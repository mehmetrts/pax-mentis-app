import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { MentorBubble } from "@/components/MentorBubble";
import { ResistanceMeter } from "@/components/ResistanceMeter";
import { llmBridge } from "@/lib/localLLM";
import {
  analyzeInput,
  getSignalLabel,
  getSignalColor,
} from "@/lib/resistanceAnalyzer";
import { retrieveRelevantChunks, buildSystemPrompt } from "@/lib/wikiKnowledge";
import { SessionMessage, MentorSession } from "@/context/AppContext";

interface DisplayMessage {
  id: string;
  role: "user" | "mentor";
  content: string;
  timestamp: number;
}

const WELCOME_MESSAGE: DisplayMessage = {
  id: "welcome",
  role: "mentor",
  content: "Merhaba. Bugün hangi görevin üzerinde çalışmak istiyorsun? Ya da sadece ne hissediyorsun şu an?",
  timestamp: Date.now(),
};

export default function MentorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const { tasks, addSession, updateSession, updateTask } = useApp();

  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentResistance, setCurrentResistance] = useState(0);
  const [currentSignal, setCurrentSignal] = useState("neutral");
  const [inputStartTime, setInputStartTime] = useState<number>(0);
  const [currentSession, setCurrentSession] = useState<MentorSession | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const activeTask = taskId ? tasks.find(t => t.id === taskId) : null;

  useEffect(() => {
    llmBridge.loadModel().then(loaded => {
      setIsModelLoaded(loaded);
    });
  }, []);

  useEffect(() => {
    if (activeTask) {
      const taskMsg: DisplayMessage = {
        id: "task_context",
        role: "mentor",
        content: `"${activeTask.title}" görevi için buradayım. Bu görevle ilgili ne hissediyorsun?`,
        timestamp: Date.now(),
      };
      setMessages([WELCOME_MESSAGE, taskMsg]);
    }
  }, [activeTask?.id]);

  const handleInputFocus = useCallback(() => {
    setInputStartTime(Date.now());
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isGenerating) return;

    const latencyMs = inputStartTime > 0 ? Date.now() - inputStartTime : 0;
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

    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    setStreamingContent("");

    try {
      const relevantChunks = retrieveRelevantChunks(userText, analysis.signal);
      const systemPrompt = buildSystemPrompt(relevantChunks, analysis.signal);

      const llmMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.slice(-6).map(m => ({
          role: m.role === "mentor" ? "assistant" as const : "user" as const,
          content: m.content,
        })),
        { role: "user" as const, content: userText },
      ];

      let fullResponse = "";
      await llmBridge.generateResponse(
        llmMessages,
        analysis.signal,
        (token) => {
          fullResponse += token;
          setStreamingContent(fullResponse);
        }
      );

      const mentorMsg: DisplayMessage = {
        id: Date.now().toString() + "_m",
        role: "mentor",
        content: fullResponse.trim(),
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, mentorMsg]);
      setStreamingContent("");

      if (activeTask) {
        await updateTask(activeTask.id, { resistanceScore: analysis.score });
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (!currentSession) {
        const session = await addSession({
          taskId: activeTask?.id,
          messages: [
            { id: userMsg.id, role: "user", content: userMsg.content, timestamp: userMsg.timestamp, latencyMs },
            { id: mentorMsg.id, role: "mentor", content: mentorMsg.content, timestamp: mentorMsg.timestamp },
          ],
          resistanceSignal: analysis.signal,
          resistanceScore: analysis.score,
        });
        setCurrentSession(session);
      } else {
        const newMessages: SessionMessage[] = [
          { id: userMsg.id, role: "user", content: userMsg.content, timestamp: userMsg.timestamp, latencyMs },
          { id: mentorMsg.id, role: "mentor", content: mentorMsg.content, timestamp: mentorMsg.timestamp },
        ];
        await updateSession(currentSession.id, {
          messages: [...currentSession.messages, ...newMessages],
          resistanceScore: analysis.score,
          resistanceSignal: analysis.signal,
        });
      }
    } catch {
      const errorMsg: DisplayMessage = {
        id: Date.now().toString() + "_err",
        role: "mentor",
        content: "Bir şeyler ters gitti. Tekrar dener misin?",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
      setInputStartTime(0);
    }
  }, [inputText, isGenerating, messages, activeTask, inputStartTime, currentSession]);

  const renderMessage = useCallback(({ item }: { item: DisplayMessage }) => (
    <View style={[
      styles.messageWrapper,
      item.role === "user" ? styles.userWrapper : styles.mentorWrapper,
    ]}>
      <MentorBubble content={item.content} isUser={item.role === "user"} />
    </View>
  ), []);

  const ListFooter = () => {
    if (!isGenerating) return null;
    return (
      <View style={[styles.messageWrapper, styles.mentorWrapper]}>
        <MentorBubble content={streamingContent} isStreaming isUser={false} />
      </View>
    );
  };

  const topPad = Platform.OS === "web" ? 24 : insets.top + 16;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {activeTask ? activeTask.title : "Mentor"}
          </Text>
          {currentResistance > 0 && (
            <View style={styles.signalRow}>
              <View style={[styles.signalDot, { backgroundColor: getSignalColor(currentSignal as any) }]} />
              <Text style={[styles.signalText, { color: colors.mutedForeground }]}>
                {getSignalLabel(currentSignal as any)}
              </Text>
            </View>
          )}
        </View>
        {currentResistance > 0 && (
          <View style={styles.meterContainer}>
            <ResistanceMeter score={currentResistance} compact />
          </View>
        )}
      </View>

      {!isModelLoaded && (
        <View style={[styles.modelBanner, { backgroundColor: colors.muted }]}>
          <Feather name="cpu" size={14} color={colors.mutedForeground} />
          <Text style={[styles.modelBannerText, { color: colors.mutedForeground }]}>
            Model hazırlanıyor...
          </Text>
        </View>
      )}

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
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.card,
              color: colors.foreground,
              borderColor: colors.border,
              borderRadius: 20,
            },
          ]}
          placeholder="Ne hissediyorsun şu an?"
          placeholderTextColor={colors.mutedForeground}
          value={inputText}
          onChangeText={setInputText}
          onFocus={handleInputFocus}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() ? colors.primary : colors.muted,
              borderRadius: 20,
            },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isGenerating}
          activeOpacity={0.85}
        >
          <Feather name="send" size={18} color={inputText.trim() ? colors.primaryForeground : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    maxWidth: 220,
  },
  signalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  signalDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  signalText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  meterContainer: {
    width: 100,
  },
  modelBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modelBannerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  mentorWrapper: {
    alignSelf: "flex-start",
    maxWidth: "88%",
  },
  userWrapper: {
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
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
