import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { getResistanceLevel } from "@/lib/resistanceAnalyzer";

interface Props {
  score: number;
  showLabel?: boolean;
  compact?: boolean;
}

export function ResistanceMeter({ score, showLabel = true, compact = false }: Props) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;
  const level = getResistanceLevel(score);

  useEffect(() => {
    Animated.spring(anim, {
      toValue: score / 100,
      useNativeDriver: false,
      tension: 30,
      friction: 8,
    }).start();
  }, [score]);

  const barWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.muted, borderRadius: 4 }]}>
        <Animated.View
          style={[
            styles.compactBar,
            { width: barWidth, backgroundColor: level.color, borderRadius: 4 },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Direnç Seviyesi</Text>
          <Text style={[styles.levelText, { color: level.color }]}>{level.label}</Text>
        </View>
      )}
      <View style={[styles.track, { backgroundColor: colors.muted, borderRadius: 8 }]}>
        <Animated.View
          style={[
            styles.bar,
            { width: barWidth, backgroundColor: level.color, borderRadius: 8 },
          ]}
        />
      </View>
      <Text style={[styles.scoreText, { color: colors.mutedForeground }]}>{score}/100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  levelText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  track: {
    height: 6,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
  },
  scoreText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  compactContainer: {
    height: 4,
    overflow: "hidden",
  },
  compactBar: {
    height: "100%",
  },
});
