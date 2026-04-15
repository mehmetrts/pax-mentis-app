/**
 * Pax Mentis — Mascot Notification Context
 *
 * • Queue-based: notifications wait their turn instead of overlapping
 * • Mascot type stored in AsyncStorage (owl / cat / dog / rabbit)
 * • showOwl(type) is imperative; queue max depth = 4 to avoid spam
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NotificationType } from "@/lib/notificationService";
import { registerOwlCallback } from "@/lib/notificationService";
import type { OwlDirection, OwlPayload, MascotType } from "@/components/OwlNotification";

// ─── Direction + icon per notification type ───────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { direction: OwlDirection; icon: string }> = {
  self_compassion:  { direction: "left",   icon: "🌿" },
  resistance_high:  { direction: "left",   icon: "🧘" },
  daily_morning:    { direction: "top",    icon: "☀️" },
  gentle_nudge:     { direction: "right",  icon: "💚" },
  streak_reminder:  { direction: "right",  icon: "🔥" },
  task_added:       { direction: "bottom", icon: "✅" },
  session_complete: { direction: "bottom", icon: "🌱" },
  smart_nudge:      { direction: "right",  icon: "🧠" },
};

// ─── Bubble message catalog ───────────────────────────────────────────────────

const BUBBLE_CATALOG: Record<NotificationType, Array<{ title: string; body: string }>> = {
  self_compassion: [
    { title: "Kendine iyi bak 🤍",        body: "Ertelemek insani bir şeydir. Küçük bir adım yeterli." },
    { title: "Her zaman başlangıç!",      body: "Mükemmel zaman yoktur. Var olan zaman şimdidir." },
    { title: "Seninle gurur duyuyorum",   body: "Zorlandığın her an büyümenin başlangıcıdır." },
  ],
  resistance_high: [
    { title: "Direnç geçici 🌊",          body: "Beyin tehdidi algılıyor. Ama tehlike yok — sadece başla." },
    { title: "Küçük adım, büyük kazanım", body: "Sadece 2 dakika. Beyin gerisini halleder." },
    { title: "Enerji var demektir ⚡",    body: "Yüksek direnç, gücün işareti. Yönlendir onu." },
  ],
  daily_morning: [
    { title: "Günaydın! ☀️",              body: "Bugün en önemli tek görevin ne?" },
    { title: "Yeni gün, yeni başlangıç",  body: "Dünün yükünü bırak. Mentörün hazır." },
    { title: "Sabah sorusu 🧠",           body: "30 saniye düşün: bugün ne yapınca memnun olursun?" },
  ],
  gentle_nudge: [
    { title: "Seni düşündüm 💚",          body: "Bir süredir görüşmedik. Nasıl gidiyor?" },
    { title: "Bir cümle yeterli",         body: "Mentörünle paylaşmak için mükemmel zaman beklemek zorunda değilsin." },
    { title: "Nefes al 🌸",              body: "Hazır olduğunda buradayım. Yavaş yavaş da olur." },
  ],
  streak_reminder: [
    { title: "Serin devam ediyor 🔥",     body: "Bugün de buradayız. Küçük adım serini yaşatır." },
    { title: "Tutarlılık güçtür 💪",      body: "Bugünkü eylem yarının kolaylığını inşa ediyor." },
  ],
  task_added: [
    { title: "Harika bir adım! 🌿",       body: "Görevi eklemek, yapmaya başlamak demektir." },
    { title: "Hedefe yaklaştın 🎯",       body: "Farkındalık, eylemin ilk yarısıdır." },
    { title: "Güzel başlangıç ✨",        body: "Şimdi en küçük bir sonraki adım ne?" },
  ],
  session_complete: [
    { title: "Kendinle konuştun 💬",      body: "Bu sohbet bir şeyler değiştirdi. Yarın görüşürüz." },
    { title: "Bugün cesurlaştın 🌱",      body: "Direncini tanımak onu yenmekten önemli bir ilk adımdır." },
    { title: "Aferin! 🙏",               body: "Her dürüst sohbet büyümeye kapı açar." },
  ],
  smart_nudge: [
    { title: "Tam zamanı 🧠",            body: "Takviminde boşluk var. Bir göreve başlamak ister misin?" },
    { title: "Seni düşündüm 💡",         body: "Kısa bir sohbet bile enerjini yeniden kazandırabilir." },
    { title: "Hazır mısın? ✨",          body: "Bugün planladıklarından en önemlisi hangisi?" },
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildPayload(type: NotificationType): OwlPayload {
  const config = TYPE_CONFIG[type];
  const msg    = pickRandom(BUBBLE_CATALOG[type]);
  return { direction: config.direction, icon: config.icon, title: msg.title, body: msg.body };
}

// ─── Mascot storage ───────────────────────────────────────────────────────────

const MASCOT_KEY = "@pax_mentis:mascot_type";

export const MASCOT_OPTIONS: Array<{ type: MascotType; label: string; emoji: string }> = [
  { type: "owl",    label: "Zürafa",  emoji: "🦒" },
  { type: "cat",    label: "Kedi",    emoji: "🐱" },
  { type: "dog",    label: "Köpek",   emoji: "🐶" },
  { type: "rabbit", label: "Maymun",  emoji: "🐒" },
];

// ─── Context ──────────────────────────────────────────────────────────────────

interface OwlContextValue {
  owlPayload:   OwlPayload | null;
  mascotType:   MascotType;
  showOwl:      (type: NotificationType) => void;
  dismissOwl:   () => void;
  setMascot:    (type: MascotType) => void;
}

const OwlContext = createContext<OwlContextValue | null>(null);

export function OwlProvider({ children }: { children: React.ReactNode }) {
  const [owlPayload, setOwlPayload] = useState<OwlPayload | null>(null);
  const [mascotType, setMascotType] = useState<MascotType>("owl");

  // Queue: max 4 pending notifications
  const queueRef     = useRef<NotificationType[]>([]);
  const isShowingRef = useRef(false);

  // Load mascot preference
  useEffect(() => {
    AsyncStorage.getItem(MASCOT_KEY).then(v => {
      if (v === "cat" || v === "dog" || v === "rabbit" || v === "owl") {
        setMascotType(v as MascotType);
      }
    });
  }, []);

  const _showNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      isShowingRef.current = false;
      return;
    }
    const next = queueRef.current.shift()!;
    setOwlPayload(buildPayload(next));
  }, []);

  const showOwl = useCallback((type: NotificationType) => {
    if (!isShowingRef.current) {
      isShowingRef.current = true;
      setOwlPayload(buildPayload(type));
    } else if (queueRef.current.length < 4) {
      queueRef.current.push(type);
    }
  }, []);

  const dismissOwl = useCallback(() => {
    setOwlPayload(null);
    setTimeout(_showNext, 600);
  }, [_showNext]);

  const setMascot = useCallback((type: MascotType) => {
    setMascotType(type);
    AsyncStorage.setItem(MASCOT_KEY, type);
  }, []);

  // Bridge to notification service
  useEffect(() => {
    registerOwlCallback(showOwl);
  }, [showOwl]);

  return (
    <OwlContext.Provider value={{ owlPayload, mascotType, showOwl, dismissOwl, setMascot }}>
      {children}
    </OwlContext.Provider>
  );
}

export function useOwl(): OwlContextValue {
  const ctx = useContext(OwlContext);
  if (!ctx) throw new Error("useOwl must be used within OwlProvider");
  return ctx;
}
