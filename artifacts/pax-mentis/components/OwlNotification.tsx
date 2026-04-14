/**
 * Pax Mentis — Animated Mascot Notification
 *
 * A cartoon animal peeks in from one of four screen edges, shows a speech bubble,
 * then slides back out. Supports owl, cat, dog, rabbit.
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
export type MascotType   = "owl" | "cat" | "dog" | "rabbit";

export interface OwlPayload {
  direction:  OwlDirection;
  title:      string;
  body:       string;
  icon:       string;
}

interface Props {
  payload:     OwlPayload | null;
  onDismiss:   () => void;
  mascotType?: MascotType;
}

const MASCOT_SIZE      = 88;
const BUBBLE_MAX_W     = 252;
const AUTO_DISMISS_MS  = 5000;
const PEEK_AMOUNT      = 78; // px visible from edge

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function getInitialOffset(dir: OwlDirection) {
  switch (dir) {
    case "left":   return { x: -(MASCOT_SIZE + 24), y: 0 };
    case "right":  return { x:   MASCOT_SIZE + 24,  y: 0 };
    case "top":    return { x: 0, y: -(MASCOT_SIZE + 24) };
    case "bottom": return { x: 0, y:   MASCOT_SIZE + 24  };
  }
}

function getFinalOffset(dir: OwlDirection) {
  const hide = MASCOT_SIZE - PEEK_AMOUNT;
  switch (dir) {
    case "left":   return { x: -hide, y: 0 };
    case "right":  return { x:  hide, y: 0 };
    case "top":    return { x: 0, y: -hide };
    case "bottom": return { x: 0, y:  hide };
  }
}

function getContainerPosition(dir: OwlDirection) {
  const { width: W, height: H } = Dimensions.get("window");
  switch (dir) {
    case "left":   return { left:   0, top:    H * 0.38 - MASCOT_SIZE / 2 };
    case "right":  return { right:  0, top:    H * 0.38 - MASCOT_SIZE / 2 };
    case "top":    return { top:    0, left:   W / 2    - MASCOT_SIZE / 2 };
    case "bottom": return { bottom: 0, left:   W / 2    - MASCOT_SIZE / 2 };
  }
}

function getMascotFlip(dir: OwlDirection) {
  return { scaleX: dir === "right" ? -1 : 1 };
}

function getBubbleStyle(dir: OwlDirection, colors: ReturnType<typeof useColors>) {
  const base = {
    position: "absolute" as const,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 18,
    padding: 12,
    maxWidth: BUBBLE_MAX_W,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  };
  const gap = MASCOT_SIZE - 8;
  switch (dir) {
    case "left":   return { ...base, left:   gap,  top: 0 };
    case "right":  return { ...base, right:  gap,  top: 0 };
    case "top":    return { ...base, top:    gap,  left: -(BUBBLE_MAX_W / 2 - MASCOT_SIZE / 2) };
    case "bottom": return { ...base, bottom: gap,  left: -(BUBBLE_MAX_W / 2 - MASCOT_SIZE / 2) };
  }
}

function getTailStyle(dir: OwlDirection, bg: string) {
  const base = {
    position: "absolute" as const,
    width: 13,
    height: 13,
    backgroundColor: bg,
    transform: [{ rotate: "45deg" }],
  };
  switch (dir) {
    case "left":   return { ...base, left: -6,   top: 16 };
    case "right":  return { ...base, right: -6,  top: 16 };
    case "top":    return { ...base, top: -6,    left: BUBBLE_MAX_W / 2 - 7 };
    case "bottom": return { ...base, bottom: -6, left: BUBBLE_MAX_W / 2 - 7 };
  }
}

// ─── Animal faces ─────────────────────────────────────────────────────────────

function OwlFace({ size, accent }: { size: number; accent: string }) {
  const eyeSize   = size * 0.22;
  const pupilSize = eyeSize * 0.5;
  const beakW     = size * 0.18;
  const beakH     = size * 0.13;

  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#C8834A", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <View style={{ position: "absolute", bottom: 0, width: size * 0.62, height: size * 0.45, borderRadius: size * 0.3, backgroundColor: "#E8B87A" }} />
      <View style={{ position: "absolute", top: -size * 0.08, width: size * 0.8, height: size * 0.22, borderRadius: 2, backgroundColor: "#1A1A2E" }} />
      <View style={{ position: "absolute", top: -size * 0.15, width: size * 0.55, height: size * 0.12, borderRadius: 2, backgroundColor: "#1A1A2E" }} />
      <View style={{ position: "absolute", top: -size * 0.02, right: size * 0.1, width: 2, height: size * 0.22, backgroundColor: accent }} />
      <View style={{ position: "absolute", top: size * 0.18, right: size * 0.07, width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} />
      <View style={{ flexDirection: "row", gap: size * 0.06, marginTop: -size * 0.04 }}>
        {[0, 1].map(i => (
          <View key={i} style={{ width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2, backgroundColor: "#FDFCE4", borderWidth: 2, borderColor: "#3D2B0A", alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: pupilSize, height: pupilSize, borderRadius: pupilSize / 2, backgroundColor: "#1A0A00" }} />
            <View style={{ position: "absolute", top: 2, left: 4, width: pupilSize * 0.35, height: pupilSize * 0.35, borderRadius: 99, backgroundColor: "#FFF" }} />
          </View>
        ))}
      </View>
      <View style={{ width: 0, height: 0, borderLeftWidth: beakW / 2, borderRightWidth: beakW / 2, borderTopWidth: beakH, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#D4820A", marginTop: size * 0.03 }} />
      <View style={{ position: "absolute", bottom: size * 0.08, left: -size * 0.06, width: size * 0.32, height: size * 0.4, borderRadius: size * 0.1, backgroundColor: "#A0612A", transform: [{ rotate: "15deg" }] }} />
      <View style={{ position: "absolute", bottom: size * 0.08, right: -size * 0.06, width: size * 0.32, height: size * 0.4, borderRadius: size * 0.1, backgroundColor: "#A0612A", transform: [{ rotate: "-15deg" }] }} />
    </View>
  );
}

function CatFace({ size, accent }: { size: number; accent: string }) {
  const eyeW = size * 0.20;
  const eyeH = size * 0.15;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#F0A060", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Left ear */}
      <View style={{ position: "absolute", top: -size * 0.05, left: size * 0.08, width: 0, height: 0, borderLeftWidth: size * 0.11, borderRightWidth: size * 0.11, borderBottomWidth: size * 0.24, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "#D07030" }} />
      <View style={{ position: "absolute", top: size * 0.02, left: size * 0.13, width: 0, height: 0, borderLeftWidth: size * 0.06, borderRightWidth: size * 0.06, borderBottomWidth: size * 0.13, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: accent }} />
      {/* Right ear */}
      <View style={{ position: "absolute", top: -size * 0.05, right: size * 0.08, width: 0, height: 0, borderLeftWidth: size * 0.11, borderRightWidth: size * 0.11, borderBottomWidth: size * 0.24, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "#D07030" }} />
      <View style={{ position: "absolute", top: size * 0.02, right: size * 0.13, width: 0, height: 0, borderLeftWidth: size * 0.06, borderRightWidth: size * 0.06, borderBottomWidth: size * 0.13, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: accent }} />
      {/* Body patch */}
      <View style={{ position: "absolute", bottom: 0, width: size * 0.55, height: size * 0.38, borderRadius: size * 0.25, backgroundColor: "#FDDBA0" }} />
      {/* Eyes */}
      <View style={{ flexDirection: "row", gap: size * 0.09, marginTop: size * 0.04 }}>
        {[0, 1].map(i => (
          <View key={i} style={{ width: eyeW, height: eyeH, borderRadius: eyeW / 2, backgroundColor: "#5CB85C", alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: eyeW * 0.22, height: eyeH * 0.85, borderRadius: 4, backgroundColor: "#111" }} />
          </View>
        ))}
      </View>
      {/* Nose */}
      <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.055, borderRightWidth: size * 0.055, borderTopWidth: size * 0.05, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#E07090", marginTop: size * 0.04 }} />
      {/* Whiskers */}
      {[-1, 1].map(side => (
        <View key={side} style={{ position: "absolute", bottom: size * 0.28, ...(side === -1 ? { left: 0 } : { right: 0 }), gap: 3 }}>
          <View style={{ width: size * 0.28, height: 1.5, backgroundColor: "#A06428" }} />
          <View style={{ width: size * 0.24, height: 1.5, backgroundColor: "#A06428" }} />
        </View>
      ))}
    </View>
  );
}

function DogFace({ size, accent }: { size: number; accent: string }) {
  const eyeSize = size * 0.18;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#D4965A", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Floppy ears */}
      <View style={{ position: "absolute", top: size * 0.1, left: -size * 0.08, width: size * 0.28, height: size * 0.52, borderRadius: size * 0.14, backgroundColor: "#A05A20", transform: [{ rotate: "10deg" }] }} />
      <View style={{ position: "absolute", top: size * 0.1, right: -size * 0.08, width: size * 0.28, height: size * 0.52, borderRadius: size * 0.14, backgroundColor: "#A05A20", transform: [{ rotate: "-10deg" }] }} />
      {/* Muzzle */}
      <View style={{ position: "absolute", bottom: size * 0.1, width: size * 0.52, height: size * 0.32, borderRadius: size * 0.16, backgroundColor: "#E8B07A" }} />
      {/* Eyes */}
      <View style={{ flexDirection: "row", gap: size * 0.1, marginTop: -size * 0.02 }}>
        {[0, 1].map(i => (
          <View key={i} style={{ width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2, backgroundColor: "#2A1A08", alignItems: "center", justifyContent: "center" }}>
            <View style={{ position: "absolute", top: 2, right: 2, width: eyeSize * 0.3, height: eyeSize * 0.3, borderRadius: 99, backgroundColor: "#FFF" }} />
          </View>
        ))}
      </View>
      {/* Nose */}
      <View style={{ width: size * 0.22, height: size * 0.14, borderRadius: size * 0.07, backgroundColor: "#1A1A1A", marginTop: size * 0.04 }} />
      {/* Tongue */}
      <View style={{ width: size * 0.18, height: size * 0.14, borderRadius: size * 0.09, backgroundColor: "#F08090", marginTop: 2 }} />
      {/* Collar */}
      <View style={{ position: "absolute", bottom: 0, width: size * 0.7, height: size * 0.1, borderRadius: 2, backgroundColor: accent }} />
    </View>
  );
}

function RabbitFace({ size, accent }: { size: number; accent: string }) {
  const eyeSize = size * 0.17;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#E8E0F0", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Left ear */}
      <View style={{ position: "absolute", top: -size * 0.28, left: size * 0.15, width: size * 0.2, height: size * 0.5, borderRadius: size * 0.1, backgroundColor: "#D4CCE4" }} />
      <View style={{ position: "absolute", top: -size * 0.24, left: size * 0.19, width: size * 0.12, height: size * 0.38, borderRadius: size * 0.06, backgroundColor: "#F0B0C0" }} />
      {/* Right ear */}
      <View style={{ position: "absolute", top: -size * 0.28, right: size * 0.15, width: size * 0.2, height: size * 0.5, borderRadius: size * 0.1, backgroundColor: "#D4CCE4" }} />
      <View style={{ position: "absolute", top: -size * 0.24, right: size * 0.19, width: size * 0.12, height: size * 0.38, borderRadius: size * 0.06, backgroundColor: "#F0B0C0" }} />
      {/* Belly */}
      <View style={{ position: "absolute", bottom: 0, width: size * 0.55, height: size * 0.4, borderRadius: size * 0.24, backgroundColor: "#F5F0FF" }} />
      {/* Eyes */}
      <View style={{ flexDirection: "row", gap: size * 0.1, marginTop: size * 0.04 }}>
        {[0, 1].map(i => (
          <View key={i} style={{ width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2, backgroundColor: "#7060C0", alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: eyeSize * 0.4, height: eyeSize * 0.4, borderRadius: 99, backgroundColor: "#2A1060" }} />
            <View style={{ position: "absolute", top: 1, right: 2, width: eyeSize * 0.25, height: eyeSize * 0.25, borderRadius: 99, backgroundColor: "#FFF" }} />
          </View>
        ))}
      </View>
      {/* Nose */}
      <View style={{ width: size * 0.1, height: size * 0.07, borderRadius: size * 0.05, backgroundColor: "#E080A0", marginTop: size * 0.06 }} />
      {/* Whiskers */}
      {[-1, 1].map(side => (
        <View key={side} style={{ position: "absolute", bottom: size * 0.3, ...(side === -1 ? { left: 0 } : { right: 0 }), gap: 3 }}>
          <View style={{ width: size * 0.25, height: 1, backgroundColor: "#9080B0" }} />
          <View style={{ width: size * 0.22, height: 1, backgroundColor: "#9080B0" }} />
        </View>
      ))}
      {/* Bow tie / accessory */}
      <View style={{ position: "absolute", bottom: size * 0.06, width: size * 0.22, height: size * 0.1, backgroundColor: accent, borderRadius: 3 }} />
    </View>
  );
}

function MascotFace({ type, size, accent }: { type: MascotType; size: number; accent: string }) {
  switch (type) {
    case "cat":    return <CatFace    size={size} accent={accent} />;
    case "dog":    return <DogFace    size={size} accent={accent} />;
    case "rabbit": return <RabbitFace size={size} accent={accent} />;
    default:       return <OwlFace    size={size} accent={accent} />;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OwlNotification({ payload, onDismiss, mascotType = "owl" }: Props) {
  const colors       = useColors();
  const translateX   = useSharedValue(0);
  const translateY   = useSharedValue(0);
  const scale        = useSharedValue(1);
  const wiggle       = useSharedValue(0);
  const bubbleOp     = useSharedValue(0);
  const bubbleScale  = useSharedValue(0.7);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback((dir: OwlDirection, cb: () => void) => {
    const out = getInitialOffset(dir);
    translateX.value  = withSpring(out.x, M3Spring.spatialDefault);
    translateY.value  = withSpring(out.y, M3Spring.spatialDefault);
    bubbleOp.value    = withTiming(0, { duration: 160 });
    bubbleScale.value = withTiming(0.7, { duration: 160 });
    cancelAnimation(wiggle);
    wiggle.value = withTiming(0, { duration: 100 }, () => runOnJS(cb)());
  }, []);

  useEffect(() => {
    if (!payload) return;

    const dir  = payload.direction;
    const init = getInitialOffset(dir);
    const fin  = getFinalOffset(dir);

    translateX.value  = init.x;
    translateY.value  = init.y;
    scale.value       = 0.7;
    bubbleOp.value    = 0;
    bubbleScale.value = 0.7;
    wiggle.value      = 0;

    translateX.value  = withSpring(fin.x, M3Spring.spatialSlow);
    translateY.value  = withSpring(fin.y, M3Spring.spatialSlow);
    scale.value       = withSpring(1, { stiffness: 500, damping: 20, mass: 0.8 });
    bubbleOp.value    = withDelay(280, withTiming(1, { duration: 200 }));
    bubbleScale.value = withDelay(280, withSpring(1, { stiffness: 500, damping: 22 }));

    wiggle.value = withDelay(
      650,
      withRepeat(
        withSequence(
          withTiming( 3.5, { duration: 550 }),
          withTiming(-3.5, { duration: 550 }),
          withTiming(0,    { duration: 280 }),
        ),
        -1, false,
      ),
    );

    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => hide(dir, onDismiss), AUTO_DISMISS_MS);

    return () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); };
  }, [payload]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale:      scale.value      },
      { rotate:     `${wiggle.value}deg` },
    ],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity:   bubbleOp.value,
    transform: [{ scale: bubbleScale.value }],
  }));

  if (!payload) return null;

  const { direction, title, body, icon } = payload;
  const containerPos = getContainerPosition(direction);
  const flip         = getMascotFlip(direction);
  const bubblePos    = getBubbleStyle(direction, colors);
  const tailPos      = getTailStyle(direction, colors.surfaceContainerHigh);

  const handlePress = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    hide(direction, onDismiss);
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }]} pointerEvents="box-none">
      <Animated.View
        style={[styles.mascotContainer, containerPos, mascotStyle]}
        pointerEvents="box-none"
      >
        <Pressable onPress={handlePress} hitSlop={14}>
          <View style={{ transform: [flip] }}>
            <MascotFace type={mascotType} size={MASCOT_SIZE} accent={colors.tertiary} />
          </View>
        </Pressable>

        <Animated.View style={[bubblePos, bubbleStyle]}>
          <Pressable onPress={handlePress}>
            <View style={tailPos} />
            <View style={styles.bubbleHeader}>
              <Text style={styles.bubbleIcon}>{icon}</Text>
              <Text style={[styles.bubbleTitle, { color: colors.onSurface }]} numberOfLines={2}>
                {title}
              </Text>
            </View>
            <Text style={[styles.bubbleBody, { color: colors.onSurfaceVariant }]} numberOfLines={4}>
              {body}
            </Text>
            <Text style={[styles.tapHint, { color: colors.primary }]}>Kapat →</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export function MascotPreview({ type, size = 56, accent }: { type: MascotType; size?: number; accent: string }) {
  return <MascotFace type={type} size={size} accent={accent} />;
}

const styles = StyleSheet.create({
  mascotContainer: {
    position: "absolute",
    width:    MASCOT_SIZE,
    height:   MASCOT_SIZE,
    zIndex:   9999,
  },
  bubbleHeader: {
    flexDirection: "row",
    alignItems:    "flex-start",
    gap:           7,
    marginBottom:  5,
  },
  bubbleIcon: {
    fontSize:   17,
    lineHeight: 24,
    flexShrink: 0,
  },
  bubbleTitle: {
    fontSize:   14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
    flex:       1,
  },
  bubbleBody: {
    fontSize:   13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  tapHint: {
    fontSize:   11,
    fontFamily: "Inter_600SemiBold",
    marginTop:  8,
    textAlign:  "right",
  },
});
