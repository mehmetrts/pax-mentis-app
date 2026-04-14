/**
 * Pax Mentis — Calendar Service
 *
 * Mahremiyet öncelikli takvim erişimi:
 *  • Yalnızca kullanıcı açıkça izin verince çalışır
 *  • Okunur: etkinlik başlığı + başlangıç/bitiş zamanı
 *  • Okunmaz: açıklama, katılımcılar, konum, notlar
 *  • Hiçbir veri sunucuya gönderilmez — tüm işlem cihaz üzerinde
 *  • Çıkarılan içerik: yoğunluk skoru + kısa Türkçe özet
 */

import * as Calendar from "expo-calendar";
import { Platform } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarEventSummary {
  title: string;          // only title, no description
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  calendarId: string;
}

export interface CalendarInsight {
  /** How many events in the next 7 days */
  totalEvents: number;
  /** Events today */
  todayEvents: CalendarEventSummary[];
  /** Events in next 7 days (max 15 items) */
  upcomingEvents: CalendarEventSummary[];
  /** 0–100: how busy the week looks */
  weekBusynessScore: number;
  /** Short Turkish summary for LLM context injection */
  turkishSummary: string;
  /** Timestamp of last read */
  fetchedAt: number;
}

export interface AvailableCalendar {
  id: string;
  title: string;
  source: string;
  color: string;
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestCalendarPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === "granted";
}

export async function getCalendarPermissionStatus(): Promise<"granted" | "denied" | "undetermined"> {
  if (Platform.OS === "web") return "denied";
  const { status } = await Calendar.getCalendarPermissionsAsync();
  return status;
}

// ─── Calendar list ────────────────────────────────────────────────────────────

export async function getAvailableCalendars(): Promise<AvailableCalendar[]> {
  try {
    const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return cals.map(c => ({
      id:     c.id,
      title:  c.title,
      source: (c as any).source?.name ?? c.source ?? "?",
      color:  c.color ?? "#3B6E3B",
    }));
  } catch {
    return [];
  }
}

// ─── Event reading ────────────────────────────────────────────────────────────

/**
 * Read upcoming events from given calendar IDs.
 * Privacy: only title + time is extracted. Description/attendees/location ignored.
 */
export async function fetchCalendarInsight(
  calendarIds: string[],
  daysAhead = 7,
): Promise<CalendarInsight> {
  const now   = new Date();
  const end   = new Date(now.getTime() + daysAhead * 24 * 3600 * 1000);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  let rawEvents: Calendar.Event[] = [];
  try {
    rawEvents = await Calendar.getEventsAsync(
      calendarIds.length > 0 ? calendarIds : (await Calendar.getCalendarsAsync()).map(c => c.id),
      now,
      end,
    );
  } catch {
    return makeEmptyInsight();
  }

  // ── Privacy filter: strip everything except title + time ─────────────────
  const events: CalendarEventSummary[] = rawEvents
    .filter(e => e.title)
    .map(e => ({
      title:      redactSensitiveTitle(e.title ?? ""),
      startDate:  new Date(e.startDate),
      endDate:    new Date(e.endDate),
      allDay:     e.allDay ?? false,
      calendarId: e.calendarId,
    }))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const todayEvents    = events.filter(e => e.startDate <= todayEnd);
  const upcomingEvents = events.slice(0, 15);

  const weekBusynessScore = computeBusyness(events, daysAhead);
  const turkishSummary    = buildTurkishSummary(todayEvents, upcomingEvents, weekBusynessScore);

  return {
    totalEvents: events.length,
    todayEvents,
    upcomingEvents,
    weekBusynessScore,
    turkishSummary,
    fetchedAt: Date.now(),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Remove any personal identifiers (email patterns, phone numbers) from titles */
function redactSensitiveTitle(title: string): string {
  return title
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, "[e-posta]")
    .replace(/\+?\d[\d\s\-()]{7,}/g, "[telefon]")
    .slice(0, 80); // cap length
}

function computeBusyness(events: CalendarEventSummary[], days: number): number {
  if (events.length === 0) return 0;

  // weighted score: more events today → higher score
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalMinutes = 0;
  for (const e of events) {
    if (!e.allDay) {
      const dur = (e.endDate.getTime() - e.startDate.getTime()) / 60000;
      const daysFromNow = Math.max(
        0,
        (e.startDate.getTime() - today.getTime()) / (24 * 3600 * 1000),
      );
      const weight = Math.max(0.2, 1 - daysFromNow / 7);
      totalMinutes += Math.min(dur, 120) * weight;
    } else {
      totalMinutes += 30; // all-day events add a flat 30 min
    }
  }

  // ~480 min/day × days ≈ total available work time
  const maxMinutes = 480 * days;
  return Math.round(Math.min(100, (totalMinutes / maxMinutes) * 200));
}

function buildTurkishSummary(
  todayEvents: CalendarEventSummary[],
  upcoming:    CalendarEventSummary[],
  busyness:    number,
): string {
  const lines: string[] = [];

  if (todayEvents.length === 0) {
    lines.push("Bugün takvimde kayıtlı etkinlik yok.");
  } else {
    lines.push(`Bugün ${todayEvents.length} etkinlik var:`);
    for (const e of todayEvents.slice(0, 3)) {
      const t = e.allDay ? "Tüm gün" : formatTime(e.startDate);
      lines.push(`  • ${t} — ${e.title}`);
    }
    if (todayEvents.length > 3) {
      lines.push(`  ... ve ${todayEvents.length - 3} etkinlik daha.`);
    }
  }

  const nonToday = upcoming.filter(e => !todayEvents.includes(e));
  if (nonToday.length > 0) {
    lines.push(`\nÖnümüzdeki günlerde ${nonToday.length} etkinlik yaklaşıyor.`);
    const next = nonToday[0];
    lines.push(`  Bir sonraki: "${next.title}" — ${formatDate(next.startDate)}`);
  }

  if (busyness >= 70) {
    lines.push("\nBu hafta takvim yoğun görünüyor. Mentor sohbetlerini kısa tutmak isteyebilirsin.");
  } else if (busyness <= 20) {
    lines.push("\nBu hafta takvim görece boş — derinlemesine çalışma için iyi bir fırsat olabilir.");
  }

  return lines.join("\n");
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDate(d: Date): string {
  const days = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  return `${days[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}`;
}

function makeEmptyInsight(): CalendarInsight {
  return {
    totalEvents: 0,
    todayEvents: [],
    upcomingEvents: [],
    weekBusynessScore: 0,
    turkishSummary: "Takvim verisi alınamadı.",
    fetchedAt: Date.now(),
  };
}
