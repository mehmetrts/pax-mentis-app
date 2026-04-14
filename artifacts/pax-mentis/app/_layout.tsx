import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SupportiveToast } from "@/components/SupportiveToast";
import { OwlNotification } from "@/components/OwlNotification";
import { AppProvider } from "@/context/AppContext";
import { CalendarProvider } from "@/context/CalendarContext";
import { NotificationProvider, useNotifications } from "@/context/NotificationContext";
import { OwlProvider, useOwl } from "@/context/OwlContext";
import { ThemeProvider } from "@/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

/** Global toast overlay — rendered above everything */
function ToastOverlay() {
  const { toast, dismissToast } = useNotifications();
  return <SupportiveToast payload={toast} onDismiss={dismissToast} />;
}

/** Animated owl — rendered as top-level overlay */
function OwlOverlay() {
  const { owlPayload, dismissOwl } = useOwl();
  return <OwlNotification payload={owlPayload} onDismiss={dismissOwl} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppProvider>
              <NotificationProvider>
                <CalendarProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <KeyboardProvider>
                      <OwlProvider>
                        <RootLayoutNav />
                        <ToastOverlay />
                        <OwlOverlay />
                      </OwlProvider>
                    </KeyboardProvider>
                  </GestureHandlerRootView>
                </CalendarProvider>
              </NotificationProvider>
            </AppProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
