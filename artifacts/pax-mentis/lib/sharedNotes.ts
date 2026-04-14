/**
 * Pax Mentis — Paylaşılan Notlar
 *
 * Kullanıcı kontrollü bağlam paylaşımı (e-posta, mesaj, görev listesi vb.)
 * Mahremiyet: Kullanıcı neyi paylaşacağını kendisi seçer.
 * Otomatik e-posta okuma yoktur — her şey manuel.
 *
 * Mantık:
 *  • Kullanıcı istediği metni yapıştırır (e-posta, not, mesaj)
 *  • AsyncStorage'da yerel olarak saklanır
 *  • Mentor sohbetinde LLM context'ine enjekte edilir
 *  • Kullanıcı istediğinde tüm notları silebilir
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@pax_mentis:shared_notes";
const MAX_LENGTH = 3000; // Limit to avoid token overflow in LLM context
const MAX_NOTES  = 5;

export interface SharedNote {
  id:        string;
  content:   string;
  label:     string;  // user-given label (e.g. "İş e-postası", "Proje listesi")
  createdAt: number;
  /** true = include in mentor context */
  active:    boolean;
}

// ─── Load / Save ──────────────────────────────────────────────────────────────

export async function loadSharedNotes(): Promise<SharedNote[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SharedNote[];
  } catch {
    return [];
  }
}

export async function saveSharedNotes(notes: SharedNote[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(notes.slice(-MAX_NOTES)));
}

export async function addSharedNote(content: string, label: string): Promise<SharedNote> {
  const notes  = await loadSharedNotes();
  const note: SharedNote = {
    id:        Date.now().toString() + Math.random().toString(36).slice(2, 7),
    content:   content.slice(0, MAX_LENGTH),
    label:     label.slice(0, 60),
    createdAt: Date.now(),
    active:    true,
  };
  await saveSharedNotes([...notes, note]);
  return note;
}

export async function toggleSharedNote(id: string): Promise<void> {
  const notes   = await loadSharedNotes();
  const updated = notes.map(n => n.id === id ? { ...n, active: !n.active } : n);
  await saveSharedNotes(updated);
}

export async function deleteSharedNote(id: string): Promise<void> {
  const notes   = await loadSharedNotes();
  await saveSharedNotes(notes.filter(n => n.id !== id));
}

export async function clearAllSharedNotes(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

// ─── LLM Bağlamı Üretici ─────────────────────────────────────────────────────

/**
 * Aktif notlardan kısa bir LLM bağlam metni oluşturur.
 * Yalnızca kullanıcı aktif olarak işaretlediği notlar dahil edilir.
 */
export function buildSharedNotesContext(notes: SharedNote[]): string | null {
  const active = notes.filter(n => n.active);
  if (active.length === 0) return null;

  const lines = active.map(n => {
    const snippet = n.content.slice(0, 400).replace(/\n+/g, " ");
    return `[${n.label}]: ${snippet}${n.content.length > 400 ? "…" : ""}`;
  });

  return `Kullanıcının paylaştığı bağlam notları:\n${lines.join("\n")}`;
}
