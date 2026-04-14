/**
 * Pax Mentis — Settings Screen
 *
 * M3 Expressive settings layout:
 * • Master notification toggle
 * • Per-category switches with icons and descriptions
 * • Morning reminder time display
 * • Quiet hours display
 * • Permission banner when notifications denied
 * • Toast preview button (for testing)
 */

import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/context/NotificationContext";
import { M3Spring } from "@/constants/colors";

function SettingRow({
  icon,
  iconColor,
  label,
  description,
  value,
  onToggle,
  disabled,
}: {
  icon: string;
  iconColor: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98, M3Spring.spatialFast); }}
        onPressOut={() => { scale.value = withSpring(1, M3Spring.spatialDefault); }}
        onPress={() => !disabled && onToggle(!value)}
        style={[
          styles.row,
          {
            backgroundColor: colors.surfaceContainer,
            borderColor: colors.outlineVariant,
            opacity: disabled ? 0.45 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.rowIcon,
            { backgroundColor: iconColor + "22", borderRadius: 12 },
          ]}
        >
          <Feather name={icon as any} size={18} color={iconColor} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: colors.onSurface }]}>{label}</Text>
          <Text style={[styles.rowDesc, { color: colors.onSurfaceVariant }]}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{ false: colors.surfaceVariant, true: colors.primary + "88" }}
          thumbColor={value ? colors.primary : colors.outline}
          ios_backgroundColor={colors.surfaceVariant}
        />
      </Pressable>
    </Animated.View>
  );
}

function SectionTitle({ text }: { text: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>{text}</Text>
  );
}

function InfoRow({ icon, label, value, onPress }: {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.infoRow, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}
    >
      <Feather name={icon as any} size={16} color={colors.onSurfaceVariant} />
      <Text style={[styles.infoLabel, { color: colors.onSurface }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Text style={[styles.infoValue, { color: colors.primary }]}>{value}</Text>
      {onPress && <Feather name="chevron-right" size={14} color={colors.onSurfaceVariant} style={{ marginLeft: 4 }} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, notify, permissionGranted, requestPermission } = useNotifications();

  const topPad    = Platform.OS === "web" ? 24 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 84 + 20 : insets.bottom + 100;

  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        "Bildirim İzni Gerekli",
        "Bildirimleri etkinleştirmek için Ayarlar > Uygulamalar > Pax Mentis > Bildirimler yolunu izleyin.",
        [{ text: "Tamam" }],
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: colors.onSurface }]}>Ayarlar</Text>
        <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
          Bildirim ve hatırlatma tercihlerin
        </Text>
      </View>

      {/* Permission Banner */}
      {!permissionGranted && (
        <Pressable
          onPress={handlePermissionRequest}
          style={[
            styles.permBanner,
            { backgroundColor: colors.tertiaryContainer, borderColor: colors.tertiary + "44" },
          ]}
        >
          <Feather name="bell-off" size={18} color={colors.tertiary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.permTitle, { color: colors.onTertiaryContainer }]}>
              Bildirim izni verilmemiş
            </Text>
            <Text style={[styles.permSub, { color: colors.onTertiaryContainer + "BB" }]}>
              Ekran kapalıyken hatırlatma alabilmek için izin ver.
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.tertiary} />
        </Pressable>
      )}

      {/* Master toggle */}
      <SectionTitle text="BİLDİRİMLER" />
      <View style={[styles.masterCard, { backgroundColor: settings.masterEnabled ? colors.primaryContainer : colors.surfaceContainer, borderColor: settings.masterEnabled ? colors.primary + "44" : colors.outlineVariant }]}>
        <View style={styles.masterLeft}>
          <View style={[styles.masterIcon, { backgroundColor: settings.masterEnabled ? colors.primary : colors.outline, borderRadius: 9999 }]}>
            <Feather name="bell" size={20} color={settings.masterEnabled ? colors.onPrimary : colors.surface} />
          </View>
          <View>
            <Text style={[styles.masterLabel, { color: settings.masterEnabled ? colors.onPrimaryContainer : colors.onSurface }]}>
              Tüm Bildirimler
            </Text>
            <Text style={[styles.masterDesc, { color: settings.masterEnabled ? colors.onPrimaryContainer + "AA" : colors.onSurfaceVariant }]}>
              {settings.masterEnabled ? "Bildirimler açık" : "Tüm bildirimler kapalı"}
            </Text>
          </View>
        </View>
        <Switch
          value={settings.masterEnabled}
          onValueChange={(v) => updateSettings({ masterEnabled: v })}
          trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      </View>

      {/* Categories */}
      <SectionTitle text="BİLDİRİM TÜRLERİ" />
      <View style={styles.rowGroup}>
        <SettingRow
          icon="plus-circle"
          iconColor={colors.primary}
          label="Görev Eklendiğinde"
          description="Yeni görev eklediğinde destekleyici mesaj"
          value={settings.taskAdded}
          onToggle={(v) => updateSettings({ taskAdded: v })}
          disabled={!settings.masterEnabled}
        />
        <SettingRow
          icon="message-circle"
          iconColor={colors.tertiary}
          label="Sohbet Tamamlandığında"
          description="Mentor sohbeti bitince teşvik mesajı"
          value={settings.sessionComplete}
          onToggle={(v) => updateSettings({ sessionComplete: v })}
          disabled={!settings.masterEnabled}
        />
        <SettingRow
          icon="activity"
          iconColor={colors.error}
          label="Yüksek Direnç Tespit Edilince"
          description="Direnç %70 üzerinde olduğunda destek"
          value={settings.resistanceHigh}
          onToggle={(v) => updateSettings({ resistanceHigh: v })}
          disabled={!settings.masterEnabled}
        />
        <SettingRow
          icon="zap"
          iconColor={colors.tertiary}
          label="Seri Hatırlatması"
          description="Günlük serini korumak için motivasyon"
          value={settings.streakReminder}
          onToggle={(v) => updateSettings({ streakReminder: v })}
          disabled={!settings.masterEnabled}
        />
        <SettingRow
          icon="clock"
          iconColor={colors.onSurfaceVariant}
          label="Nazik Hatırlatma"
          description="Uzun süre kullanılmadığında nazikçe hatırlatır"
          value={settings.gentleNudge}
          onToggle={(v) => updateSettings({ gentleNudge: v })}
          disabled={!settings.masterEnabled}
        />
        <SettingRow
          icon="heart"
          iconColor={colors.lavender ?? colors.accent}
          label="Öz-şefkat Mesajları"
          description="Erteleme sonrası kendinle barışık kal"
          value={settings.selfCompassion}
          onToggle={(v) => updateSettings({ selfCompassion: v })}
          disabled={!settings.masterEnabled}
        />
      </View>

      {/* Daily Morning */}
      <SectionTitle text="SABAH HATIRLATMASI" />
      <View style={styles.rowGroup}>
        <SettingRow
          icon="sun"
          iconColor={colors.tertiary}
          label="Günlük Sabah Sorusu"
          description="Her sabah motivasyon ve soru mesajı"
          value={settings.dailyMorning}
          onToggle={(v) => updateSettings({ dailyMorning: v })}
          disabled={!settings.masterEnabled}
        />
        <InfoRow
          icon="clock"
          label="Hatırlatma Saati"
          value={formatTime(settings.morningHour, settings.morningMinute)}
        />
        <InfoRow
          icon="moon"
          label="Sessiz Saatler"
          value={`${String(settings.quietStart).padStart(2,"0")}:00 – ${String(settings.quietEnd).padStart(2,"0")}:00`}
        />
      </View>

      {/* Preview */}
      <SectionTitle text="TEST" />
      <Pressable
        onPress={() => notify("self_compassion")}
        style={({ pressed }) => [
          styles.previewBtn,
          {
            backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <Feather name="eye" size={16} color={colors.primary} />
        <Text style={[styles.previewText, { color: colors.primary }]}>
          Bildirim önizlemesi göster
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 4,
  },
  pageTitle: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 20,
  },
  masterCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  masterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  masterIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  masterLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  masterDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  permBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  permTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  permSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  rowGroup: {
    marginHorizontal: 20,
    gap: 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  rowIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  rowDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  previewBtn: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
