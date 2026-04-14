import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { TaskCard } from "@/components/TaskCard";
import { PlanCard } from "@/components/PlanCard";
import { Task, TaskPriority, TaskStatus } from "@/context/AppContext";

type FilterTab = "active" | "completed" | "deferred" | "plans";

const FILTER_LABELS: Record<FilterTab, string> = {
  active: "Aktif",
  completed: "Tamamlanan",
  deferred: "Ertelenen",
  plans: "Planlar",
};

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, plans, addTask, completeTask, deferTask, toggleStep } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterTab>("active");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");

  const filteredTasks = useMemo(() => {
    const statusMap: Record<string, TaskStatus[]> = {
      active: ["pending", "in_progress"],
      completed: ["completed"],
      deferred: ["deferred"],
    };
    if (!statusMap[activeFilter]) return [];
    return tasks
      .filter(t => statusMap[activeFilter].includes(t.status))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [tasks, activeFilter]);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => b.createdAt - a.createdAt);
  }, [plans]);

  const pendingPlansCount = useMemo(() => {
    return plans.filter(p => !p.isCompleted).length;
  }, [plans]);

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    await addTask({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      status: "pending",
      priority: newPriority,
      resistanceScore: 0,
      tags: [],
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNewTitle("");
    setNewDescription("");
    setNewPriority("medium");
    setShowAddModal(false);
  };

  const getTaskCount = (tab: FilterTab) => {
    if (tab === "plans") return pendingPlansCount;
    const statusMap: Record<string, TaskStatus[]> = {
      active: ["pending", "in_progress"],
      completed: ["completed"],
      deferred: ["deferred"],
    };
    if (!statusMap[tab]) return 0;
    return tasks.filter(t => statusMap[tab].includes(t.status)).length;
  };

  const topPad = Platform.OS === "web" ? 24 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 84 + 20 : insets.bottom + 100;

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: "low", label: "Düşük", color: "#8a9a7a" },
    { value: "medium", label: "Orta", color: "#d4a853" },
    { value: "high", label: "Yüksek", color: "#c06060" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Görevler</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary, borderRadius: 20 }]}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      {/* Filtre sekmeleri */}
      <View style={[styles.filterRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {(["active", "completed", "deferred", "plans"] as FilterTab[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              activeFilter === f && [styles.filterTabActive, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: activeFilter === f ? colors.primary : colors.mutedForeground },
              ]}
            >
              {FILTER_LABELS[f]}
            </Text>
            <View style={[
              styles.filterCount,
              {
                backgroundColor: f === "plans" && pendingPlansCount > 0
                  ? colors.primary + "22"
                  : colors.muted,
                borderRadius: 10,
              },
            ]}>
              <Text style={[
                styles.filterCountText,
                {
                  color: f === "plans" && pendingPlansCount > 0
                    ? colors.primary
                    : colors.mutedForeground,
                },
              ]}>
                {getTaskCount(f)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* İçerik */}
      {activeFilter === "plans" ? (
        sortedPlans.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="map" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Henüz plan yok</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Mentörle konuşmaya başla — birlikte bir plan oluşturacağız.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
            showsVerticalScrollIndicator={false}
          >
            {sortedPlans.map(plan => {
              const relatedTask = plan.taskId ? tasks.find(t => t.id === plan.taskId) : null;
              return (
                <View key={plan.id} style={styles.planWrapper}>
                  {relatedTask && (
                    <Text style={[styles.planTaskLabel, { color: colors.mutedForeground }]}>
                      <Feather name="link" size={11} /> {relatedTask.title}
                    </Text>
                  )}
                  <PlanCard
                    plan={plan}
                    onStepToggle={(stepId) => toggleStep(plan.id, stepId)}
                    compact={false}
                  />
                </View>
              );
            })}
          </ScrollView>
        )
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => router.push({ pathname: "/(tabs)/mentor", params: { taskId: item.id } })}
              onComplete={() => completeTask(item.id)}
              onDefer={() => deferTask(item.id)}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Feather name="check-square" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {activeFilter === "active" ? "Görev yok" :
                 activeFilter === "completed" ? "Henüz tamamlanmış görev yok" :
                 "Ertelenen görev yok"}
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {activeFilter === "active" ? "Yeni bir görev ekleyerek başla" :
                 "Görevleri tamamladıkça burada görünecek"}
              </Text>
            </View>
          )}
        />
      )}

      {/* Görev ekleme modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>İptal</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Yeni Görev</Text>
            <TouchableOpacity onPress={handleAddTask} disabled={!newTitle.trim()}>
              <Text style={[styles.modalSave, { color: newTitle.trim() ? colors.primary : colors.mutedForeground }]}>
                Kaydet
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Görev Başlığı *</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, borderRadius: 12 }]}
                placeholder="Ne yapman gerekiyor?"
                placeholderTextColor={colors.mutedForeground}
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
              />
            </View>

            <View>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Açıklama (opsiyonel)</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputMulti, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, borderRadius: 12 }]}
                placeholder="Detaylar, notlar..."
                placeholderTextColor={colors.mutedForeground}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Öncelik</Text>
              <View style={styles.priorityRow}>
                {priorityOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor: newPriority === opt.value ? opt.color + "22" : colors.card,
                        borderColor: newPriority === opt.value ? opt.color : colors.border,
                        borderRadius: 12,
                      },
                    ]}
                    onPress={() => setNewPriority(opt.value)}
                  >
                    <Text style={[styles.priorityOptionText, { color: newPriority === opt.value ? opt.color : colors.mutedForeground }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabActive: {
    borderBottomWidth: 2,
  },
  filterTabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  filterCount: {
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  filterCountText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  listContent: {
    padding: 20,
    gap: 10,
  },
  planWrapper: {
    gap: 4,
  },
  planTaskLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  modalSave: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  modalContent: {
    padding: 20,
    gap: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  fieldInputMulti: {
    height: 90,
    textAlignVertical: "top",
  },
  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  priorityOptionText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
