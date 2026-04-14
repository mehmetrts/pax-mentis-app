import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useVoice } from "@/hooks/useVoice";
import { MentorBubble } from "@/components/MentorBubble";
import { ResistanceMeter } from "@/components/ResistanceMeter";
import { llmBridge } from "@/lib/localLLM";
import { analyzeInput, getSignalLabel, getSignalColor } from "@/lib/resistanceAnalyzer";
import {
  retrieveRelevantChunks,
  buildSystemPrompt,
  determinePhase,
  ConversationPhase,
} from "@/lib/wikiKnowledge";
import {
  UserProfile,
  loadUserProfile,
  updateUserProfile,
  generateProfileSummary,
} from "@/lib/userProfile";
import { generateActionPlan } from "@/lib/actionPlan";
import { summarizeConversation } from "@/lib/sessionSummary";
import { SessionMessage, MentorSession } from "@/context/AppContext";

interface DisplayMessage {
  id: string;
  role: "user" | "mentor";
  content: string;
  timestamp: number;
}

const PHASE_LABELS: Record<ConversationPhase, string> = {
  discovery: "Keşif",
  diagnosis: "Teşhis",
  planning: "Plan",
  followup: "Takip",
};

function makeWelcomeMessage(taskTitle?: string): DisplayMessage {
  return {
    id: "welcome",
    role: "mentor",
    content: taskTitle
      ? `"${taskTitle}" görevi için buradayım. Bu görevle ilgili ne hissediyorsun şu an?`
      : "Merhaba. Bugün nasılsın? Ne üzerinde çalışıyorsun ya da ne düşünüyorsun?",
    timestamp: Date.now(),
  };
}

export default function MentorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const { tasks, addSession, updateSession, updateTask, addPlan } = useApp();
  const voice = useVoice();

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentResistance, setCurrentResistance] = useState(0);
  const [currentSignal, setCurrentSignal] = useState("neutral");
  const [currentPhase, setCurrentPhase] = useState<ConversationPhase>("discovery");
  const [hasActionPlan, setHasActionPlan] = useState(false);
  const planSavedRef = useRef(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const userProfileRef = useRef<UserProfile | null>(null);

  // Stale closure fix: session both in state and ref
  const [currentSession, setCurrentSession] = useState<MentorSession | null>(null);
  const currentSessionRef = useRef<MentorSession | null>(null);
  const updateCurrentSession = useCallback((s: MentorSession | null) => {
    setCurrentSession(s);
    currentSessionRef.current = s;
  }, []);

  // Latency: from first keystroke, not focus
  const firstKeystrokeTime = useRef(0);
  const flatListRef = useRef<FlatList>(null);

  const activeTask = useMemo(
    () => (taskId ? tasks.find(t => t.id === taskId) : null),
    [taskId, tasks]
  );

  // Initialize LLM bridge and user profile
  useEffect(() => {
    llmBridge.initialize();
    loadUserProfile().then(p => {
      setUserProfile(p);
      userProfileRef.current = p;
    });
  }, []);

  // Reset on task change
  useEffect(() => {
    setMessages([makeWelcomeMessage(activeTask?.title)]);
    setCurrentPhase("discovery");
    setHasActionPlan(false);
    planSavedRef.current = false;
    updateCurrentSession(null);
    firstKeystrokeTime.current = 0;
  }, [activeTask?.id]);

  const handleTextChange = useCallback((text: string) => {
    if (firstKeystrokeTime.current === 0 && text.length === 1) {
      firstKeystrokeTime.current = Date.now();
    }
    if (text.length === 0) firstKeystrokeTime.current = 0;
    setInputText(text);
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isGenerating) return;

    const latencyMs = firstKeystrokeTime.current > 0
      ? Date.now() - firstKeystrokeTime.current : 0;
    firstKeystrokeTime.current = 0;

    const userText = inputText.trim();
    setInputText("");

    const analysis = analyzeInput(userText, latencyMs);
    setCurrentResistance(analysis.score);
    setCurrentSignal(analysis.signal);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: Date.now(),
    };

    const userMessageCount = messages.filter(m => m.role === "user").length + 1;
    const nextPhase = determinePhase(userMessageCount, hasActionPlan);
    setCurrentPhase(nextPhase);
    if (nextPhase === "planning") setHasActionPlan(true);

    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    setStreamingContent("");

    try {
      const relevantChunks = retrieveRelevantChunks(userText, analysis.signal);

      // ─── Oturum özeti: uzun konuşmalarda eski mesajları özetle ───────────
      const allMsgs = messages.map(m => ({
        role: m.role as "user" | "mentor",
        content: m.content,
      }));
      const { summary: convSummary, recentMessages } = summarizeConversation(allMsgs);

      // ─── Profil özeti ────────────────────────────────────────────────────
      const profileSummary = generateProfileSummary(
        userProfileRef.current ?? {
          sessionCount: 0, totalUserMessages: 0,
          signalFrequency: {}, avgResistanceScore: 0,
          lastSessionDate: null, usedInterventions: {},
        }
      );

      const systemPrompt = buildSystemPrompt(
        relevantChunks,
        analysis.signal,
        nextPhase,
        [profileSummary, convSummary].filter(Boolean).join("\n") || undefined
      );

      const llmMessages = [
        { role: "system" as const, content: systemPrompt },
        ...recentMessages.slice(-8).map(m => ({
          role: m.role === "mentor" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
        { role: "user" as const, content: userText },
      ];

      let fullResponse = "";
      await llmBridge.generateResponse(
        llmMessages,
        analysis.signal,
        token => {
          fullResponse += token;
          setStreamingContent(fullResponse);
        },
        nextPhase
      );

      const mentorMsg: DisplayMessage = {
        id: Date.now().toString() + "_m",
        role: "mentor",
        content: fullResponse.trim(),
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, mentorMsg]);
      setStreamingContent("");

      // ─── TTS: yanıtı sesli oku ─────────────────────────────────────────
      voice.speakText(mentorMsg.content);

      if (activeTask) {
        await updateTask(activeTask.id, { resistanceScore: analysis.score });
      }

      // ─── Plan oluştur (planning fazına ilk girildiğinde) ─────────────────
      if (nextPhase === "planning" && !planSavedRef.current) {
        planSavedRef.current = true;
        const plan = generateActionPlan(
          relevantChunks,
          analysis.signal,
          activeTask?.id,
          currentSessionRef.current?.id
        );
        await addPlan(plan);

        const planMsg: DisplayMessage = {
          id: Date.now().toString() + "_plan",
          role: "mentor",
          content: `Seninle birlikte bir plan hazırladım — "${plan.title}". Görevler → Planlar sekmesinde adımlarını takip edebilirsin.`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, planMsg]);
        voice.speakText(planMsg.content);
      }

      // ─── Kullanıcı profilini güncelle ─────────────────────────────────────
      const isNewSession = currentSessionRef.current === null;
      const updatedProfile = await updateUserProfile(analysis.signal, analysis.score, isNewSession);
      setUserProfile(updatedProfile);
      userProfileRef.current = updatedProfile;

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // ─── Session yönetimi ────────────────────────────────────────────────
      const session = currentSessionRef.current;
      const newMsgs: SessionMessage[] = [
        { id: userMsg.id, role: "user", content: userMsg.content, timestamp: userMsg.timestamp, latencyMs },
        { id: mentorMsg.id, role: "mentor", content: mentorMsg.content, timestamp: mentorMsg.timestamp },
      ];

      if (!session) {
        const created = await addSession({
          taskId: activeTask?.id,
          messages: newMsgs,
          resistanceSignal: analysis.signal,
          resistanceScore: analysis.score,
        });
        updateCurrentSession(created);
      } else {
        const updated: MentorSession = {
          ...session,
          messages: [...session.messages, ...newMsgs],
          resistanceScore: analysis.score,
          resistanceSignal: analysis.signal,
        };
        updateCurrentSession(updated);
        await updateSession(session.id, {
          messages: updated.messages,
          resistanceScore: analysis.score,
          resistanceSignal: analysis.signal,
        });
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + "_err",
          role: "mentor",
          content: "Bir şeyler ters gitti. Tekrar dener misin?",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, isGenerating, messages, activeTask, hasActionPlan, voice]);

  const renderMessage = useCallback(
    ({ item }: { item: DisplayMessage }) => (
      <TouchableOpacity
        onPress={() => item.role === "mentor" && voice.speakText(item.content)}
        activeOpacity={0.85}
        style={[
          styles.messageWrapper,
          item.role === "user" ? styles.userWrapper : styles.mentorWrapper,
        ]}
      >
        <MentorBubble content={item.content} isUser={item.role === "user"} />
      </TouchableOpacity>
    ),
    [voice]
  );

  const ListFooter = useCallback(() => {
    if (!isGenerating) return null;
    return (
      <View style={[styles.messageWrapper, styles.mentorWrapper]}>
        <MentorBubble content={streamingContent} isStreaming isUser={false} />
      </View>
    );
  }, [isGenerating, streamingContent]);

  const topPad = Platform.OS === "web" ? 24 : insets.top + 16;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {activeTask ? activeTask.title : "Mentor"}
          </Text>
          <View style={styles.headerMeta}>
            <View style={[styles.phaseBadge, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.phaseBadgeText, { color: colors.primary }]}>
                {PHASE_LABELS[currentPhase]}
              </Text>
            </View>
            {userProfile && userProfile.sessionCount > 0 && (
              <View style={[styles.phaseBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.phaseBadgeText, { color: colors.mutedForeground }]}>
                  {userProfile.sessionCount} sohbet
                </Text>
              </View>
            )}
            {currentResistance > 0 && (
              <View style={styles.signalRow}>
                <View style={[styles.signalDot, { backgroundColor: getSignalColor(currentSignal as any) }]} />
                <Text style={[styles.signalText, { color: colors.mutedForeground }]}>
                  {getSignalLabel(currentSignal as any)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          {currentResistance > 0 && (
            <View style={{ width: 80 }}>
              <ResistanceMeter score={currentResistance} compact />
            </View>
          )}
          {/* TTS toggle */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: voice.isTTSEnabled ? colors.primary + "22" : colors.muted,
                borderRadius: 12,
              },
            ]}
            onPress={voice.toggleTTS}
            activeOpacity={0.7}
          >
            <Feather
              name={voice.ttsStatus === "speaking" ? "volume-2" : "volume"}
              size={16}
              color={voice.isTTSEnabled ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mesaj listesi */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        scrollEnabled
      />

      {/* Giriş alanı */}
      <View
        style={[
          styles.inputContainer,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: bottomInset + 8,
          },
        ]}
      >
        {/* Mikrofon butonu (STT — dev build'de etkin) */}
        <TouchableOpacity
          style={[
            styles.micBtn,
            { backgroundColor: colors.muted, borderRadius: 20 },
          ]}
          onPress={() => {
            // TODO: Dev build'de voice.startRecording() ile değiştir
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          activeOpacity={0.7}
        >
          <Feather
            name="mic"
            size={18}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.card,
              color: colors.foreground,
              borderColor: colors.border,
              borderRadius: 20,
            },
          ]}
          placeholder="Ne düşünüyorsun?"
          placeholderTextColor={colors.mutedForeground}
          value={inputText}
          onChangeText={handleTextChange}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() && !isGenerating ? colors.primary : colors.muted,
              borderRadius: 20,
            },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isGenerating}
          activeOpacity={0.85}
        >
          <Feather
            name="send"
            size={18}
            color={inputText.trim() && !isGenerating ? colors.primaryForeground : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: { flex: 1, gap: 6 },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    maxWidth: 220,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 8,
  },
  phaseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  phaseBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  signalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  signalDot: { width: 7, height: 7, borderRadius: 3.5 },
  signalText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  messageWrapper: { marginBottom: 12 },
  mentorWrapper: { alignSelf: "flex-start", maxWidth: "88%" },
  userWrapper: { alignSelf: "flex-end", maxWidth: "80%" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  micBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
