/**
 * Pax Mentis — Calendar Insight Card
 *
 * Ana ekran Bento Grid'ine gömülen kompakt takvim özeti.
 * • Bugünkü etkinlikleri listeler
 * • Haftalık yoğunluk göstergesi (bar)
 * • Mahremiyet notu ile birlikte
 * • Animasyonlu giriş (M3 Spring)
 */

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useCalendar } from "@/context/CalendarContext";
import { M3Spring } from "@/constants/colors";

const DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

interface Props {
  onOpenSettings?: () => void;
}

export function CalendarInsightCard({ onOpenSettings }: Props) {
  const colors  = useColors();
  const { insight, isLoading, calSettings } = useCalendar();

  const scale = useSharedValue(1);
  const pressed = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!calSettings.enabled) {
    return (
      <Pressable
        onPress={onOpenSettings}
        style={[
          styles.card,
          styles.disabledCard,
          { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant },
        ]}
      >
        <Feather name="calendar" size={18} color={colors.onSurfaceVariant} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.disabledTitle, { color: colors.onSurfaceVariant }]}>
            Takvim entegrasyonu kapalı
          </Text>
          <Text style={[styles.disabledSub, { color: colors.onSurfaceVariant + "88" }]}>
            Ayarlardan etkinleştir
          </Text>
        </View>
        <Feather name="chevron-right" size={14} color={colors.onSurfaceVariant + "66"} />
      </Pressable>
    );
  }

  if (isLoading || !insight) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
          Takvim okunuyor…
        </Text>
      </View>
    );
  }

  const busynessColor =
    insight.weekBusynessScore >= 70 ? colors.error :
    insight.weekBusynessScore >= 40 ? colors.tertiary :
    colors.primary;

  return (
    <Animated.View style={[pressed, styles.wrapper]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, M3Spring.spatialFast); }}
        onPressOut={() => { scale.value = withSpring(1, M3Spring.spatialDefault); }}
        style={[
          styles.card,
          { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
              <Feather name="calendar" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.onSurface }]}>Takvim</Text>
          </View>
          <View style={[styles.busynessBadge, { backgroundColor: busynessColor + "22" }]}>
            <Text style={[styles.busynessLabel, { color: busynessColor }]}>
              {insight.weekBusynessScore >= 70 ? "Yoğun" :
               insight.weekBusynessScore >= 40 ? "Orta" : "Sakin"}
            </Text>
          </View>
        </View>

        {/* Today count */}
        <Text style={[styles.todayLine, { color: colors.onSurface }]}>
          {insight.todayEvents.length === 0
            ? "Bugün etkinlik yok"
            : `Bugün ${insight.todayEvents.length} etkinlik`}
        </Text>

        {/* Today events list */}
        {insight.todayEvents.slice(0, 3).map((e, i) => (
          <View key={i} style={styles.eventRow}>
            <View style={[styles.eventDot, { backgroundColor: colors.primary }]} />
            <Text
              style={[styles.eventTime, { color: colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {e.allDay ? "Tüm gün" : formatTime(e.startDate)}
            </Text>
            <Text
              style={[styles.eventTitle, { color: colors.onSurface }]}
              numberOfLines={1}
            >
              {e.title}
            </Text>
          </View>
        ))}

        {/* Busyness bar */}
        <View style={styles.barRow}>
          <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${insight.weekBusynessScore}%`,
                  backgroundColor: busynessColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: colors.onSurfaceVariant }]}>
            Hafta yoğunluğu
          </Text>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyRow}>
          <Feather name="lock" size={10} color={colors.onSurfaceVariant + "66"} />
          <Text style={[styles.privacyText, { color: colors.onSurfaceVariant + "66" }]}>
            Yalnızca başlık ve saat okunur · Cihaz içinde kalır
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  wrapper: {},
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  disabledCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  disabledTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  disabledSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginLeft: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  busynessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  busynessLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  todayLine: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    flexShrink: 0,
  },
  eventTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    width: 44,
    flexShrink: 0,
  },
  eventTitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  barRow: {
    gap: 4,
    marginTop: 2,
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  privacyText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
});
