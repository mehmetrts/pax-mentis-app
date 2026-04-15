/**
 * Pax Mentis — Calendar Service
 *
 * Mahremiyet öncelikli takvim erişimi:
 *  • Yalnızca kullanıcı açıkça izin verince çalışır
 *  • Okunur: etkinlik başlığı + başlangıç/bitiş zamanı
 *  • Okunmaz: açıklama, katılımcılar, konum, notlar
 *  • Hiçbir veri sunucuya gönderilmez — tüm işlem cihaz üzerinde
 *  • Çıkarılan içerik: yoğunluk skoru + kısa Türkçe özet
 *
 *  iCal (ICS) URL desteği:
 *  • Google Calendar / Outlook / herhangi bir CalDAV servisi
 *  • Kurumsal MDM engelinde bile .ics gizli bağlantısı ile çalışır
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

// ─── iCal (ICS) URL desteği ────────────────────────────────────────────────

export interface ICalFeed {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  color: string;
  lastFetched: number | null;
  lastError: string | null;
}

/**
 * .ics dosyasındaki tarih ifadelerini JavaScript Date nesnesine çevirir.
 * Desteklenen formatlar:
 *   20240415T100000Z   → UTC
 *   20240415T100000    → yerel saat gibi işlenir
 *   20240415           → tüm gün
 */
function parseICalDate(raw: string): { date: Date; allDay: boolean } {
  const s = raw.trim();
  // Tüm gün: YYYYMMDD (8 hane, T yok)
  if (/^\d{8}$/.test(s)) {
    const d = new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`);
    return { date: d, allDay: true };
  }
  // YYYYMMDDTHHMMSSZ veya YYYYMMDDTHHMMSS
  const m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (m) {
    const [, yr, mo, dy, hr, mn, sc, utc] = m;
    const iso = `${yr}-${mo}-${dy}T${hr}:${mn}:${sc}${utc ? "Z" : ""}`;
    return { date: new Date(iso), allDay: false };
  }
  // Geri dönüş: Date constructor'a bırak
  return { date: new Date(s), allDay: false };
}

/**
 * .ics metin içeriğini CalendarEventSummary dizisine dönüştürür.
 * Gizlilik: yalnızca SUMMARY (başlık) ve DTSTART/DTEND okunur.
 */
export function parseICalText(
  icsText: string,
  feedId: string,
): CalendarEventSummary[] {
  // RFC 5545: katlı satırları aç (CRLF + boşluk/tab = devam)
  const unfolded = icsText
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "");

  const events: CalendarEventSummary[] = [];
  const lines = unfolded.split("\n");

  let inEvent = false;
  let summary = "";
  let dtstart: { date: Date; allDay: boolean } | null = null;
  let dtend:   { date: Date; allDay: boolean } | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      summary = "";
      dtstart = null;
      dtend   = null;
      continue;
    }
    if (line === "END:VEVENT") {
      inEvent = false;
      if (summary && dtstart) {
        const end = dtend ?? dtstart;
        events.push({
          title:      redactSensitiveTitle(summary),
          startDate:  dtstart.date,
          endDate:    end.date,
          allDay:     dtstart.allDay,
          calendarId: feedId,
        });
      }
      continue;
    }
    if (!inEvent) continue;

    // Parametre içeren satırlar: DTSTART;TZID=...:değer veya DTSTART;VALUE=DATE:değer
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key   = line.slice(0, colonIdx).split(";")[0].toUpperCase();
    const value = line.slice(colonIdx + 1).trim();

    if (key === "SUMMARY") {
      // iCal escape karakterlerini çöz
      summary = value
        .replace(/\\n/g, " ")
        .replace(/\\,/g, ",")
        .replace(/\\;/g, ";")
        .replace(/\\\\/g, "\\");
    } else if (key === "DTSTART") {
      dtstart = parseICalDate(value);
    } else if (key === "DTEND" || key === "DUE") {
      dtend = parseICalDate(value);
    }
  }

  return events;
}

/**
 * Verilen iCal feed URL'ini indirir ve etkinlik listesi döndürür.
 * 10 saniye zaman aşımı uygulanır.
 */
export async function fetchICalFeed(
  feed: ICalFeed,
  daysAhead = 7,
): Promise<{ events: CalendarEventSummary[]; error: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const resp = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "Accept": "text/calendar, */*" },
    });
    clearTimeout(timer);

    if (!resp.ok) {
      return { events: [], error: `HTTP ${resp.status}` };
    }

    const text = await resp.text();
    if (!text.includes("BEGIN:VCALENDAR")) {
      return { events: [], error: "Geçersiz iCal dosyası" };
    }

    const now = new Date();
    const end = new Date(now.getTime() + daysAhead * 24 * 3600 * 1000);

    const allEvents = parseICalText(text, feed.id);
    // Gelecekteki etkinlikleri filtrele
    const filtered = allEvents.filter(
      e => e.startDate >= now && e.startDate <= end,
    );

    return { events: filtered, error: null };
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === "AbortError") {
      return { events: [], error: "Bağlantı zaman aşımı" };
    }
    return { events: [], error: err?.message ?? "Bilinmeyen hata" };
  }
}

/**
 * Birden fazla iCal feed'inden etkinlik toplayıp birleştirir.
 */
export async function fetchAllICalFeeds(
  feeds: ICalFeed[],
  daysAhead = 7,
): Promise<{ events: CalendarEventSummary[]; errors: Record<string, string> }> {
  const enabledFeeds = feeds.filter(f => f.enabled);
  if (enabledFeeds.length === 0) return { events: [], errors: {} };

  const results = await Promise.all(
    enabledFeeds.map(f => fetchICalFeed(f, daysAhead)),
  );

  const events: CalendarEventSummary[] = [];
  const errors: Record<string, string> = {};

  results.forEach((r, i) => {
    if (r.error) {
      errors[enabledFeeds[i].id] = r.error;
    } else {
      events.push(...r.events);
    }
  });

  return { events, errors };
}

/**
 * Verilen URL'in geçerli bir iCal kaynağı olup olmadığını doğrular.
 * Döndürür: null (başarılı) veya hata mesajı.
 */
export async function validateICalUrl(url: string): Promise<string | null> {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "URL http:// veya https:// ile başlamalı";
  }
  const { error } = await fetchICalFeed(
    { id: "_test", name: "", url, enabled: true, color: "#3B82F6", lastFetched: null, lastError: null },
    30,
  );
  return error;
}
