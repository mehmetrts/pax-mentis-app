import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLLMStatus } from "@/hooks/useLLMStatus";
import { BentoCard, SectionHeader, StatCard } from "@/components/BentoGrid";
import { TaskCard } from "@/components/TaskCard";
import { PlanCard } from "@/components/PlanCard";
import { ResistanceMeter } from "@/components/ResistanceMeter";
import { OnboardingModal } from "@/components/OnboardingModal";
import { M3Spring } from "@/constants/colors";

const ONBOARDING_KEY = "@pax_mentis:onboarding_done";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 17) return "İyi günler";
  if (h < 21) return "İyi akşamlar";
  return "İyi geceler";
}

function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 2)  return "Az önce";
  if (mins < 60) return `${mins} dakika önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} saat önce`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Dün";
  return `${days} gün önce`;
}

/** M3 Expressive staggered spring entry for each page section */
function FadeInSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const opacity     = useSharedValue(0);
  const translateY  = useSharedValue(16);

  useEffect(() => {
    opacity.value    = withDelay(delay, withSpring(1, M3Spring.effectDefault));
    translateY.value = withDelay(delay, withSpring(0, M3Spring.spatialSlow));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function HomeScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const {
    tasks, sessions, plans,
    streakDays, totalCompleted,
    completeTask, deferTask, toggleStep, isLoading,
  } = useApp();
  const llm = useLLMStatus();

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(v => {
      if (!v) setShowOnboarding(true);
    });
  }, []);

  const handleOnboardingDone = () => {
    setShowOnboarding(false);
    AsyncStorage.setItem(ONBOARDING_KEY, "1");
  };

  const activeTasks = useMemo(
    () => tasks.filter(t => t.status === "pending" || t.status === "in_progress"),
    [tasks],
  );

  const urgentTask = useMemo(
    () => [...activeTasks].sort((a, b) => {
      const p = { high: 3, medium: 2, low: 1 };
      return p[b.priority] - p[a.priority];
    })[0],
    [activeTasks],
  );

  const avgResistance = useMemo(() => {
    if (sessions.length === 0) return 0;
    const recent = sessions.slice(-7);
    return Math.round(
      recent.reduce((acc, s) => acc + s.resistanceScore, 0) / recent.length,
    );
  }, [sessions]);

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(
      t => t.completedAt && new Date(t.completedAt).toDateString() === today,
    ).length;
  }, [tasks]);

  const activePlans = useMemo(
    () => plans.filter(p => !p.isCompleted)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 2),
    [plans],
  );

  const lastSession = useMemo(() => {
    if (sessions.length === 0) return null;
    return [...sessions].sort((a, b) => b.startedAt - a.startedAt)[0];
  }, [sessions]);

  const topPad    = Platform.OS === "web" ? 24 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 84 + 20 : insets.bottom + 100;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────── */}
      <FadeInSection delay={0}>
        <View style={styles.headerSection}>
          <View style={styles.headerTopRow}>
            <Text style={[styles.greeting, { color: colors.onSurfaceVariant }]}>
              {getGreeting()}
            </Text>
            {/* Model Status Badge — M3 pill shape */}
            <Pressable
              onPress={() => router.push("/(tabs)/settings")}
              style={[
                styles.modelBadge,
                {
                  backgroundColor: llm.color + "18",
                  borderColor: llm.color + "44",
                  borderRadius: 9999,
                },
              ]}
            >
              <View style={[styles.modelDot, { backgroundColor: llm.color }]} />
              <Text style={[styles.modelBadgeText, { color: llm.color }]}>
                {llm.label}
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.headline, { color: colors.onSurface }]}>Pax Mentis</Text>
          <Text style={[styles.subHeadline, { color: colors.onSurfaceVariant }]}>
            Zihinsel direncini aş, eyleme geç.
          </Text>
        </View>
      </FadeInSection>

      <OnboardingModal visible={showOnboarding} onDone={handleOnboardingDone} />

      {/* ── Öncelikli Görev ────────────────────────── */}
      {urgentTask && (
        <FadeInSection delay={60}>
          <View style={styles.section}>
            <SectionHeader
              title="Öncelikli Görev"
              action="Hepsini gör"
              onAction={() => router.push("/(tabs)/tasks")}
            />
            <View style={styles.paddedContent}>
              <BentoCard accent={colors.primary} style={styles.urgentCard}>
                <View style={styles.urgentHeader}>
                  {/* M3 "Şimdi Yap" chip — filled tonal style */}
                  <View
                    style={[
                      styles.urgentBadge,
                      {
                        backgroundColor: colors.primaryContainer,
                        borderRadius: 9999,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.urgentBadgeText,
                        { color: colors.onPrimaryContainer },
                      ]}
                    >
                      Şimdi Yap
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.urgentTitle, { color: colors.onSurface }]}
                  numberOfLines={2}
                >
                  {urgentTask.title}
                </Text>
                {urgentTask.resistanceScore > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <ResistanceMeter score={urgentTask.resistanceScore} />
                  </View>
                )}
                {/* M3 Filled Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.mentorButton,
                    {
                      backgroundColor: pressed
                        ? colors.primary + "CC"
                        : colors.primary,
                      borderRadius: 9999,
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/mentor",
                      params: { taskId: urgentTask.id },
                    })
                  }
                >
                  <Feather name="message-circle" size={16} color={colors.onPrimary} />
                  <Text
                    style={[styles.mentorButtonText, { color: colors.onPrimary }]}
                  >
                    Mentörle Konuş
                  </Text>
                </Pressable>
              </BentoCard>
            </View>
          </View>
        </FadeInSection>
      )}

      {/* ── Günlük Özet ────────────────────────────── */}
      <FadeInSection delay={120}>
        <View style={styles.section}>
          <SectionHeader title="Günlük Özet" />
          <View style={styles.statsGrid}>
            <StatCard
              label="Tamamlandı"
              value={completedToday}
              icon="check-circle"
              color={colors.primary}
              onPress={() => router.push("/(tabs)/tasks")}
            />
            <StatCard
              label="Seri (Gün)"
              value={streakDays}
              icon="zap"
              color={colors.tertiary}
              onPress={() => router.push("/(tabs)/tasks")}
            />
            <StatCard
              label="Direnç"
              value={`${avgResistance}%`}
              icon="activity"
              color={
                avgResistance > 60
                  ? colors.error
                  : colors.primary
              }
            />
            <StatCard
              label="Toplam"
              value={totalCompleted}
              icon="award"
              color={colors.lavender ?? colors.accent}
            />
          </View>
        </View>
      </FadeInSection>

      {/* ── Son Sohbet ─────────────────────────────── */}
      {lastSession && (
        <FadeInSection delay={180}>
          <View style={styles.section}>
            <SectionHeader
              title="Son Sohbet"
              action="Mentöre Git"
              onAction={() => router.push("/(tabs)/mentor")}
            />
            <View style={styles.paddedContent}>
              <Pressable
                style={({ pressed }) => [
                  styles.sessionCard,
                  {
                    backgroundColor: pressed
                      ? colors.surfaceContainerHigh
                      : colors.surfaceContainer,
                    borderColor: colors.outlineVariant,
                    borderRadius: colors.radius,
                  },
                ]}
                onPress={() => router.push("/(tabs)/mentor")}
              >
                <View style={styles.sessionCardTop}>
                  <Text style={[styles.sessionTime, { color: colors.onSurfaceVariant }]}>
                    {formatRelativeDate(lastSession.startedAt)}
                  </Text>
                  {lastSession.resistanceScore > 0 && (
                    <View
                      style={[
                        styles.sessionSignal,
                        { backgroundColor: colors.surfaceVariant, borderRadius: 9999 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sessionSignalText,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        Direnç {lastSession.resistanceScore}%
                      </Text>
                    </View>
                  )}
                </View>
                {lastSession.messages.length > 0 && (
                  <Text
                    style={[styles.sessionSnippet, { color: colors.onSurface }]}
                    numberOfLines={2}
                  >
                    {lastSession.messages[lastSession.messages.length - 1]?.content ?? ""}
                  </Text>
                )}
                <View style={styles.sessionFooter}>
                  <Feather name="message-circle" size={13} color={colors.onSurfaceVariant} />
                  <Text style={[styles.sessionMsgCount, { color: colors.onSurfaceVariant }]}>
                    {lastSession.messages.length} mesaj
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Feather name="chevron-right" size={16} color={colors.onSurfaceVariant} />
                </View>
              </Pressable>
            </View>
          </View>
        </FadeInSection>
      )}

      {/* ── Aktif Planlar ──────────────────────────── */}
      {activePlans.length > 0 && (
        <FadeInSection delay={220}>
          <View style={styles.section}>
            <SectionHeader
              title="Aktif Planlar"
              action={
                plans.filter(p => !p.isCompleted).length > 2 ? "Hepsini gör" : undefined
              }
              onAction={() => router.push("/(tabs)/tasks")}
            />
            <View style={[styles.paddedContent, { gap: 10 }]}>
              {activePlans.map(plan => {
                const relatedTask = plan.taskId
                  ? tasks.find(t => t.id === plan.taskId)
                  : null;
                return (
                  <View key={plan.id}>
                    {relatedTask && (
                      <Text
                        style={[styles.planTaskLabel, { color: colors.onSurfaceVariant }]}
                      >
                        {relatedTask.title}
                      </Text>
                    )}
                    <PlanCard
                      plan={plan}
                      onStepToggle={stepId => toggleStep(plan.id, stepId)}
                      compact
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </FadeInSection>
      )}

      {/* ── Aktif Görevler ─────────────────────────── */}
      {activeTasks.length > 0 && (
        <FadeInSection delay={260}>
          <View style={styles.section}>
            <SectionHeader
              title="Aktif Görevler"
              action={
                activeTasks.length > 3 ? `+${activeTasks.length - 3} daha` : undefined
              }
              onAction={() => router.push("/(tabs)/tasks")}
            />
            <View style={[styles.paddedContent, { gap: 10 }]}>
              {activeTasks.slice(0, 3).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/mentor",
                      params: { taskId: task.id },
                    })
                  }
                  onComplete={() => completeTask(task.id)}
                  onDefer={() => deferTask(task.id)}
                />
              ))}
            </View>
          </View>
        </FadeInSection>
      )}

      {/* ── Boş Durum ──────────────────────────────── */}
      {activeTasks.length === 0 && !isLoading && (
        <FadeInSection delay={180}>
          <View style={styles.section}>
            <View style={styles.paddedContent}>
              <BentoCard>
                <View style={styles.emptyState}>
                  <Feather name="inbox" size={32} color={colors.onSurfaceVariant} />
                  <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                    Görev yok
                  </Text>
                  <Text
                    style={[styles.emptyText, { color: colors.onSurfaceVariant }]}
                  >
                    İlk görevini ekle ve mentörünle çalışmaya başla.
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.addButton,
                      {
                        backgroundColor: pressed
                          ? colors.primary + "CC"
                          : colors.primary,
                        borderRadius: 9999,
                      },
                    ]}
                    onPress={() => router.push("/(tabs)/tasks")}
                  >
                    <Feather name="plus" size={16} color={colors.onPrimary} />
                    <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>
                      Görev Ekle
                    </Text>
                  </Pressable>
                </View>
              </BentoCard>
            </View>
          </View>
        </FadeInSection>
      )}

      {/* ── Hızlı Erişim ───────────────────────────── */}
      <FadeInSection delay={300}>
        <View style={styles.section}>
          <SectionHeader title="Hızlı Erişim" />
          <View style={styles.quickGrid}>
            <QuickCard
              icon="message-circle"
              label="Mentor"
              sub="Sokratik sohbet"
              color={colors.primary}
              containerColor={colors.primaryContainer}
              onContainerColor={colors.onPrimaryContainer}
              onPress={() => router.push("/(tabs)/mentor")}
            />
            <QuickCard
              icon="book-open"
              label="Wiki"
              sub="Psikoloji kütüphanesi"
              color={colors.lavender ?? colors.accent}
              containerColor={(colors.lavender ?? colors.accent) + "22"}
              onContainerColor={colors.lavender ?? colors.accent}
              onPress={() => router.push("/(tabs)/wiki")}
            />
            <QuickCard
              icon="map"
              label="Planlar"
              sub={
                plans.filter(p => !p.isCompleted).length > 0
                  ? `${plans.filter(p => !p.isCompleted).length} aktif plan`
                  : "Henüz plan yok"
              }
              color={colors.tertiary}
              containerColor={colors.tertiaryContainer}
              onContainerColor={colors.onTertiaryContainer}
              onPress={() => router.push("/(tabs)/tasks")}
            />
          </View>
        </View>
      </FadeInSection>
    </ScrollView>
  );
}

// ── QuickCard ─────────────────────────────────────────────────────────────────
function QuickCard({
  icon, label, sub, color, containerColor, onContainerColor, onPress,
}: {
  icon: string;
  label: string;
  sub: string;
  color: string;
  containerColor: string;
  onContainerColor: string;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[style, { flex: 1 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.94, M3Spring.spatialFast); }}
        onPressOut={() => { scale.value = withSpring(1, M3Spring.spatialDefault); }}
        onPress={onPress}
        style={[
          styles.quickCard,
          {
            backgroundColor: colors.surfaceContainer,
            borderColor: colors.outlineVariant,
            borderRadius: 20,
          },
        ]}
      >
        {/* M3 tonal icon container */}
        <View
          style={[
            styles.quickIcon,
            { backgroundColor: containerColor, borderRadius: 14 },
          ]}
        >
          <Feather name={icon as any} size={20} color={color} />
        </View>
        <Text style={[styles.quickLabel, { color: colors.onSurface }]}>{label}</Text>
        <Text style={[styles.quickSub, { color: colors.onSurfaceVariant }]}>{sub}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 4,
  },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  headline: { fontSize: 34, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  subHeadline: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { marginBottom: 28 },
  paddedContent: { paddingHorizontal: 20 },
  urgentCard: { gap: 12 },
  urgentHeader: { flexDirection: "row" },
  urgentBadge: { paddingHorizontal: 12, paddingVertical: 5 },
  urgentBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  urgentTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", lineHeight: 24 },
  mentorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 4,
  },
  mentorButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    justifyContent: "space-between",
  },
  sessionCard: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  sessionCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sessionSignal: { paddingHorizontal: 10, paddingVertical: 4 },
  sessionSignalText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  sessionSnippet: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  sessionFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  sessionMsgCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  planTaskLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginLeft: 4,
    marginBottom: 4,
  },
  quickGrid: { flexDirection: "row", paddingHorizontal: 20, gap: 10 },
  quickCard: { padding: 14, borderWidth: 1, gap: 6 },
  quickIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  quickLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  quickSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 20 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
  },
  addButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  modelDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  modelBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
