import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResistanceSignal } from "./wikiKnowledge";

const PROFILE_KEY = "@pax_mentis:user_profile";

export interface UserProfile {
  sessionCount: number;
  totalUserMessages: number;
  signalFrequency: Record<string, number>;
  avgResistanceScore: number;
  lastSessionDate: number | null;
  // Hangi wiki chunk'larının plan fazında kullanıldığını takip eder
  // Gerçek LLM entegre edildiğinde etkinliğe göre ağırlıklandırılır
  usedInterventions: Record<string, number>;
}

const DEFAULT_PROFILE: UserProfile = {
  sessionCount: 0,
  totalUserMessages: 0,
  signalFrequency: {},
  avgResistanceScore: 0,
  lastSessionDate: null,
  usedInterventions: {},
};

export async function loadUserProfile(): Promise<UserProfile> {
  try {
    const json = await AsyncStorage.getItem(PROFILE_KEY);
    if (!json) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(json) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function updateUserProfile(
  signal: ResistanceSignal,
  resistanceScore: number,
  isNewSession: boolean
): Promise<UserProfile> {
  const profile = await loadUserProfile();

  profile.signalFrequency[signal] = (profile.signalFrequency[signal] ?? 0) + 1;
  profile.totalUserMessages += 1;

  if (isNewSession) {
    profile.sessionCount += 1;
    profile.lastSessionDate = Date.now();
  }

  // Kayan ortalama (ağırlıklı yeni veriye doğru)
  const alpha = 0.3;
  profile.avgResistanceScore =
    profile.avgResistanceScore === 0
      ? resistanceScore
      : Math.round(alpha * resistanceScore + (1 - alpha) * profile.avgResistanceScore);

  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export async function recordInterventionUsed(chunkId: string): Promise<void> {
  const profile = await loadUserProfile();
  profile.usedInterventions[chunkId] = (profile.usedInterventions[chunkId] ?? 0) + 1;
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// ─── Sistem prompt'u için Türkçe özet üretir ─────────────────────────────────
export function generateProfileSummary(profile: UserProfile): string | null {
  if (profile.sessionCount === 0) return null;

  const lines: string[] = [];

  // Kaç sohbet yapıldı
  lines.push(
    `Bu kullanıcıyla daha önce ${profile.sessionCount} sohbet yapıldı` +
    ` (toplam ${profile.totalUserMessages} mesaj).`
  );

  // En baskın direnç sinyali
  const dominant = getDominantSignal(profile.signalFrequency);
  if (dominant) {
    const total = Object.values(profile.signalFrequency).reduce((a, b) => a + b, 0);
    const pct = Math.round((profile.signalFrequency[dominant] / total) * 100);
    const label = SIGNAL_LABELS_TR[dominant] ?? dominant;
    lines.push(`En sık karşılaşılan durum: ${label} (sohbetlerin %${pct}'inde).`);
  }

  // Ortalama direnç
  if (profile.avgResistanceScore > 0) {
    const level =
      profile.avgResistanceScore >= 70
        ? "yüksek"
        : profile.avgResistanceScore >= 40
        ? "orta"
        : "düşük";
    lines.push(`Ortalama direnç seviyesi ${level} (${profile.avgResistanceScore}/100).`);
  }

  // Son sohbet
  if (profile.lastSessionDate) {
    const daysDiff = Math.floor((Date.now() - profile.lastSessionDate) / 86_400_000);
    if (daysDiff === 0) lines.push("Son sohbet bugün gerçekleşti.");
    else if (daysDiff === 1) lines.push("Son sohbet dün gerçekleşti.");
    else lines.push(`Son sohbet ${daysDiff} gün önce gerçekleşti.`);
  }

  return lines.join(" ");
}

function getDominantSignal(freq: Record<string, number>): string | null {
  const entries = Object.entries(freq);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

const SIGNAL_LABELS_TR: Record<string, string> = {
  avoidance: "kaçınma",
  overwhelm: "bunalmışlık",
  perfectionism: "mükemmeliyetçilik",
  fear: "başarısızlık korkusu",
  ambiguity: "belirsizlik",
  low_energy: "enerji düşüklüğü",
  neutral: "genel durum",
};
