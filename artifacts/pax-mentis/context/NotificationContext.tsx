/**
 * Pax Mentis — Notification Context
 *
 * Stores notification settings in AsyncStorage, exposes them to the app,
 * and provides helpers for triggering in-app toasts + scheduling OS notifications.
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
import * as Notifications from "expo-notifications";
import {
  NotificationSettings,
  NotificationType,
  DEFAULT_NOTIFICATION_SETTINGS,
  ToastPayload,
  initNotificationHandler,
  requestNotificationPermission,
  setupNotificationChannels,
  scheduleLocalNotification,
  scheduleDailyMorning,
  scheduleGentleNudge,
  registerToastCallback,
  triggerInAppToast,
} from "@/lib/notificationService";

const STORAGE_KEY = "@pax_mentis:notif_settings";

interface NotificationContextValue {
  settings: NotificationSettings;
  updateSettings: (patch: Partial<NotificationSettings>) => Promise<void>;
  notify: (type: NotificationType) => void;
  toast: ToastPayload | null;
  dismissToast: () => void;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load settings ──────────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
          setSettings(s => ({ ...s, ...parsed }));
        } catch (_) {}
      }
    });
  }, []);

  // ── Init notification system ───────────────────────────────────────────────
  useEffect(() => {
    initNotificationHandler();
    setupNotificationChannels();

    Notifications.getPermissionsAsync().then(({ status }) => {
      setPermissionGranted(status === "granted");
    });

    registerToastCallback((payload) => {
      setToast(payload);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 4800);
    });
  }, []);

  // ── Re-schedule daily on settings change ──────────────────────────────────
  useEffect(() => {
    scheduleDailyMorning(settings);
  }, [
    settings.masterEnabled,
    settings.dailyMorning,
    settings.morningHour,
    settings.morningMinute,
  ]);

  const updateSettings = useCallback(async (patch: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    return granted;
  }, []);

  const notify = useCallback((type: NotificationType) => {
    // In-app toast
    triggerInAppToast(type, settings);
    // OS notification (background-safe)
    scheduleLocalNotification(type, settings);
  }, [settings]);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        settings,
        updateSettings,
        notify,
        toast,
        dismissToast,
        permissionGranted,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
