// ─── Pax Mentis Wiki Kütüphanesi ──────────────────────────────────────────────
//
// Kaynak distilasyonu (kavram/fikir düzeyinde, verbatim değil):
//   • Steel, P. (2007). The Nature of Procrastination. Psychological Bulletin, 133(1).
//   • Steel, P. (2011). The Procrastination Equation. Harper Collins.
//   • Sirois, F. & Pychyl, T. (2013). Procrastination and the Priority of Short-Term
//     Mood Regulation. Social and Personality Psychology Compass.
//   • Pychyl, T. (2013). Solving the Procrastination Puzzle. Tarcher/Penguin.
//   • Gollwitzer, P. & Sheeran, P. (2006). Implementation Intentions and Goal
//     Achievement: A Meta-Analysis. Advances in Experimental Social Psychology.
//   • Kuhl, J. / Kazén, M. & Quirin, M. (2018). PSI Theory. Hogrefe.
//   • Hayes, S. C. & Smith, S. (2005). Get Out of Your Mind & Into Your Life. New Harbinger.
//   • Clear, J. (2018). Atomic Habits. Penguin Random House.
//   • Kahneman, D. (2011). Thinking, Fast and Slow. Farrar, Straus and Giroux.
//   • Neff, K. (2011). Self-Compassion. William Morrow.
//   • Miller, W. & Rollnick, S. (2013). Motivational Interviewing (3rd ed.). Guilford.
//   • Rogers, C. (1951). Client-Centered Therapy. Houghton Mifflin.
//
// Lisans notu: Tüm içerik özgün sentez ve öğretimsel kullanım için yazılmıştır.
// Akademik makaleler açık erişim depolarında (White Rose, ResearchGate) mevcuttur.

export interface WikiChunk {
  id: string;
  theory: string;
  topic: string;
  topicEn: string;
  keywords: string[];
  keywordsEn: string[];
  content: string;
  contentEn: string;
  socraaticPrompt: string;
  socraaticPromptEn: string;
  intervention: string;
  interventionEn: string;
  source: string;
}

export type ResistanceSignal =
  | "avoidance"
  | "overwhelm"
  | "perfectionism"
  | "fear"
  | "ambiguity"
  | "low_energy"
  | "shame"
  | "boredom"
  | "neutral";

export type ConversationPhase =
  | "discovery"   // İlk 1-2 mesaj: kullanıcıyı tanı, soru sor, dinle
  | "diagnosis"   // 3-4. mesaj: sinyal netleşti, derin Sokratik soru
  | "planning"    // 5+ mesaj veya kullanıcı hazırsa: somut plan öner
  | "followup";   // Plan verildikten sonra: destek ve takip

// ─────────────────────────────────────────────────────────────────────────────
// BÖLÜM 1: Ertelemenin Doğası (TMT / Steel)
// ─────────────────────────────────────────────────────────────────────────────

export const WIKI_CHUNKS: WikiChunk[] = [
  {
    id: "tmt_01",
    theory: "TMT",
    topic: "Motivasyon Açığı",
    topicEn: "Motivation Gap",
    keywords: ["istemiyorum", "sıkıldım", "anlamsız", "ne gerek", "neden", "motivasyon", "isteksiz"],
    keywordsEn: ["don't want", "bored", "meaningless", "motivation", "why bother"],
    content: "Piers Steel'in Temporal Motivation Theory formülü: Motivasyon = (Beklenti × Değer) / (Dürtüsellik × Gecikme). Ödül uzaktaysa veya görev rahatsız ediciyse beyin anlık rahatlığı öncelikler. Bu biyolojik bir yanılgıdır, tembellik değil.",
    contentEn: "Piers Steel's TMT formula: Motivation = (Expectancy × Value) / (Impulsiveness × Delay). When rewards are distant or tasks feel aversive, the brain prioritizes immediate comfort. This is a biological bias, not laziness.",
    socraaticPrompt: "Bu görevi tamamladığında sana ne kazandıracak — gerçekten önemli olan ne?",
    socraaticPromptEn: "What would completing this task give you — what really matters here?",
    intervention: "Görevi daha küçük parçalara böl. İlk 2 dakikalık adımı belirle ve sadece ona odaklan.",
    interventionEn: "Break the task into smaller parts. Identify just the first 2-minute step.",
    source: "Steel (2007, 2011)",
  },
  {
    id: "tmt_02",
    theory: "TMT",
    topic: "Yakın Ödül",
    topicEn: "Delay Discounting",
    keywords: ["uzun sürer", "zaman alır", "bitiremedim", "başlayamıyorum", "çok var"],
    keywordsEn: ["takes too long", "can't finish", "can't start", "so much to do"],
    content: "Gecikme cezası (TMT): Uzak hedefler beyin tarafından daha küçük algılanır — hiperbolik indirim. 'Şu an küçük bir eylem' büyük bir hedeften daha motive edicidir.",
    contentEn: "Delay penalty (TMT): Distant goals feel smaller — hyperbolic discounting. 'One small action now' is more motivating than a big distant goal.",
    socraaticPrompt: "Şu andan 5 dakika sonra nerede olmak istiyorsun — sadece 5 dakika?",
    socraaticPromptEn: "Where do you want to be in just 5 minutes — only 5 minutes?",
    intervention: "Eğer-Öyleyse planı: 'Saat X'te masama geçince, ilk Y adımını atarım.'",
    interventionEn: "Implementation intention: 'When it's X o'clock, I will take step Y.'",
    source: "Steel (2007); Gollwitzer & Sheeran (2006)",
  },
  {
    id: "tmt_03",
    theory: "TMT",
    topic: "Görev Tiksintisi",
    topicEn: "Task Aversiveness",
    keywords: ["iğrenç", "sıkıcı", "nefret", "berbat", "çekilemez", "bıktım", "dayanamıyorum"],
    keywordsEn: ["hate it", "boring", "awful", "unbearable", "disgusting task"],
    content: "Steel'in meta-analizine göre (691 korelasyon) ertelemenin en güçlü öngörücüsü görev tiksintisidir — sıkıcı, anlamsız veya bunaltıcı bulunan görevler. Tiksintiyi azaltmak, ceza korkusundan daha etkili.",
    contentEn: "Steel's meta-analysis (691 correlations): task aversiveness is the strongest predictor of procrastination — tasks that feel boring, meaningless or overwhelming. Reducing aversion beats punishing delays.",
    socraaticPrompt: "Bu görevin tam olarak hangi parçası seni en çok rahatsız ediyor?",
    socraaticPromptEn: "Which exact part of this task feels most unbearable to you?",
    intervention: "O spesifik parçayı izole et ve sadece onunla 5 dakika yüzleş. Geri kalanı bekleyebilir.",
    interventionEn: "Isolate that specific part and face it for just 5 minutes. The rest can wait.",
    source: "Steel (2007)",
  },
  {
    id: "tmt_04",
    theory: "TMT",
    topic: "Akıllı Gecikme vs Erteleme",
    topicEn: "Strategic Delay vs Procrastination",
    keywords: ["bekleyebilir", "doğru zaman değil", "hazır değilim", "bir süre sonra"],
    keywordsEn: ["can wait", "not the right time", "not ready yet"],
    content: "Erteleme = kendi çıkarına aykırı olduğunu bilerek kasıtlı geciktirmek. Stratejik geciktirme ise mantıklıdır. Aradaki fark: 'Bu beni ne kadar süredir sıkıyor?' — eğer suçluluk varsa, ertelemedir.",
    contentEn: "Procrastination = voluntarily delaying despite knowing you'll be worse off. Strategic delay is rational. The difference: if guilt is present, it's procrastination.",
    socraaticPrompt: "Bu 'bekleme' kararı sana iç huzur mu veriyor yoksa hafif bir suçluluk mu?",
    socraaticPromptEn: "Does this 'waiting' decision bring peace — or a faint guilt?",
    intervention: "Suçluluk hissediyorsan bu ertelemedir. En küçük başlangıç adımını şimdi at.",
    interventionEn: "If guilt is present, it's procrastination. Take the smallest first step now.",
    source: "Steel (2011); Pychyl (2013)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 2: Duygu Düzenleme (Sirois & Pychyl / Pychyl)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "mood_01",
    theory: "Pychyl",
    topic: "Anlık Duygu Onarımı",
    topicEn: "Short-Term Mood Repair",
    keywords: ["şimdi", "hemen", "anında", "iyi hissetmek", "rahatlama", "kaçış", "sonra yaparım"],
    keywordsEn: ["feel better now", "relief", "escape", "I'll do it later"],
    content: "Pychyl & Sirois (2013): Erteleme bir zaman yönetimi sorunu değil, duygu yönetimi başarısızlığıdır. 'Şimdi iyi hissetmek için görevi erteleriz' — bu kısa vadede işe yarar ama uzun vadede kaygıyı artırır.",
    contentEn: "Pychyl & Sirois (2013): Procrastination is not a time-management problem — it's an emotion-regulation failure. 'We give in to feel good' — this works short-term but increases anxiety long-term.",
    socraaticPrompt: "Ertelediğinde gerçekten rahatladın mı, yoksa bir süre sonra daha kötü hissettin mi?",
    socraaticPromptEn: "When you put it off, did you truly relax — or did you feel worse later?",
    intervention: "Rahatsızlığa tolerans penceresini genişlet: 5 dakika boyunca bu duyguyla sadece otur, sonra karar ver.",
    interventionEn: "Expand your distress tolerance window: sit with the discomfort for 5 minutes, then decide.",
    source: "Sirois & Pychyl (2013); Pychyl (2013)",
  },
  {
    id: "mood_02",
    theory: "Pychyl",
    topic: "Öz-Şefkat",
    topicEn: "Self-Compassion",
    keywords: ["kendime kızıyorum", "başarısızım", "yetersizim", "utanç", "suçluluk", "kendimi yiyorum"],
    keywordsEn: ["I failed", "I'm useless", "shame", "guilt", "hate myself"],
    content: "Pychyl & Neff: Öz-eleştiri ertelemeyi artırır, öz-şefkat azaltır. Kendini yargılamak enerjiyi tüketir ve bir sonraki adımı daha da zor hale getirir. Mükemmel olman gerekmez.",
    contentEn: "Pychyl & Neff: Self-criticism increases procrastination; self-compassion reduces it. Judging yourself drains energy and makes the next step harder. You don't need to be perfect.",
    socraaticPrompt: "En iyi arkadaşın tam şu durumunda olsaydı, ona ne söylerdin?",
    socraaticPromptEn: "If your best friend were in your exact situation, what would you tell them?",
    intervention: "Öz-şefkat pratiği: 'Bu zor ve ben insan gibiyim. Başlamak yeterli.' Şimdi sadece 1 küçük adım.",
    interventionEn: "Self-compassion practice: 'This is hard and I'm human. Starting is enough.' Take 1 small step now.",
    source: "Pychyl (2013); Neff (2011)",
  },
  {
    id: "mood_03",
    theory: "Pychyl",
    topic: "Gelecek Ben Ayrışması",
    topicEn: "Future Self Disconnection",
    keywords: ["ileride", "gelecekte", "sonra hallederim", "yarın başlarım", "zamanı gelince"],
    keywordsEn: ["future me", "I'll deal with it later", "tomorrow I'll start"],
    content: "Sirois & Pychyl (2013): Erteleme şimdiki benin rahatını, gelecek benin sıkıntısına yükler. Beyin gelecekteki kendini yabancı biri gibi algılar — bu yüzden ona kolayca yük aktarırız.",
    contentEn: "Sirois & Pychyl (2013): Procrastination transfers current comfort to the future self's burden. The brain perceives the future self as a stranger — which is why we easily offload to it.",
    socraaticPrompt: "Bir hafta sonraki sen bu kararı nasıl değerlendirecek — şu an ona adil davranıyor musun?",
    socraaticPromptEn: "How will the version of you one week from now judge this decision — are you being fair to them?",
    intervention: "Gelecek benine bir mesaj yaz: Ona ne bırakıyorsun, ne yapmasını istiyorsun?",
    interventionEn: "Write a message to your future self: What are you leaving for them? What do you want them to do?",
    source: "Sirois & Pychyl (2013)",
  },
  {
    id: "mood_04",
    theory: "Pychyl",
    topic: "Başlama Gücü",
    topicEn: "The Power of Getting Started",
    keywords: ["başlayamıyorum", "nasıl başlayacağım", "ilk adım", "nereden", "girişemiyorum"],
    keywordsEn: ["can't start", "how do I begin", "first step", "getting started"],
    content: "Pychyl: Beklemek istemek yerine sadece başlamak. 'Yapma isteği' genellikle başladıktan sonra gelir, önce değil. Zeigarnik etkisi: başladığımız işi tamamlamak için zihinsel baskı artar.",
    contentEn: "Pychyl: Just start instead of waiting to feel like it. The 'motivation' usually comes after starting, not before. Zeigarnik effect: unfinished tasks create mental pressure to complete.",
    socraaticPrompt: "Gerçekten sadece 2 dakika — sadece başlamak için — ne yapardın?",
    socraaticPromptEn: "Just 2 minutes — only to get started — what would you do?",
    intervention: "Şimdi sadece aç: belgeyi, defteri, uygulamayı. Yazmak zorunda değilsin — sadece aç.",
    interventionEn: "Just open it: the document, the notebook, the app. You don't have to write — just open it.",
    source: "Pychyl (2013); Zeigarnik (1927)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 3: Uygulama Niyetleri (Gollwitzer & Sheeran)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "impl_01",
    theory: "Implementation Intentions",
    topic: "Eğer-Öyleyse Planlaması",
    topicEn: "If-Then Planning",
    keywords: ["ne zaman", "nasıl yapacağım", "plan lazım", "adım adım", "organize"],
    keywordsEn: ["when will I", "how to do it", "need a plan", "step by step"],
    content: "Gollwitzer & Sheeran meta-analizi (94 bağımsız test, d=0.65): 'Eğer X durumu gerçekleşirse, Y davranışını yapacağım' formatı hedef başarısını orta-büyük düzeyde artırır. Niyet yetmez — 'ne zaman' ve 'nerede' de belirlenmelidir.",
    contentEn: "Gollwitzer & Sheeran meta-analysis (94 independent tests, d=0.65): 'If situation X occurs, I will perform Y' format has medium-to-large effects on goal achievement. Intention alone isn't enough — when and where must also be specified.",
    socraaticPrompt: "Bu görevi tam olarak nerede ve ne zaman yapacaksın — somut bir an var mı kafanda?",
    socraaticPromptEn: "Where and when exactly will you do this — is there a specific moment in mind?",
    intervention: "Şimdi bir Eğer-Öyleyse planı yaz: 'Eğer [zaman/durum] olursa, [görev]i yapacağım.'",
    interventionEn: "Write an If-Then plan now: 'If [time/situation] arrives, I will do [task].'",
    source: "Gollwitzer & Sheeran (2006)",
  },
  {
    id: "impl_02",
    theory: "Implementation Intentions",
    topic: "Niyet-Eylem Açığı",
    topicEn: "Intention-Action Gap",
    keywords: ["niyetim vardı", "istiyordum ama", "planladım ama", "yapamadım yine", "döngüsü"],
    keywordsEn: ["I intended to", "meant to do it", "planned but failed", "same cycle"],
    content: "Sheeran (2002): Güçlü niyet bildiren insanların %47'si hiç harekete geçemedi. 'İyi niyetlerin yolu cehenneme çıkar.' Niyeti eyleme dönüştürmek için özel bir psikolojik araç gerekir — uygulama niyeti.",
    contentEn: "Sheeran (2002): 47% of people with strong intentions never acted on them. Good intentions alone aren't enough — a specific psychological tool is needed to bridge the gap.",
    socraaticPrompt: "Daha önce de aynı niyeti taşıdın ama olmadı — bu sefer ne farklı olacak?",
    socraaticPromptEn: "You've had this intention before and it didn't happen — what will be different this time?",
    intervention: "Niyet yetmez. Belirli bir an, yer ve tetikleyici seç. Bunu bir alarmla sabitle.",
    interventionEn: "Intention isn't enough. Choose a specific time, place, and trigger. Lock it with an alarm.",
    source: "Gollwitzer & Sheeran (2006); Sheeran (2002)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 4: PSI Teorisi (Kuhl / Kazén & Quirin)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "psi_01",
    theory: "PSI",
    topic: "Durum Yönelimi",
    topicEn: "State Orientation",
    keywords: ["yapamam", "başaramam", "kafam karışık", "ne yapacağımı bilmiyorum", "tıkandım", "dondum"],
    keywordsEn: ["I can't", "confused", "don't know what to do", "stuck", "frozen"],
    content: "PSI Teorisi (Julius Kuhl): Durum yönelimi — kişi geçmiş başarısızlıklara veya gelecek kaygılara odaklanarak harekete geçemez. 'Şimdi ne yapabilirim?' sorusu yerine 'Neden böyleyim?' sorusuna sıkışır.",
    contentEn: "PSI Theory (Julius Kuhl): State orientation — the person gets stuck ruminating on past failures or future worries. Asks 'Why am I like this?' instead of 'What can I do right now?'",
    socraaticPrompt: "Şu an seni en çok durduran tek şey ne — bir düşünce mü, bir duygu mu, bir engel mi?",
    socraaticPromptEn: "What single thing is stopping you most right now — a thought, a feeling, or an obstacle?",
    intervention: "Geçmişe veya geleceğe değil, şu an yapabileceğin en küçük somut eyleme odaklan.",
    interventionEn: "Focus not on past or future — but on the smallest concrete action possible right now.",
    source: "Kuhl (1984); Kazén & Quirin (2018)",
  },
  {
    id: "psi_02",
    theory: "PSI",
    topic: "Öz-Regülasyon Tükenmesi",
    topicEn: "Self-Regulation Depletion",
    keywords: ["yoruldum", "artık yeter", "pes ettim", "bırakmak istiyorum", "güç yok", "dayanamıyorum"],
    keywordsEn: ["exhausted", "giving up", "no energy", "can't do this anymore"],
    content: "PSI: Öz-regülasyon kapasitesi tükenmişlik dönemlerinde düşer. Parasempatik aktivasyon (nefes, kısa dinlenme, olumlu duygu) bu kapasiteyi yeniler. Güç yoksa iradeye değil, sisteme güven.",
    contentEn: "PSI: Self-regulation capacity drops during depletion. Parasympathetic activation (breathing, short rest, positive emotion) replenishes it. When willpower is low, trust the system, not willpower.",
    socraaticPrompt: "Şu an bedeninde ne hissediyorsun — 3 derin nefes alıp bana anlat.",
    socraaticPromptEn: "What does your body feel right now — take 3 deep breaths and tell me.",
    intervention: "2 dakika kasıtlı nefes egzersizi yap (4 içeri, 4 tut, 4 dışarı), sonra tek küçük adım.",
    interventionEn: "2 minutes of deliberate breathing (4 in, 4 hold, 4 out), then one small step.",
    source: "Kuhl (1984); Kazén & Quirin (2018)",
  },
  {
    id: "psi_03",
    theory: "PSI",
    topic: "Eylem Yönelimi",
    topicEn: "Action Orientation",
    keywords: ["nasıl başlarım", "adım atmalıyım", "devam etmek istiyorum", "harekete geçmek"],
    keywordsEn: ["how do I start", "need to act", "want to move forward", "take action"],
    content: "PSI: Eylem yönelimi — şimdiki ana odaklanmak, niyeti hızla eyleme dönüştürmek. Kişi 'İyi hissettiğimde yaparım' yerine 'Şimdi yaparım, his gelecek' moduna geçer.",
    contentEn: "PSI: Action orientation — focusing on the present moment, quickly turning intention into action. Shifts from 'I'll do it when I feel like it' to 'I'll do it now; the feeling will come.'",
    socraaticPrompt: "Şu an tam olarak neyi yapabilirsin — 'iyi hissetsem' şartı olmadan?",
    socraaticPromptEn: "What can you do right now — without the condition of 'feeling ready'?",
    intervention: "Duyguyu beklemeden başla. Momentum duyguyu peşinden sürükler, tersi değil.",
    interventionEn: "Start without waiting for the feeling. Momentum pulls feelings forward, not the reverse.",
    source: "Kuhl (1984); Kazén & Quirin (2018)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 5: ACT — Kabul ve Kararlılık Terapisi (Hayes & Smith)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "act_01",
    theory: "ACT",
    topic: "Deneyimsel Kaçınma",
    topicEn: "Experiential Avoidance",
    keywords: ["istemiyorum", "rahatsız ediyor", "zor geliyor", "kaçmak istiyorum", "sıkıntı", "kaçış"],
    keywordsEn: ["don't want to", "uncomfortable", "hard to face", "want to escape", "distressing"],
    content: "Steven Hayes — ACT: Psikolojik kıyı dinamiği. İstenmeyen duygu veya düşünceden kaçınmak için eylemi ertelemek, kısa vadede işe yarar ama kısa sürede geri döner. Bataklığa düşmek gibi — mücadele etmek batmayı hızlandırır.",
    contentEn: "Steven Hayes — ACT: The psychological quicksand dynamic. Avoiding unwanted feelings by delaying action works briefly but bounces back. Like quicksand — struggling makes you sink faster.",
    socraaticPrompt: "Bu görevi düşündüğünde içinde ne hissediyorsun — onu kaçırmaya mı yoksa kucaklamaya mı daha yakınsın?",
    socraaticPromptEn: "When you think about this task, what do you feel inside — are you closer to fleeing or embracing it?",
    intervention: "Rahatsızlığı kabul et ama ona itaat etme. Duygu geçer, yapılmamış iş kalır.",
    interventionEn: "Accept the discomfort but don't obey it. Feelings pass; undone work remains.",
    source: "Hayes & Smith (2005)",
  },
  {
    id: "act_02",
    theory: "ACT",
    topic: "Psikolojik Esneklik",
    topicEn: "Psychological Flexibility",
    keywords: ["değerlerim", "önemli", "anlamlı", "hayatım", "kim olmak istiyorum", "neden önemli"],
    keywordsEn: ["my values", "what matters", "meaningful life", "who do I want to be"],
    content: "ACT: Psikolojik esneklik — anlık duygudan bağımsız olarak değerlere uygun davranabilmek. Mutlu hissetmek zorunda değilsin; değerlerine uygun hareket etmen yeterli. Duygu yolcudur, sen şoförsün.",
    contentEn: "ACT: Psychological flexibility — acting in line with values regardless of momentary feelings. You don't need to feel happy; you only need to act according to what matters. Emotion is a passenger; you're the driver.",
    socraaticPrompt: "Bu görevi tamamlamak seni daha çok olmak istediğin kişiye yaklaştırıyor mu — hangisi?",
    socraaticPromptEn: "Does completing this task move you closer to the person you want to be — who is that person?",
    intervention: "Değer tabanlı motivasyon bul: Bu görev hangi önemli değerini yansıtıyor?",
    interventionEn: "Find a values-based motivation: Which important value does this task reflect?",
    source: "Hayes & Smith (2005)",
  },
  {
    id: "act_03",
    theory: "ACT",
    topic: "Bilişsel Ayrışma",
    topicEn: "Cognitive Defusion",
    keywords: ["aklımdan çıkmıyor", "düşünce var", "kafama yapıştı", "inanıyorum buna", "bu doğru mu"],
    keywordsEn: ["stuck in my head", "can't stop thinking", "I believe this thought", "is this true"],
    content: "ACT — Bilişsel Ayrışma: 'Ben bu görevi yapamam' düşüncesi bir gerçek değil, zihnin ürettiği bir hikayedir. Düşünceye bakabilirsin — ondan bakmaklık yerine. 'Zihin yine söylüyor ki...' diyebilirsin.",
    contentEn: "ACT — Cognitive Defusion: 'I can't do this task' is not a fact — it's a story your mind produces. You can look at a thought rather than looking from it. 'My mind is telling me again that...'",
    socraaticPrompt: "Bu düşünce sana gerçekmiş gibi geliyor — ama bu düşünceyi düşünen sen kimsin?",
    socraaticPromptEn: "This thought feels real — but who is the 'you' that is observing this thought?",
    intervention: "'Ben X yapamam' yerine 'Zihnimde X yapamam düşüncesi var' de. Fark ne kadar büyük?",
    interventionEn: "Replace 'I can't do X' with 'I notice my mind is saying I can't do X.' How different does that feel?",
    source: "Hayes & Smith (2005)",
  },
  {
    id: "act_04",
    theory: "ACT",
    topic: "Değerlere Dönüş",
    topicEn: "Values Clarification",
    keywords: ["ne istiyorum", "amaç", "anlam", "neden uğraşıyorum", "hayatımda önemli olan"],
    keywordsEn: ["what do I want", "purpose", "meaning", "why bother", "what matters in life"],
    content: "ACT — Değer Netleştirme: Hedefler varış noktalarıdır ama değerler pusuladır. Ertelenmiş görevler genellikle temel bir değerle bağlantılıdır — güvenlik, büyüme, ilişki, katkı. Bu bağlantı görünür olduğunda motivasyon değişir.",
    contentEn: "ACT — Values Clarification: Goals are destinations, but values are the compass. Postponed tasks are often connected to a core value — security, growth, connection, contribution. When this connection becomes visible, motivation shifts.",
    socraaticPrompt: "Bu görevi tamamen bıraksaydın — kim veya ne zarar görürdü, neyin yitirilmesi seni üzüyor?",
    socraaticPromptEn: "If you fully abandoned this task — who or what would suffer? What loss would grieve you?",
    intervention: "Bu görevi bir değere bağla: 'Bunu yapıyorum çünkü [değer] benim için önemli.'",
    interventionEn: "Connect this task to a value: 'I'm doing this because [value] matters to me.'",
    source: "Hayes & Smith (2005)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 6: Kahneman — Hızlı ve Yavaş Düşünce
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "kahneman_01",
    theory: "Kahneman",
    topic: "Sistem 1 Tepkisi",
    topicEn: "System 1 Response",
    keywords: ["otomatik", "içgüdüsel", "sinirli", "duygusal", "panik", "korku", "anında"],
    keywordsEn: ["automatic", "instinctive", "emotional", "panic", "fear", "instant reaction"],
    content: "Kahneman Sistem 1: Hızlı, duygusal, otomatik düşünce. Amigdala aktif olduğunda prefrontal korteks — planlama merkezi — yavaşlar. Bu yüzden kaygılı olduğunda görev daha büyük görünür.",
    contentEn: "Kahneman System 1: Fast, emotional, automatic thinking. When the amygdala fires, the prefrontal cortex — the planning center — slows down. This is why tasks feel larger when you're anxious.",
    socraaticPrompt: "Şu an duygusal mı düşünüyorsun yoksa sakin mi — ikisi arasında ne kadar fark var?",
    socraaticPromptEn: "Are you thinking emotionally right now or calmly — how big is the gap between those two?",
    intervention: "4-4-4 nefes tekniği: 4 saniye içeri, 4 saniye tut, 4 saniye dışarı. Sonra tekrar değerlendir.",
    interventionEn: "4-4-4 breathing: 4 seconds in, 4 hold, 4 out. Then reassess the task.",
    source: "Kahneman (2011)",
  },
  {
    id: "kahneman_02",
    theory: "Kahneman",
    topic: "Sistem 2 Aktivasyonu",
    topicEn: "System 2 Activation",
    keywords: ["düşüneyim", "analiz", "mantıklı", "anlamak istiyorum", "neden", "çözelim"],
    keywordsEn: ["let me think", "analyze", "rational", "want to understand", "why"],
    content: "Kahneman Sistem 2: Yavaş, analitik, kasıtlı düşünce. Ertelemeyi çözmek için Sistem 2'yi aktive etmek gerekir — ancak bu kapasitesi sınırlıdır. Sabah saatleri Sistem 2 için en verimli zamandır.",
    contentEn: "Kahneman System 2: Slow, analytical, deliberate thinking. Solving procrastination requires activating System 2 — but its capacity is limited. Morning hours are most productive for System 2.",
    socraaticPrompt: "Bu görevi mantıklı bir şekilde değerlendirirsen — gerçekten ne kadar zor?",
    socraaticPromptEn: "If you evaluate this task rationally — how hard is it, really?",
    intervention: "Görevi yazılı olarak küçük adımlara böl. Her adımın maksimum 15 dakika süreceğini varsay.",
    interventionEn: "Write the task as small steps. Assume each step takes at most 15 minutes.",
    source: "Kahneman (2011)",
  },
  {
    id: "kahneman_03",
    theory: "Kahneman",
    topic: "Planlama Yanılgısı",
    topicEn: "Planning Fallacy",
    keywords: ["sanmıştım", "hesaplamadım", "beklemiyordum", "çok sürdü", "öngöremedim"],
    keywordsEn: ["thought it would be faster", "underestimated", "didn't expect", "took too long"],
    content: "Kahneman — Planlama Yanılgısı: İnsanlar görevleri her zaman gerçekte sürdüğünden daha kısa, kolaylıkta gerçekte olduğundan daha kolay tahmin eder. Bu, hedefi küçümseyip hayal kırıklığına neden olur.",
    contentEn: "Kahneman — Planning Fallacy: People consistently underestimate how long tasks take and overestimate how easy they'll be. This causes goal neglect and disappointment.",
    socraaticPrompt: "Bu görevi son yaptığında ne kadar sürmüştü — bu sefer ne kadar tahmin ediyorsun?",
    socraaticPromptEn: "Last time you did something similar, how long did it take — what's your estimate this time?",
    intervention: "Tahminini 1.5 ile çarp. Gerçekçi bir süre bekle ve kendini buna göre hazırla.",
    interventionEn: "Multiply your time estimate by 1.5. Expect a realistic duration and prepare accordingly.",
    source: "Kahneman (2011)",
  },
  {
    id: "kahneman_04",
    theory: "Kahneman",
    topic: "Kayıptan Kaçınma",
    topicEn: "Loss Aversion",
    keywords: ["kaybederim", "risk", "tehlikeli", "güvende", "batırırım", "mahvederim"],
    keywordsEn: ["I'll lose", "risky", "dangerous", "safe", "ruin it", "mess it up"],
    content: "Kahneman — Kayıp Kaçınması: Kayıp korkusu, kazanç beklentisinden yaklaşık iki kat daha güçlüdür. Başarısızlık korkusu ertelemenin sık gizli nedenlerinden biridir — 'başlamazsam kaybetmem.'",
    contentEn: "Kahneman — Loss Aversion: Fear of loss is roughly twice as powerful as hope of gain. Fear of failure is a hidden driver of procrastination — 'if I don't start, I can't fail.'",
    socraaticPrompt: "Başlarsan ne kaybedebilirsin — başlamazsan ne kesin kaybediyorsun?",
    socraaticPromptEn: "What might you lose if you start — what do you definitely lose if you don't?",
    intervention: "Başlamak riske girmek değil, riski azaltmaktır. Küçük adımlar riski küçük tutarak ilerler.",
    interventionEn: "Starting is not taking a risk — it's reducing risk. Small steps keep the risk small.",
    source: "Kahneman (2011)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 7: Atomik Alışkanlıklar (Clear)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "habits_01",
    theory: "Atomic Habits",
    topic: "Tetikleyici Kurma",
    topicEn: "Habit Cue Design",
    keywords: ["alışkanlık", "düzenli", "her gün", "rutin", "sistem", "tekrar"],
    keywordsEn: ["habit", "routine", "every day", "system", "repetition"],
    content: "James Clear — Alışkanlık Döngüsü: İşaret → Arzu → Yanıt → Ödül. Her alışkanlık en basit haliyle bu döngüye indirgenir. Tetikleyici (işaret) olmazsa davranış olmaz; var olursa otomatikleşir.",
    contentEn: "James Clear — Habit Loop: Cue → Craving → Response → Reward. Every habit reduces to this loop. Without a cue, there's no behavior; with a cue, it becomes automatic.",
    socraaticPrompt: "Bu görevi hangi ortamda, hangi saatte yapmak sana en kolay gelir?",
    socraaticPromptEn: "In which environment and at what time does this task feel easiest to do?",
    intervention: "Görev için bir 'tetikleyici ritüel' belirle: Kahveni alır almaz masana geç.",
    interventionEn: "Set a trigger ritual for the task: As soon as you get your coffee, go to your desk.",
    source: "Clear (2018)",
  },
  {
    id: "habits_02",
    theory: "Atomic Habits",
    topic: "Kimlik Bazlı Motivasyon",
    topicEn: "Identity-Based Motivation",
    keywords: ["ben", "olmak istiyorum", "hedefim", "başarılı", "kişi", "böyle biri"],
    keywordsEn: ["I want to be", "my goal", "successful person", "that kind of person"],
    content: "Clear: Sürdürülebilir değişim kimlik düzeyinde gerçekleşir. 'Bu görevi yapmak istiyorum' (sonuç odaklı) yerine 'Ben bu tür biri oldum' (kimlik odaklı). Her küçük eylem, kim olduğuna dair oy kullanmaktır.",
    contentEn: "Clear: Sustainable change happens at the identity level. Instead of 'I want to do this task' (outcome focus) — 'I'm the kind of person who does this' (identity focus). Every small action is a vote for who you are.",
    socraaticPrompt: "Bu görevi yapan kişi nasıl biri — ve sen o kişi misin, yoksa olmaya mı çalışıyorsun?",
    socraaticPromptEn: "What kind of person does this task — are you that person, or are you becoming them?",
    intervention: "Kimlik bildirimi oluştur: 'Ben [X] olan birisiyim ve bu benim için önemli.'",
    interventionEn: "Create an identity statement: 'I am the kind of person who [X] — and this matters to me.'",
    source: "Clear (2018)",
  },
  {
    id: "habits_03",
    theory: "Atomic Habits",
    topic: "İki Dakika Kuralı",
    topicEn: "Two-Minute Rule",
    keywords: ["başlayamıyorum", "zor geliyor", "büyük iş", "küçültemiyorum", "nereden"],
    keywordsEn: ["can't start", "feels hard", "big task", "where to begin"],
    content: "Clear — İki Dakika Kuralı: Her alışkanlık en basit haliyle 2 dakikaya indirgenebilir. 'Kitap oku' → 'Bir sayfa aç.' 'Çalış' → 'Defteri aç ve bir cümle yaz.' Ritüeli korumak içeriği korumaktan önce gelir.",
    contentEn: "Clear — Two-Minute Rule: Every habit can be reduced to 2 minutes in its simplest form. 'Study' → 'Open the notebook and write one sentence.' 'Exercise' → 'Put on your shoes.' Maintaining the ritual matters more than the content.",
    socraaticPrompt: "Bu görevi sadece 2 dakikaya indirirsen — ne yapardın?",
    socraaticPromptEn: "If you reduced this task to just 2 minutes — what would you do?",
    intervention: "2 dakikalık versiyonu şimdi yap. Devam etmek için kendini zorlamak zorunda değilsin.",
    interventionEn: "Do the 2-minute version right now. You don't have to force yourself to continue.",
    source: "Clear (2018)",
  },
  {
    id: "habits_04",
    theory: "Atomic Habits",
    topic: "Çevre Tasarımı",
    topicEn: "Environment Design",
    keywords: ["ortam", "çalışma ortamı", "dikkat dağıtıyor", "telefon", "masa", "ev"],
    keywordsEn: ["environment", "workspace", "distractions", "phone", "desk", "home"],
    content: "Clear: Motivasyon değil, çevre değişikliği kalıcı davranış değişimini sağlar. Görevi başlatmak için gereken adım sayısını azalt; dikkat dağıtıcıları artır. 'En az çaba yasası' senin için çalışsın.",
    contentEn: "Clear: Not motivation but environment design creates lasting behavior change. Reduce friction for desired tasks; increase friction for distractions. Make the law of least effort work for you.",
    socraaticPrompt: "Şu an çalışma ortamın görevi yapmayı kolaylaştırıyor mu, yoksa zorlaştırıyor mu?",
    socraaticPromptEn: "Does your current environment make the task easier or harder right now?",
    intervention: "Bir çevre değişikliği yap: Telefonu başka odaya koy veya sadece o sekme açık olsun.",
    interventionEn: "Make one environment change: Put the phone in another room, or have only that tab open.",
    source: "Clear (2018)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 8: Doğal Konuşma, Empati ve Sokratik Diyalog
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "conv_01",
    theory: "Motivational Interviewing",
    topic: "Değişim Konuşması",
    topicEn: "Change Talk",
    keywords: ["belki", "düşünüyorum", "istesem", "yapabilirdim", "değişmek istiyorum"],
    keywordsEn: ["maybe", "I'm thinking about it", "if I wanted to", "I could do it", "want to change"],
    content: "Miller & Rollnick — Motivasyonel Görüşme: 'Değişim konuşması' (change talk) — kişinin kendi ağzından değişim nedenleri söylemesi, dışarıdan anlatılan tavsiyelerin birkaç katı etkilidir. Direnç gösterildiğinde tartışmak yerine yönü değiştir.",
    contentEn: "Miller & Rollnick — Motivational Interviewing: 'Change talk' — the person stating their own reasons for change — is several times more effective than being told what to do. When resistance emerges, shift direction rather than argue.",
    socraaticPrompt: "Kendi ağzından söyle — bu değişikliği yapmak için 3 neden var mı?",
    socraaticPromptEn: "Say it yourself — can you name 3 reasons why this change matters to you?",
    intervention: "Kişinin kendi değişim nedenlerini keşfetmesine alan aç. Yargılama; merak et.",
    interventionEn: "Create space for the person to discover their own reasons. Don't judge; be curious.",
    source: "Miller & Rollnick (2013)",
  },
  {
    id: "conv_02",
    theory: "Socratic Method",
    topic: "Açık Uçlu Soru",
    topicEn: "Open-Ended Questioning",
    keywords: ["anlat bana", "nasıl", "neden", "ne hissediyorsun", "ne düşünüyorsun"],
    keywordsEn: ["tell me", "how", "why", "what do you feel", "what do you think"],
    content: "Sokratik yöntem: Cevabı bilmiyormuş gibi sormak. Açık uçlu sorular (Evet/Hayır olmayan) kişinin kendi iç dünyasını keşfetmesini sağlar. Kapalı soru: 'Görevden mi korkuyorsun?' — Açık soru: 'Bu görev sende ne uyandırıyor?'",
    contentEn: "Socratic method: Asking as if you don't know the answer. Open-ended questions (not Yes/No) let the person explore their own inner world. Closed: 'Are you afraid of the task?' — Open: 'What does this task stir in you?'",
    socraaticPrompt: "Bunu sana sorsam: Bu durumla ilgili sana en doğru hissettiren şey ne?",
    socraaticPromptEn: "Let me ask you this: What feels most true to you about this situation?",
    intervention: "Her yanıtta en az bir açık uçlu soru sor. Analizden önce anlamaya çalış.",
    interventionEn: "In every response, ask at least one open-ended question. Understand before analyzing.",
    source: "Plato (Socratic dialogues); Miller & Rollnick (2013)",
  },
  {
    id: "conv_03",
    theory: "Active Listening",
    topic: "Yansıtma ve Özetleme",
    topicEn: "Reflection and Summarizing",
    keywords: ["anlıyorum", "zor", "hissediyorum ki", "doğru anladım mı", "yani"],
    keywordsEn: ["I understand", "that sounds hard", "I sense that", "did I get that right", "so"],
    content: "Carl Rogers — Kişi Merkezli Yaklaşım: Koşulsuz olumlu kabul, empati, özgünlük. Kişi yargılanmadan dinlendiğini hissettiğinde kendini daha dürüst ifade eder. 'Duyduğuma göre... doğru mu anlıyorum?' tekniği güveni hızla inşa eder.",
    contentEn: "Carl Rogers — Person-Centered Approach: Unconditional positive regard, empathy, genuineness. When a person feels heard without judgment, they express themselves more honestly. 'It sounds like... is that right?' quickly builds trust.",
    socraaticPrompt: "Duyduğuma göre [X] hissediyorsun — bu doğru mu anlıyorum?",
    socraaticPromptEn: "It sounds like you're feeling [X] — am I understanding that right?",
    intervention: "Özetleme: Söylenilenleri kısa ve yargısız yansıt. Bu, kişinin kendini duyulmuş hissettirmenin en hızlı yoludur.",
    interventionEn: "Summarize: Reflect back what was said briefly and without judgment. This is the fastest way to make someone feel heard.",
    source: "Rogers (1951); Miller & Rollnick (2013)",
  },
  {
    id: "conv_04",
    theory: "Active Listening",
    topic: "Normalizasyon ve Empati",
    topicEn: "Normalization and Empathy",
    keywords: ["yalnız hissediyorum", "sadece ben mi", "herkes böyle mi", "garip hissediyorum", "anlayamazsın"],
    keywordsEn: ["feel alone", "am I the only one", "does everyone feel this way", "you can't understand"],
    content: "Normalizasyon: Mücadelenin yaygın olduğunu bildirmek yükü hafifletir. Erteleme neredeyse evrenseldir — üniversite öğrencilerinin %80-95'i erteleme yaşar (Steel, 2007). Yalnız değilsin; beynin böyle çalışıyor.",
    contentEn: "Normalization: Acknowledging that struggle is common reduces the burden. Procrastination is nearly universal — 80-95% of college students experience it (Steel, 2007). You're not alone; your brain is wired this way.",
    socraaticPrompt: "Bunu sana söylesem — bu his çok yaygın, pek çok insan bunu yaşıyor — içinde ne değişiyor?",
    socraaticPromptEn: "If I told you — this feeling is very common, many people experience it — what shifts inside you?",
    intervention: "Suçluluğu azalt: Bu bir karakter sorunu değil, evrimsel bir miras. Empatiyle başla, çözümle bitir.",
    interventionEn: "Reduce guilt: This isn't a character flaw — it's an evolutionary legacy. Start with empathy, end with action.",
    source: "Steel (2007); Rogers (1951)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 9: Özel Durumlar
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "special_01",
    theory: "Perfectionism",
    topic: "Mükemmeliyetçilik Bloğu",
    topicEn: "Perfectionism Block",
    keywords: ["mükemmel", "hazır değilim", "doğru değil", "yanlış olur", "hata", "eksik"],
    keywordsEn: ["perfect", "not ready", "not right", "wrong", "mistake", "incomplete"],
    content: "Mükemmeliyetçi erteleme: 'Ya doğru yaparsam ya da hiç.' Ancak başlamamak kesin bir hata, başlamak ise düzeltilebilir bir süreç. Mükemmel planın düşmanı 'yeterince iyi' başlangıçtır.",
    contentEn: "Perfectionist procrastination: 'Either I do it right or not at all.' But not starting is a definite mistake; starting is a correctable process. The enemy of a perfect plan is a 'good enough' beginning.",
    socraaticPrompt: "Mükemmel yapmak ile hiç yapmamak arasında hangisi seni daha kötü hissettiriyor?",
    socraaticPromptEn: "Between doing it perfectly and not doing it at all — which makes you feel worse?",
    intervention: "Taslak izni ver kendine: 'Berbat bir taslak yazmak mükemmel bir boş sayfadan iyidir.'",
    interventionEn: "Give yourself permission for a draft: 'A terrible draft beats a perfect blank page.'",
    source: "Pychyl (2013); Steel (2007)",
  },
  {
    id: "special_02",
    theory: "Shame",
    topic: "Utanç Döngüsü",
    topicEn: "Shame Cycle",
    keywords: ["utanıyorum", "mahcup", "rezil", "berbat biri", "kimseye söyleyemem", "gizliyorum"],
    keywordsEn: ["ashamed", "embarrassed", "terrible person", "can't tell anyone", "hiding it"],
    content: "Utanç erteleme döngüsü: Utanç → Kaçınma → Daha fazla utanç. Araştırmalar utancın (shame) suçluluktan (guilt) farklı olduğunu gösterir: Suçluluk 'kötü bir şey yaptım,' utanç 'ben kötü biriyim.' Utanç gizliliğe, suçluluk harekete iter.",
    contentEn: "Shame procrastination cycle: Shame → Avoidance → More shame. Research shows shame differs from guilt: Guilt = 'I did something bad,' Shame = 'I am bad.' Shame drives secrecy; guilt drives action.",
    socraaticPrompt: "Şu an kendine baktığında ne görüyorsun — yaptığın bir şeyi mi, yoksa sen misin?",
    socraaticPromptEn: "When you look at yourself right now — do you see something you did, or do you see yourself?",
    intervention: "Utancı adlandır ve ayır: 'Bu eylemimden utanıyorum' → 'Ama bu ben değilim.' Öz-şefkat ekle.",
    interventionEn: "Name and separate shame: 'I'm ashamed of this action' → 'But this is not who I am.' Add self-compassion.",
    source: "Neff (2011); Brown, B. (2010). The Gifts of Imperfection.",
  },
  {
    id: "special_03",
    theory: "Boredom",
    topic: "Sıkılma ve Anlamlandırma",
    topicEn: "Boredom and Meaning-Making",
    keywords: ["can sıkıcı", "sıkılıyorum", "tekrar", "monoton", "zevksiz", "ilgimi çekmiyor"],
    keywordsEn: ["boring", "bored", "repetitive", "monotonous", "no interest", "tedious"],
    content: "Sıkılma salt bir duygu değil, anlam eksikliğinin işaretidir. Araştırmalar sıkılmayı tolerans edebilmenin yaratıcılık ve odaklanmayla ilişkili olduğunu gösteriyor. Sıkıcı görev → 'neden' bağlantısı kurulduğunda daha katlanılabilir hale gelir.",
    contentEn: "Boredom is not just a feeling — it signals a lack of meaning. Research shows tolerating boredom is linked to creativity and sustained focus. A boring task becomes more bearable when its 'why' is made explicit.",
    socraaticPrompt: "Bu görev sana sıkıcı geliyorsa — onu anlamlı kılacak tek bir şey ne olabilir?",
    socraaticPromptEn: "If this task feels boring — what is one thing that could make it feel meaningful?",
    intervention: "Anlam enjeksiyonu: 'Bu [sıkıcı görev], [değer/kişi/amaç] için önemli.' Bağlantıyı yüksek sesle kur.",
    interventionEn: "Meaning injection: 'This [boring task] matters for [value/person/purpose].' Make the connection explicit.",
    source: "Danckert & Merrifield (2018). Boredom. MIT Press.",
  },
];

// ─── Sinyal Tespiti ───────────────────────────────────────────────────────────
// Hem Türkçe hem İngilizce kelimeler desteklenmektedir.

export function analyzeResistance(
  inputText: string,
  latencyMs: number
): ResistanceSignal {
  const lower = inputText.toLowerCase();

  // Yüksek gecikme = kaçınma sinyali
  if (latencyMs > 10000) return "avoidance";

  const signals: Array<{ signal: ResistanceSignal; words: string[] }> = [
    {
      signal: "shame",
      words: ["utanıyorum", "mahcup", "rezil", "kimseye söyleyemem", "ashamed", "embarrassed", "hiding", "terrible person"],
    },
    {
      signal: "perfectionism",
      words: ["mükemmel", "hazır değilim", "doğru değil", "yanlış olur", "eksik", "perfect", "not ready", "not right", "mistake"],
    },
    {
      signal: "fear",
      words: ["korktum", "endişe", "başarısız", "rezil", "mahvedersem", "afraid", "scared", "fail", "mess up", "anxious"],
    },
    {
      signal: "overwhelm",
      words: ["çok fazla", "bunaltıcı", "tıkandım", "yapamam", "bitiremedim", "too much", "overwhelmed", "stuck", "can't", "buried"],
    },
    {
      signal: "avoidance",
      words: ["kaçmak", "istemiyorum", "erteleyeyim", "sonra", "yarın", "ilgilenmiyorum", "avoid", "later", "tomorrow", "don't want"],
    },
    {
      signal: "ambiguity",
      words: ["ne yapacağımı", "nasıl", "nereden başlayacağım", "bilmiyorum", "belirsiz", "don't know", "how to", "where to start", "unclear"],
    },
    {
      signal: "low_energy",
      words: ["yorgun", "enerji yok", "bıktım", "pes", "artık yeter", "tired", "exhausted", "no energy", "burned out", "drained"],
    },
    {
      signal: "boredom",
      words: ["sıkıcı", "sıkılıyorum", "monoton", "tekrar", "ilgimi çekmiyor", "boring", "bored", "tedious", "repetitive", "dull"],
    },
  ];

  for (const { signal, words } of signals) {
    if (words.some(w => lower.includes(w))) return signal;
  }

  return "neutral";
}

// ─── Chunk Retrieval ──────────────────────────────────────────────────────────

export function retrieveRelevantChunks(
  inputText: string,
  signal: ResistanceSignal,
  maxChunks = 3
): WikiChunk[] {
  const lower = inputText.toLowerCase();

  const signalTheoryMap: Record<ResistanceSignal, string[]> = {
    avoidance: ["ACT", "Pychyl", "Motivational Interviewing"],
    overwhelm: ["TMT", "PSI", "Atomic Habits"],
    perfectionism: ["Perfectionism", "ACT", "Kahneman"],
    fear: ["ACT", "Kahneman", "Pychyl"],
    ambiguity: ["TMT", "Implementation Intentions", "PSI"],
    low_energy: ["PSI", "Pychyl", "Active Listening"],
    shame: ["Shame", "Active Listening", "Pychyl"],
    boredom: ["Boredom", "ACT", "Atomic Habits"],
    neutral: ["TMT", "Atomic Habits", "Socratic Method"],
  };

  const scored = WIKI_CHUNKS.map(chunk => {
    let score = 0;
    const allKeywords = [...chunk.keywords, ...chunk.keywordsEn];
    allKeywords.forEach(kw => { if (lower.includes(kw.toLowerCase())) score += 3; });
    if (signalTheoryMap[signal].includes(chunk.theory)) score += 2;
    return { chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(s => s.chunk);
}

// ─── Sinyal İkonu / Renk / Etiket ────────────────────────────────────────────

export function getSignalLabel(signal: ResistanceSignal): string {
  const labels: Record<ResistanceSignal, string> = {
    avoidance: "Kaçınma",
    overwhelm: "Bunalmışlık",
    perfectionism: "Mükemmeliyetçilik",
    fear: "Korku",
    ambiguity: "Belirsizlik",
    low_energy: "Düşük Enerji",
    shame: "Utanç",
    boredom: "Sıkılma",
    neutral: "Nötr",
  };
  return labels[signal] ?? "Nötr";
}

export function getSignalColor(signal: ResistanceSignal): string {
  const colors: Record<ResistanceSignal, string> = {
    avoidance: "#e07b54",
    overwhelm: "#c06060",
    perfectionism: "#8b7ec8",
    fear: "#c06060",
    ambiguity: "#c4a35a",
    low_energy: "#8aaa8a",
    shame: "#a0607a",
    boredom: "#7a9ab5",
    neutral: "#5a7a5a",
  };
  return colors[signal] ?? "#5a7a5a";
}

// ─── Konuşma Fazı ──────────────────────────────────────────────────────────────

export function determinePhase(messageCount: number, hasActionPlan: boolean): ConversationPhase {
  if (hasActionPlan) return "followup";
  if (messageCount <= 2) return "discovery";
  if (messageCount <= 4) return "diagnosis";
  return "planning";
}

// ─── Sistem Prompt ──────────────────────────────────────────────────────────────

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
    low_energy: "enerji ve motivasyon düşüklüğü",
    shame: "utanç ve öz-yargı",
    boredom: "sıkılma ve anlam kaybı",
    neutral: "genel durum",
  };

  const chunkContext = chunks
    .map(c =>
      `[${c.theory} — ${c.topic}]\n${c.content}\nSoru: "${c.socraaticPrompt}"\nMüdahale: ${c.intervention}`
    )
    .join("\n\n---\n\n");

  const phaseInstructions: Record<ConversationPhase, string> = {
    discovery: `## Bu Aşama: Keşif — Dinle, Tanı, Yargılama
Henüz teşhis yapma, çözüm önerme, tavsiye verme.
- Kullanıcının söylediklerini yansıt: "Duyduğuma göre... — doğru mu anladım?"
- Sadece tek, açık uçlu bir soru sor. "Evet/Hayır" sorusu sorma.
- Empati kur: "Bu zor geliyorsa mantıklı. Anlat bana."
- Duyguyu tanı ve isimlendir: "Sende bir [yorgunluk/korku/belirsizlik] mi görüyorum?"
- Hedef: Kullanıcının tam olarak ne yaşadığını anlamak.`,

    diagnosis: `## Bu Aşama: Teşhis — Derin Sokratik Soru
Yeterince bilgi topladın. Şimdi tek, keskin bir Sokratik soru sor.
- Tespit ettiğin sinyali (${signalDescriptions[signal]}) nazikçe yansıt.
- Wiki çerçevelerinden birini doğal olarak kullan — ama isim verme.
- "Şöyle mi oluyor: [durum]?" gibi hipotez sun ve kullanıcının doğrulamasına izin ver.
- Kullanıcının kendi cevabını bulmasına alan aç. Cevabı sen verme.
- Empatiyi asla kaybetme: "Bu mantıklı, çünkü beyin böyle çalışıyor."`,

    planning: `## Bu Aşama: Plan — Somut ve Uygulanabilir
Sorunun kaynağını anlıyorsun. Şimdi birlikte somut bir plan oluştur.
- Maksimum 3 adım. Her adım 15 dakika veya daha az.
- Wiki müdahalelerine dayan — ama teori adı verme.
- Planı kullanıcıyla birlikte şekillendir: "Bunu nasıl buluyorsun?" diye sor.
- Başarıyı küçük tut: "Bugün için tek hedef şu olsun."
- Sıcak, motive edici, gerçekçi dil kullan. Vaaz değil, beraber düşünce.`,

    followup: `## Bu Aşama: Takip — Destek ve Uyum
Plan verildi. Şimdi kullanıcının durumunu öğren ve üzerine inşa et.
- "İlk adımı deneyebildin mi?" gibi somut takip soruları sor.
- Zorlandıklarını normalize et: "Bu normal, her zaman kolay olmuyor."
- Küçük ilerlemeleri gerçekten kutla — abartma, ama gör.
- Gerekirse planı güncelle: "O adım zor geldiyse, daha küçültelim mi?"`,
  };

  return `Sen Pax Mentis'sin — erteleme, duygu düzenleme ve motivasyon konularında derin bilgili; şefkatli ama kararlı bir Sokratik mentör.

${phaseInstructions[phase]}

${conversationSummary ? `## Konuşma Özeti\n${conversationSummary}\n` : ""}## Şu An Tespit Edilen Sinyal
${signalDescriptions[signal]}

## Kullanılabilecek Psikolojik Çerçeveler
${chunkContext}

## Kesin Kurallar
1. ASLA yargılama. Kullanıcı tembel değil; duygu düzenleme güçlüğü yaşıyor.
2. Teorileri ismiyle anma — onları konuşmaya doğal biçimde sindirmiş gibi yansıt.
3. Mobil ekran: Maksimum 3-4 cümle. Kısa, derin, sıcak.
4. Her yanıtta yalnızca BİR soru sor — daha fazla değil.
5. Bir doktor gibi değil, yıllar önce aynı şeyi yaşamış ama üstesinden gelmiş bir dost gibi konuş.
6. Türkçe konuş, samimi ol. Resmi dil kullanma.
7. "Anlıyorum, bu zor" gibi klişeleri değil, gerçek empatiyi tercih et.`;
}
