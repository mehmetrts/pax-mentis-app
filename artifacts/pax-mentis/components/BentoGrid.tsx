import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface BentoCardProps {
  children: React.ReactNode;
  style?: object;
  onPress?: () => void;
  accent?: string;
}

export function BentoCard({ children, style, onPress, accent }: BentoCardProps) {
  const colors = useColors();
  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: (colors.radius || 16),
          borderColor: accent ? accent + "33" : colors.border,
          borderLeftWidth: accent ? 3 : 1,
          borderLeftColor: accent || colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
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
  return (
    <BentoCard accent={color} onPress={onPress} style={styles.statCard}>
      <View style={styles.statHeader}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: (color || colors.primary) + "22", borderRadius: 10 },
          ]}
        >
          <Feather name={icon as any} size={16} color={color || colors.primary} />
        </View>
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </BentoCard>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </TouchableOpacity>
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
    width: 32,
    height: 32,
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
