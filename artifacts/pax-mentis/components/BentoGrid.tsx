import React, { useCallback } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { M3Spring } from "@/constants/colors";

interface BentoCardProps {
  children: React.ReactNode;
  style?: object;
  onPress?: () => void;
  accent?: string;
}

export function BentoCard({ children, style, onPress, accent }: BentoCardProps) {
  const colors = useColors();

  // M3 Expressive — spring press scale (spatialFast for responsiveness)
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, M3Spring.spatialFast);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, M3Spring.spatialDefault);
  }, []);

  const cardView = (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: accent ? colors.surfaceContainer : colors.card,
          borderRadius: colors.radius || 16,
          borderColor: accent ? accent + "44" : colors.outlineVariant,
          borderLeftWidth: accent ? 3 : 1,
          borderLeftColor: accent || colors.outlineVariant,
        },
        style,
        animStyle,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardView}
      </Pressable>
    );
  }

  return cardView;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  onPress?: () => void;
}

export function StatCard({ label, value, icon, color, onPress }: StatCardProps) {
  const colors = useColors();
  const toneColor = color || colors.primary;

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const card = (
    <Animated.View
      style={[
        styles.statCard,
        {
          backgroundColor: toneColor + "14",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: toneColor + "30",
        },
        animStyle,
      ]}
    >
      {/* Icon — M3 tonal container, top-left */}
      <View
        style={[
          styles.statIconWrap,
          {
            backgroundColor: toneColor + "26",
            borderRadius: 14,
          },
        ]}
      >
        <Feather name={icon as any} size={18} color={toneColor} />
      </View>

      {/* Value — large, bold */}
      <Text
        style={[styles.statValue, { color: colors.onSurface }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>

      {/* Label — always visible */}
      <Text
        style={[styles.statLabel, { color: toneColor }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {label}
      </Text>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.95, M3Spring.spatialFast); }}
        onPressOut={() => { scale.value = withSpring(1, M3Spring.spatialDefault); }}
        onPress={onPress}
        style={styles.statCardOuter}
      >
        {card}
      </Pressable>
    );
  }
  return <View style={styles.statCardOuter}>{card}</View>;
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  /* ── StatCard ── */
  statCardOuter: {
    width: "48%",    // 2-column grid, leaves gap in between
  },
  statCard: {
    padding: 16,
    gap: 6,
    minHeight: 110,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    lineHeight: 34,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  sectionAction: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
