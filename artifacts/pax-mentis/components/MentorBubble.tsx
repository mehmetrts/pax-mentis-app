import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { M3Spring } from "@/constants/colors";

interface Props {
  content: string;
  isStreaming?: boolean;
  isUser?: boolean;
}

// M3 Expressive loading dot — springs up and down with stagger
function SpringDot({ delay, color }: { delay: number; color: string }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(-6, { stiffness: 420, damping: 18, mass: 0.6 }),
          withSpring(0,  { stiffness: 380, damping: 22, mass: 0.6 }),
        ),
        -1,
        false,
      ),
    );
    return () => { translateY.value = 0; };
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[style, styles.dot, { backgroundColor: color }]}
    />
  );
}

export function MentorBubble({ content, isStreaming = false, isUser = false }: Props) {
  const colors = useColors();

  // M3 Expressive — spring entry animation for every bubble
  const scale   = useSharedValue(0.82);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(isUser ? 6 : -4);

  useEffect(() => {
    opacity.value    = withSpring(1, M3Spring.effectDefault);
    scale.value      = withSpring(1, M3Spring.spatialDefault);
    translateY.value = withSpring(0, M3Spring.spatialDefault);
  }, []);

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  if (isUser) {
    return (
      <Animated.View style={[styles.userWrapper, bubbleStyle]}>
        <View
          style={[
            styles.userBubble,
            {
              backgroundColor: colors.primary,
              borderRadius: 20,
              borderBottomRightRadius: 4,
            },
          ]}
        >
          <Text style={[styles.userText, { color: colors.onPrimary }]}>{content}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.mentorRow}>
      {/* Avatar — M3 shape:full circle with sage primaryContainer background */}
      <View
        style={[
          styles.mentorAvatar,
          {
            backgroundColor: colors.primaryContainer,
            borderRadius: 9999,
          },
        ]}
      >
        <Text style={[styles.avatarText, { color: colors.onPrimaryContainer }]}>Ψ</Text>
      </View>

      <Animated.View
        style={[
          styles.mentorBubble,
          {
            backgroundColor: colors.surfaceContainer,
            borderColor: colors.outlineVariant,
            borderRadius: 20,
            borderTopLeftRadius: 4,
          },
          bubbleStyle,
        ]}
      >
        {isStreaming && content.length === 0 ? (
          <View style={styles.dotsRow}>
            <SpringDot delay={0}   color={colors.onSurfaceVariant} />
            <SpringDot delay={120} color={colors.onSurfaceVariant} />
            <SpringDot delay={240} color={colors.onSurfaceVariant} />
          </View>
        ) : (
          <Text style={[styles.mentorText, { color: colors.onSurface }]}>{content}</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mentorRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
  },
  mentorAvatar: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  mentorBubble: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
  },
  mentorText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userWrapper: {
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  userBubble: {
    padding: 14,
  },
  userText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
});
