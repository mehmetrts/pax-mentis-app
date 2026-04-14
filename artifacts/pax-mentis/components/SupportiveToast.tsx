/**
 * Pax Mentis — Supportive In-App Toast
 *
 * M3 Expressive animated banner:
 * • Spring slide-in from top + fade
 * • Auto-dismiss after 4.8s with spring exit
 * • Swipe-up to dismiss (GestureHandler)
 * • Color variant: success (primary), info (tertiary), support (lavender), warning (error)
 * • Icon pulse animation on entry
 */

import React, { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { M3Spring } from "@/constants/colors";
import type { ToastPayload, ToastVariant } from "@/lib/notificationService";

const ICON_MAP: Record<ToastVariant, string> = {
  success: "check-circle",
  info:    "bell",
  support: "heart",
  warning: "alert-circle",
};

interface VariantTokens {
  container: string;
  onContainer: string;
  iconColor: string;
}

function useVariantTokens(variant: ToastVariant): VariantTokens {
  const colors = useColors();
  switch (variant) {
    case "success":
      return {
        container:   colors.primaryContainer,
        onContainer: colors.onPrimaryContainer,
        iconColor:   colors.primary,
      };
    case "info":
      return {
        container:   colors.tertiaryContainer,
        onContainer: colors.onTertiaryContainer,
        iconColor:   colors.tertiary,
      };
    case "support":
      return {
        container:   (colors.lavender ?? colors.accent) + "28",
        onContainer: colors.onSurface,
        iconColor:   colors.lavender ?? colors.accent,
      };
    case "warning":
      return {
        container:   colors.errorContainer,
        onContainer: colors.onErrorContainer,
        iconColor:   colors.error,
      };
  }
}

interface Props {
  payload: ToastPayload | null;
  onDismiss: () => void;
}

export function SupportiveToast({ payload, onDismiss }: Props) {
  const insets   = useSafeAreaInsets();
  const colors   = useColors();

  // Spring entry / exit
  const translateY = useSharedValue(-160);
  const opacity    = useSharedValue(0);
  const scale      = useSharedValue(0.88);

  // Icon pulse
  const iconScale  = useSharedValue(1);

  const isVisible = !!payload;
  const prevVisible = useRef(false);

  useEffect(() => {
    if (isVisible && !prevVisible.current) {
      // Enter animation
      translateY.value = withSpring(0,    M3Spring.spatialDefault);
      opacity.value    = withSpring(1,    M3Spring.effectDefault);
      scale.value      = withSpring(1,    M3Spring.spatialDefault);
      // Icon pulse
      iconScale.value  = withSpring(1.25, M3Spring.spatialFast, () => {
        iconScale.value = withSpring(1, M3Spring.spatialDefault);
      });
    } else if (!isVisible && prevVisible.current) {
      // Exit animation
      translateY.value = withSpring(-160, M3Spring.spatialDefault);
      opacity.value    = withTiming(0, { duration: 220 });
      scale.value      = withSpring(0.88, M3Spring.spatialFast);
    }
    prevVisible.current = isVisible;
  }, [isVisible]);

  // Swipe up to dismiss
  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY < 0) {
        translateY.value = e.translationY;
        opacity.value    = 1 + e.translationY / 120;
      }
    })
    .onEnd((e) => {
      if (e.translationY < -50) {
        translateY.value = withSpring(-200, M3Spring.spatialFast);
        opacity.value    = withTiming(0, { duration: 180 }, () => {
          runOnJS(onDismiss)();
        });
      } else {
        translateY.value = withSpring(0, M3Spring.spatialDefault);
        opacity.value    = withSpring(1, M3Spring.effectDefault);
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale:     scale.value },
    ],
    opacity: opacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!payload) {
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.wrapper, { top: insets.top + 12 }, containerStyle]}
      />
    );
  }

  const tokens = useVariantTokens(payload.variant);

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View
        style={[
          styles.wrapper,
          { top: insets.top + 12 },
          containerStyle,
        ]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: tokens.container,
              borderColor:     tokens.iconColor + "44",
            },
          ]}
        >
          {/* Left — icon */}
          <Animated.View
            style={[
              styles.iconWrap,
              { backgroundColor: tokens.iconColor + "22" },
              iconStyle,
            ]}
          >
            <Feather
              name={ICON_MAP[payload.variant] as any}
              size={20}
              color={tokens.iconColor}
            />
          </Animated.View>

          {/* Center — text */}
          <View style={styles.textCol}>
            <Text
              style={[styles.title, { color: tokens.onContainer }]}
              numberOfLines={1}
            >
              {payload.title}
            </Text>
            <Text
              style={[styles.body, { color: tokens.onContainer + "CC" }]}
              numberOfLines={2}
            >
              {payload.body}
            </Text>
          </View>

          {/* Right — dismiss */}
          <Pressable onPress={onDismiss} style={styles.dismissBtn} hitSlop={12}>
            <Feather name="x" size={16} color={tokens.onContainer + "88"} />
          </Pressable>
        </View>

        {/* Progress bar — drains over 4.8s */}
        <ProgressBar color={tokens.iconColor} durationMs={4600} onComplete={onDismiss} />
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Progress bar draining over toast duration ────────────────────────────────
function ProgressBar({
  color,
  durationMs,
  onComplete,
}: {
  color: string;
  durationMs: number;
  onComplete: () => void;
}) {
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = 1;
    progress.value = withTiming(0, { duration: durationMs }, (finished) => {
      if (finished) runOnJS(onComplete)();
    });
    return () => { progress.value = 0; };
  }, [color]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  return (
    <View style={[styles.progressTrack, { backgroundColor: color + "22" }]}>
      <Animated.View
        style={[styles.progressBar, { backgroundColor: color + "88" }, barStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    // Android elevation
    elevation: 6,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 19,
  },
  body: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  dismissBtn: {
    padding: 4,
    flexShrink: 0,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 6,
    marginHorizontal: 4,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});
