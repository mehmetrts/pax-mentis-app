/**
 * Pax Mentis — Bildirim Merkezi Modal
 *
 * Ayarlar ekranından açılan tam ekran modal:
 * • Her bildirim türü kendi maskot animasyonuyla gösterilir
 * • Açma/kapama toggle + test butonu
 * • Master toggle en üstte
 * • Sabah hatırlatması saati görüntülenir
 */

import React, { useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Platform,
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/context/NotificationContext";
import type { NotificationType, NotificationSettings } from "@/lib/notificationService";

// ─── Maskot → lottie kaynağı eşleşmesi ────────────────────────────────────────
const LOTTIE_SOURCES = {
  giraffe: require("@/assets/lottie/Meditating_Giraffe_1776260409023.lottie"),
  crab:    require("@/assets/lottie/Dancing_Crab_1776260409026.lottie"),
  reeny:   require("@/assets/lottie/Reeny_Waving_1776260409025.lottie"),
  tiger:   require("@/assets/lottie/Cute_Tiger_1776260409024.lottie"),
  cat:     require("@/assets/lottie/Loader_cat_1776260409025.lottie"),
  doggie:  require("@/assets/lottie/Cute_Doggie_1776260409024.lottie"),
  monkey:  require("@/assets/lottie/Monkey_1776260409025.lottie"),
  cama:    require("@/assets/lottie/Camaleon_1776260409025.lottie"),
};

// ─── Bildirim türü yapılandırması ──────────────────────────────────────────────
interface NotifConfig {
  type:        NotificationType;
  settingKey:  keyof NotificationSettings;
  label:       string;
  description: string;
  mascot:      keyof typeof LOTTIE_SOURCES;
}

const NOTIF_CONFIGS: Array<NotifConfig> = [
  {
    type:       "daily_morning",
    settingKey: "dailyMorning",
    label:      "Sabah Sorusu",
    description:"Her sabah motivasyon mesajı ve günlük sorusu gönderir.",
    mascot:     "cat",
  },
  {
    type:       "task_added",
    settingKey: "taskAdded",
    label:      "Görev Eklenince",
    description:"Yeni görev eklediğinde kutlama ve destek mesajı.",
    mascot:     "crab",
  },
  {
    type:       "session_complete",
    settingKey: "sessionComplete",
    label:      "Sohbet Tamamlandı",
    description:"Mentor sohbeti bittiğinde teşvik mesajı gelir.",
    mascot:     "reeny",
  },
  {
    type:       "resistance_high",
    settingKey: "resistanceHigh",
    label:      "Yüksek Direnç",
    description:"Direnç %70'in üzerinde tespit edildiğinde destek mesajı.",
    mascot:     "tiger",
  },
  {
    type:       "streak_reminder",
    settingKey: "streakReminder",
    label:      "Seri Hatırlatması",
    description:"Günlük serinizi canlı tutmak için motivasyon mesajı.",
    mascot:     "monkey",
  },
  {
    type:       "gentle_nudge",
    settingKey: "gentleNudge",
    label:      "Nazik Hatırlatma",
    description:"Uzun süre gelmediğinde nazikçe sizi hatırlatır.",
    mascot:     "doggie",
  },
  {
    type:       "self_compassion",
    settingKey: "selfCompassion",
    label:      "Öz-Şefkat Mesajları",
    description:"Erteleme sonrası kendinizle barışık kalmak için.",
    mascot:     "giraffe",
  },
  {
    type:       "smart_nudge",
    settingKey: "gentleNudge",
    label:      "Akıllı Hatırlatma",
    description:"Görev ve takvime göre en uygun zamanda hatırlatır.",
    mascot:     "cama",
  },
];

// ─── Tek bildirim kartı ────────────────────────────────────────────────────────
function NotifCard({
  config,
  enabled,
  masterEnabled,
  onToggle,
  onTest,
}: {
  config: NotifConfig;
  enabled: boolean;
  masterEnabled: boolean;
  onToggle: (v: boolean) => void;
  onTest: () => void;
}) {
  const colors  = useColors();
  const lottieRef = useRef<LottieView>(null);
  const disabled  = !masterEnabled;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: enabled && !disabled
            ? colors.primaryContainer + "33"
            : colors.surfaceContainer,
          borderColor: enabled && !disabled
            ? colors.primary + "44"
            : colors.outlineVariant,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {/* Maskot animasyonu */}
      <Pressable
        onPress={() => lottieRef.current?.play()}
        style={styles.lottieWrap}
      >
        <LottieView
          ref={lottieRef}
          source={LOTTIE_SOURCES[config.mascot]}
          autoPlay
          loop
          style={styles.lottie}
        />
      </Pressable>

      {/* İçerik */}
      <View style={styles.cardBody}>
        <Text style={[styles.cardLabel, { color: colors.onSurface }]}>
          {config.label}
        </Text>
        <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>
          {config.description}
        </Text>

        <View style={styles.cardActions}>
          {/* Test butonu */}
          <Pressable
            onPress={onTest}
            disabled={disabled || !enabled}
            style={({ pressed }) => [
              styles.testBtn,
              {
                backgroundColor:
                  disabled || !enabled
                    ? colors.surfaceVariant
                    : pressed
                    ? colors.primary + "33"
                    : colors.primaryContainer,
                borderColor:
                  disabled || !enabled
                    ? colors.outlineVariant
                    : colors.primary + "66",
              },
            ]}
          >
            <Feather
              name="send"
              size={11}
              color={disabled || !enabled ? colors.onSurfaceVariant : colors.primary}
            />
            <Text
              style={[
                styles.testBtnText,
                { color: disabled || !enabled ? colors.onSurfaceVariant : colors.primary },
              ]}
            >
              Test
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Toggle */}
      <Switch
        value={enabled && !disabled}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
        thumbColor={colors.onPrimary}
        style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
      />
    </View>
  );
}

// ─── Ana modal ────────────────────────────────────────────────────────────────
interface NotificationModalProps {
  visible:  boolean;
  onClose:  () => void;
}

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, notify, permissionGranted, requestPermission } =
    useNotifications();

  const topPad    = insets.top    + (Platform.OS === "android" ? 8 : 0);
  const bottomPad = insets.bottom + 16;

  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalRoot, { backgroundColor: colors.surface, paddingTop: topPad }]}>

        {/* Handle bar */}
        <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />

        {/* Başlık */}
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
              Bildirimler
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.onSurfaceVariant }]}>
              Maskota tıklayarak animasyonu izleyebilirsin
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.surfaceContainer }]}
          >
            <Feather name="x" size={18} color={colors.onSurface} />
          </Pressable>
        </View>

        {/* İzin uyarısı */}
        {!permissionGranted && (
          <Pressable
            onPress={requestPermission}
            style={[
              styles.permBanner,
              { backgroundColor: colors.tertiaryContainer, borderColor: colors.tertiary + "44" },
            ]}
          >
            <Feather name="bell-off" size={16} color={colors.tertiary} />
            <Text style={[styles.permText, { color: colors.onTertiaryContainer }]}>
              Bildirim izni verilmemiş — izin vermek için dokun
            </Text>
            <Feather name="chevron-right" size={14} color={colors.tertiary} />
          </Pressable>
        )}

        {/* Master toggle */}
        <View
          style={[
            styles.masterCard,
            {
              backgroundColor: settings.masterEnabled
                ? colors.primaryContainer
                : colors.surfaceContainer,
              borderColor: settings.masterEnabled
                ? colors.primary + "55"
                : colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.masterLeft}>
            <View
              style={[
                styles.masterIcon,
                {
                  backgroundColor: settings.masterEnabled
                    ? colors.primary
                    : colors.outline,
                },
              ]}
            >
              <Feather
                name="bell"
                size={22}
                color={settings.masterEnabled ? colors.onPrimary : colors.surface}
              />
            </View>
            <View>
              <Text style={[styles.masterLabel, { color: colors.onSurface }]}>
                Tüm Bildirimler
              </Text>
              <Text style={[styles.masterSub, { color: colors.onSurfaceVariant }]}>
                {settings.masterEnabled
                  ? `Aktif · Sabah ${formatTime(settings.morningHour, settings.morningMinute)}`
                  : "Tüm bildirimler kapalı"}
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

        {/* Bildirim kartları */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
        >
          {NOTIF_CONFIGS.map((cfg) => {
            const key = cfg.settingKey as keyof typeof settings;
            const enabled = Boolean(settings[key]);

            return (
              <NotifCard
                key={cfg.type}
                config={cfg}
                enabled={enabled}
                masterEnabled={settings.masterEnabled}
                onToggle={(v) => updateSettings({ [cfg.settingKey]: v } as any)}
                onTest={() => notify(cfg.type)}
              />
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  permBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  permText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  masterCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  masterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  masterIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  masterLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  masterSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  // ─── Kart ─────────────────────────────────────────────────────────────
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  lottieWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: "hidden",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: 72,
    height: 72,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  cardActions: {
    flexDirection: "row",
    marginTop: 6,
  },
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  testBtnText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
