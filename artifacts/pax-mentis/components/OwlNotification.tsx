/**
 * Pax Mentis — Animated Owl Notification
 *
 * A cartoon owl peeks in from one of four screen edges, shows a speech bubble,
 * then slides back out. Each direction maps to a notification category:
 *
 *   Left   → self_compassion / resistance_high  (empathy)
 *   Right  → gentle_nudge / streak_reminder     (action prompt)
 *   Top    → daily_morning                      (greeting)
 *   Bottom → task_added / session_complete      (celebration)
 */

import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  withDelay,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { M3Spring } from "@/constants/colors";

export type OwlDirection = "left" | "right" | "top" | "bottom";

export interface OwlPayload {
  direction: OwlDirection;
  title: string;
  body: string;
  icon: string;
}

interface Props {
  payload: OwlPayload | null;
  onDismiss: () => void;
}

const OWL_SIZE = 88;
const BUBBLE_MAX_W = 200;
const AUTO_DISMISS_MS = 4500;

// How far the owl slides in from the edge (positive = more visible)
const PEEK_AMOUNT = 58;

function getInitialOffset(dir: OwlDirection): { x: number; y: number } {
  const { width: W, height: H } = Dimensions.get("window");
  switch (dir) {
    case "left":   return { x: -(OWL_SIZE + 20), y: 0 };
    case "right":  return { x:   OWL_SIZE + 20,  y: 0 };
    case "top":    return { x: 0, y: -(OWL_SIZE + 20) };
    case "bottom": return { x: 0, y:   OWL_SIZE + 20  };
  }
}

function getFinalOffset(dir: OwlDirection): { x: number; y: number } {
  switch (dir) {
    case "left":   return { x: -(OWL_SIZE - PEEK_AMOUNT), y: 0 };
    case "right":  return { x:   OWL_SIZE - PEEK_AMOUNT,  y: 0 };
    case "top":    return { x: 0, y: -(OWL_SIZE - PEEK_AMOUNT) };
    case "bottom": return { x: 0, y:   OWL_SIZE - PEEK_AMOUNT  };
  }
}

/** Absolute position of the owl container on the screen */
function getContainerPosition(dir: OwlDirection) {
  const { width: W, height: H } = Dimensions.get("window");
  switch (dir) {
    case "left":
      return { left: 0, top: H * 0.38 - OWL_SIZE / 2 };
    case "right":
      return { right: 0, top: H * 0.38 - OWL_SIZE / 2 };
    case "top":
      return { top: 0, left: W / 2 - OWL_SIZE / 2 };
    case "bottom":
      return { bottom: 0, left: W / 2 - OWL_SIZE / 2 };
  }
}

/** Face direction — owl "looks" toward center of screen */
function getOwlFlip(dir: OwlDirection): { scaleX: number } {
  // default emoji faces left; for right-peek flip horizontally
  return { scaleX: dir === "right" ? -1 : 1 };
}

/** Position of speech bubble relative to owl */
function getBubbleStyle(dir: OwlDirection, colors: ReturnType<typeof useColors>) {
  const base: any = {
    position: "absolute" as const,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: 10,
    maxWidth: BUBBLE_MAX_W,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  };
  switch (dir) {
    case "left":
      return { ...base, left: OWL_SIZE - 6, top: 2 };
    case "right":
      return { ...base, right: OWL_SIZE - 6, top: 2 };
    case "top":
      return { ...base, top: OWL_SIZE - 6, left: -(BUBBLE_MAX_W / 2 - OWL_SIZE / 2) };
    case "bottom":
      return { ...base, bottom: OWL_SIZE - 6, left: -(BUBBLE_MAX_W / 2 - OWL_SIZE / 2) };
  }
}

/** Tail/arrow of the speech bubble */
function getTailStyle(dir: OwlDirection, colors: ReturnType<typeof useColors>) {
  const bg = colors.surfaceContainerHigh;
  const base: any = {
    position: "absolute" as const,
    width: 12,
    height: 12,
    backgroundColor: bg,
    transform: [{ rotate: "45deg" }],
  };
  switch (dir) {
    case "left":   return { ...base, left: -5,  top: 14 };
    case "right":  return { ...base, right: -5, top: 14 };
    case "top":    return { ...base, top: -5,   left: BUBBLE_MAX_W / 2 - 6 };
    case "bottom": return { ...base, bottom: -5, left: BUBBLE_MAX_W / 2 - 6 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Owl SVG-style drawn with Views
// ─────────────────────────────────────────────────────────────────────────────
function OwlFace({ size, accent }: { size: number; accent: string }) {
  const eyeSize   = size * 0.22;
  const pupilSize = eyeSize * 0.5;
  const beakW     = size * 0.18;
  const beakH     = size * 0.13;

  return (
    <View style={{
      width:  size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: "#C8834A",
      alignItems:      "center",
      justifyContent:  "center",
      overflow:        "hidden",
      // Chest patch
    }}>
      {/* Body gradient overlay (lighter belly) */}
      <View style={{
        position:        "absolute",
        bottom:          0,
        width:           size * 0.62,
        height:          size * 0.45,
        borderRadius:    size * 0.3,
        backgroundColor: "#E8B87A",
      }} />
      {/* Graduate cap */}
      <View style={{
        position:   "absolute",
        top:        -size * 0.08,
        width:      size * 0.8,
        height:     size * 0.22,
        borderRadius: 2,
        backgroundColor: "#1A1A2E",
      }} />
      <View style={{
        position:    "absolute",
        top:         -size * 0.15,
        width:       size * 0.55,
        height:      size * 0.12,
        borderRadius: 2,
        backgroundColor: "#1A1A2E",
      }} />
      {/* Tassel */}
      <View style={{
        position:        "absolute",
        top:             -size * 0.02,
        right:           size * 0.1,
        width:           2,
        height:          size * 0.22,
        backgroundColor: accent,
      }} />
      <View style={{
        position:        "absolute",
        top:             size * 0.18,
        right:           size * 0.07,
        width:           8,
        height:          8,
        borderRadius:    4,
        backgroundColor: accent,
      }} />

      {/* Eyes row */}
      <View style={{ flexDirection: "row", gap: size * 0.06, marginTop: -size * 0.04 }}>
        {/* Left eye */}
        <View style={{
          width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2,
          backgroundColor: "#FDFCE4", borderWidth: 2, borderColor: "#3D2B0A",
          alignItems: "center", justifyContent: "center",
        }}>
          <View style={{
            width: pupilSize, height: pupilSize, borderRadius: pupilSize / 2,
            backgroundColor: "#1A0A00",
          }} />
          <View style={{
            position: "absolute", top: 2, left: 4,
            width: pupilSize * 0.35, height: pupilSize * 0.35,
            borderRadius: 99, backgroundColor: "#FFF",
          }} />
        </View>
        {/* Right eye */}
        <View style={{
          width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2,
          backgroundColor: "#FDFCE4", borderWidth: 2, borderColor: "#3D2B0A",
          alignItems: "center", justifyContent: "center",
        }}>
          <View style={{
            width: pupilSize, height: pupilSize, borderRadius: pupilSize / 2,
            backgroundColor: "#1A0A00",
          }} />
          <View style={{
            position: "absolute", top: 2, left: 4,
            width: pupilSize * 0.35, height: pupilSize * 0.35,
            borderRadius: 99, backgroundColor: "#FFF",
          }} />
        </View>
      </View>

      {/* Beak */}
      <View style={{
        width:           0,
        height:          0,
        borderLeftWidth:  beakW / 2,
        borderRightWidth: beakW / 2,
        borderTopWidth:   beakH,
        borderLeftColor:  "transparent",
        borderRightColor: "transparent",
        borderTopColor:   "#D4820A",
        marginTop:        size * 0.03,
      }} />

      {/* Wing hints */}
      <View style={{
        position:        "absolute",
        bottom:          size * 0.08,
        left:            -size * 0.06,
        width:           size * 0.32,
        height:          size * 0.4,
        borderRadius:    size * 0.1,
        backgroundColor: "#A0612A",
        transform:       [{ rotate: "15deg" }],
      }} />
      <View style={{
        position:        "absolute",
        bottom:          size * 0.08,
        right:           -size * 0.06,
        width:           size * 0.32,
        height:          size * 0.4,
        borderRadius:    size * 0.1,
        backgroundColor: "#A0612A",
        transform:       [{ rotate: "-15deg" }],
      }} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main OwlNotification component
// ─────────────────────────────────────────────────────────────────────────────
export function OwlNotification({ payload, onDismiss }: Props) {
  const colors    = useColors();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale      = useSharedValue(1);
  const wiggle     = useSharedValue(0);
  const bubbleOp   = useSharedValue(0);
  const bubbleScale = useSharedValue(0.7);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback((dir: OwlDirection, cb: () => void) => {
    const out = getInitialOffset(dir);
    translateX.value = withSpring(out.x, M3Spring.spatialDefault);
    translateY.value = withSpring(out.y, M3Spring.spatialDefault);
    bubbleOp.value   = withTiming(0, { duration: 180 });
    bubbleScale.value = withTiming(0.7, { duration: 180 });
    cancelAnimation(wiggle);
    wiggle.value = withTiming(0, { duration: 120 }, () => runOnJS(cb)());
  }, []);

  useEffect(() => {
    if (!payload) return;

    const dir  = payload.direction;
    const init = getInitialOffset(dir);
    const fin  = getFinalOffset(dir);

    // Snap to initial off-screen position
    translateX.value = init.x;
    translateY.value = init.y;
    scale.value      = 0.7;
    bubbleOp.value   = 0;
    bubbleScale.value = 0.7;
    wiggle.value     = 0;

    // Slide in with spring
    translateX.value = withSpring(fin.x, M3Spring.spatialSlow);
    translateY.value = withSpring(fin.y, M3Spring.spatialSlow);
    scale.value      = withSpring(1, { stiffness: 500, damping: 20, mass: 0.8 });

    // Bubble appears after owl peeks
    bubbleOp.value    = withDelay(300, withTiming(1, { duration: 220 }));
    bubbleScale.value = withDelay(300, withSpring(1, { stiffness: 500, damping: 22 }));

    // Idle wiggle
    const wiggleAmp = dir === "left" || dir === "right" ? 3 : 3;
    wiggle.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming( wiggleAmp, { duration: 600 }),
          withTiming(-wiggleAmp, { duration: 600 }),
          withTiming(0,          { duration: 300 }),
        ),
        -1,
        false,
      ),
    );

    // Auto-dismiss
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => {
      hide(dir, onDismiss);
    }, AUTO_DISMISS_MS);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [payload]);

  const owlStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale:      scale.value      },
      { rotate: `${wiggle.value}deg` },
    ],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity:   bubbleOp.value,
    transform: [{ scale: bubbleScale.value }],
  }));

  if (!payload) return null;

  const { direction, title, body, icon } = payload;
  const containerPos = getContainerPosition(direction);
  const flip         = getOwlFlip(direction);
  const bubblePos    = getBubbleStyle(direction, colors);
  const tailPos      = getTailStyle(direction, colors);

  const handlePress = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    hide(direction, onDismiss);
  };

  return (
    // box-none lets touches pass through the overlay to content below
    <View
      style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }]}
      pointerEvents="box-none"
    >
      {/* Owl + bubble container — only this area is tappable */}
      <Animated.View
        style={[
          styles.owlContainer,
          containerPos,
          owlStyle,
        ]}
        pointerEvents="box-none"
      >
        {/* The owl face */}
        <Pressable onPress={handlePress} hitSlop={12}>
          <View style={{ transform: [flip] }}>
            <OwlFace size={OWL_SIZE} accent={colors.tertiary} />
          </View>
        </Pressable>

        {/* Speech bubble */}
        <Animated.View style={[bubblePos, bubbleStyle]}>
          <Pressable onPress={handlePress}>
            {/* Bubble tail */}
            <View style={tailPos} />
            {/* Icon + title */}
            <View style={styles.bubbleHeader}>
              <Text style={styles.bubbleIcon}>{icon}</Text>
              <Text
                style={[styles.bubbleTitle, { color: colors.onSurface }]}
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>
            {/* Body text */}
            <Text
              style={[styles.bubbleBody, { color: colors.onSurfaceVariant }]}
              numberOfLines={3}
            >
              {body}
            </Text>
            {/* Dismiss hint */}
            <Text style={[styles.tapHint, { color: colors.primary }]}>
              Kapat →
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  owlContainer: {
    position:  "absolute",
    width:     OWL_SIZE,
    height:    OWL_SIZE,
    zIndex:    9999,
  },
  bubbleHeader: {
    flexDirection:  "row",
    alignItems:     "flex-start",
    gap:            6,
    marginBottom:   4,
  },
  bubbleIcon: {
    fontSize:   16,
    lineHeight: 22,
    flexShrink: 0,
  },
  bubbleTitle: {
    fontSize:      13,
    fontFamily:    "Inter_600SemiBold",
    lineHeight:    18,
    flex:          1,
  },
  bubbleBody: {
    fontSize:   11.5,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  tapHint: {
    fontSize:   10,
    fontFamily: "Inter_600SemiBold",
    marginTop:  6,
    textAlign:  "right",
  },
});
