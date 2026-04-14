/**
 * Pax Mentis — Owl Notification Context
 *
 * Maps each NotificationType to an owl peek direction + icon,
 * picks a random message, and exposes showOwl() imperatively.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { NotificationType } from "@/lib/notificationService";
import { registerOwlCallback } from "@/lib/notificationService";
import type { OwlDirection, OwlPayload } from "@/components/OwlNotification";

// ─── Direction + icon per notification type ───────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { direction: OwlDirection; icon: string }> = {
  self_compassion:  { direction: "left",   icon: "🌿" },
  resistance_high:  { direction: "left",   icon: "🧘" },
  daily_morning:    { direction: "top",    icon: "☀️" },
  gentle_nudge:     { direction: "right",  icon: "💚" },
  streak_reminder:  { direction: "right",  icon: "🔥" },
  task_added:       { direction: "bottom", icon: "✅" },
  session_complete: { direction: "bottom", icon: "🌱" },
};

// ─── Short-form message catalog (concise for the bubble) ─────────────────────

const BUBBLE_CATALOG: Record<NotificationType, Array<{ title: string; body: string }>> = {
  self_compassion: [
    { title: "Kendine iyi bak 🤍",   body: "Ertelemek insani bir şeydir. Küçük bir adım yeterli." },
    { title: "Her zaman başlangıç!", body: "Mükemmel zaman yoktur. Var olan zaman şimdidir." },
    { title: "Seninle gurur duyuyorum", body: "Zorlandığın her an büyümenin başlangıcıdır." },
  ],
  resistance_high: [
    { title: "Direnç geçici 🌊",     body: "Beyin tehdidi algılıyor. Ama tehlike yok — sadece başla." },
    { title: "Küçük adım, büyük kazanım", body: "Sadece 2 dakika. Beyin gerisini halleder." },
    { title: "Enerji var demektir ⚡", body: "Yüksek direnç, gücün işareti. Yönlendir onu." },
  ],
  daily_morning: [
    { title: "Günaydın! ☀️",          body: "Bugün en önemli tek görevin ne?" },
    { title: "Yeni gün, yeni başlangıç", body: "Dünün yükünü bırak. Mentörün hazır." },
    { title: "Sabah sorusu 🧠",       body: "30 saniye düşün: bugün ne yapınca memnun olursun?" },
  ],
  gentle_nudge: [
    { title: "Seni düşündüm 💚",      body: "Bir süredir görüşmedik. Nasıl gidiyor?" },
    { title: "Bir cümle yeterli",     body: "Mentörünle paylaşmak için mükemmel zaman beklemek zorunda değilsin." },
    { title: "Nefes al 🌸",           body: "Hazır olduğunda buradayım. Yavaş yavaş da olur." },
  ],
  streak_reminder: [
    { title: "Serin devam ediyor 🔥", body: "Bugün de buradayız. Küçük adım serini yaşatır." },
    { title: "Tutarlılık güçtür 💪",  body: "Bugünkü eylem yarının kolaylığını inşa ediyor." },
  ],
  task_added: [
    { title: "Harika bir adım! 🌿",   body: "Görevi eklemek, yapmaya başlamak demektir." },
    { title: "Hedefe yaklaştın 🎯",   body: "Farkındalık, eylemin ilk yarısıdır." },
    { title: "Güzel başlangıç ✨",    body: "Şimdi en küçük bir sonraki adım ne?" },
  ],
  session_complete: [
    { title: "Kendinle konuştun 💬",  body: "Bu sohbet bir şeyler değiştirdi. Yarın görüşürüz." },
    { title: "Bugün cesurlaştın 🌱",  body: "Direncini tanımak onu yenmekten önemli bir ilk adımdır." },
    { title: "Aferin! 🙏",            body: "Her dürüst sohbet büyümeye kapı açar." },
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface OwlContextValue {
  owlPayload: OwlPayload | null;
  showOwl: (type: NotificationType) => void;
  dismissOwl: () => void;
}

const OwlContext = createContext<OwlContextValue | null>(null);

export function OwlProvider({ children }: { children: React.ReactNode }) {
  const [owlPayload, setOwlPayload] = useState<OwlPayload | null>(null);

  const showOwl = useCallback((type: NotificationType) => {
    const config = TYPE_CONFIG[type];
    const msg    = pickRandom(BUBBLE_CATALOG[type]);
    setOwlPayload({
      direction: config.direction,
      icon:      config.icon,
      title:     msg.title,
      body:      msg.body,
    });
  }, []);

  const dismissOwl = useCallback(() => {
    setOwlPayload(null);
  }, []);

  // Register with notification service so notify() also triggers the owl
  useEffect(() => {
    registerOwlCallback(showOwl);
  }, [showOwl]);

  return (
    <OwlContext.Provider value={{ owlPayload, showOwl, dismissOwl }}>
      {children}
    </OwlContext.Provider>
  );
}

export function useOwl(): OwlContextValue {
  const ctx = useContext(OwlContext);
  if (!ctx) throw new Error("useOwl must be used within OwlProvider");
  return ctx;
}
