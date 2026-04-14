import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { WIKI_CHUNKS, WikiChunk } from "@/lib/wikiKnowledge";

const THEORY_COLORS: Record<string, string> = {
  TMT: "#5a7a5a",
  PSI: "#7b6cbd",
  ACT: "#5a9a9a",
  Kahneman: "#d4a853",
  "Atomic Habits": "#c06060",
  Pychyl: "#a07050",
};

const THEORY_DESCRIPTIONS: Record<string, string> = {
  TMT: "Temporal Motivation Theory — Piers Steel",
  PSI: "PSI Teorisi — Julius Kuhl",
  ACT: "Kabul ve Kararlılık Terapisi — Steven Hayes",
  Kahneman: "Hızlı ve Yavaş Düşünce — Daniel Kahneman",
  "Atomic Habits": "Atomik Alışkanlıklar — James Clear",
  Pychyl: "Erteleme Bulmacası — Timothy Pychyl",
};

const ALL_THEORIES = [...new Set(WIKI_CHUNKS.map(c => c.theory))];

export default function WikiScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [selectedTheory, setSelectedTheory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = WIKI_CHUNKS.filter(chunk => {
    const matchSearch = searchText.length === 0 ||
      chunk.topic.toLowerCase().includes(searchText.toLowerCase()) ||
      chunk.content.toLowerCase().includes(searchText.toLowerCase()) ||
      chunk.keywords.some(k => k.includes(searchText.toLowerCase()));
    const matchTheory = !selectedTheory || chunk.theory === selectedTheory;
    return matchSearch && matchTheory;
  });

  const topPad = Platform.OS === "web" ? 24 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 84 + 20 : insets.bottom + 100;

  const renderChunk = ({ item }: { item: WikiChunk }) => {
    const isExpanded = expandedId === item.id;
    const color = THEORY_COLORS[item.theory] || colors.primary;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        style={[
          styles.chunkCard,
          {
            backgroundColor: colors.card,
            borderColor: isExpanded ? color + "66" : colors.border,
            borderLeftColor: color,
            borderLeftWidth: 3,
            borderRadius: 14,
          },
        ]}
      >
        <View style={styles.chunkHeader}>
          <View style={styles.chunkMeta}>
            <View style={[styles.theoryBadge, { backgroundColor: color + "22", borderRadius: 6 }]}>
              <Text style={[styles.theoryBadgeText, { color }]}>{item.theory}</Text>
            </View>
            <Text style={[styles.chunkTopic, { color: colors.foreground }]}>{item.topic}</Text>
          </View>
          <Feather
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.mutedForeground}
          />
        </View>

        {isExpanded && (
          <View style={styles.chunkExpanded}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.chunkContent, { color: colors.foreground }]}>{item.content}</Text>

            <View style={[styles.socraaticBox, { backgroundColor: color + "11", borderColor: color + "33", borderRadius: 10 }]}>
              <View style={styles.socraaticHeader}>
                <Feather name="message-circle" size={14} color={color} />
                <Text style={[styles.socraaticLabel, { color }]}>Sokratik Soru</Text>
              </View>
              <Text style={[styles.socraaticText, { color: colors.foreground }]}>
                "{item.socraaticPrompt}"
              </Text>
            </View>

            <View style={[styles.interventionBox, { backgroundColor: colors.muted, borderRadius: 10 }]}>
              <View style={styles.interventionHeader}>
                <Feather name="zap" size={14} color={colors.mutedForeground} />
                <Text style={[styles.interventionLabel, { color: colors.mutedForeground }]}>Müdahale</Text>
              </View>
              <Text style={[styles.interventionText, { color: colors.foreground }]}>
                {item.intervention}
              </Text>
            </View>

            <View style={styles.keywordsRow}>
              {item.keywords.slice(0, 4).map(kw => (
                <View key={kw} style={[styles.keyword, { backgroundColor: colors.muted, borderRadius: 6 }]}>
                  <Text style={[styles.keywordText, { color: colors.mutedForeground }]}>{kw}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Wiki</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {WIKI_CHUNKS.length} bilgi parçası
        </Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchText, { color: colors.foreground }]}
            placeholder="Konu veya anahtar kelime ara..."
            placeholderTextColor={colors.mutedForeground}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.theoryScroll}>
          <TouchableOpacity
            style={[
              styles.theoryChip,
              {
                backgroundColor: selectedTheory === null ? colors.primary : colors.card,
                borderColor: selectedTheory === null ? colors.primary : colors.border,
                borderRadius: 16,
              },
            ]}
            onPress={() => setSelectedTheory(null)}
          >
            <Text style={[styles.theoryChipText, { color: selectedTheory === null ? colors.primaryForeground : colors.mutedForeground }]}>
              Tümü
            </Text>
          </TouchableOpacity>
          {ALL_THEORIES.map(theory => {
            const color = THEORY_COLORS[theory] || colors.primary;
            const isSelected = selectedTheory === theory;
            return (
              <TouchableOpacity
                key={theory}
                style={[
                  styles.theoryChip,
                  {
                    backgroundColor: isSelected ? color + "22" : colors.card,
                    borderColor: isSelected ? color : colors.border,
                    borderRadius: 16,
                  },
                ]}
                onPress={() => setSelectedTheory(isSelected ? null : theory)}
              >
                <Text style={[styles.theoryChipText, { color: isSelected ? color : colors.mutedForeground }]}>
                  {theory}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {selectedTheory && (
        <View style={[styles.theoryInfo, { backgroundColor: THEORY_COLORS[selectedTheory] + "11", borderBottomColor: colors.border }]}>
          <Text style={[styles.theoryInfoText, { color: colors.mutedForeground }]}>
            {THEORY_DESCRIPTIONS[selectedTheory] || selectedTheory}
          </Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderChunk}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Feather name="book" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sonuç bulunamadı</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Farklı bir arama terimi dene
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  theoryScroll: {
    marginHorizontal: -4,
  },
  theoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  theoryChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  theoryInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  theoryInfoText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  listContent: {
    padding: 16,
  },
  chunkCard: {
    padding: 16,
    borderWidth: 1,
  },
  chunkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chunkMeta: {
    flex: 1,
    gap: 6,
  },
  theoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  theoryBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chunkTopic: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  chunkExpanded: {
    gap: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  chunkContent: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  socraaticBox: {
    padding: 12,
    gap: 6,
    borderWidth: 1,
  },
  socraaticHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  socraaticLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  socraaticText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
    fontStyle: "italic",
  },
  interventionBox: {
    padding: 12,
    gap: 6,
  },
  interventionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  interventionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  interventionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  keywordsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  keyword: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  keywordText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
