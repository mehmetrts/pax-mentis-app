/**
 * Pax Mentis — Calendar Context
 *
 * Cihaz takvimine mahremiyet öncelikli erişim.
 * Veri sunucuya gönderilmez — yalnızca cihaz üzerinde işlenir.
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
import {
  CalendarInsight,
  AvailableCalendar,
  ICalFeed,
  getCalendarPermissionStatus,
  requestCalendarPermission,
  getAvailableCalendars,
  fetchCalendarInsight,
  fetchAllICalFeeds,
  validateICalUrl,
} from "@/lib/calendarService";
import {
  SharedNote,
  loadSharedNotes,
  addSharedNote,
  toggleSharedNote,
  deleteSharedNote,
  clearAllSharedNotes,
  buildSharedNotesContext,
} from "@/lib/sharedNotes";

const SETTINGS_KEY   = "@pax_mentis:calendar_settings";
const ICAL_FEEDS_KEY = "@pax_mentis:ical_feeds";

export interface CalendarSettings {
  enabled:           boolean;
  selectedCalendars: string[]; // empty = all
  daysAhead:         number;   // default 7
  injectIntoMentor:  boolean;
}

const DEFAULT_CAL_SETTINGS: CalendarSettings = {
  enabled:           false,
  selectedCalendars: [],
  daysAhead:         7,
  injectIntoMentor:  true,
};

const FEED_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
];

interface CalendarContextValue {
  calSettings:        CalendarSettings;
  updateCalSettings:  (patch: Partial<CalendarSettings>) => Promise<void>;
  permissionStatus:   "granted" | "denied" | "undetermined";
  requestPermission:  () => Promise<boolean>;
  availableCalendars: AvailableCalendar[];
  insight:            CalendarInsight | null;
  isLoading:          boolean;
  refresh:            () => Promise<void>;
  // iCal URL feed yönetimi
  icalFeeds:          ICalFeed[];
  addICalFeed:        (url: string, name: string) => Promise<string | null>;
  removeICalFeed:     (id: string) => Promise<void>;
  toggleICalFeed:     (id: string) => Promise<void>;
  icalLoading:        boolean;
  // Shared notes (e-posta/not paylaşımı)
  sharedNotes:        SharedNote[];
  addNote:            (content: string, label: string) => Promise<void>;
  toggleNote:         (id: string) => Promise<void>;
  deleteNote:         (id: string) => Promise<void>;
  clearAllNotes:      () => Promise<void>;
  /** LLM context snippet built from active notes */
  notesContext:       string | null;
  /** LLM context snippet built from calendar insight */
  calendarContext:    string | null;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [calSettings, setCalSettings]               = useState<CalendarSettings>(DEFAULT_CAL_SETTINGS);
  const [permissionStatus, setPermissionStatus]     = useState<"granted" | "denied" | "undetermined">("undetermined");
  const [availableCalendars, setAvailableCalendars] = useState<AvailableCalendar[]>([]);
  const [insight, setInsight]                       = useState<CalendarInsight | null>(null);
  const [isLoading, setIsLoading]                   = useState(false);
  const [sharedNotes, setSharedNotes]               = useState<SharedNote[]>([]);
  const [icalFeeds, setIcalFeeds]                   = useState<ICalFeed[]>([]);
  const [icalLoading, setIcalLoading]               = useState(false);

  // ── Load persisted settings ───────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SETTINGS_KEY),
      AsyncStorage.getItem(ICAL_FEEDS_KEY),
      loadSharedNotes(),
    ]).then(([raw, rawFeeds, notes]) => {
      if (raw) {
        try { setCalSettings(s => ({ ...s, ...JSON.parse(raw) })); } catch (_) {}
      }
      if (rawFeeds) {
        try { setIcalFeeds(JSON.parse(rawFeeds)); } catch (_) {}
      }
      setSharedNotes(notes);
    });
  }, []);

  // ── Check permission on mount ─────────────────────────────────────────────
  useEffect(() => {
    getCalendarPermissionStatus().then(setPermissionStatus);
  }, []);

  // ── Auto-refresh calendar when enabled ───────────────────────────────────
  const refreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (calSettings.enabled && permissionStatus === "granted") {
      refresh();
      // Re-read every 30 minutes while app is open
      refreshRef.current = setInterval(() => refresh(), 30 * 60 * 1000);
    } else {
      setInsight(null);
      if (refreshRef.current) clearInterval(refreshRef.current);
    }
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [calSettings.enabled, permissionStatus]);

  const refresh = useCallback(async () => {
    if (!calSettings.enabled || permissionStatus !== "granted") return;
    setIsLoading(true);
    try {
      const cals = await getAvailableCalendars();
      setAvailableCalendars(cals);
      const ids = calSettings.selectedCalendars.length > 0
        ? calSettings.selectedCalendars
        : cals.map(c => c.id);
      const result = await fetchCalendarInsight(ids, calSettings.daysAhead);

      // iCal feed'lerinden gelen etkinlikleri de dahil et
      if (icalFeeds.length > 0) {
        const { events: icalEvents, errors } = await fetchAllICalFeeds(icalFeeds, calSettings.daysAhead);
        // Hataları feed'lere kaydet
        if (Object.keys(errors).length > 0) {
          setIcalFeeds(prev => prev.map(f =>
            errors[f.id] ? { ...f, lastError: errors[f.id] } : { ...f, lastError: null },
          ));
        }
        // iCal etkinliklerini yerleşik insight ile birleştir
        const allEvents = [...result.upcomingEvents, ...icalEvents]
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        result.todayEvents    = allEvents.filter(e => e.startDate <= todayEnd);
        result.upcomingEvents = allEvents.slice(0, 15);
        result.totalEvents    = allEvents.length;
      }

      setInsight(result);
    } finally {
      setIsLoading(false);
    }
  }, [calSettings, icalFeeds]);

  // ── iCal feed yönetimi ────────────────────────────────────────────────────

  const saveIcalFeeds = useCallback(async (feeds: ICalFeed[]) => {
    setIcalFeeds(feeds);
    await AsyncStorage.setItem(ICAL_FEEDS_KEY, JSON.stringify(feeds));
  }, []);

  const addICalFeed = useCallback(async (url: string, name: string): Promise<string | null> => {
    setIcalLoading(true);
    try {
      const error = await validateICalUrl(url);
      if (error) return error;

      const newFeed: ICalFeed = {
        id:          `ical_${Date.now()}`,
        name:        name.trim() || "Takvim",
        url:         url.trim(),
        enabled:     true,
        color:       FEED_COLORS[icalFeeds.length % FEED_COLORS.length],
        lastFetched: Date.now(),
        lastError:   null,
      };
      await saveIcalFeeds([...icalFeeds, newFeed]);
      return null;
    } finally {
      setIcalLoading(false);
    }
  }, [icalFeeds, saveIcalFeeds]);

  const removeICalFeed = useCallback(async (id: string) => {
    await saveIcalFeeds(icalFeeds.filter(f => f.id !== id));
  }, [icalFeeds, saveIcalFeeds]);

  const toggleICalFeed = useCallback(async (id: string) => {
    await saveIcalFeeds(icalFeeds.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  }, [icalFeeds, saveIcalFeeds]);

  const updateCalSettings = useCallback(async (patch: Partial<CalendarSettings>) => {
    setCalSettings(prev => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestCalendarPermission();
    setPermissionStatus(granted ? "granted" : "denied");
    return granted;
  }, []);

  // ── Shared notes ──────────────────────────────────────────────────────────
  const addNote = useCallback(async (content: string, label: string) => {
    const note = await addSharedNote(content, label);
    setSharedNotes(prev => [...prev, note]);
  }, []);

  const toggleNote = useCallback(async (id: string) => {
    await toggleSharedNote(id);
    setSharedNotes(prev => prev.map(n => n.id === id ? { ...n, active: !n.active } : n));
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    await deleteSharedNote(id);
    setSharedNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotes = useCallback(async () => {
    await clearAllSharedNotes();
    setSharedNotes([]);
  }, []);

  // ── Derived LLM context snippets ─────────────────────────────────────────
  const notesContext: string | null = sharedNotes.length > 0
    ? buildSharedNotesContext(sharedNotes)
    : null;

  const calendarContext: string | null =
    calSettings.enabled && calSettings.injectIntoMentor && insight
      ? insight.turkishSummary
      : null;

  return (
    <CalendarContext.Provider
      value={{
        calSettings,
        updateCalSettings,
        permissionStatus,
        requestPermission,
        availableCalendars,
        insight,
        isLoading,
        refresh,
        icalFeeds,
        addICalFeed,
        removeICalFeed,
        toggleICalFeed,
        icalLoading,
        sharedNotes,
        addNote,
        toggleNote,
        deleteNote,
        clearAllNotes,
        notesContext,
        calendarContext,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}
