/**
 * Pax Mentis — Notification Service
 *
 * Provides:
 *  • Android channel setup with custom calm chime sound (pax_chime.wav)
 *  • Permission request
 *  • Local push scheduling (OS-level, works with screen off)
 *  • In-app toast trigger via callback
 *  • Supportive message catalog (Turkish)
 *  • Smart context-aware notifications (conversation + task + calendar data)
 *  • Frequency guard: max 1 per hour, max 3 per day (not counting morning)
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "task_added"
  | "session_complete"
  | "resistance_high"
  | "streak_reminder"
  | "gentle_nudge"
  | "self_compassion"
  | "daily_morning"
  | "smart_nudge";

export interface NotificationSettings {
  masterEnabled:   boolean;
  taskAdded:       boolean;
  sessionComplete: boolean;
  resistanceHigh:  boolean;
  streakReminder:  boolean;
  gentleNudge:     boolean;
  selfCompassion:  boolean;
  dailyMorning:    boolean;
  morningHour:     number;
  morningMinute:   number;
  quietStart:      number;
  quietEnd:        number;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  masterEnabled:   true,
  taskAdded:       true,
  sessionComplete: true,
  resistanceHigh:  true,
  streakReminder:  true,
  gentleNudge:     true,
  selfCompassion:  true,
  dailyMorning:    true,
  morningHour:     9,
  morningMinute:   0,
  quietStart:      22,
  quietEnd:        8,
};

// ─── Frequency guard ──────────────────────────────────────────────────────────

const FREQ_KEY = "@pax_mentis:notif_frequency";

interface FreqRecord {
  lastTimestamp: number;   // ms — last notification time (any type)
  todayCount:    number;   // count for today (resets at midnight)
  todayDate:     string;   // YYYY-MM-DD
}

async function canSendNotification(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(FREQ_KEY);
    const now = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10);

    if (!raw) return true;

    const rec: FreqRecord = JSON.parse(raw);

    // Reset daily counter if it's a new day
    if (rec.todayDate !== todayStr) return true;

    // Max 3 non-morning notifications per day
    if (rec.todayCount >= 3) return false;

    // Min 60 minutes between any two notifications
    if (now - rec.lastTimestamp < 60 * 60 * 1000) return false;

    return true;
  } catch {
    return true;
  }
}

async function recordNotificationSent(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(FREQ_KEY);
    const now = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10);

    let rec: FreqRecord = raw
      ? JSON.parse(raw)
      : { lastTimestamp: 0, todayCount: 0, todayDate: todayStr };

    if (rec.todayDate !== todayStr) {
      rec = { lastTimestamp: now, todayCount: 1, todayDate: todayStr };
    } else {
      rec.lastTimestamp = now;
      rec.todayCount    += 1;
    }

    await AsyncStorage.setItem(FREQ_KEY, JSON.stringify(rec));
  } catch {}
}

// ─── Message Catalog ──────────────────────────────────────────────────────────

const CATALOG: Record<NotificationType, Array<{ title: string; body: string }>> = {
  task_added: [
    { title: "Harika bir adım! 🌿",         body: "Yeni görevini ekledin. Her büyük yolculuk küçük bir adımla başlar." },
    { title: "Hedefe bir adım daha yakınsın 🎯", body: "Görevi kaydetmek, onu yapmaya başlamak demektir. Devam et." },
    { title: "Güzel bir başlangıç ✨",       body: "Farkındalık, eylemin ilk yarısıdır. Görevi gördün, şimdi bir sonraki küçük adım ne?" },
  ],
  session_complete: [
    { title: "Kendinle konuştun 💬",         body: "Bu sohbet bir şeyler değiştirdi. Yarın seninle olacağım." },
    { title: "Bugün cesurlaştın 🌱",         body: "Direncini keşfetmek, onu yenmekten daha önemli bir ilk adımdır." },
    { title: "Aferin, kendinle dürüst oldun 🙏", body: "Her dürüst sohbet büyümeye bir kapı açar. Yarın görüşürüz." },
  ],
  resistance_high: [
    { title: "Direnç burada, sen de buradasın 🧘", body: "Yüksek direnç, enerji var demektir. Onu bir adıma yönlendirmek yeterli." },
    { title: "Bu his geçici 🌊",             body: "Beyin zor görevleri tehdit gibi işler. Ama bu, tehlikeli olduğu anlamına gelmez." },
    { title: "Küçük adım, büyük kazanım 🍃", body: "Sadece 2 dakika. Sadece bir başlangıç. Sonrasını beyin halleder." },
  ],
  streak_reminder: [
    { title: "Serin devam ediyor 🔥",        body: "Bugün de buradayız. Küçük bir adım serini canlı tutar." },
    { title: "Tutarlılık güçtür 💪",         body: "Bugünkü küçük eylem, yarının kolaylığını inşa ediyor." },
  ],
  gentle_nudge: [
    { title: "Nasılsın? 🌿",                body: "Bir süredir görüşmedik. Mentörün burada, istediğinde konuşabiliriz." },
    { title: "Seni düşündüm 💚",            body: "Bir görevin seni bekliyor. Hazır olduğunda yanındayım." },
    { title: "Nefes al 🌸",                 body: "Yoğun günler olur. Tek yapman gereken bir şey: bugün mentörünle bir cümle paylaş." },
  ],
  self_compassion: [
    { title: "Ertelemek insani bir şeydir 🤍", body: "Kendini yargılama. Bugün bir adım atmak yeterli." },
    { title: "Her zaman başlangıç zamanı 🌅",  body: "Mükemmel zaman yoktur. Var olan zaman şimdidir." },
    { title: "Kendin için buradayım 🌱",        body: "Zorlandığın her an bir öğrenme anıdır. Devam etmek cesarettir." },
  ],
  daily_morning: [
    { title: "Günaydın ☀️",                 body: "Bugün hangi tek şeyi yaparsan en çok memnun olursun?" },
    { title: "Yeni bir gün, yeni bir başlangıç 🌿", body: "Dünün takıntıları bugünü şekillendirmesin. Mentörün hazır." },
    { title: "Sabah sorusu 🧠",             body: "Bugün en önemli görevin ne? Bunu düşünmek için 30 saniye yeterli." },
  ],
  smart_nudge: [
    { title: "Seni düşündüm 🦉",            body: "Bir görevin seni bekliyor. Küçük bir adım atmak için iyi bir an olabilir." },
    { title: "Takvime baktım 🗓️",           body: "Bugün görece sakin görünüyor — ertelediğin o göreve bir bakma fırsatı olabilir." },
    { title: "Bir dakikan var mı? 🌿",      body: "Mentörün seninle konuşmaya hazır. Küçük bir adım büyük fark yaratır." },
    { title: "Hatırlatma 🌱",               body: "Listelendiğin görevden bu yana zaman geçti. Nasıl gidiyor?" },
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isInQuietHours(quietStart: number, quietEnd: number): boolean {
  const h = new Date().getHours();
  if (quietStart > quietEnd) return h >= quietStart || h < quietEnd;
  return h >= quietStart && h < quietEnd;
}

// ─── Channel Setup ─────────────────────────────────────────────────────────────
// Custom sound: android/app/src/main/res/raw/pax_chime.wav
// Reference without extension for Android channels.

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  // Primary support channel — custom chime sound
  await Notifications.setNotificationChannelAsync("pax-support", {
    name:                   "Pax Mentis — Destek",
    description:            "Destekleyici hatırlatmalar ve teşvik mesajları",
    importance:             Notifications.AndroidImportance.HIGH,
    sound:                  "pax_chime.wav",
    vibrationPattern:       [0, 180, 80, 180],
    lightColor:             "#8FCF91",
    lockscreenVisibility:   Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge:              false,
  });

  // Task channel — same chime
  await Notifications.setNotificationChannelAsync("pax-task", {
    name:                   "Pax Mentis — Görev",
    description:            "Görev ekleme ve ilerleme bildirimleri",
    importance:             Notifications.AndroidImportance.DEFAULT,
    sound:                  "pax_chime.wav",
    vibrationPattern:       [0, 120, 60, 120],
    lightColor:             "#8FCF91",
    showBadge:              true,
  });

  // Low-priority nudge channel — soft vibration only, no sound
  await Notifications.setNotificationChannelAsync("pax-nudge", {
    name:                   "Pax Mentis — Nazik Hatırlatma",
    description:            "Uzun süre uygulama kullanılmadığında nazik hatırlatmalar",
    importance:             Notifications.AndroidImportance.LOW,
    sound:                  "pax_chime.wav",
    vibrationPattern:       [0, 100],
    showBadge:              false,
  });

  // Smart context nudge — chime
  await Notifications.setNotificationChannelAsync("pax-smart", {
    name:                   "Pax Mentis — Akıllı Hatırlatma",
    description:            "Görev ve takvime dayalı bağlamsal hatırlatmalar",
    importance:             Notifications.AndroidImportance.DEFAULT,
    sound:                  "pax_chime.wav",
    vibrationPattern:       [0, 150, 60, 150],
    lightColor:             "#A78BFA",
    lockscreenVisibility:   Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge:              false,
  });
}

// ─── Permission ─────────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice && Platform.OS !== "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Notification Handler (call once at app start) ──────────────────────────

export function initNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert:  true,   // Uygulama açıkken de bildirim banner'ı göster
      shouldPlaySound:  true,
      shouldSetBadge:   false,
      shouldShowBanner: true,
      shouldShowList:   true,
    }),
  });
}

// ─── Schedule OS-level Push ───────────────────────────────────────────────────

export async function scheduleLocalNotification(
  type: NotificationType,
  settings: NotificationSettings,
  delaySec = 0,
): Promise<void> {
  if (!settings.masterEnabled) return;
  if (isInQuietHours(settings.quietStart, settings.quietEnd)) return;

  // Frequency guard (morning is exempt)
  if (type !== "daily_morning") {
    const allowed = await canSendNotification();
    if (!allowed) return;
  }

  const typeEnabled: Record<NotificationType, boolean> = {
    task_added:       settings.taskAdded,
    session_complete: settings.sessionComplete,
    resistance_high:  settings.resistanceHigh,
    streak_reminder:  settings.streakReminder,
    gentle_nudge:     settings.gentleNudge,
    self_compassion:  settings.selfCompassion,
    daily_morning:    settings.dailyMorning,
    smart_nudge:      settings.gentleNudge,
  };
  if (!typeEnabled[type]) return;

  const msg = pickRandom(CATALOG[type]);
  const ch  =
    type === "gentle_nudge" ? "pax-nudge"  :
    type === "task_added"   ? "pax-task"   :
    type === "smart_nudge"  ? "pax-smart"  :
    "pax-support";

  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body:  msg.body,
      data:  { type },
      sound: "pax_chime.wav",
      ...(Platform.OS === "android" ? { channelId: ch } : {}),
    },
    trigger: delaySec > 0
      ? { seconds: delaySec, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL }
      : null,
  });

  if (type !== "daily_morning") {
    await recordNotificationSent();
  }
}

// ─── Smart Context-Aware Notification ─────────────────────────────────────────

const SMART_KEY = "@pax_mentis:smart_notif_state";

interface SmartNotifState {
  lastAnalysisMs: number;
  lastSentType:   string;
}

/**
 * Analyzes local data (tasks, calendar, conversation) and schedules a smart
 * notification if conditions are right. Call this from background / on app hide.
 */
export async function scheduleSmartNotification(
  settings: NotificationSettings,
): Promise<void> {
  if (!settings.masterEnabled || !settings.gentleNudge) return;
  if (isInQuietHours(settings.quietStart, settings.quietEnd)) return;

  // Only run analysis max once per 90 minutes
  try {
    const raw = await AsyncStorage.getItem(SMART_KEY);
    if (raw) {
      const state: SmartNotifState = JSON.parse(raw);
      if (Date.now() - state.lastAnalysisMs < 90 * 60 * 1000) return;
    }
  } catch {}

  const allowed = await canSendNotification();
  if (!allowed) return;

  // Read local context signals
  let hasOverdueTasks  = false;
  let isCalendarLight  = false;
  let hadRecentSession = false;

  try {
    // Check pending tasks
    const tasksRaw = await AsyncStorage.getItem("@pax_mentis:tasks");
    if (tasksRaw) {
      const tasks: Array<{ completed: boolean; dueDate?: string }> = JSON.parse(tasksRaw);
      const now = new Date();
      hasOverdueTasks = tasks.some(t => {
        if (t.completed) return false;
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < now;
      });
    }
  } catch {}

  try {
    // Check calendar busyness
    const calRaw = await AsyncStorage.getItem("@pax_mentis:cal_insight_cache");
    if (calRaw) {
      const insight = JSON.parse(calRaw);
      isCalendarLight = (insight.weekBusynessScore ?? 100) < 35;
    }
  } catch {}

  try {
    // Check last session time
    const profileRaw = await AsyncStorage.getItem("@pax_mentis:user_profile");
    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      const lastSession = profile.lastSessionAt;
      if (lastSession) {
        hadRecentSession = Date.now() - new Date(lastSession).getTime() < 4 * 3600 * 1000;
      }
    }
  } catch {}

  // Don't nudge if user just had a session
  if (hadRecentSession) return;

  // Pick notification type based on context
  let type: NotificationType = "smart_nudge";
  if (hasOverdueTasks && isCalendarLight) {
    type = "gentle_nudge";
  } else if (hasOverdueTasks) {
    type = "smart_nudge";
  } else {
    type = "self_compassion";
  }

  // Schedule 15–45 min from now (random, non-intrusive)
  const delayMin = 15 + Math.floor(Math.random() * 30);
  await scheduleLocalNotification(type, settings, delayMin * 60);

  // Record analysis time
  await AsyncStorage.setItem(SMART_KEY, JSON.stringify({
    lastAnalysisMs: Date.now(),
    lastSentType:   type,
  }));
}

// ─── Daily Morning Notification ───────────────────────────────────────────────

export async function scheduleDailyMorning(
  settings: NotificationSettings,
): Promise<void> {
  await cancelDailyMorning();
  if (!settings.masterEnabled || !settings.dailyMorning) return;

  const msg = pickRandom(CATALOG.daily_morning);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body:  msg.body,
      data:  { type: "daily_morning" },
      sound: "pax_chime.wav",
      ...(Platform.OS === "android" ? { channelId: "pax-support" } : {}),
    },
    trigger: {
      type:   Notifications.SchedulableTriggerInputTypes.DAILY,
      hour:   settings.morningHour,
      minute: settings.morningMinute,
    },
    identifier: "pax-daily-morning",
  });
}

export async function cancelDailyMorning(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync("pax-daily-morning").catch(() => {});
}

// ─── Gentle Nudge ─────────────────────────────────────────────────────────────

const NUDGE_ID = "pax-gentle-nudge";

export async function scheduleGentleNudge(
  settings: NotificationSettings,
  afterHours = 26,
): Promise<void> {
  await cancelGentleNudge();
  if (!settings.masterEnabled || !settings.gentleNudge) return;
  await scheduleLocalNotification("gentle_nudge", settings, afterHours * 3600);
}

export async function cancelGentleNudge(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NUDGE_ID).catch(() => {});
}

// ─── In-App Toast ─────────────────────────────────────────────────────────────

export type ToastType    = NotificationType;
export type ToastVariant = "success" | "info" | "support" | "warning";

export interface ToastPayload {
  type:    ToastType;
  variant: ToastVariant;
  title:   string;
  body:    string;
}

let _toastCallback: ((payload: ToastPayload) => void) | null = null;
let _owlCallback:   ((type: NotificationType) => void)   | null = null;
let _mentorFocusActive = false;

export function setMentorFocusMode(active: boolean): void {
  _mentorFocusActive = active;
}

export function registerToastCallback(cb: (payload: ToastPayload) => void): void {
  _toastCallback = cb;
}

export function registerOwlCallback(cb: (type: NotificationType) => void): void {
  _owlCallback = cb;
}

export function triggerInAppToast(
  type: NotificationType,
  settings: NotificationSettings,
): void {
  if (!settings.masterEnabled) return;
  if (_mentorFocusActive) return;

  const typeEnabled: Record<NotificationType, boolean> = {
    task_added:       settings.taskAdded,
    session_complete: settings.sessionComplete,
    resistance_high:  settings.resistanceHigh,
    streak_reminder:  settings.streakReminder,
    gentle_nudge:     settings.gentleNudge,
    self_compassion:  settings.selfCompassion,
    daily_morning:    settings.dailyMorning,
    smart_nudge:      settings.gentleNudge,
  };
  if (!typeEnabled[type]) return;

  const msg = pickRandom(CATALOG[type]);
  const VARIANT_MAP: Record<NotificationType, ToastVariant> = {
    task_added:       "success",
    session_complete: "success",
    resistance_high:  "support",
    streak_reminder:  "info",
    gentle_nudge:     "info",
    self_compassion:  "support",
    daily_morning:    "info",
    smart_nudge:      "info",
  };

  _toastCallback?.({ type, variant: VARIANT_MAP[type], title: msg.title, body: msg.body });

  // Owl mascot bildirimi — mentor ekranı dışındayken göster
  if (!_mentorFocusActive) {
    _owlCallback?.(type);
  }
}
