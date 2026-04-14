export interface WikiChunk {
  id: string;
  theory: string;
  topic: string;
  keywords: string[];
  content: string;
  socraaticPrompt: string;
  intervention: string;
}

export type ResistanceSignal =
  | "avoidance"
  | "overwhelm"
  | "perfectionism"
  | "fear"
  | "ambiguity"
  | "low_energy"
  | "neutral";

export type ConversationPhase =
  | "discovery"   // İlk 1-2 mesaj: kullanıcıyı tanı, soru sor, dinle
  | "diagnosis"   // 3-4. mesaj: sinyal netleşti, derin Sokratik soru
  | "planning"    // 5+ mesaj veya kullanıcı hazırsa: somut plan öner
  | "followup";   // Plan verildikten sonra: destek ve takip

export const WIKI_CHUNKS: WikiChunk[] = [
  {
    id: "tmt_01",
    theory: "TMT",
    topic: "Motivasyon Açığı",
    keywords: ["istemiyorum", "sıkıldım", "anlamsız", "ne gerek", "neden", "motivasyon"],
    content: "Temporal Motivation Theory (Piers Steel): Motivasyon = (Beklenti × Değer) / (Dürtüsellik × Gecikme). Ödül uzaktaysa, beyin anlık rahatsızlığı öncelikler.",
    socraaticPrompt: "Bu görevi tamamladığında sana ne kazandıracak — gerçekten önemli olan ne?",
    intervention: "Görevi daha küçük parçalara böl ve ilk 2 dakikalık adımı belirle.",
  },
  {
    id: "tmt_02",
    theory: "TMT",
    topic: "Yakın Ödül",
    keywords: ["uzun", "zaman alır", "süre", "bitiremedim", "başlayamıyorum"],
    content: "Gecikme cezası (TMT): Uzak hedefler beyin tarafından küçük algılanır. 'Implementation Intention' tekniği bu açığı kapatır.",
    socraaticPrompt: "Şu andan 5 dakika sonra nerede olmak istiyorsun — sadece 5 dakika?",
    intervention: "Tek bir somut eylem belirle: 'Ne zaman X, o zaman Y yapacağım.'",
  },
  {
    id: "psi_01",
    theory: "PSI",
    topic: "Durum Yönelimi",
    keywords: ["yapamam", "başaramam", "kafam karışık", "ne yapacağımı bilmiyorum", "tıkandım"],
    content: "PSI Teorisi (Julius Kuhl): Durum yönelimi — kişi geçmiş başarısızlıklar veya gelecek kaygılarına odaklanarak harekete geçemez. Eylem yönelimi ise şimdiki adıma odaklanır.",
    socraaticPrompt: "Şu an seni en çok durduran tek şey ne — bir düşünce mü, bir duygu mu?",
    intervention: "Geçmişe veya geleceğe değil, şu an yapabileceğin en küçük eyleme odaklan.",
  },
  {
    id: "psi_02",
    theory: "PSI",
    topic: "Öz-Regülasyon",
    keywords: ["yoruldum", "artık yeter", "pes ettim", "bırakmak istiyorum"],
    content: "PSI Teorisi: Öz-Regülasyon kapasitesi tükenmişlik dönemlerinde düşer. Parasempatik aktivasyon (nefes, kısa mola) bu kapasiteyi yeniler.",
    socraaticPrompt: "Şu an bedeninde ne hissediyorsun — 3 derin nefes aldıktan sonra bana söyle.",
    intervention: "2 dakika kasıtlı nefes egzersizi yap, sonra tek bir küçük adım at.",
  },
  {
    id: "act_01",
    theory: "ACT",
    topic: "Deneyimsel Kaçınma",
    keywords: ["istemiyorum", "rahatsız ediyor", "zor geliyor", "kaçmak istiyorum", "sıkıntı"],
    content: "ACT (Steven Hayes): Deneyimsel kaçınma — rahatsız edici düşünce veya duygudan kaçmak amacıyla eylemi ertelemek. Kabul, kaçınmadan daha az enerji tüketir.",
    socraaticPrompt: "Bu görevi düşündüğünde içinde ne hissediyorsun — onu kaçırmaya mı yoksa kucaklamaya mı hazırsın?",
    intervention: "Rahatsızlığı kabul et ama ona itaat etme. Duygu geçer, yapılmamış iş kalır.",
  },
  {
    id: "act_02",
    theory: "ACT",
    topic: "Psikolojik Esneklik",
    keywords: ["değerlerim", "önemli", "anlamlı", "hayatım", "kim olmak istiyorum"],
    content: "ACT: Psikolojik esneklik — anlık duygudan bağımsız olarak değerlere uygun davranabilmek.",
    socraaticPrompt: "Bu görevi tamamlamak seni daha çok kim olmak istediğin kişiye yaklaştırıyor mu?",
    intervention: "Değer tabanlı motivasyon bul: Bu görev hangi önemli değerini yansıtıyor?",
  },
  {
    id: "kahneman_01",
    theory: "Kahneman",
    topic: "Sistem 1 Tepkisi",
    keywords: ["otomatik", "içgüdüsel", "sinirli", "duygusal", "panik", "korku"],
    content: "Kahneman Sistem 1: Hızlı, duygusal, otomatik düşünce. Amigdala devreye girdiğinde rasyonel planlama kilitlenir.",
    socraaticPrompt: "Şu an duygusal mı düşünüyorsun yoksa rasyonel mi — ikisi arasında fark var mı?",
    intervention: "4-4-4 nefes tekniği: 4 saniye içeri, 4 saniye tut, 4 saniye dışarı. Sonra tekrar değerlendir.",
  },
  {
    id: "kahneman_02",
    theory: "Kahneman",
    topic: "Sistem 2 Aktivasyonu",
    keywords: ["düşüneyim", "analiz", "mantıklı", "anlamak istiyorum", "neden"],
    content: "Kahneman Sistem 2: Yavaş, analitik, kasıtlı düşünce. Ertelemeyi çözmek için Sistem 2'yi aktive etmek gerekir.",
    socraaticPrompt: "Bu görevi mantıklı bir şekilde değerlendirirsen — gerçekten ne kadar zor?",
    intervention: "Görevi yazılı olarak küçük adımlara böl, her adımın maksimum 15 dakika süreceğini varsay.",
  },
  {
    id: "habits_01",
    theory: "Atomic Habits",
    topic: "Tetikleyici Kurma",
    keywords: ["alışkanlık", "düzenli", "her gün", "rutin", "sistem"],
    content: "James Clear: Eylem tetikleyicileri (cue-routine-reward) ve 2 Dakika Kuralı. Her alışkanlık en basit haliyle 2 dakikaya indirgenebilir.",
    socraaticPrompt: "Bu görevi hangi ortamda, hangi saatte yapmak sana en kolay gelir?",
    intervention: "Görev için bir 'tetikleyici ritüel' belirle: Kahveni alır almaz masana geç.",
  },
  {
    id: "habits_02",
    theory: "Atomic Habits",
    topic: "Kimlik Bazlı Motivasyon",
    keywords: ["ben", "olmak istiyorum", "hedefim", "başarılı", "kişi"],
    content: "Clear: Sürdürülebilir değişim kimlik düzeyinde gerçekleşir. 'Bu görevi yapmak istiyorum' değil, 'Bu tür biri oldum' ifadesi.",
    socraaticPrompt: "Bu görevi yapan kişi nasıl biri? Sen o kişi misin?",
    intervention: "Kimlik bildirimi oluştur: 'Ben [X] olan birisiyim ve bu benim için önemli.'",
  },
  {
    id: "mood_01",
    theory: "Pychyl",
    topic: "Anlık Duygu Onarımı",
    keywords: ["şimdi", "hemen", "anında", "iyi hissetmek", "rahatlama", "kaçış"],
    content: "Timothy Pychyl: Erteleme, görevin rahatsızlığından kaçmak için anlık duyguyu iyileştirme stratejisidir. Kısa vadeli rahatlama uzun vadeli sıkıntı yaratır.",
    socraaticPrompt: "Ertelediğinde gerçekten rahatladın mı, yoksa bir süre sonra daha kötü hissettin mi?",
    intervention: "Rahatsızlığa tolerans penceresini genişlet: 5 dakika boyunca bu duyguyla sadece otur, sonra karar ver.",
  },
  {
    id: "mood_02",
    theory: "Pychyl",
    topic: "Öz-Şefkat",
    keywords: ["kendime kızıyorum", "başarısızım", "yetersizim", "utanç", "suçluluk"],
    content: "Pychyl & Sirois: Öz-eleştiri ertelemeyi artırır, öz-şefkat azaltır. Kendini yargılamak, harekete geçmeyi zorlaştırır.",
    socraaticPrompt: "En iyi arkadaşın senin yerine olsaydı, ona ne söylerdin?",
    intervention: "Öz-şefkat pratiği: Mükemmel olmak zorunda değilsin. Başlamak yeterli.",
  },
];

export function analyzeResistance(
  inputText: string,
  latencyMs: number
): ResistanceSignal {
  const lower = inputText.toLowerCase();

  if (latencyMs > 8000) return "avoidance";

  const avoidanceWords = ["kaçmak", "istemiyorum", "erteleyeyim", "sonra", "yarın"];
  const overwhelmWords = ["çok", "fazla", "bunaltıcı", "tıkandım", "yapamam", "bitiremedim"];
  const perfectionismWords = ["mükemmel", "hazır değilim", "doğru değil", "yanlış olur"];
  const fearWords = ["korktum", "endişe", "başarısız", "rezil", "mahvedersem"];
  const ambiguityWords = ["ne yapacağımı", "nasıl", "nereden başlayacağım", "bilmiyorum"];
  const lowEnergyWords = ["yorgun", "enerji yok", "bıktım", "pes", "artık yeter"];

  if (avoidanceWords.some(w => lower.includes(w))) return "avoidance";
  if (overwhelmWords.some(w => lower.includes(w))) return "overwhelm";
  if (perfectionismWords.some(w => lower.includes(w))) return "perfectionism";
  if (fearWords.some(w => lower.includes(w))) return "fear";
  if (ambiguityWords.some(w => lower.includes(w))) return "ambiguity";
  if (lowEnergyWords.some(w => lower.includes(w))) return "low_energy";

  return "neutral";
}

export function retrieveRelevantChunks(
  inputText: string,
  signal: ResistanceSignal,
  maxChunks = 3
): WikiChunk[] {
  const lower = inputText.toLowerCase();
  const signalTheoryMap: Record<ResistanceSignal, string[]> = {
    avoidance: ["ACT", "Pychyl"],
    overwhelm: ["TMT", "PSI"],
    perfectionism: ["ACT", "Kahneman"],
    fear: ["ACT", "Kahneman"],
    ambiguity: ["TMT", "PSI"],
    low_energy: ["PSI", "Pychyl"],
    neutral: ["TMT", "Atomic Habits"],
  };

  const scored = WIKI_CHUNKS.map(chunk => {
    let score = 0;
    chunk.keywords.forEach(kw => { if (lower.includes(kw)) score += 3; });
    if (signalTheoryMap[signal].includes(chunk.theory)) score += 2;
    return { chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(s => s.chunk);
}

// ─── Faz bazlı sistem prompt ──────────────────────────────────────────────────
// Her konuşma aşaması farklı bir davranış gerektirir:
//   discovery  → Dinle, soru sor, yargılama, teşhis yapma henüz
//   diagnosis  → Sinyal netleşti, derin Sokratik soru, duyguyu yansıt
//   planning   → Somut 3 adımlı plan sun, wiki teorisine dayan
//   followup   → Planı takip et, ne kadar ilerlendi öğren

export function buildSystemPrompt(
  chunks: WikiChunk[],
  signal: ResistanceSignal,
  phase: ConversationPhase,
  conversationSummary?: string
): string {
  const signalDescriptions: Record<ResistanceSignal, string> = {
    avoidance: "kaçınma davranışı",
    overwhelm: "bunalmışlık",
    perfectionism: "mükemmeliyetçilik bloğu",
    fear: "başarısızlık korkusu",
    ambiguity: "belirsizlik ve yön kaybı",
    low_energy: "enerji düşüklüğü",
    neutral: "genel durum",
  };

  const chunkContext = chunks
    .map(c => `[${c.theory} — ${c.topic}]\n${c.content}\nSokratik Soru: "${c.socraaticPrompt}"\nMüdahale: ${c.intervention}`)
    .join("\n\n---\n\n");

  const phaseInstructions: Record<ConversationPhase, string> = {
    discovery: `## Bu Aşama: Keşif
Sen şu an kullanıcıyı tanımaya çalışıyorsun. HENÜZ teşhis yapma, çözüm önerme.
- Sadece tek, açık uçlu bir soru sor.
- Kullanıcının söylediklerini yansıt: "Duyduğuma göre... — doğru mu anladım?"
- Empati kur ama teori anlatma. Duyguyu tanı, isimlendir.
- Hedef: Kullanıcının sorununun tam olarak ne olduğunu anlamak.`,

    diagnosis: `## Bu Aşama: Teşhis
Konuşmadan yeterince bilgi topladın. Şimdi daha derin bir Sokratik soru sor.
- Tespit ettiğin direnç sinyalini (${signalDescriptions[signal]}) yansıt.
- Wiki'deki teorilerden birini kullanarak soruyu derinleştir — ama teoriyi açıklama.
- Tek soru, net ve keskin. Kullanıcının kendi cevabını bulmasını sağla.`,

    planning: `## Bu Aşama: Plan
Artık sorunun kaynağını anlıyorsun. Somut, uygulanabilir bir plan sun.
- Maksimum 3 adım. Her adım 15 dakika veya daha az sürmeli.
- Wiki'deki müdahale tekniklerine dayan — ama teori adı verme.
- Planı kullanıcıyla birlikte şekillendir: "Bunu nasıl buluyorsun?" diye sor.
- Net, sıcak, motive edici dil kullan.`,

    followup: `## Bu Aşama: Takip
Plan verildi. Şimdi kullanıcının durumunu öğren ve destek ol.
- "İlk adımı deneyebildin mi?" gibi somut takip soruları sor.
- Zorlandıklarını normalize et, küçük ilerlemeleri kutla.
- Gerekirse planı güncelle.`,
  };

  return `Sen Pax Mentis'sin — erteleme ve duygu yönetimi konusunda uzman, şefkatli ama kararlı bir bilge mentör.

${phaseInstructions[phase]}

${conversationSummary ? `## Konuşma Özeti\n${conversationSummary}\n` : ""}
## Mevcut Durum
Tespit edilen sinyal: ${signalDescriptions[signal]}

## Kullanılabilecek Psikolojik Çerçeveler (gerektiğinde)
${chunkContext}

## Kesin Kurallar
1. Asla yargılama. Kullanıcı disiplinsiz değil, duygusal düzenleme güçlüğü yaşıyor.
2. Teorileri ismiyle anma — onları konuşmaya doğal biçimde yansıt.
3. Mobil ekran: Maksimum 3-4 cümle. Kısa, derin, sıcak.
4. Türkçe konuş, samimi ol.
5. Her yanıtta yalnızca BİR soru sor.`;
}

// Konuşma geçmişinden faz belirle
export function determinePhase(messageCount: number, hasActionPlan: boolean): ConversationPhase {
  if (hasActionPlan) return "followup";
  if (messageCount <= 2) return "discovery";
  if (messageCount <= 4) return "diagnosis";
  return "planning";
}
