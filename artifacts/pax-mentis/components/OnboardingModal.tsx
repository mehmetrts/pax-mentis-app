import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

interface Slide {
  icon: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: "cpu",
    title: "Pax Mentis",
    body: "Sana yargılamadan eşlik eden bir zihinsel danışman. Ertelemenin kökenini birlikte keşfedip, küçük adımlarla harekete geçmeni destekleyeceğim.",
  },
  {
    icon: "message-circle",
    title: "Sokratik Yöntem",
    body: "Sana cevap vermiyorum — doğru soruları soruyorum. Kendi içindeki direnç sesini tanımak, onu aşmanın ilk adımıdır.",
  },
  {
    icon: "book-open",
    title: "Bilim Temelli",
    body: "ACT, SDT, CBT, Akış ve daha fazlasından öğrenilmiş 55+ bilgi birikimi. Konuşmalarımız bu bilimsel altyapıya dayanır.",
  },
  {
    icon: "shield",
    title: "Tamamen Yerel",
    body: "Tüm veriler cihazında saklanır. Model de cihazında çalışır. İnternet bağlantısına gerek yok, gizlilik riski yok.",
  },
  {
    icon: "zap",
    title: "Başlayalım",
    body: "Ayarlar ekranından Llama 3.2 3B modelini indirerek tam AI deneyimini aktive edebilirsin. Şimdilik demo modunda başlayalım.",
  },
];

interface Props {
  visible: boolean;
  onDone: () => void;
}

export function OnboardingModal({ visible, onDone }: Props) {
  const colors = useColors();
  const [page, setPage] = useState(0);

  const isLast = page === SLIDES.length - 1;
  const slide = SLIDES[page];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* İkon — M3 tonal icon container */}
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
            <Feather name={slide.icon as any} size={36} color={colors.primary} />
          </View>

          {/* Metin */}
          <Text style={[styles.title, { color: colors.onSurface }]}>{slide.title}</Text>
          <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>{slide.body}</Text>

          {/* Nokta göstergesi — M3 indicator dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === page ? colors.primary : colors.outlineVariant,
                    width: i === page ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Butonlar — M3 filled + text button */}
          <View style={styles.btnRow}>
            {!isLast && (
              <TouchableOpacity onPress={onDone} style={styles.skipBtn}>
                <Text style={[styles.skipText, { color: colors.onSurfaceVariant }]}>Atla</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.nextBtn,
                { backgroundColor: colors.primary, flex: isLast ? 1 : undefined },
              ]}
              onPress={isLast ? onDone : () => setPage(p => p + 1)}
            >
              <Text style={[styles.nextText, { color: colors.onPrimary }]}>
                {isLast ? "Başla" : "İleri"}
              </Text>
              {!isLast && (
                <Feather name="arrow-right" size={16} color={colors.onPrimary} style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: Math.min(width - 48, 380),
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 28,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 28,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    alignItems: "center",
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 9999,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "500",
  },
  nextBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  nextText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
