import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { M3Spring } from "@/constants/colors";

const { width } = Dimensions.get("window");

// ─── Slide Types ──────────────────────────────────────────────────────────────

interface PrivacyPoint {
  allowed: boolean;
  text:    string;
}

interface Slide {
  icon:          string;
  iconVariant?:  "primary" | "tertiary" | "success" | "warning";
  title:         string;
  body:          string;
  privacyPoints?: PrivacyPoint[];
}

const SLIDES: Slide[] = [
  {
    icon:  "cpu",
    title: "Pax Mentis",
    body:  "Sana yargılamadan eşlik eden bir zihinsel danışman. Ertelemenin kökenini birlikte keşfedip, küçük adımlarla harekete geçmeni destekleyeceğim.",
  },
  {
    icon:  "message-circle",
    title: "Sokratik Yöntem",
    body:  "Sana cevap vermiyorum — doğru soruları soruyorum. Kendi içindeki direnç sesini tanımak, onu aşmanın ilk adımıdır.",
  },
  {
    icon:  "book-open",
    title: "Bilim Temelli",
    body:  "ACT, SDT, CBT, Akış ve daha fazlasından öğrenilmiş 55+ bilgi birikimi. Konuşmalarımız bu bilimsel altyapıya dayanır.",
  },
  {
    icon:  "shield",
    title: "Tamamen Yerel",
    body:  "Tüm veriler cihazında saklanır. Model de cihazında çalışır. İnternet bağlantısına gerek yok, gizlilik riski yok.",
  },
  {
    icon:         "calendar",
    iconVariant:  "tertiary",
    title:        "Takvim Entegrasyonu",
    body:         "İstersen yaklaşan etkinliklerini okuyarak yoğun günlerine göre sohbeti ayarlayabilirim. Neyi okuyup neyi okumadığım konusunda şeffafım:",
    privacyPoints: [
      { allowed: true,  text: 'Etkinlik başlıkları (örn. "Toplantı")' },
      { allowed: true,  text: "Başlangıç ve bitiş saatleri" },
      { allowed: false, text: "Etkinlik açıklamaları ve notlar" },
      { allowed: false, text: "Katılımcı isimleri ve e-postaları" },
      { allowed: false, text: "Konum bilgisi" },
      { allowed: false, text: "Herhangi bir sunucuya gönderim" },
    ],
  },
  {
    icon:         "file-text",
    iconVariant:  "success",
    title:        "Bağlam Notları",
    body:         "Bir e-postayı, mesajı ya da görev listesini benimle paylaşmak istersen yapıştır — sana daha isabetli sorular sorabilirim. Kontrol tamamen sende:",
    privacyPoints: [
      { allowed: true,  text: "Yalnızca sen seçip yapıştırdığın içerik" },
      { allowed: true,  text: "Dilediğinde aktif/pasif yapabilirsin" },
      { allowed: true,  text: "Tek tıkla tümünü silebilirsin" },
      { allowed: false, text: "Otomatik e-posta veya mesaj okuma" },
      { allowed: false, text: "Arka planda erişim ya da izleme" },
      { allowed: false, text: "Buluta veya sunucuya gönderim" },
    ],
  },
  {
    icon:  "zap",
    title: "Başlayalım",
    body:  "Ayarlar ekranından Llama 3.2 3B modelini indirerek tam AI deneyimini aktive edebilirsin. Şimdilik demo modunda başlayalım.",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onDone:  () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingModal({ visible, onDone }: Props) {
  const colors = useColors();
  const [page, setPage] = useState(0);

  const isLast = page === SLIDES.length - 1;
  const slide  = SLIDES[page];

  // Spring card transition
  const cardOpacity = useSharedValue(1);
  const cardTranslateX = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    opacity:   cardOpacity.value,
    transform: [{ translateX: cardTranslateX.value }],
  }));

  function goNext() {
    cardOpacity.value    = withTiming(0, { duration: 140 }, () => {
      cardTranslateX.value = -20;
    });
    cardOpacity.value    = withTiming(0, { duration: 140 });
    setTimeout(() => {
      setPage(p => p + 1);
      cardTranslateX.value = 20;
      cardOpacity.value    = withSpring(1, M3Spring.effectDefault);
      cardTranslateX.value = withSpring(0, M3Spring.spatialDefault);
    }, 150);
  }

  // Icon container color by variant
  const iconBg = {
    primary: colors.primaryContainer,
    tertiary: colors.tertiaryContainer,
    success: colors.primaryContainer,
    warning: colors.tertiaryContainer,
  }[slide.iconVariant ?? "primary"];

  const iconColor = {
    primary: colors.primary,
    tertiary: colors.tertiary,
    success: colors.primary,
    warning: colors.tertiary,
  }[slide.iconVariant ?? "primary"];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { backgroundColor: colors.surface }, cardStyle]}>

          {/* İkon */}
          <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
            <Feather name={slide.icon as any} size={36} color={iconColor} />
          </View>

          {/* Başlık */}
          <Text style={[styles.title, { color: colors.onSurface }]}>{slide.title}</Text>

          {/* Gövde */}
          <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>{slide.body}</Text>

          {/* Mahremiyet detayları */}
          {slide.privacyPoints && (
            <View style={[styles.privacyBox, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
              {slide.privacyPoints.map((pt, i) => (
                <View key={i} style={styles.privacyRow}>
                  <View
                    style={[
                      styles.privacyDot,
                      {
                        backgroundColor: pt.allowed
                          ? colors.primary + "22"
                          : colors.error + "18",
                      },
                    ]}
                  >
                    <Feather
                      name={pt.allowed ? "check" : "x"}
                      size={11}
                      color={pt.allowed ? colors.primary : colors.error}
                    />
                  </View>
                  <Text
                    style={[
                      styles.privacyText,
                      { color: pt.allowed ? colors.onSurface : colors.onSurfaceVariant },
                    ]}
                  >
                    {pt.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Nokta göstergesi */}
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

          {/* Butonlar */}
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
              onPress={isLast ? onDone : goNext}
            >
              <Text style={[styles.nextText, { color: colors.onPrimary }]}>
                {isLast ? "Başla" : "İleri"}
              </Text>
              {!isLast && (
                <Feather name="arrow-right" size={16} color={colors.onPrimary} style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    width: Math.min(width - 48, 400),
    borderRadius: 28,
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
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 16,
  },
  privacyBox: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  privacyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  privacyText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 17,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 24,
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
    fontFamily: "Inter_500Medium",
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
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
