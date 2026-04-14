import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { getResistanceLevel } from "@/lib/resistanceAnalyzer";
import { M3Spring } from "@/constants/colors";

interface Props {
  score: number;
  showLabel?: boolean;
  compact?: boolean;
}

export function ResistanceMeter({ score, showLabel = true, compact = false }: Props) {
  const colors = useColors();
  const level = getResistanceLevel(score);

  // M3 Expressive spring — deliberate entry (spatialSlow) for the bar
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(score / 100, M3Spring.spatialSlow);
  }, [score]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  if (compact) {
    return (
      <View
        style={[
          styles.compactTrack,
          { backgroundColor: colors.surfaceVariant, borderRadius: 4 },
        ]}
      >
        <Animated.View
          style={[
            styles.compactBar,
            { backgroundColor: level.color, borderRadius: 4 },
            barStyle,
          ]}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
            Direnç Seviyesi
          </Text>
          <Text style={[styles.levelText, { color: level.color }]}>
            {level.label}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.track,
          { backgroundColor: colors.surfaceVariant, borderRadius: 8 },
        ]}
      >
        <Animated.View
          style={[
            styles.bar,
            { backgroundColor: level.color, borderRadius: 8 },
            barStyle,
          ]}
        />
      </View>
      <Text style={[styles.scoreText, { color: colors.onSurfaceVariant }]}>
        {score}/100
      </Text>
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
    height: 7,
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
  compactTrack: {
    height: 5,
    overflow: "hidden",
  },
  compactBar: {
    height: "100%",
  },
});
