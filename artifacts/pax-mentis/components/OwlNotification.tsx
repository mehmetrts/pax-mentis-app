/**
 * Pax Mentis — Animated Lottie Mascot Notification
 *
 * A Lottie animal peeks in from one of four screen edges, shows a speech bubble,
 * then slides back out. Animation character depends on direction + mascot type.
 *
 *   Left   → Meditating Giraffe (owl) / Loader Cat (cat) / Cute Doggie (dog) / Monkey (rabbit)
 *   Right  → Camaleon (owl) / Cute Tiger (cat/dog) / Cute Tiger (rabbit)
 *   Top    → Reeny Waving (always — morning greeting)
 *   Bottom → Dancing Crab (always — celebration)
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
import LottieView from "lottie-react-native";
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

// ─── Lottie asset mapping ─────────────────────────────────────────────────────

const LOTTIE_ASSETS = {
  meditating_giraffe: require("@/assets/lottie/Meditating_Giraffe_1776260409023.lottie"),
  cute_tiger:         require("@/assets/lottie/Cute_Tiger_1776260409024.lottie"),
  cute_doggie:        require("@/assets/lottie/Cute_Doggie_1776260409024.lottie"),
  loader_cat:         require("@/assets/lottie/Loader_cat_1776260409025.lottie"),
  reeny_waving:       require("@/assets/lottie/Reeny_Waving_1776260409025.lottie"),
  camaleon:           require("@/assets/lottie/Camaleon_1776260409025.lottie"),
  monkey:             require("@/assets/lottie/Monkey_1776260409025.lottie"),
  dancing_crab:       require("@/assets/lottie/Dancing_Crab_1776260409026.lottie"),
} as const;

/**
 * Direction wins for top/bottom (fixed mood characters).
 * left/right: mascot type determines the character.
 *
 * require() returns a number on native; lottie-react-native v7
 * resolves it via Image.resolveAssetSource → sourceDotLottieURI internally.
 */
function getLottieSource(
  direction: OwlDirection,
  mascotType: MascotType,
): any {
  if (direction === "top")    return LOTTIE_ASSETS.reeny_waving;
  if (direction === "bottom") return LOTTIE_ASSETS.dancing_crab;

  // left = calm/empathy side, right = energy/action side
  switch (mascotType) {
    case "cat":
      return direction === "left"
        ? LOTTIE_ASSETS.loader_cat
        : LOTTIE_ASSETS.cute_tiger;
    case "dog":
      return direction === "left"
        ? LOTTIE_ASSETS.cute_doggie
        : LOTTIE_ASSETS.cute_tiger;
    case "rabbit":
      return direction === "left"
        ? LOTTIE_ASSETS.monkey
        : LOTTIE_ASSETS.cute_tiger;
    case "owl":
    default:
      return direction === "left"
        ? LOTTIE_ASSETS.meditating_giraffe
        : LOTTIE_ASSETS.camaleon;
  }
}

const MASCOT_SIZE      = 100;
const BUBBLE_MAX_W     = 252;
const AUTO_DISMISS_MS  = 5500;
const PEEK_AMOUNT      = 84;

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
    borderRadius: 20,
    padding: 13,
    maxWidth: BUBBLE_MAX_W,
    minWidth: 164,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 10,
  };
  const gap = MASCOT_SIZE - 10;
  switch (dir) {
    case "left":   return { ...base, left:   gap,  top: 4 };
    case "right":  return { ...base, right:  gap,  top: 4 };
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
    case "left":   return { ...base, left: -6,   top: 18 };
    case "right":  return { ...base, right: -6,  top: 18 };
    case "top":    return { ...base, top: -6,    left: BUBBLE_MAX_W / 2 - 7 };
    case "bottom": return { ...base, bottom: -6, left: BUBBLE_MAX_W / 2 - 7 };
  }
}

// ─── Lottie container sizes per direction ─────────────────────────────────────

function getLottieContainerStyle(dir: OwlDirection) {
  // Top/bottom characters show more body; left/right peek from edge so show full circle
  const size =
    dir === "top" || dir === "bottom" ? MASCOT_SIZE * 1.15 : MASCOT_SIZE;
  return { width: size, height: size };
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
  const lottieRef    = useRef<LottieView>(null);

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
    scale.value       = 0.75;
    bubbleOp.value    = 0;
    bubbleScale.value = 0.7;
    wiggle.value      = 0;

    translateX.value  = withSpring(fin.x, M3Spring.spatialSlow);
    translateY.value  = withSpring(fin.y, M3Spring.spatialSlow);
    scale.value       = withSpring(1, { stiffness: 460, damping: 18, mass: 0.8 });
    bubbleOp.value    = withDelay(300, withTiming(1, { duration: 220 }));
    bubbleScale.value = withDelay(300, withSpring(1, { stiffness: 480, damping: 22 }));

    // Gentle bounce wiggle after settling
    wiggle.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming( 4,   { duration: 600 }),
          withTiming(-4,   { duration: 600 }),
          withTiming( 0,   { duration: 300 }),
          withTiming( 0,   { duration: 800 }), // pause between wiggles
        ),
        -1, false,
      ),
    );

    // Restart lottie animation
    lottieRef.current?.reset();
    lottieRef.current?.play();

    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => hide(dir, onDismiss), AUTO_DISMISS_MS);

    return () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); };
  }, [payload]);

  const mascotAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale:      scale.value      },
      { rotate:     `${wiggle.value}deg` },
    ],
  }));

  const bubbleAnimStyle = useAnimatedStyle(() => ({
    opacity:   bubbleOp.value,
    transform: [{ scale: bubbleScale.value }],
  }));

  if (!payload) return null;

  const { direction, title, body, icon } = payload;
  const containerPos  = getContainerPosition(direction);
  const flip          = getMascotFlip(direction);
  const bubblePos     = getBubbleStyle(direction, colors);
  const tailPos       = getTailStyle(direction, colors.surfaceContainerHigh);
  const lottieSource  = getLottieSource(direction, mascotType);
  const lottieSize    = getLottieContainerStyle(direction);

  const handlePress = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    hide(direction, onDismiss);
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }]} pointerEvents="box-none">
      <Animated.View
        style={[styles.mascotContainer, containerPos, { width: lottieSize.width, height: lottieSize.height }, mascotAnimStyle]}
        pointerEvents="box-none"
      >
        <Pressable onPress={handlePress} hitSlop={16}>
          <View style={[{ transform: [flip] }, lottieSize]}>
            <LottieView
              ref={lottieRef}
              source={lottieSource}
              autoPlay
              loop
              style={lottieSize}
              resizeMode="contain"
            />
          </View>
        </Pressable>

        <Animated.View style={[bubblePos, bubbleAnimStyle]}>
          <Pressable onPress={handlePress}>
            <View style={tailPos} />
            <View style={styles.bubbleHeader}>
              <Text style={styles.bubbleIcon}>{icon}</Text>
              <Text
                style={[styles.bubbleTitle, { color: colors.onSurface }]}
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>
            <Text
              style={[styles.bubbleBody, { color: colors.onSurfaceVariant }]}
              numberOfLines={4}
            >
              {body}
            </Text>
            <Text style={[styles.tapHint, { color: colors.primary }]}>Kapat →</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─── Compact preview for settings / mascot picker ─────────────────────────────

export function MascotPreview({
  type,
  size = 64,
}: {
  type: MascotType;
  size?: number;
  accent?: string;
}) {
  const source = getLottieSource("left", type);
  return (
    <LottieView
      source={source}
      autoPlay
      loop
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  mascotContainer: {
    position: "absolute",
    zIndex:   9999,
  },
  bubbleHeader: {
    flexDirection: "row",
    alignItems:    "flex-start",
    gap:           7,
    marginBottom:  5,
  },
  bubbleIcon: {
    fontSize:   18,
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
