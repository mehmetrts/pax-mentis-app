import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { BentoCard, SectionHeader, StatCard } from "@/components/BentoGrid";
import { TaskCard } from "@/components/TaskCard";
import { PlanCard } from "@/components/PlanCard";
import { ResistanceMeter } from "@/components/ResistanceMeter";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 17) return "İyi günler";
  if (h < 21) return "İyi akşamlar";
  return "İyi geceler";
}

function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Az önce";
  if (mins < 60) return `${mins} dakika önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat önce`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Dün";
  return `${days} gün önce`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, sessions, plans, streakDays, totalCompleted, completeTask, deferTask, toggleStep, isLoading } = useApp();

  const activeTasks = useMemo(
    () => tasks.filter(t => t.status === "pending" || t.status === "in_progress"),
    [tasks]
  );

  const urgentTask = useMemo(
    () => [...activeTasks].sort((a, b) => {
      const p = { high: 3, medium: 2, low: 1 };
      return p[b.priority] - p[a.priority];
    })[0],
    [activeTasks]
  );

  const avgResistance = useMemo(() => {
    if (sessions.length === 0) return 0;
    const recent = sessions.slice(-7);
    return Math.round(recent.reduce((acc, s) => acc + s.resistanceScore, 0) / recent.length);
  }, [sessions]);

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === today).length;
  }, [tasks]);

  // Aktif (tamamlanmamış) planlar — en güncel önce
  const activePlans = useMemo(
    () => plans.filter(p => !p.isCompleted).sort((a, b) => b.createdAt - a.createdAt).slice(0, 2),
    [plans]
  );

  // Son sohbet
  const lastSession = useMemo(() => {
    if (sessions.length === 0) return null;
    return [...sessions].sort((a, b) => b.startedAt - a.startedAt)[0];
  }, [sessions]);

  const topPad = Platform.OS === "web" ? 24 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 84 + 20 : insets.bottom + 100;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Başlık */}
      <View style={styles.headerSection}>
        <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{getGreeting()}</Text>
        <Text style={[styles.headline, { color: colors.foreground }]}>Pax Mentis</Text>
        <Text style={[styles.subHeadline, { color: colors.mutedForeground }]}>
          Zihinsel direncini aş, eyleme geç.
        </Text>
      </View>

      {/* Öncelikli Görev */}
      {urgentTask && (
        <View style={styles.section}>
          <SectionHeader
            title="Öncelikli Görev"
            action="Hepsini gör"
            onAction={() => router.push("/(tabs)/tasks")}
          />
          <View style={styles.paddedContent}>
            <BentoCard accent={colors.sage} style={styles.urgentCard}>
              <View style={styles.urgentHeader}>
                <View style={[styles.urgentBadge, { backgroundColor: colors.sage + "22", borderRadius: 8 }]}>
                  <Text style={[styles.urgentBadgeText, { color: colors.sage }]}>Şimdi Yap</Text>
                </View>
              </View>
              <Text style={[styles.urgentTitle, { color: colors.foreground }]} numberOfLines={2}>
                {urgentTask.title}
              </Text>
              {urgentTask.resistanceScore > 0 && (
                <View style={{ marginTop: 8 }}>
                  <ResistanceMeter score={urgentTask.resistanceScore} />
                </View>
              )}
              <TouchableOpacity
                style={[styles.mentorButton, { backgroundColor: colors.primary, borderRadius: 12 }]}
                onPress={() => router.push({ pathname: "/(tabs)/mentor", params: { taskId: urgentTask.id } })}
                activeOpacity={0.85}
              >
                <Feather name="message-circle" size={16} color={colors.primaryForeground} />
                <Text style={[styles.mentorButtonText, { color: colors.primaryForeground }]}>
                  Mentörle Konuş
                </Text>
              </TouchableOpacity>
            </BentoCard>
          </View>
        </View>
      )}

      {/* Günlük özet */}
      <View style={styles.section}>
        <SectionHeader title="Günlük Özet" />
        <View style={styles.statsGrid}>
          <StatCard label="Tamamlandı" value={completedToday} icon="check-circle" color={colors.sage} onPress={() => router.push("/(tabs)/tasks")} />
          <StatCard label="Seri (Gün)" value={streakDays} icon="zap" color="#d4a853" onPress={() => router.push("/(tabs)/tasks")} />
          <StatCard label="Direnç" value={`${avgResistance}%`} icon="activity" color={avgResistance > 60 ? "#c06060" : colors.sage} />
          <StatCard label="Toplam" value={totalCompleted} icon="award" color="#7b6cbd" />
        </View>
      </View>

      {/* Son sohbet özeti */}
      {lastSession && (
        <View style={styles.section}>
          <SectionHeader
            title="Son Sohbet"
            action="Mentöre Git"
            onAction={() => router.push("/(tabs)/mentor")}
          />
          <View style={styles.paddedContent}>
            <TouchableOpacity
              style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/(tabs)/mentor")}
              activeOpacity={0.85}
            >
              <View style={styles.sessionCardTop}>
                <Text style={[styles.sessionTime, { color: colors.mutedForeground }]}>
                  {formatRelativeDate(lastSession.startedAt)}
                </Text>
                {lastSession.resistanceScore > 0 && (
                  <View style={[styles.sessionSignal, { backgroundColor: colors.muted, borderRadius: 8 }]}>
                    <Text style={[styles.sessionSignalText, { color: colors.mutedForeground }]}>
                      Direnç {lastSession.resistanceScore}%
                    </Text>
                  </View>
                )}
              </View>
              {lastSession.messages.length > 0 && (
                <Text style={[styles.sessionSnippet, { color: colors.foreground }]} numberOfLines={2}>
                  {lastSession.messages[lastSession.messages.length - 1]?.content ?? ""}
                </Text>
              )}
              <View style={styles.sessionFooter}>
                <Feather name="message-circle" size={13} color={colors.mutedForeground} />
                <Text style={[styles.sessionMsgCount, { color: colors.mutedForeground }]}>
                  {lastSession.messages.length} mesaj
                </Text>
                <View style={{ flex: 1 }} />
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Aktif Planlar */}
      {activePlans.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Aktif Planlar"
            action={plans.filter(p => !p.isCompleted).length > 2 ? "Hepsini gör" : undefined}
            onAction={() => router.push("/(tabs)/tasks")}
          />
          <View style={[styles.paddedContent, { gap: 10 }]}>
            {activePlans.map(plan => {
              const relatedTask = plan.taskId ? tasks.find(t => t.id === plan.taskId) : null;
              return (
                <View key={plan.id}>
                  {relatedTask && (
                    <Text style={[styles.planTaskLabel, { color: colors.mutedForeground }]}>
                      {relatedTask.title}
                    </Text>
                  )}
                  <PlanCard
                    plan={plan}
                    onStepToggle={(stepId) => toggleStep(plan.id, stepId)}
                    compact
                  />
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Aktif görevler */}
      {activeTasks.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Aktif Görevler"
            action={activeTasks.length > 3 ? `+${activeTasks.length - 3} daha` : undefined}
            onAction={() => router.push("/(tabs)/tasks")}
          />
          <View style={[styles.paddedContent, { gap: 10 }]}>
            {activeTasks.slice(0, 3).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => router.push({ pathname: "/(tabs)/mentor", params: { taskId: task.id } })}
                onComplete={() => completeTask(task.id)}
                onDefer={() => deferTask(task.id)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Boş durum */}
      {activeTasks.length === 0 && !isLoading && (
        <View style={styles.section}>
          <View style={styles.paddedContent}>
            <BentoCard>
              <View style={styles.emptyState}>
                <Feather name="inbox" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Görev yok</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  İlk görevini ekle ve mentörünle çalışmaya başla.
                </Text>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.primary, borderRadius: 12 }]}
                  onPress={() => router.push("/(tabs)/tasks")}
                >
                  <Feather name="plus" size={16} color={colors.primaryForeground} />
                  <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>Görev Ekle</Text>
                </TouchableOpacity>
              </View>
            </BentoCard>
          </View>
        </View>
      )}

      {/* Hızlı erişim */}
      <View style={styles.section}>
        <SectionHeader title="Hızlı Erişim" />
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 16 }]}
            onPress={() => router.push("/(tabs)/mentor")}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIcon, { backgroundColor: colors.sage + "22", borderRadius: 12 }]}>
              <Feather name="message-circle" size={20} color={colors.sage} />
            </View>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>Mentor</Text>
            <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>Sokratik sohbet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 16 }]}
            onPress={() => router.push("/(tabs)/wiki")}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#7b6cbd22", borderRadius: 12 }]}>
              <Feather name="book-open" size={20} color="#7b6cbd" />
            </View>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>Wiki</Text>
            <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>Psikoloji kütüphanesi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 16 }]}
            onPress={() => router.push("/(tabs)/tasks")}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#5a8a6a22", borderRadius: 12 }]}>
              <Feather name="map" size={20} color="#5a8a6a" />
            </View>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>Planlar</Text>
            <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>
              {plans.filter(p => !p.isCompleted).length > 0
                ? `${plans.filter(p => !p.isCompleted).length} aktif plan`
                : "Henüz plan yok"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  headline: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  subHeadline: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { marginBottom: 28 },
  paddedContent: { paddingHorizontal: 20 },
  urgentCard: { gap: 10 },
  urgentHeader: { flexDirection: "row" },
  urgentBadge: { paddingHorizontal: 10, paddingVertical: 4 },
  urgentBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  urgentTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", lineHeight: 24 },
  mentorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
  },
  mentorButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 10 },
  sessionCard: {
    borderRadius: 16,
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
  sessionSignal: { paddingHorizontal: 8, paddingVertical: 3 },
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
  quickCard: { flex: 1, padding: 14, borderWidth: 1, gap: 6 },
  quickIcon: {
    width: 40, height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  quickLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  quickSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 20 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  addButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
