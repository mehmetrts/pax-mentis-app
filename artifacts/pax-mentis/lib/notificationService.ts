/**
 * Pax Mentis — Notification Service
 *
 * Provides:
 *  • Android channel setup
 *  • Permission request
 *  • Local push scheduling (OS-level, works with screen off)
 *  • In-app toast trigger via callback
 *  • Supportive message catalog (Turkish)
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "task_added"
  | "session_complete"
  | "resistance_high"
  | "streak_reminder"
  | "gentle_nudge"
  | "self_compassion"
  | "daily_morning";

export interface NotificationSettings {
  masterEnabled:   boolean;
  taskAdded:       boolean;
  sessionComplete: boolean;
  resistanceHigh:  boolean;
  streakReminder:  boolean;
  gentleNudge:     boolean;
  selfCompassion:  boolean;
  dailyMorning:    boolean;
  morningHour:     number; // 0-23
  morningMinute:   number;
  quietStart:      number; // quiet hours start (e.g. 22)
  quietEnd:        number; // quiet hours end   (e.g. 8)
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

// ─── Message Catalog ──────────────────────────────────────────────────────────

const CATALOG: Record<NotificationType, Array<{ title: string; body: string }>> = {
  task_added: [
    {
      title: "Harika bir adım! 🌿",
      body: "Yeni görevini ekledin. Her büyük yolculuk küçük bir adımla başlar.",
    },
    {
      title: "Hedefe bir adım daha yakınsın 🎯",
      body: "Görevi kaydetmek, onu yapmaya başlamak demektir. Devam et.",
    },
    {
      title: "Güzel bir başlangıç ✨",
      body: "Farkındalık, eylemin ilk yarısıdır. Görevi gördün, şimdi bir sonraki küçük adım ne?",
    },
  ],
  session_complete: [
    {
      title: "Kendinle konuştun 💬",
      body: "Bu sohbet bir şeyler değiştirdi. Yarın seninle olacağım.",
    },
    {
      title: "Bugün cesurlaştın 🌱",
      body: "Direncini keşfetmek, onu yenmekten daha önemli bir ilk adımdır.",
    },
    {
      title: "Aferin, kendinle dürüst oldun 🙏",
      body: "Her dürüst sohbet büyümeye bir kapı açar. Yarın görüşürüz.",
    },
  ],
  resistance_high: [
    {
      title: "Direnç burada, sen de buradasyın 🧘",
      body: "Yüksek direnç, enerji var demektir. Onu bir adıma yönlendirmek yeterli.",
    },
    {
      title: "Bu his geçici 🌊",
      body: "Beyin zor görevleri tehdit gibi işler. Ama bu, tehlikeli olduğu anlamına gelmez.",
    },
    {
      title: "Küçük adım, büyük kazanım 🍃",
      body: "Sadece 2 dakika. Sadece bir başlangıç. Sonrasını beyin halleder.",
    },
  ],
  streak_reminder: [
    {
      title: "Serin devam ediyor 🔥",
      body: "Bugün de buradayız. Küçük bir adım serini canlı tutar.",
    },
    {
      title: "Tutarlılık güçtür 💪",
      body: "Bugünkü küçük eylem, yarının kolaylığını inşa ediyor.",
    },
  ],
  gentle_nudge: [
    {
      title: "Nasılsın? 🌿",
      body: "Bir süredir görüşmedik. Mentörün burada, istediğinde konuşabiliriz.",
    },
    {
      title: "Seni düşündüm 💚",
      body: "Bir görevin seni bekliyor. Hazır olduğunda yanındayım.",
    },
    {
      title: "Nefes al 🌸",
      body: "Yoğun günler olur. Tek yapman gereken bir şey: bugün mentörünle bir cümle paylaş.",
    },
  ],
  self_compassion: [
    {
      title: "Ertelemek insani bir şeydir 🤍",
      body: "Kendini yargılama. Bugün bir adım atmak yeterli.",
    },
    {
      title: "Her zaman başlangıç zamanı 🌅",
      body: "Mükemmel zaman yoktur. Var olan zaman şimdidir.",
    },
    {
      title: "Kendin için buradayım 🌱",
      body: "Zorlandığın her an bir öğrenme anıdır. Devam etmek cesarettir.",
    },
  ],
  daily_morning: [
    {
      title: "Günaydın ☀️",
      body: "Bugün hangi tek şeyi yaparsan en çok memnun olursun?",
    },
    {
      title: "Yeni bir gün, yeni bir başlangıç 🌿",
      body: "Dünün takıntıları bugünü şekillendirmesin. Mentörün hazır.",
    },
    {
      title: "Sabah sorusu 🧠",
      body: "Bugün en önemli görevin ne? Bunu düşünmek için 30 saniye yeterli.",
    },
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isInQuietHours(quietStart: number, quietEnd: number): boolean {
  const h = new Date().getHours();
  if (quietStart > quietEnd) {
    return h >= quietStart || h < quietEnd;
  }
  return h >= quietStart && h < quietEnd;
}

// ─── Channel Setup ────────────────────────────────────────────────────────────

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("pax-support", {
    name: "Pax Mentis — Destek",
    description: "Destekleyici hatırlatmalar ve teşvik mesajları",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180, 80, 180],
    lightColor: "#8FCF91",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: false,
  });

  await Notifications.setNotificationChannelAsync("pax-task", {
    name: "Pax Mentis — Görev",
    description: "Görev ekleme ve ilerleme bildirimleri",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 120, 60, 120],
    lightColor: "#8FCF91",
    showBadge: true,
  });

  await Notifications.setNotificationChannelAsync("pax-nudge", {
    name: "Pax Mentis — Nazik Hatırlatma",
    description: "Uzun süre uygulama kullanılmadığında nazik hatırlatmalar",
    importance: Notifications.AndroidImportance.LOW,
    vibrationPattern: [0, 100],
    showBadge: false,
  });
}

// ─── Permission ────────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice && Platform.OS !== "web") return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Notification Handler (call once at app start) ───────────────────────────

export function initNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList:   true,
    }),
  });
}

// ─── Schedule OS-level Push ───────────────────────────────────────────────────

/**
 * Fires a local push notification immediately (or after `delaySec` seconds).
 * Works with screen off on Android via the background notification system.
 */
export async function scheduleLocalNotification(
  type: NotificationType,
  settings: NotificationSettings,
  delaySec = 0,
): Promise<void> {
  if (!settings.masterEnabled) return;
  if (isInQuietHours(settings.quietStart, settings.quietEnd)) return;

  const typeEnabled: Record<NotificationType, boolean> = {
    task_added:       settings.taskAdded,
    session_complete: settings.sessionComplete,
    resistance_high:  settings.resistanceHigh,
    streak_reminder:  settings.streakReminder,
    gentle_nudge:     settings.gentleNudge,
    self_compassion:  settings.selfCompassion,
    daily_morning:    settings.dailyMorning,
  };
  if (!typeEnabled[type]) return;

  const msg   = pickRandom(CATALOG[type]);
  const ch    = type === "gentle_nudge" ? "pax-nudge" : type === "task_added" ? "pax-task" : "pax-support";

  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body:  msg.body,
      data:  { type },
      ...(Platform.OS === "android" ? { channelId: ch } : {}),
    },
    trigger: delaySec > 0
      ? { seconds: delaySec, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL }
      : null,
  });
}

// ─── Daily Morning Notification ───────────────────────────────────────────────

/** Cancel existing daily and reschedule at user's chosen time */
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
      ...(Platform.OS === "android" ? { channelId: "pax-support" } : {}),
    },
    trigger: {
      type:    Notifications.SchedulableTriggerInputTypes.DAILY,
      hour:    settings.morningHour,
      minute:  settings.morningMinute,
    },
    identifier: "pax-daily-morning",
  });
}

export async function cancelDailyMorning(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync("pax-daily-morning").catch(() => {});
}

// ─── Gentle Nudge (fires after X hours inactivity) ────────────────────────────

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

// ─── In-App Toast Trigger ─────────────────────────────────────────────────────

export type ToastType = NotificationType;
export type ToastVariant = "success" | "info" | "support" | "warning";

export interface ToastPayload {
  type:    ToastType;
  variant: ToastVariant;
  title:   string;
  body:    string;
}

let _toastCallback: ((payload: ToastPayload) => void) | null = null;

export function registerToastCallback(cb: (payload: ToastPayload) => void): void {
  _toastCallback = cb;
}

export function triggerInAppToast(
  type: NotificationType,
  settings: NotificationSettings,
): void {
  if (!settings.masterEnabled) return;

  const typeEnabled: Record<NotificationType, boolean> = {
    task_added:       settings.taskAdded,
    session_complete: settings.sessionComplete,
    resistance_high:  settings.resistanceHigh,
    streak_reminder:  settings.streakReminder,
    gentle_nudge:     settings.gentleNudge,
    self_compassion:  settings.selfCompassion,
    daily_morning:    settings.dailyMorning,
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
  };

  _toastCallback?.({
    type,
    variant: VARIANT_MAP[type],
    title:   msg.title,
    body:    msg.body,
  });
}
