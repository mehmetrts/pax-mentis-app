import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Task } from "@/context/AppContext";
import { ResistanceMeter } from "./ResistanceMeter";

interface Props {
  task: Task;
  onPress: () => void;
  onComplete: () => void;
  onDefer: () => void;
}

const PRIORITY_COLORS = {
  low: "#8a9a7a",
  medium: "#d4a853",
  high: "#c06060",
};

const PRIORITY_LABELS = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

export function TaskCard({ task, onPress, onComplete, onDefer }: Props) {
  const colors = useColors();

  const handleComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  const handleDefer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDefer();
  };

  const isCompleted = task.status === "completed";
  const isDeferred = task.status === "deferred";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius || 16,
          borderColor: colors.border,
          opacity: isCompleted ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={handleComplete} style={styles.checkButton}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: isCompleted ? colors.primary : colors.border,
                  backgroundColor: isCompleted ? colors.primary : "transparent",
                  borderRadius: 6,
                },
              ]}
            >
              {isCompleted && <Feather name="check" size={12} color={colors.primaryForeground} />}
            </View>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: isCompleted ? colors.mutedForeground : colors.foreground,
                  textDecorationLine: isCompleted ? "line-through" : "none",
                },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: PRIORITY_COLORS[task.priority] + "22", borderRadius: 8 },
            ]}
          >
            <View
              style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]}
            />
            <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>
              {PRIORITY_LABELS[task.priority]}
            </Text>
          </View>
        </View>

        {task.description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
      </View>

      {task.resistanceScore > 0 && !isCompleted && (
        <View style={styles.meter}>
          <ResistanceMeter score={task.resistanceScore} compact />
        </View>
      )}

      <View style={styles.footer}>
        {task.deferCount > 0 && (
          <View style={styles.deferBadge}>
            <Feather name="clock" size={10} color={colors.mutedForeground} />
            <Text style={[styles.deferText, { color: colors.mutedForeground }]}>
              {task.deferCount}x ertelendi
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }} />

        {!isCompleted && (
          <TouchableOpacity onPress={handleDefer} style={styles.deferButton}>
            <Feather name="skip-forward" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  header: {
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkButton: {
    paddingTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  priorityText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginLeft: 32,
  },
  meter: {
    marginLeft: 32,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 32,
    marginTop: 2,
  },
  deferBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deferText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  deferButton: {
    padding: 4,
  },
});
