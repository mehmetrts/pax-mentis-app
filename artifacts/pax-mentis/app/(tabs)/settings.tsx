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

import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Platform,
  Pressable,
  Alert,
  Modal,
  ActivityIndicator,
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
import { useCalendar } from "@/context/CalendarContext";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import { M3Spring } from "@/constants/colors";
import {
  modelManager,
  MODEL_CATALOG,
  ModelStatus,
  DownloadProgress,
} from "@/lib/modelManager";
import { llmBridge } from "@/lib/localLLM";

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
  const { themeMode, setThemeMode } = useTheme();
  const { settings, updateSettings, notify, permissionGranted, requestPermission } = useNotifications();
  const {
    calSettings, updateCalSettings,
    permissionStatus: calPermStatus, requestPermission: requestCalPerm,
    availableCalendars, insight, isLoading: calLoading, refresh: refreshCal,
    sharedNotes, addNote, toggleNote, deleteNote, clearAllNotes,
  } = useCalendar();

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteLabel, setNoteLabel]     = useState("");

  // ── Model state ─────────────────────────────────────────────────────────────
  const [modelStatuses, setModelStatuses] = useState<Record<string, ModelStatus>>({});
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgress>>({});
  const [activeModelId, setActiveModelId] = useState<string | null>(null);

  const refreshModelStatuses = useCallback(async () => {
    const statuses: Record<string, ModelStatus> = {};
    for (const m of MODEL_CATALOG) {
      statuses[m.id] = await modelManager.getModelStatus(m.id);
    }
    setModelStatuses(statuses);
    const active = await modelManager.getActiveModelId();
    setActiveModelId(active);
  }, []);

  useEffect(() => { refreshModelStatuses(); }, [refreshModelStatuses]);

  const handleDownload = (modelId: string) => {
    setModelStatuses(s => ({ ...s, [modelId]: "downloading" }));
    setDownloadProgress(p => ({ ...p, [modelId]: { totalBytes: 0, downloadedBytes: 0, percent: 0 } }));
    modelManager.downloadModel(
      modelId,
      (progress) => setDownloadProgress(p => ({ ...p, [modelId]: progress })),
      () => {
        refreshModelStatuses();
        setDownloadProgress(p => { const n = { ...p }; delete n[modelId]; return n; });
        // İndirme tamamlandı — modeli otomatik belleğe yükle
        llmBridge.loadModel(modelId);
      },
      (err) => {
        Alert.alert("İndirme Hatası", err);
        setModelStatuses(s => ({ ...s, [modelId]: "error" }));
        setDownloadProgress(p => { const n = { ...p }; delete n[modelId]; return n; });
      },
    );
  };

  const handleCancelDownload = async (modelId: string) => {
    await modelManager.cancelDownload(modelId);
    setModelStatuses(s => ({ ...s, [modelId]: "not_downloaded" }));
    setDownloadProgress(p => { const n = { ...p }; delete n[modelId]; return n; });
  };

  const handleDeleteModel = (modelId: string) => {
    Alert.alert(
      "Modeli Sil",
      "Model dosyası silinecek. Tekrar kullanmak için indirmen gerekecek.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil", style: "destructive",
          onPress: async () => {
            await modelManager.deleteModel(modelId);
            if (activeModelId === modelId) setActiveModelId(null);
            refreshModelStatuses();
          },
        },
      ],
    );
  };

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

  const handleCalendarToggle = async (v: boolean) => {
    if (v && calPermStatus !== "granted") {
      const granted = await requestCalPerm();
      if (!granted) {
        Alert.alert(
          "Takvim İzni Gerekli",
          "Takvim erişimi için Ayarlar > Uygulamalar > Pax Mentis > İzinler yolunu izleyin.\n\nNot: Yalnızca etkinlik başlıkları ve saatleri okunur — açıklama veya katılımcı bilgisi alınmaz.",
          [{ text: "Tamam" }],
        );
        return;
      }
    }
    await updateCalSettings({ enabled: v });
    if (v) refreshCal();
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    await addNote(noteContent.trim(), noteLabel.trim() || "Not");
    setNoteContent("");
    setNoteLabel("");
    setShowAddNoteModal(false);
  };

  const handleClearNotes = () => {
    Alert.alert(
      "Tüm Notları Sil",
      "Tüm paylaşılan notlar silinecek. Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        { text: "Sil", style: "destructive", onPress: () => clearAllNotes() },
      ],
    );
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


      {/* ── TAKVİM ─────────────────────────────────────────────────────────── */}
      <SectionTitle text="TAKVİM ENTEGRASYONU" />

      {/* Privacy info card */}
      <View style={[styles.privacyCard, { backgroundColor: colors.tertiaryContainer + "55", borderColor: colors.tertiary + "33" }]}>
        <Feather name="lock" size={14} color={colors.tertiary} />
        <Text style={[styles.privacyText, { color: colors.onSurface }]}>
          Yalnızca etkinlik başlıkları ve saatleri okunur. Açıklamalar, katılımcılar ve konum bilgisi hiçbir zaman alınmaz. Tüm veriler yalnızca bu cihazda işlenir, sunucuya gönderilmez.
        </Text>
      </View>

      <View style={styles.rowGroup}>
        <SettingRow
          icon="calendar"
          iconColor={colors.primary}
          label="Takvim Erişimi"
          description="Yaklaşan etkinliklere göre yoğunluk analizi"
          value={calSettings.enabled}
          onToggle={handleCalendarToggle}
        />
        {calSettings.enabled && (
          <SettingRow
            icon="cpu"
            iconColor={colors.tertiary}
            label="Mentöre Bağlam Olarak Aktar"
            description="Yoğun günlerde mentor sohbetini buna göre ayarlar"
            value={calSettings.injectIntoMentor}
            onToggle={(v) => updateCalSettings({ injectIntoMentor: v })}
          />
        )}
      </View>

      {/* Calendar insight summary */}
      {calSettings.enabled && insight && (
        <View style={[styles.insightCard, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
          <View style={styles.insightHeader}>
            <Text style={[styles.insightTitle, { color: colors.onSurface }]}>Son takvim özeti</Text>
            <Pressable onPress={refreshCal}>
              <Feather name="refresh-cw" size={14} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={[styles.insightBody, { color: colors.onSurfaceVariant }]}>
            {insight.turkishSummary}
          </Text>
          <Text style={[styles.insightMeta, { color: colors.onSurfaceVariant + "66" }]}>
            {insight.totalEvents} etkinlik · Son güncelleme: {new Date(insight.fetchedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      )}

      {/* ── PAYLAŞILAN NOTLAR (E-posta / Mesaj / Görev) ──────────────────── */}
      <SectionTitle text="MENTOR BAĞLAM NOTLARI" />

      <View style={[styles.privacyCard, { backgroundColor: colors.primaryContainer + "44", borderColor: colors.primary + "22" }]}>
        <Feather name="info" size={14} color={colors.primary} />
        <Text style={[styles.privacyText, { color: colors.onSurface }]}>
          E-posta, mesaj veya görev listelerinden istediğin parçaları buraya yapıştır. Mentor sohbetinde bu bağlamı kullanır. Otomatik e-posta okuma yoktur — neyi paylaşacağını sen seçersin.
        </Text>
      </View>

      {/* Existing notes */}
      {sharedNotes.length > 0 && (
        <View style={[styles.rowGroup, { marginBottom: 2 }]}>
          {sharedNotes.map(note => (
            <View
              key={note.id}
              style={[styles.noteRow, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}
            >
              <Pressable
                onPress={() => toggleNote(note.id)}
                style={[
                  styles.noteActiveDot,
                  { backgroundColor: note.active ? colors.primary : colors.outline },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.noteLabel, { color: colors.onSurface }]} numberOfLines={1}>
                  {note.label}
                </Text>
                <Text style={[styles.noteSnippet, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                  {note.content}
                </Text>
              </View>
              <Pressable
                onPress={() => deleteNote(note.id)}
                hitSlop={10}
                style={{ padding: 4 }}
              >
                <Feather name="trash-2" size={14} color={colors.error} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Add note button */}
      <View style={styles.noteActions}>
        <Pressable
          onPress={() => setShowAddNoteModal(true)}
          style={({ pressed }) => [
            styles.addNoteBtn,
            { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer, borderColor: colors.outlineVariant },
          ]}
        >
          <Feather name="plus" size={16} color={colors.primary} />
          <Text style={[styles.addNoteBtnText, { color: colors.primary }]}>Not Ekle</Text>
        </Pressable>
        {sharedNotes.length > 0 && (
          <Pressable
            onPress={handleClearNotes}
            style={({ pressed }) => [
              styles.clearBtn,
              { backgroundColor: pressed ? colors.errorContainer : "transparent", borderColor: colors.error + "44" },
            ]}
          >
            <Feather name="trash" size={14} color={colors.error} />
            <Text style={[styles.clearBtnText, { color: colors.error }]}>Tümünü Sil</Text>
          </Pressable>
        )}
      </View>

      {/* ── AI MODELİ ──────────────────────────────────────────────────────── */}
      <SectionTitle text="AI MODELİ" />
      <View style={[styles.privacyCard, { backgroundColor: colors.primaryContainer + "44", borderColor: colors.primary + "33" }]}>
        <Feather name="cpu" size={14} color={colors.primary} />
        <Text style={[styles.privacyText, { color: colors.onSurface }]}>
          Model dosyaları yalnızca cihazında saklanır. İndirme yaklaşık 1.8–2.5 GB veri kullanır; Wi-Fi bağlantısı önerilir.
        </Text>
      </View>

      {MODEL_CATALOG.map((model) => {
        const status   = modelStatuses[model.id] ?? "not_downloaded";
        const progress = downloadProgress[model.id];
        const isActive = activeModelId === model.id;
        const isDownloading = status === "downloading";
        const isReady = status === "ready" || status === "loaded" || status === "loading";
        // "Aktif" rozeti: hem seçili HEM de dosya var olmalı
        const isActiveAndReady = isActive && isReady;
        // Bozuk durum: AsyncStorage'da aktif ama dosya yok
        const isBrokenActive = isActive && !isReady && !isDownloading;

        return (
          <View
            key={model.id}
            style={[
              styles.modelCard,
              {
                backgroundColor: isActiveAndReady ? colors.primaryContainer + "55" : colors.surfaceContainer,
                borderColor: isActiveAndReady ? colors.primary + "55" : colors.outlineVariant,
              },
            ]}
          >
            {/* Header row */}
            <View style={styles.modelHeader}>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.modelName, { color: colors.onSurface }]}>{model.name}</Text>
                  {model.recommended && (
                    <View style={[styles.badge, { backgroundColor: colors.tertiary + "22" }]}>
                      <Text style={[styles.badgeText, { color: colors.tertiary }]}>Önerilen</Text>
                    </View>
                  )}
                  {isActiveAndReady && (
                    <View style={[styles.badge, { backgroundColor: colors.primary + "22" }]}>
                      <Text style={[styles.badgeText, { color: colors.primary }]}>Aktif</Text>
                    </View>
                  )}
                  {isBrokenActive && (
                    <View style={[styles.badge, { backgroundColor: colors.error + "22" }]}>
                      <Text style={[styles.badgeText, { color: colors.error }]}>Dosya Yok</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.modelDesc, { color: colors.onSurfaceVariant }]}>
                  {model.description} · {modelManager.formatSize(model.sizeMB)}
                </Text>
              </View>
            </View>

            {/* Progress bar when downloading */}
            {isDownloading && progress && (
              <View style={{ gap: 6, marginTop: 8 }}>
                <View style={[styles.progressTrack, { backgroundColor: colors.outlineVariant }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: colors.primary, width: `${progress.percent}%` as any },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>
                  {progress.percent}% · {modelManager.formatSize(Math.round(progress.downloadedBytes / 1024 / 1024))} / {modelManager.formatSize(model.sizeMB)}
                </Text>
              </View>
            )}

            {/* Action buttons */}
            <View style={[styles.modelActions, { borderTopColor: colors.outlineVariant }]}>
              {isDownloading ? (
                <Pressable
                  onPress={() => handleCancelDownload(model.id)}
                  style={[styles.modelBtn, { backgroundColor: colors.errorContainer, borderColor: colors.error + "44" }]}
                >
                  <Feather name="x" size={14} color={colors.error} />
                  <Text style={[styles.modelBtnText, { color: colors.error }]}>İptal</Text>
                </Pressable>
              ) : isReady ? (
                <>
                  {!isActive && (
                    <Pressable
                      onPress={() => {
                        modelManager.setActiveModelId(model.id);
                        setActiveModelId(model.id);
                        llmBridge.loadModel(model.id);
                      }}
                      style={[styles.modelBtn, { backgroundColor: colors.primaryContainer, borderColor: colors.primary + "44" }]}
                    >
                      <Feather name="check-circle" size={14} color={colors.primary} />
                      <Text style={[styles.modelBtnText, { color: colors.primary }]}>Seç</Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => handleDeleteModel(model.id)}
                    style={[styles.modelBtn, { backgroundColor: colors.errorContainer + "55", borderColor: colors.error + "33" }]}
                  >
                    <Feather name="trash-2" size={14} color={colors.error} />
                    <Text style={[styles.modelBtnText, { color: colors.error }]}>Sil</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onPress={() => handleDownload(model.id)}
                  style={[styles.modelBtn, { backgroundColor: colors.primary, borderColor: "transparent", flex: 1 }]}
                >
                  <Feather name="download" size={14} color={colors.onPrimary} />
                  <Text style={[styles.modelBtnText, { color: colors.onPrimary }]}>
                    {status === "error" ? "Tekrar Dene" : "İndir"}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}

      {/* ── TEMA ────────────────────────────────────────────────────────────── */}
      <SectionTitle text="GÖRÜNÜM" />
      <View style={[styles.segmentCard, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
        {(["system", "light", "dark"] as ThemeMode[]).map((mode, idx, arr) => {
          const labels: Record<ThemeMode, string> = { system: "Sistem", light: "Açık", dark: "Koyu" };
          const icons:  Record<ThemeMode, string> = { system: "monitor", light: "sun", dark: "moon" };
          const active = themeMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => setThemeMode(mode)}
              style={[
                styles.segmentItem,
                {
                  backgroundColor: active ? colors.primary : "transparent",
                  borderRightWidth: idx < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderRightColor: colors.outlineVariant,
                },
              ]}
            >
              <Feather
                name={icons[mode] as any}
                size={15}
                color={active ? colors.onPrimary : colors.onSurfaceVariant}
              />
              <Text style={[styles.segmentText, { color: active ? colors.onPrimary : colors.onSurfaceVariant }]}>
                {labels[mode]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── DİL ──────────────────────────────────────────────────────────────── */}
      <SectionTitle text="DİL" />
      <View style={[styles.langCard, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
        <View style={[styles.langIconWrap, { backgroundColor: colors.primary + "22" }]}>
          <Feather name="globe" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.langLabel, { color: colors.onSurface }]}>Türkçe</Text>
          <Text style={[styles.langSub, { color: colors.onSurfaceVariant }]}>Şu an desteklenen tek dil</Text>
        </View>
        <View style={[styles.langBadge, { backgroundColor: colors.primaryContainer }]}>
          <Text style={[styles.langBadgeText, { color: colors.primary }]}>Aktif</Text>
        </View>
      </View>

      {/* Preview */}
      <SectionTitle text="BAYKUŞ BİLDİRİMİ — TEST" />
      <View style={[styles.owlTestGrid, { gap: 10 }]}>
        {([
          { type: "self_compassion",  label: "← Sol",   icon: "🌿", dir: "Öz-şefkat"    },
          { type: "gentle_nudge",     label: "Sağ →",   icon: "💚", dir: "Dürtme"        },
          { type: "daily_morning",    label: "↑ Üst",   icon: "☀️", dir: "Günaydın"      },
          { type: "task_added",       label: "↓ Alt",   icon: "✅", dir: "Görev"         },
        ] as const).map(({ type, label, icon, dir }) => (
          <Pressable
            key={type}
            onPress={() => notify(type as any)}
            style={({ pressed }) => [
              styles.owlTestBtn,
              {
                backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <Text style={styles.owlTestIcon}>{icon}</Text>
            <Text style={[styles.owlTestLabel, { color: colors.onSurface }]}>{label}</Text>
            <Text style={[styles.owlTestDir, { color: colors.onSurfaceVariant }]}>{dir}</Text>
          </Pressable>
        ))}
      </View>

      {/* Add Note Modal */}
      <Modal
        visible={showAddNoteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddNoteModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Not Ekle</Text>
            <Pressable onPress={() => setShowAddNoteModal(false)}>
              <Feather name="x" size={22} color={colors.onSurface} />
            </Pressable>
          </View>

          <Text style={[styles.modalLabel, { color: colors.onSurfaceVariant }]}>Etiket (örn. "İş e-postası", "Proje notu")</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: colors.surfaceContainer, color: colors.onSurface, borderColor: colors.outlineVariant }]}
            placeholder="Kısa açıklama…"
            placeholderTextColor={colors.onSurfaceVariant + "88"}
            value={noteLabel}
            onChangeText={setNoteLabel}
            maxLength={60}
          />

          <Text style={[styles.modalLabel, { color: colors.onSurfaceVariant }]}>İçerik (e-posta metni, görev listesi, mesaj vb.)</Text>
          <TextInput
            style={[styles.modalTextArea, { backgroundColor: colors.surfaceContainer, color: colors.onSurface, borderColor: colors.outlineVariant }]}
            placeholder="Buraya içeriği yapıştır…"
            placeholderTextColor={colors.onSurfaceVariant + "88"}
            value={noteContent}
            onChangeText={setNoteContent}
            multiline
            numberOfLines={10}
            maxLength={3000}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.onSurfaceVariant + "66" }]}>
            {noteContent.length}/3000
          </Text>

          {/* Privacy reminder */}
          <View style={[styles.modalPrivacy, { backgroundColor: colors.primaryContainer + "44" }]}>
            <Feather name="lock" size={12} color={colors.primary} />
            <Text style={[styles.modalPrivacyText, { color: colors.onSurface }]}>
              Bu içerik yalnızca bu cihazda saklanır ve sunucuya gönderilmez.
            </Text>
          </View>

          <Pressable
            onPress={handleAddNote}
            style={({ pressed }) => [
              styles.modalSaveBtn,
              { backgroundColor: pressed ? colors.primary + "CC" : colors.primary },
            ]}
          >
            <Text style={[styles.modalSaveBtnText, { color: colors.onPrimary }]}>Kaydet</Text>
          </Pressable>
        </View>
      </Modal>
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
  privacyCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  insightCard: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  insightTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  insightBody: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  insightMeta: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noteActiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  noteLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  noteSnippet: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  noteActions: {
    marginHorizontal: 20,
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  addNoteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  addNoteBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  modalLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  modalTextArea: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    minHeight: 160,
  },
  charCount: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: -6,
  },
  modalPrivacy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
  },
  modalPrivacyText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  modalSaveBtn: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  modalSaveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  // ── Owl test grid ────────────────────────────────────────────────────────────
  owlTestGrid: {
    marginHorizontal: 20,
    flexDirection:    "row",
    flexWrap:         "wrap",
  },
  owlTestBtn: {
    width:         "47%",
    borderRadius:  14,
    borderWidth:   1,
    padding:       14,
    alignItems:    "center",
    gap:           4,
  },
  owlTestIcon: {
    fontSize: 24,
    lineHeight: 30,
  },
  owlTestLabel: {
    fontSize:   14,
    fontFamily: "Inter_600SemiBold",
  },
  owlTestDir: {
    fontSize:   11,
    fontFamily: "Inter_400Regular",
  },
  // ── Theme segment ────────────────────────────────────────────────────────────
  segmentCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  // ── Language row ──────────────────────────────────────────────────────────────
  langCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  langIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  langLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  langSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  langBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  langBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  // ── Model card ──────────────────────────────────────────────────────────────
  modelCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  modelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  modelName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  modelDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    lineHeight: 17,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  modelActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  modelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  modelBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
