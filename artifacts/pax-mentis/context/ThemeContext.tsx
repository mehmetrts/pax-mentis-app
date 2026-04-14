import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeMode = "system" | "light" | "dark";

interface ThemeContextType {
  themeMode:    ThemeMode;
  colorScheme:  "light" | "dark";   // resolved
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType>({
  themeMode:    "system",
  colorScheme:  "light",
  setThemeMode: async () => {},
});

const STORAGE_KEY = "@pax_mentis:theme_mode";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme() ?? "light";
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeModeState(stored);
      }
    });
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const colorScheme: "light" | "dark" =
    themeMode === "system" ? systemScheme : themeMode;

  return (
    <ThemeContext.Provider value={{ themeMode, colorScheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme() {
  return useContext(ThemeContext);
}
