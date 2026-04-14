import { ResistanceSignal, analyzeResistance, getSignalLabel, getSignalColor } from "./wikiKnowledge";

export { getSignalLabel, getSignalColor };

export interface ResistanceAnalysis {
  signal: ResistanceSignal;
  score: number;
  latencyMs: number;
  insights: string[];
}

export interface TypingMetrics {
  startTime: number;
  pauseCount: number;
  totalPauses: number;
  charCount: number;
}

const SIGNAL_SCORES: Record<ResistanceSignal, number> = {
  avoidance: 75,
  overwhelm: 70,
  perfectionism: 65,
  fear: 80,
  ambiguity: 55,
  low_energy: 60,
  shame: 72,
  boredom: 45,
  neutral: 20,
};

export function analyzeInput(
  text: string,
  latencyMs: number,
  metrics?: TypingMetrics
): ResistanceAnalysis {
  const signal = analyzeResistance(text, latencyMs);
  let score = SIGNAL_SCORES[signal];

  if (latencyMs > 10000) score = Math.min(100, score + 15);
  if (latencyMs > 5000 && latencyMs <= 10000) score = Math.min(100, score + 8);

  if (metrics) {
    const pauseRatio = metrics.pauseCount / Math.max(1, metrics.charCount / 10);
    if (pauseRatio > 0.5) score = Math.min(100, score + 10);
  }

  const insights: string[] = [];

  if (latencyMs > 8000) {
    insights.push("Yanıt vermeden önce uzun süre bekledi — bilişsel kaçınma sinyali");
  }
  if (signal === "avoidance") {
    insights.push("Kaçınma dili tespit edildi");
  }
  if (signal === "overwhelm") {
    insights.push("Bunalma belirtileri — görev parçalanması önerilir");
  }
  if (signal === "perfectionism") {
    insights.push("Mükemmeliyetçilik bloğu — 'yeterince iyi' çerçevesi dene");
  }
  if (signal === "shame") {
    insights.push("Utanç döngüsü — öz-şefkat ve ayrıştırma gerekiyor");
  }
  if (signal === "boredom") {
    insights.push("Sıkılma sinyali — anlam bağlantısı kur");
  }
  if (signal === "fear") {
    insights.push("Başarısızlık korkusu — küçük ve güvenli ilk adım öner");
  }
  if (signal === "low_energy") {
    insights.push("Enerji düşüklüğü — parasempatik aktivasyon önce gelir");
  }

  return { signal, score, latencyMs, insights };
}

export function getResistanceLevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Yüksek Direnç", color: "#c06060" };
  if (score >= 60) return { label: "Orta Direnç", color: "#d4a853" };
  if (score >= 40) return { label: "Hafif Direnç", color: "#8a9a7a" };
  return { label: "Akış Durumu", color: "#5a7a5a" };
}
