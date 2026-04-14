// ─── Oturum Özeti ─────────────────────────────────────────────────────────────
// Uzun konuşmalarda mentor geçmişi unutmaması için eski mesajları özetler.
// Özet sistem prompt'una eklenir, son 6 mesaj ise ham olarak iletilir.

export interface ConversationMessage {
  role: "user" | "mentor" | "assistant";
  content: string;
}

const SUMMARY_THRESHOLD = 8; // Bu sayıdan fazla mesajda özet oluştur

export function shouldSummarize(messages: ConversationMessage[]): boolean {
  return messages.length >= SUMMARY_THRESHOLD;
}

/**
 * Konuşmanın eski kısmını özetler.
 * Döndürülenler:
 *   summary — eski mesajlardan üretilen Türkçe özet
 *   recentMessages — son 6 mesaj (ham, sistem prompt'una eklenir)
 */
export function summarizeConversation(messages: ConversationMessage[]): {
  summary: string;
  recentMessages: ConversationMessage[];
} {
  const filtered = messages;
  if (filtered.length < SUMMARY_THRESHOLD) {
    return { summary: "", recentMessages: filtered };
  }

  const old = filtered.slice(0, -6);
  const recent = filtered.slice(-6);

  const userLines = old
    .filter(m => m.role === "user")
    .map(m => m.content.slice(0, 120).trim())
    .filter(Boolean);

  const mentorLines = old
    .filter(m => m.role === "mentor" || m.role === "assistant")
    .map(m => m.content.slice(0, 80).trim())
    .filter(Boolean);

  const parts: string[] = [];

  if (userLines.length > 0) {
    parts.push(`Kullanıcı şunları paylaştı: "${userLines.join(" / ")}".`);
  }

  if (mentorLines.length > 0) {
    parts.push(`Mentor şu yönde yanıt verdi: "${mentorLines[mentorLines.length - 1]}".`);
  }

  const summary = parts.length > 0
    ? `[Konuşma özeti — ${old.length} eski mesaj]: ${parts.join(" ")}`
    : "";

  return { summary, recentMessages: recent };
}
