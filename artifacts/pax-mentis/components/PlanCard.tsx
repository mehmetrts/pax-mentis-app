import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { ActionPlan } from "@/lib/actionPlan";

const THEORY_COLORS: Record<string, string> = {
  TMT: "#5a7a5a",
  PSI: "#6a7a8a",
  ACT: "#8a6a5a",
  Kahneman: "#7a6a8a",
  "Atomic Habits": "#6a8a5a",
  Pychyl: "#8a7a5a",
};

interface Props {
  plan: ActionPlan;
  onStepToggle: (stepId: string) => void;
  compact?: boolean;
}

export function PlanCard({ plan, onStepToggle, compact = false }: Props) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(!compact);
  const theoryColor = THEORY_COLORS[plan.theory] ?? colors.primary;
  const completedCount = plan.steps.filter(s => s.isCompleted).length;
  const totalCount = plan.steps.length;
  const progressPct = totalCount > 0 ? completedCount / totalCount : 0;

  const handleStepToggle = async (stepId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStepToggle(stepId);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant, borderRadius: 16 }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => compact && setExpanded(e => !e)}
        activeOpacity={compact ? 0.7 : 1}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.theoryBadge, { backgroundColor: theoryColor + "22", borderRadius: 8 }]}>
            <Text style={[styles.theoryText, { color: theoryColor }]}>{plan.theory}</Text>
          </View>
          <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
            {plan.title}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.progress, { color: completedCount === totalCount ? theoryColor : colors.onSurfaceVariant }]}>
            {completedCount}/{totalCount}
          </Text>
          {compact && (
            <Feather
              name={expanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.onSurfaceVariant}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant, borderRadius: 4 }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: theoryColor, borderRadius: 4, width: `${progressPct * 100}%` as any },
          ]}
        />
      </View>

      {/* Steps */}
      {expanded && (
        <View style={styles.steps}>
          {plan.steps.map((step, idx) => (
            <TouchableOpacity
              key={step.id}
              style={styles.step}
              onPress={() => handleStepToggle(step.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.stepCheck,
                  {
                    borderColor: step.isCompleted ? theoryColor : colors.outlineVariant,
                    backgroundColor: step.isCompleted ? theoryColor : "transparent",
                    borderRadius: 6,
                  },
                ]}
              >
                {step.isCompleted && (
                  <Feather name="check" size={11} color="#fff" />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepText,
                    {
                      color: step.isCompleted ? colors.onSurfaceVariant : colors.onSurface,
                      textDecorationLine: step.isCompleted ? "line-through" : "none",
                    },
                  ]}
                >
                  {idx + 1}. {step.text}
                </Text>
                <Text style={[styles.stepDuration, { color: colors.onSurfaceVariant }]}>
                  ~{step.durationMinutes} dk
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Completed state */}
      {plan.isCompleted && (
        <View style={[styles.completedBanner, { backgroundColor: theoryColor + "11", borderRadius: 10 }]}>
          <Feather name="check-circle" size={14} color={theoryColor} />
          <Text style={[styles.completedText, { color: theoryColor }]}>Plan tamamlandı</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  theoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  theoryText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  progress: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  progressBar: {
    height: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
  },
  steps: {
    gap: 10,
    marginTop: 2,
  },
  step: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  stepCheck: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  stepDuration: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  completedText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
