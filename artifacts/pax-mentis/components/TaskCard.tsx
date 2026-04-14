import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { Task } from "@/context/AppContext";
import { ResistanceMeter } from "./ResistanceMeter";
import { M3Spring } from "@/constants/colors";

interface Props {
  task: Task;
  onPress: () => void;
  onComplete: () => void;
  onDefer: () => void;
}

const PRIORITY_COLORS = {
  low:    "#5A8A6A",
  medium: "#C28C0A",
  high:   "#C05050",
};

const PRIORITY_LABELS = {
  low:    "Düşük",
  medium: "Orta",
  high:   "Yüksek",
};

export function TaskCard({ task, onPress, onComplete, onDefer }: Props) {
  const colors = useColors();

  // Card press spring
  const cardScale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  // Checkbox spring scale + shape morph (square→circle on check)
  const checkScale  = useSharedValue(task.status === "completed" ? 1 : 1);
  const checkRadius = useSharedValue(task.status === "completed" ? 9999 : 6);
  const checkStyle  = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    borderRadius: checkRadius.value,
  }));

  const handleComplete = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // M3 Expressive — shape morph: square → circle, bounce
    checkScale.value  = withSpring(1.25, M3Spring.spatialFast, () => {
      checkScale.value = withSpring(1, M3Spring.spatialDefault);
    });
    checkRadius.value = withSpring(9999, M3Spring.spatialFast);
    onComplete();
  }, [onComplete]);

  const handleDefer = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDefer();
  }, [onDefer]);

  const handlePressIn  = () => cardScale.value = withSpring(0.975, M3Spring.spatialFast);
  const handlePressOut = () => cardScale.value = withSpring(1, M3Spring.spatialDefault);

  const isCompleted = task.status === "completed";

  return (
    <Animated.View style={cardStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: colors.surfaceContainer,
            borderRadius: colors.radius || 16,
            borderColor: colors.outlineVariant,
            opacity: isCompleted ? 0.55 : 1,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {/* Checkbox with shape morph */}
            <Pressable onPress={handleComplete} style={styles.checkButton}>
              <Animated.View
                style={[
                  styles.checkbox,
                  {
                    borderColor: isCompleted ? colors.primary : colors.outline,
                    backgroundColor: isCompleted ? colors.primary : "transparent",
                  },
                  checkStyle,
                ]}
              >
                {isCompleted && (
                  <Feather name="check" size={12} color={colors.onPrimary} />
                )}
              </Animated.View>
            </Pressable>

            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.title,
                  {
                    color: isCompleted ? colors.onSurfaceVariant : colors.onSurface,
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
                {
                  backgroundColor: PRIORITY_COLORS[task.priority] + "22",
                  borderRadius: 9999,
                },
              ]}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: PRIORITY_COLORS[task.priority] },
                ]}
              />
              <Text
                style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}
              >
                {PRIORITY_LABELS[task.priority]}
              </Text>
            </View>
          </View>

          {task.description ? (
            <Text
              style={[styles.description, { color: colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
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
              <Feather name="clock" size={10} color={colors.onSurfaceVariant} />
              <Text style={[styles.deferText, { color: colors.onSurfaceVariant }]}>
                {task.deferCount}x ertelendi
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }} />

          {!isCompleted && (
            <Pressable onPress={handleDefer} style={styles.deferButton}>
              <Feather name="skip-forward" size={14} color={colors.onSurfaceVariant} />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
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
