import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  content: string;
  isStreaming?: boolean;
  isUser?: boolean;
}

export function MentorBubble({ content, isStreaming = false, isUser = false }: Props) {
  const colors = useColors();
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isStreaming || content.length > 0) return;

    const createPulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );

    const a1 = createPulse(dotAnim1, 0);
    const a2 = createPulse(dotAnim2, 150);
    const a3 = createPulse(dotAnim3, 300);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [isStreaming, content]);

  if (isUser) {
    return (
      <View style={[styles.userBubble, { backgroundColor: colors.primary, borderRadius: 18, borderBottomRightRadius: 4 }]}>
        <Text style={[styles.userText, { color: colors.primaryForeground }]}>{content}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mentorRow}>
      <View style={[styles.mentorAvatar, { backgroundColor: colors.sage || colors.primary, borderRadius: 20 }]}>
        <Text style={styles.avatarText}>Ψ</Text>
      </View>
      <View
        style={[
          styles.mentorBubble,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: 18,
            borderTopLeftRadius: 4,
          },
        ]}
      >
        {isStreaming && content.length === 0 ? (
          <View style={styles.dotsRow}>
            {[dotAnim1, dotAnim2, dotAnim3].map((a, i) => (
              <Animated.View
                key={i}
                style={[styles.dot, { backgroundColor: colors.mutedForeground, opacity: a }]}
              />
            ))}
          </View>
        ) : (
          <Text style={[styles.mentorText, { color: colors.foreground }]}>{content}</Text>
        )}
      </View>
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
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    color: "#ffffff",
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
    gap: 5,
    paddingVertical: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  userBubble: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    padding: 14,
  },
  userText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
});
