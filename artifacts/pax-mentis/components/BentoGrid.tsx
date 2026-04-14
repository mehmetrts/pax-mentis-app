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

  return (
    <BentoCard accent={toneColor} onPress={onPress} style={styles.statCard}>
      <View style={styles.statHeader}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: toneColor + "28",
              borderRadius: colors.shape?.medium ?? 12,
            },
          ]}
        >
          <Feather name={icon as any} size={16} color={toneColor} />
        </View>
      </View>
      <Text style={[styles.statValue, { color: colors.onSurface }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
    </BentoCard>
  );
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
  statCard: {
    flex: 1,
    gap: 4,
    minHeight: 90,
  },
  statHeader: {
    marginBottom: 4,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
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
