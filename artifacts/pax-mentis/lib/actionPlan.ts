import AsyncStorage from "@react-native-async-storage/async-storage";
import { WikiChunk, ResistanceSignal } from "./wikiKnowledge";

export interface PlanStep {
  id: string;
  text: string;
  durationMinutes: number;
  isCompleted: boolean;
  completedAt?: number;
}

export interface ActionPlan {
  id: string;
  taskId?: string;
  sessionId?: string;
  createdAt: number;
  signal: ResistanceSignal;
  theory: string;
  title: string;
  steps: PlanStep[];
  isCompleted: boolean;
  completedAt?: number;
}

const PLANS_KEY = "@pax_mentis:action_plans";

// ─── AsyncStorage işlemleri ───────────────────────────────────────────────────

export async function loadAllPlans(): Promise<ActionPlan[]> {
  try {
    const json = await AsyncStorage.getItem(PLANS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

async function persistPlans(plans: ActionPlan[]): Promise<void> {
  await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export async function savePlan(plan: ActionPlan): Promise<void> {
  const plans = await loadAllPlans();
  const idx = plans.findIndex(p => p.id === plan.id);
  if (idx >= 0) plans[idx] = plan;
  else plans.push(plan);
  await persistPlans(plans);
}

export async function togglePlanStep(
  planId: string,
  stepId: string
): Promise<ActionPlan | null> {
  const plans = await loadAllPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) return null;

  plan.steps = plan.steps.map(s => {
    if (s.id !== stepId) return s;
    const isCompleted = !s.isCompleted;
    return { ...s, isCompleted, completedAt: isCompleted ? Date.now() : undefined };
  });

  plan.isCompleted = plan.steps.every(s => s.isCompleted);
  if (plan.isCompleted && !plan.completedAt) plan.completedAt = Date.now();
  else if (!plan.isCompleted) plan.completedAt = undefined;

  await persistPlans(plans);
  return plan;
}

export async function deletePlan(planId: string): Promise<void> {
  const plans = await loadAllPlans();
  await persistPlans(plans.filter(p => p.id !== planId));
}

// ─── Plan üretimi (wiki tabanlı) ──────────────────────────────────────────────
// Gerçek LLM entegre edildiğinde bu fonksiyon yerine LLM'in JSON çıktısı kullanılır.
// Her sinyal türü için 3 somut adım, wiki müdahalesinden türetilir.

const STEP_TEMPLATES: Record<ResistanceSignal, (chunk: WikiChunk) => { text: string; durationMinutes: number }[]> = {
  avoidance: () => [
    { text: "Görevle ilgili tek bir duyguyu isimlendir ve bunu bir cümleyle yaz.", durationMinutes: 5 },
    { text: "Sadece 10 dakika için timer kur — başlamak yeterli, bitirmek zorunda değilsin.", durationMinutes: 10 },
    { text: "Timer bitince: 1 dakika derin nefes al ve devam edip etmeyeceğine karar ver.", durationMinutes: 5 },
  ],
  overwhelm: (chunk) => [
    { text: chunk.intervention, durationMinutes: 5 },
    { text: "Görevin sadece ilk adımını yaz. Tek cümle, maksimum 2 dakikalık eylem.", durationMinutes: 10 },
    { text: "O adımı yap ve bitince 'Başardım' diye kendinle konuş.", durationMinutes: 10 },
  ],
  perfectionism: () => [
    { text: "'Yeterince iyi' versiyonunu hayal et — mükemmel değil, tamamlanmış.", durationMinutes: 5 },
    { text: "Göreve %70 kaliteyle başla, ilk taslağı tamamla.", durationMinutes: 15 },
    { text: "Bıraktığın yeri not et — düzeltme için ayrı bir zaman dilimi planla.", durationMinutes: 5 },
  ],
  fear: (chunk) => [
    { text: "En kötü ihtimali yaz — ve bunun gerçekten ne kadar olası olduğunu değerlendir.", durationMinutes: 5 },
    { text: chunk.intervention, durationMinutes: 5 },
    { text: "Küçük bir adım at ve kendine 'Deniyorum' de — 'başarmalıyım' değil.", durationMinutes: 10 },
  ],
  ambiguity: () => [
    { text: "Görevi 3 alt parçaya böl — her birini tek cümleyle tanımla.", durationMinutes: 10 },
    { text: "Bu üç parçadan en somut, en küçük olanını seç ve sadece ona odaklan.", durationMinutes: 15 },
    { text: "Bitince bir sonraki parçayı hangi gün yapacağını takvime ekle.", durationMinutes: 5 },
  ],
  low_energy: (chunk) => [
    { text: "2 dakika derin nefes: 4 saniye içeri, 4 saniye tut, 4 saniye dışarı.", durationMinutes: 2 },
    { text: chunk.intervention, durationMinutes: 5 },
    { text: "Enerji için en uygun saatini belirle ve görevi o saate kaydır.", durationMinutes: 10 },
  ],
  neutral: () => [
    { text: "Görevi başlatmak için tek bir tetikleyici ritüel belirle (örn: kahve, belirli bir masa).", durationMinutes: 5 },
    { text: "Sadece ilk 15 dakika için otur — daha uzunu düşünme.", durationMinutes: 15 },
    { text: "İlk 15 dakika sonunda ne yaptığını bir cümleyle not et.", durationMinutes: 5 },
  ],
};

const PLAN_TITLES: Record<ResistanceSignal, string> = {
  avoidance: "Kaçınma Kırıcı Plan",
  overwhelm: "Bunalmayı Aşma Planı",
  perfectionism: "Mükemmeliyetçilik Tuzağı Planı",
  fear: "Korku Aşma Planı",
  ambiguity: "Netlik Kazanma Planı",
  low_energy: "Enerji Yenileme Planı",
  neutral: "Başlangıç Planı",
};

export function generateActionPlan(
  chunks: WikiChunk[],
  signal: ResistanceSignal,
  taskId?: string,
  sessionId?: string
): ActionPlan {
  const topChunk = chunks[0];
  const stepTemplate = STEP_TEMPLATES[signal];
  const rawSteps = stepTemplate(topChunk);

  const steps: PlanStep[] = rawSteps.map((s, i) => ({
    id: `step_${Date.now()}_${i}`,
    text: s.text,
    durationMinutes: s.durationMinutes,
    isCompleted: false,
  }));

  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    taskId,
    sessionId,
    createdAt: Date.now(),
    signal,
    theory: topChunk.theory,
    title: PLAN_TITLES[signal],
    steps,
    isCompleted: false,
  };
}
