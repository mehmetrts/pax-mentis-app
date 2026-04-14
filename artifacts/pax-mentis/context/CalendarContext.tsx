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
  getCalendarPermissionStatus,
  requestCalendarPermission,
  getAvailableCalendars,
  fetchCalendarInsight,
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

const SETTINGS_KEY = "@pax_mentis:calendar_settings";

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

interface CalendarContextValue {
  calSettings:        CalendarSettings;
  updateCalSettings:  (patch: Partial<CalendarSettings>) => Promise<void>;
  permissionStatus:   "granted" | "denied" | "undetermined";
  requestPermission:  () => Promise<boolean>;
  availableCalendars: AvailableCalendar[];
  insight:            CalendarInsight | null;
  isLoading:          boolean;
  refresh:            () => Promise<void>;
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

  // ── Load persisted settings ───────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SETTINGS_KEY),
      loadSharedNotes(),
    ]).then(([raw, notes]) => {
      if (raw) {
        try { setCalSettings(s => ({ ...s, ...JSON.parse(raw) })); } catch (_) {}
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
      setInsight(result);
    } finally {
      setIsLoading(false);
    }
  }, [calSettings]);

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
