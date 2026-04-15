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

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 10: Öz-Belirlenim Teorisi (Ryan & Deci)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "sdt_01",
    theory: "SDT",
    topic: "Otonom vs Kontrollü Motivasyon",
    topicEn: "Autonomous vs Controlled Motivation",
    keywords: ["zorunda", "yapmalıyım", "mecburum", "baskı", "isteyerek değil", "zorlanıyorum"],
    keywordsEn: ["have to", "must", "forced", "pressure", "don't want to but", "obligation"],
    content: "Ryan & Deci — SDT: Motivasyonun kalitesi miktarından önemlidir. 'Yapmak zorundayım' (kontrollü) enerjisi tüketir ve ertelemeye yol açar. 'Yapmak istiyorum çünkü değer taşıyor' (otonom) enerjisi besler. Aynı görev, farklı 'neden' ile tamamen farklı hissettirir.",
    contentEn: "Ryan & Deci — SDT: Quality of motivation matters more than quantity. 'I have to' (controlled) drains energy and leads to procrastination. 'I want to because it matters' (autonomous) energizes. Same task, different 'why' — completely different feel.",
    socraaticPrompt: "Bu görevi 'yapmak zorunda olduğun için' mi yoksa 'önemli olduğu için' mi yapıyorsun?",
    socraaticPromptEn: "Are you doing this task because you 'have to' — or because it genuinely matters to you?",
    intervention: "Görevi kendi seçimine çevir: 'Bunu seçiyorum çünkü [kişisel anlam].' Kontrol duygusu enerjini değiştirir.",
    interventionEn: "Reframe as a choice: 'I choose to do this because [personal meaning].' A sense of agency changes your energy.",
    source: "Ryan & Deci (2000). Self-Determination Theory. Psychological Review.",
  },
  {
    id: "sdt_02",
    theory: "SDT",
    topic: "Temel Psikolojik İhtiyaçlar",
    topicEn: "Basic Psychological Needs",
    keywords: ["kendimi yetersiz hissediyorum", "ait değilim", "kontrol kaybı", "özgürlük yok", "değersiz"],
    keywordsEn: ["feel inadequate", "don't belong", "losing control", "no freedom", "worthless"],
    content: "SDT: Üç temel psikolojik ihtiyaç — Özerklik (kendi kararlarımı alabilmek), Yeterlik (başarabileceğime inanmak), Bağlılık (önemli biriyle bağ kurmak). Bu üçü kırıldığında motivasyon çöker.",
    contentEn: "SDT: Three basic psychological needs — Autonomy (making my own decisions), Competence (believing I can succeed), Relatedness (connecting with someone important). When these three are broken, motivation collapses.",
    socraaticPrompt: "Bu üçünden hangisi şu an eksik hissettiriyor — özgürlük mü, yeterlik mi, bağlantı mı?",
    socraaticPromptEn: "Which of these three feels most lacking right now — autonomy, competence, or connection?",
    intervention: "Eksik ihtiyacı hedefle: Özerklik için bir seçim yap; yeterlik için küçük bir başarı kazan; bağlılık için birine anlat.",
    interventionEn: "Target the unmet need: For autonomy — make one choice; for competence — earn a small win; for relatedness — tell someone.",
    source: "Ryan & Deci (2000); Deci & Ryan (2008). Self-determination theory.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 11: Akış Teorisi (Csikszentmihalyi)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "flow_01",
    theory: "Flow",
    topic: "Zorluk-Beceri Dengesi",
    topicEn: "Challenge-Skill Balance",
    keywords: ["çok kolay", "çok zor", "sıkıştım", "bunalttı", "odaklanamıyorum", "ilgimi çekmiyor"],
    keywordsEn: ["too easy", "too hard", "trapped", "overwhelmed", "can't focus", "not engaging"],
    content: "Csikszentmihalyi — Akış: Görev çok kolaysa sıkılırsın, çok zorsa paniklersin. Akış tam ortada, becerilerinin biraz üstünde bir zorlukta gerçekleşir. Erteleme çoğu zaman bu dengesizliğin belirtisidir.",
    contentEn: "Csikszentmihalyi — Flow: If the task is too easy, boredom; too hard, anxiety. Flow happens in the middle — at a challenge level slightly above your current skills. Procrastination is often a symptom of this imbalance.",
    socraaticPrompt: "Bu görev sana fazla kolay mı geliyor yoksa fazla zor mu — hangisi daha yakın?",
    socraaticPromptEn: "Does this task feel too easy or too hard — which is closer?",
    intervention: "Dengeyi ayarla: Kolay geliyorsa bir kısıtlama ekle (süre, kalite). Zor geliyorsa görevi küçült, beceri düzeyine indir.",
    interventionEn: "Adjust the balance: If too easy, add a constraint (time, quality). If too hard, shrink the task to match your current skill level.",
    source: "Csikszentmihalyi (1990). Flow. Harper & Row.",
  },
  {
    id: "flow_02",
    theory: "Flow",
    topic: "Akış Kapısı",
    topicEn: "Flow Entry",
    keywords: ["konsantrasyon", "odak", "dalmak istiyorum", "başlayınca duramıyorum", "kaybolmak"],
    keywordsEn: ["concentration", "focus", "want to get in the zone", "once I start I can't stop", "lose myself"],
    content: "Akışa girmek için önce 'ısınma' gerekir — ilk 5-10 dakika genellikle en zorıdur. Dikkat dağıtıcıları kaldır, tek bir göreveye kilitle, zamanlayıcıyı başlat. Akış başladığında beyin dopamin salgılar ve devam etmek otomatikleşir.",
    contentEn: "Entering flow requires a 'warm-up' — the first 5-10 minutes are usually the hardest. Remove distractions, lock onto one task, start the timer. When flow begins, the brain releases dopamine and continuation becomes automatic.",
    socraaticPrompt: "Akışa girdiğin bir anı hatırlıyor musun — o gün ne farklıydı?",
    socraaticPromptEn: "Can you remember a time you were in flow — what was different that day?",
    intervention: "Akış ritüeli: Telefonu sessize al, tek sekme aç, zamanlayıcıyı 25 dakikaya kur. İlk 10 dakika sadece orada ol.",
    interventionEn: "Flow ritual: Silence phone, open one tab, set timer for 25 minutes. For the first 10 minutes, just be there.",
    source: "Csikszentmihalyi (1990). Flow.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 12: Öz-Yeterlik ve Büyüme Zihniyeti (Bandura / Dweck)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "bandura_01",
    theory: "Bandura",
    topic: "Öz-Yeterlik İnancı",
    topicEn: "Self-Efficacy Belief",
    keywords: ["beceremem", "başaramam", "yetkim yok", "zaten olmaz", "ben yapamam", "kapasitem yok"],
    keywordsEn: ["I can't do it", "I'll fail", "not capable", "won't happen", "not up to it"],
    content: "Albert Bandura: Öz-yeterlik — kişinin belirli bir görevi başarabileceğine dair inancıdır. Bu inanç birikimleri başarı deneyimlerine dayanır. 'Yapamam' hissi bir gerçek değil, önceki deneyimlerden gelen bir tahmindir.",
    contentEn: "Albert Bandura: Self-efficacy — belief in one's ability to succeed at a specific task. This belief is built from accumulated mastery experiences. 'I can't' is not a fact — it's an estimate based on past experiences.",
    socraaticPrompt: "Bu görevi %100 yapamayacağını nereden biliyorsun — daha önce benzerini hiç denedin mi?",
    socraaticPromptEn: "How do you know 100% that you can't do this — have you ever tried something similar before?",
    intervention: "Kanıt topla: Benzer bir zorluğu geçmişte başardığın bir anı bul. O an bugünkünden ne kadar farklı?",
    interventionEn: "Gather evidence: Find a time you succeeded at a similar challenge in the past. How different was that from now?",
    source: "Bandura, A. (1977). Self-efficacy. Psychological Review.",
  },
  {
    id: "bandura_02",
    theory: "Bandura",
    topic: "Küçük Başarılar Birikiyor",
    topicEn: "Mastery Accumulation",
    keywords: ["küçük adım", "ilerleme", "biraz oldu", "az da olsa", "adım attım"],
    keywordsEn: ["small step", "progress", "little done", "bit by bit", "took a step"],
    content: "Bandura: En güçlü öz-yeterlik kaynağı 'ustalık deneyimleri'dir — kendi başardığın şeylerin birikimi. Her küçük tamamlanmış görev, 'başarabiliyorum' inancını yeniden kurar. İlerleme hissi motivasyonu yakıtar.",
    contentEn: "Bandura: The strongest source of self-efficacy is 'mastery experiences' — your accumulation of personal achievements. Every small completed task rebuilds the belief 'I can succeed.' The feeling of progress fuels motivation.",
    socraaticPrompt: "Bu hafta, küçük de olsa, başardığın bir şey var mı — ne kadar küçük olursa olsun?",
    socraaticPromptEn: "This week, even if small, is there something you completed — no matter how tiny?",
    intervention: "Başarıları görünür kıl: Bugün bitirdiğin her şeyi bir yere yaz. Beyin tamamlananları hafıza yenileyen dopaminle işler.",
    interventionEn: "Make successes visible: Write down everything you completed today. The brain processes completions with memory-refreshing dopamine.",
    source: "Bandura (1977, 1997). Self-efficacy.",
  },
  {
    id: "dweck_01",
    theory: "Growth Mindset",
    topic: "Sabit vs Gelişim Zihniyeti",
    topicEn: "Fixed vs Growth Mindset",
    keywords: ["zekam yetmez", "yeteneğim yok", "doğuştan böyle", "değişemem", "beceriksizim"],
    keywordsEn: ["not smart enough", "no talent", "born this way", "can't change", "incompetent"],
    content: "Carol Dweck: Sabit zihniyet — 'Yeteneğim sabittir, başarısızlık yetersizliğimi kanıtlar.' Gelişim zihniyeti — 'Yetenek çabayla gelişir, başarısızlık bilgi sağlar.' Erteleyenlerin büyük çoğunluğu sabit zihniyet döngüsündedir.",
    contentEn: "Carol Dweck: Fixed mindset — 'My ability is fixed; failure proves my inadequacy.' Growth mindset — 'Ability develops through effort; failure provides information.' The majority of procrastinators are caught in a fixed mindset loop.",
    socraaticPrompt: "Başarısız olursan bu sana ne söyler — 'yetersizim' mi, yoksa 'buradan öğreniyorum' mu?",
    socraaticPromptEn: "If you fail at this, what does it tell you — 'I'm inadequate' — or 'I'm learning from this'?",
    intervention: "'Henüz değil' çerçevesi: 'Bunu yapamıyorum' yerine 'Bunu henüz yapamıyorum — ama öğreniyorum.'",
    interventionEn: "'Not yet' framing: Instead of 'I can't do this' — 'I can't do this yet — but I'm learning.'",
    source: "Dweck, C. (2006). Mindset. Random House.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 13: Davranışsal İktisat ve Ödül Tasarımı
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "behav_01",
    theory: "Behavioral Economics",
    topic: "Cazip Paketleme",
    topicEn: "Temptation Bundling",
    keywords: ["sıkıcı görev", "zevksiz", "yapmak istemiyorum", "ödül istiyorum", "eğlenceli değil"],
    keywordsEn: ["boring task", "unpleasant", "don't want to do it", "want a reward", "not fun"],
    content: "Katy Milkman — Cazip Paketleme: Sıkıcı ama önemli bir görevi, sadece o sırada yapabileceğin keyifli bir şeyle birleştir. 'Raporumu yazarken sadece o podcast'i dinlerim.' Beyin görevi cazip aktiviteyle ilişkilendirir.",
    contentEn: "Katy Milkman — Temptation Bundling: Pair a boring but important task with something enjoyable you only allow during that task. 'I only listen to that podcast while writing my report.' The brain associates the task with the tempting activity.",
    socraaticPrompt: "Bu görevi yaparken tek izin vereceğin keyifli bir şey ne olabilir?",
    socraaticPromptEn: "What is one enjoyable thing you could only allow yourself while doing this task?",
    intervention: "Cazip paket kur: Görevi başlatmadan önce 'keyifli bağlantıyı' hazırla. Sadece görev sırasında erişim ver kendine.",
    interventionEn: "Build your temptation bundle: Prepare the enjoyable element before starting the task. Only allow access to it during the task.",
    source: "Milkman, K. (2021). How to Change. Portfolio.",
  },
  {
    id: "behav_02",
    theory: "Behavioral Economics",
    topic: "Taahhüt Aygıtı",
    topicEn: "Commitment Device",
    keywords: ["söz verdim", "kendimi bağlamak", "dışarıdan baskı", "birinin bilmesi", "hesap verebilmek"],
    keywordsEn: ["made a promise", "bind myself", "external pressure", "someone to know", "be accountable"],
    content: "Ariely & Thaler: İnsanlar geleceğe ertelemek yerine şimdiden kendilerini bağladıklarında başarı oranları dramatik artar. 'Taahhüt aygıtı' — şimdiki benin, gelecekteki benin için karar almasını kısıtlaması. Aleni taahhüt, saygınlığı riske atar.",
    contentEn: "Ariely & Thaler: When people bind themselves now rather than deferring to the future, success rates increase dramatically. A 'commitment device' — the present self restricting the future self's options. Public commitment puts reputation at stake.",
    socraaticPrompt: "Bu görevi bir kişiye açıkça söylesen ve onun seni takip etmesini istesen — kim olurdu?",
    socraaticPromptEn: "If you told one person about this task openly and asked them to follow up — who would that be?",
    intervention: "Aleni taahhüt al: 'Cuma 18:00'e kadar [görevi] bitireceğim' diye birine söyle. Sosyal hesap verebilirlik güçlü bir tamamlama mekanizmasıdır.",
    interventionEn: "Make a public commitment: Tell someone 'I will finish [task] by Friday 6pm.' Social accountability is a powerful completion mechanism.",
    source: "Ariely, D. (2008). Predictably Irrational. Harper.",
  },
  {
    id: "reward_01",
    theory: "Dopamine",
    topic: "Anlık Ödül Tasarımı",
    topicEn: "Immediate Reward Design",
    keywords: ["ödül", "kendimi ödüllendirmek", "motivasyon için", "teşvik", "sonunda ne var"],
    keywordsEn: ["reward", "reward myself", "for motivation", "incentive", "what's in it for me"],
    content: "Dopamin sisteminin anahtarı beklenti anıdır — ödülün kendisi değil. Görevi başlatmadan hemen önce küçük bir 'çapraz ödül' belirlemek beynin ileri hareketini ateşler. Ödülün görevle ilgisiz olması daha etkilidir.",
    contentEn: "The key to the dopamine system is the moment of anticipation — not the reward itself. Deciding on a small 'cross-reward' just before starting activates the brain's forward movement. An unrelated reward is more effective.",
    socraaticPrompt: "Bu görevi bitirince kendine ne vereceksin — ve bunu şimdi gerçekten istiyor musun?",
    socraaticPromptEn: "What will you give yourself after finishing this task — and do you genuinely want that right now?",
    intervention: "Somut, anlık bir ödül belirle: Görevi bitirince [belirli bir şey] yapacaksın. Bunu şimdi yaz.",
    interventionEn: "Name a concrete, immediate reward: When you finish the task, you will do [specific thing]. Write this down now.",
    source: "Berridge & Kringelbach (2015). Pleasure systems in the brain. Neuron.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 14: WOOP — Zihinsel Zıtlama (Oettingen)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "woop_01",
    theory: "WOOP",
    topic: "Zihinsel Zıtlama",
    topicEn: "Mental Contrasting",
    keywords: ["hayal ediyorum", "olacak", "başarırsam", "bitirirsem", "sonunda", "ileride"],
    keywordsEn: ["imagining", "it will happen", "if I succeed", "when I finish", "eventually"],
    content: "Gabriele Oettingen: Sadece olumlu hayal kurmak ('vizyon') bazen motivasyonu düşürür — beyin hedefi zaten gerçekleşmiş gibi işler ve enerji azalır. Zihinsel Zıtlama: önce istediğin sonucu hayal et, sonra önündeki gerçek engeli. Bu ikisi birlikte harekete geçirir.",
    contentEn: "Gabriele Oettingen: Purely positive visualization ('dreaming') can reduce motivation — the brain processes the goal as already achieved and energy drops. Mental Contrasting: first visualize the desired outcome, then the real obstacle in front of you. Together, these two mobilize action.",
    socraaticPrompt: "Bu görevi tamamladığında nasıl bir his olur — ve şu an onu durduran en büyük engel ne?",
    socraaticPromptEn: "What will it feel like to complete this task — and what is the biggest obstacle stopping you right now?",
    intervention: "WOOP'un OO'sunu yap: Sonucu hayal et (Outcome), ardından engeli (Obstacle). Bu çift görüntü beyne 'gerçekten çalışmam gerekiyor' sinyali verir.",
    interventionEn: "Do the OO of WOOP: Visualize the Outcome, then the Obstacle. This dual image signals the brain 'I actually need to work.'",
    source: "Oettingen, G. (2014). Rethinking Positive Thinking. Current.",
  },
  {
    id: "woop_02",
    theory: "WOOP",
    topic: "WOOP Planı",
    topicEn: "WOOP Full Plan",
    keywords: ["plan yapmak", "somut adım", "engeli aşmak", "yol haritası", "nasıl yapacağım"],
    keywordsEn: ["make a plan", "concrete steps", "overcome obstacle", "roadmap", "how will I do this"],
    content: "WOOP: Wish (Dilek) → Outcome (Sonuç) → Obstacle (Engel) → Plan (Eğer-Öyleyse). Sadece W ve O değil, O ve P de kritiktir. 'Eğer [engel] çıkarsa, [plan] yapacağım.' Bu formül Gollwitzer'in uygulama niyetiyle birleşir.",
    contentEn: "WOOP: Wish → Outcome → Obstacle → Plan (If-Then). Not just W and O — O and P are also critical. 'If [obstacle] appears, I will [plan].' This formula merges with Gollwitzer's implementation intention.",
    socraaticPrompt: "En büyük engelini biliyor musun — ve o engel çıkarsa tam olarak ne yapacaksın?",
    socraaticPromptEn: "Do you know your biggest obstacle — and if it appears, exactly what will you do?",
    intervention: "Tam WOOP yaz: 1. Dileğin ne, 2. Sonuç nasıl hissettirir, 3. Engel ne, 4. Eğer engel çıkarsa ne yaparsın.",
    interventionEn: "Write the full WOOP: 1. Your wish, 2. How the outcome feels, 3. What's the obstacle, 4. If obstacle appears, what do you do.",
    source: "Oettingen (2014); Oettingen & Gollwitzer (2010).",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 15: Biyolojik Ritim ve Karar Yorgunluğu
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "chrono_01",
    theory: "Chronobiology",
    topic: "Biyolojik Tepe Zamanı",
    topicEn: "Biological Peak Time",
    keywords: ["sabah mı", "akşam mı", "hangi saatte", "en verimli", "zaman", "ne zaman çalışmalıyım"],
    keywordsEn: ["morning or evening", "what time", "most productive", "best time to work", "when to work"],
    content: "Daniel Pink ve biyolojik ritim araştırmaları: Çoğu insan ('sabahçı') bilişsel zirveyi öğleden önce, günün çukurunu öğleden sonra 2-3'te yaşar. Zor, odak gerektiren görevler için tepe zamanı; rutin görevler için çukur zamanı kullan.",
    contentEn: "Daniel Pink and chronobiology research: Most people ('larks') hit cognitive peak before noon, the daily trough around 2-3pm. Use peak time for hard, focus-demanding tasks; use trough time for routine tasks.",
    socraaticPrompt: "Günün hangi saatinde en berrak ve enerjik hissediyorsun — o saat için ne planlıyorsun?",
    socraaticPromptEn: "At what time of day do you feel clearest and most energized — what are you planning for that slot?",
    intervention: "En zor görevi tepe saatine planla. Şu an tepe saatin miydi? Değilse, görevi o saate taşı.",
    interventionEn: "Schedule your hardest task at your peak time. Are you at your peak right now? If not, move the task to that time.",
    source: "Pink, D. (2018). When. Riverhead Books.",
  },
  {
    id: "chrono_02",
    theory: "Chronobiology",
    topic: "Karar Yorgunluğu",
    topicEn: "Decision Fatigue",
    keywords: ["karar veremiyorum", "seçemiyorum", "kafam doldu", "ne yapacağımı bilemiyorum", "bunaldım"],
    keywordsEn: ["can't decide", "can't choose", "brain full", "don't know what to do", "overwhelmed by choices"],
    content: "Baumeister — Ego Tükenmesi ve Karar Yorgunluğu: Her karar öz-kontrol kapasitesinden bir miktar tüketir. Gün ilerledikçe karar kalitesi düşer; erteleme kapasitesi artar. Sabah saatlerinde alınan kararlar daha sağlam ve uzun vadeli odaklıdır.",
    contentEn: "Baumeister — Ego Depletion and Decision Fatigue: Every decision draws from self-control capacity. As the day progresses, decision quality drops; procrastination capacity increases. Morning decisions are more solid and long-term focused.",
    socraaticPrompt: "Bu kararı vermekte zorlanıyorsun — günün kaçı ve bugün kaç önemli karar verdin zaten?",
    socraaticPromptEn: "You're struggling with this decision — what time is it and how many important decisions have you made today already?",
    intervention: "Büyük kararları sabaha ertele. Şu an için: tek bir küçük eylem seç ve hemen yap. Seçim yorgunluğunu kır.",
    interventionEn: "Defer big decisions to the morning. For now: choose one small action and do it immediately. Break the choice fatigue.",
    source: "Baumeister et al. (1998). Ego depletion. JPSP.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 16: Bilişsel Terapi — CBT (Beck)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "cbt_01",
    theory: "CBT",
    topic: "Felakete Götürme",
    topicEn: "Catastrophizing",
    keywords: ["her şey mahvolur", "felaket olur", "en kötüsü", "kesinlikle başarısız", "berbat sonuç"],
    keywordsEn: ["everything will go wrong", "catastrophe", "worst case", "definitely fail", "terrible outcome"],
    content: "Beck — Bilişsel Terapi: Felakete götürme — olası en kötü sonucu kaçınılmaz gibi değerlendirmek. 'Bunu yapmazsam hayatım biter' tipik bir bilişsel çarpıtmadır. Erteleyenlerin büyük çoğunluğu bu çarpıtmayı yaşar.",
    contentEn: "Beck — Cognitive Therapy: Catastrophizing — treating the worst possible outcome as inevitable. 'If I don't do this, my life is over' is a typical cognitive distortion. The vast majority of procrastinators experience this distortion.",
    socraaticPrompt: "En kötü senaryo gerçekten ne kadar olası — ve olsa bile, bundan geriye dönemez misin?",
    socraaticPromptEn: "How likely is the worst case scenario really — and even if it happened, couldn't you recover?",
    intervention: "Gerçekçi senaryo yaz: En kötü olasılık, en iyi olasılık, en gerçekçi olasılık. Hangisi en çok yer kaplıyor kafanda?",
    interventionEn: "Write realistic scenarios: worst case, best case, most realistic case. Which one is taking up most space in your head?",
    source: "Beck, A.T. (1979). Cognitive Therapy of Depression. Guilford.",
  },
  {
    id: "cbt_02",
    theory: "CBT",
    topic: "Ya Hep Ya Hiç",
    topicEn: "All-or-Nothing Thinking",
    keywords: ["ya tam yaparsam", "ya mükemmel ya hiç", "ya bitirirsem ya bırakırım", "orta yolu yok", "tamamen"],
    keywordsEn: ["either perfectly or not at all", "all or nothing", "no middle ground", "completely"],
    content: "Beck — Ya Hep Ya Hiç Düşüncesi: İşleri siyah-beyaz değerlendirmek. '%70 yaptım — başarısız sayılır.' Bu düşünce hem mükemmeliyetçiliği hem de ertelemeyi besler. Kısmi ilerleme tam yokluktan her zaman daha değerlidir.",
    contentEn: "Beck — All-or-Nothing Thinking: Evaluating things in black and white. 'I did 70% — that counts as a failure.' This thinking feeds both perfectionism and procrastination. Partial progress is always more valuable than total absence.",
    socraaticPrompt: "Bu görevi %60 yaptıysan — başarısız mısın yoksa %60 başarılı mısın?",
    socraaticPromptEn: "If you completed 60% of this task — are you a failure, or are you 60% successful?",
    intervention: "'İlerleme skoru' kullan: Bugün %0'dan %20'ye gidersen — bu zafer. Tamamlanmamış olmak başlanmamış olmaktan farklıdır.",
    interventionEn: "Use a 'progress score': If you go from 0% to 20% today — that's a victory. Being incomplete is different from being unstarted.",
    source: "Beck (1979); Burns, D. (1980). Feeling Good. Morrow.",
  },
  {
    id: "cbt_03",
    theory: "CBT",
    topic: "Bilişsel Yeniden Çerçeveleme",
    topicEn: "Cognitive Reframing",
    keywords: ["bakış açısı", "farklı düşünmek", "yeniden bakmak", "perspektif", "anlam değişirse"],
    keywordsEn: ["perspective", "think differently", "look at it differently", "reframe", "if the meaning changes"],
    content: "CBT — Yeniden Çerçeveleme: Olayın kendisi değil, olaya atfettiğimiz anlam duyguyu belirler. 'Bu görev beni mahvediyor' → 'Bu görev becerilerimi test ediyor.' Aynı gerçeklik, farklı çerçeve, farklı motivasyon.",
    contentEn: "CBT — Reframing: Not the event itself, but the meaning we assign to it determines our emotions. 'This task is destroying me' → 'This task is testing my skills.' Same reality, different frame, different motivation.",
    socraaticPrompt: "Bu görevi 'tehdit' olarak değil, 'fırsat' olarak gördüğünde ne değişiyor?",
    socraaticPromptEn: "When you see this task as an 'opportunity' rather than a 'threat' — what changes?",
    intervention: "Çerçeve dönüştürme: 'Bu görev [olumsuz anlam]' → 'Bu görev [gelişim/değer/güç anlamı].' Yeni cümleyi yüksek sesle söyle.",
    interventionEn: "Frame shift: 'This task is [negative meaning]' → 'This task is [growth/value/strength meaning].' Say the new sentence aloud.",
    source: "Beck (1979); Ellis, A. (1962). Reason and Emotion in Psychotherapy.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 17: Farkındalık — Mindfulness (Kabat-Zinn)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "mindful_01",
    theory: "Mindfulness",
    topic: "Şimdiki Ana Dönüş",
    topicEn: "Return to Present Moment",
    keywords: ["aklım dağıldı", "düşünceler geliyor", "geçmiş", "gelecek kaygısı", "konsantre olamıyorum"],
    keywordsEn: ["mind is scattered", "thoughts keep coming", "past", "future anxiety", "can't concentrate"],
    content: "Kabat-Zinn — Farkındalık: Geçmiş pişmanlık + gelecek kaygı = şimdiki an kaybolur. Erteleme çoğunlukla 'ya başarısız olursam' (gelecek) veya 'daha önce de yapamadım' (geçmiş) döngüsünde yaşar. Şimdiki anın tek sorusu: 'Şu an, burada ne yapabilirim?'",
    contentEn: "Kabat-Zinn — Mindfulness: Past regret + future anxiety = present moment disappears. Procrastination most often lives in 'what if I fail' (future) or 'I couldn't do it before' (past) loops. The only question in the present: 'Right now, here, what can I do?'",
    socraaticPrompt: "Şu an, tam bu dakikada, önündeki tek adım ne — geçmiş ve gelecek paranteze alınırsa?",
    socraaticPromptEn: "Right now, at this exact moment, what is the one step in front of you — if past and future are bracketed out?",
    intervention: "Mindful bir dakika: Gözleri kapa, 3 nefes al, sadece şu anki duyuma gel. Sonra tek soruyu sor: 'Şimdi ne yapabilirim?'",
    interventionEn: "One mindful minute: Close eyes, take 3 breaths, arrive at just this moment's sensations. Then ask one question: 'What can I do now?'",
    source: "Kabat-Zinn, J. (1994). Wherever You Go There You Are. Hyperion.",
  },
  {
    id: "mindful_02",
    theory: "Mindfulness",
    topic: "Merak Modu",
    topicEn: "Curiosity Mode",
    keywords: ["tedirginim", "rahatsız oluyorum", "bu duygudan kaçmak", "katlanamıyorum", "zor geliyor"],
    keywordsEn: ["anxious", "uncomfortable", "want to flee this feeling", "can't stand it", "feels hard"],
    content: "Farkındalık araştırmacısı Judson Brewer: 'Kaygı modunda' olan beyin kaçmaya çalışır. 'Merak moduna' geçen beyin gözlemler. 'Bu rahatsızlık tam olarak nasıl hissettiriyor?' sorusu, kaçınma dürtüsünü merak dürtüsüne dönüştürür.",
    contentEn: "Mindfulness researcher Judson Brewer: The brain in 'anxiety mode' tries to flee. The brain in 'curiosity mode' observes. The question 'What exactly does this discomfort feel like?' converts the avoidance urge into a curiosity urge.",
    socraaticPrompt: "Bu görevi düşündüğünde bedeninde tam olarak ne hissediyorsun — merak ederek tarif edebilir misin?",
    socraaticPromptEn: "When you think about this task, what exactly do you feel in your body — can you describe it with curiosity?",
    intervention: "Kaygıyı gözlemle: 'Bu his [nerede, nasıl].' İsim koy: 'Bu görev kaygısı.' İsimlendirmek prefrontal korteksi aktive eder.",
    interventionEn: "Observe the anxiety: 'This feeling is [where, how].' Name it: 'This is task anxiety.' Naming activates the prefrontal cortex.",
    source: "Brewer, J. (2021). Unwinding Anxiety. Avery.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 18: Sosyal Hesap Verebilirlik ve Vücut Çiftleşmesi
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "social_01",
    theory: "Social Accountability",
    topic: "Vücut Çiftleşmesi",
    topicEn: "Body Doubling",
    keywords: ["yalnız başaramıyorum", "biri olsa", "yanımda biri olsaydı", "beraber çalışmak", "ortam lazım"],
    keywordsEn: ["can't do it alone", "if someone were here", "wish someone was with me", "work together", "need an environment"],
    content: "ADHD araştırmacılarının keşfi: Başka biri aynı odada (ya da video'da) sadece kendi işini yaparken bile, erteleme oranı dramatik düşer. 'Vücut çiftleşmesi' — fiziksel varlık prefrontal korteks aktivasyonunu artırır. Çalışma kafesi, online çalışma grupları aynı etkiyi sağlar.",
    contentEn: "ADHD researchers' discovery: When another person is in the same room (or on video) just doing their own work, procrastination rates drop dramatically. 'Body doubling' — physical presence increases prefrontal cortex activation. Coffee shops and online study groups provide the same effect.",
    socraaticPrompt: "Bu görevi yalnız yapacak mısın, yoksa yanında biri olsa daha kolay olur muydu?",
    socraaticPromptEn: "Will you do this task alone — or would it be easier if someone was beside you?",
    intervention: "Vücut çiftleşmesi dene: Bir arkadaşa 'beraber çalışalım' de (ayrı işler, aynı ortam). Ya da kalabalık bir kafede otur.",
    interventionEn: "Try body doubling: Tell a friend 'let's work together' (separate tasks, same space). Or sit in a busy café.",
    source: "Ratey, J. (2008). Spark. Little, Brown. ADHD and focus research.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 19: Ruminasyon vs Yapıcı Yansıma (Nolen-Hoeksema)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "rumin_01",
    theory: "Rumination",
    topic: "Ruminasyon Tuzağı",
    topicEn: "Rumination Trap",
    keywords: ["aklımdan çıkmıyor", "tekrar tekrar düşünüyorum", "kafamda dönüyor", "takıldım", "bırakamıyorum"],
    keywordsEn: ["can't get it out of my head", "thinking about it over and over", "going in circles", "stuck on it", "can't let go"],
    content: "Nolen-Hoeksema — Ruminasyon: Aynı olumsuz düşünceyi tekrarlayan bir döngü. Ertelemeyle birlikte güçlü bir geri bildirim oluşturur: Erteleme → Suçluluk → Ruminasyon → Daha fazla erteleme. Ruminasyon çözüm üretmez; sadece acıyı uzatır.",
    contentEn: "Nolen-Hoeksema — Rumination: A loop of repeating the same negative thought. Creates a strong feedback loop with procrastination: Procrastination → Guilt → Rumination → More procrastination. Rumination doesn't produce solutions; it only prolongs pain.",
    socraaticPrompt: "Bu düşünce kafanda kaç kez döndü — ve her seferinde yeni bir şey mi fark ettin, yoksa aynı yere mi döndün?",
    socraaticPromptEn: "How many times has this thought circled in your head — and each time, did you notice something new, or return to the same place?",
    intervention: "Dışarı çıkar: Düşünceyi yaz, fiziksel bir hareket yap (kalk, yürü), farklı bir nesneye 30 saniye bak. Döngüyü kır.",
    interventionEn: "Break out: Write the thought down, do a physical movement (stand, walk), look at a different object for 30 seconds. Break the loop.",
    source: "Nolen-Hoeksema, S. (1991). Responses to Depression. Journal of Personality.",
  },
  {
    id: "rumin_02",
    theory: "Rumination",
    topic: "Yapıcı Yansıma",
    topicEn: "Constructive Reflection",
    keywords: ["nereden yanlış gitti", "neden böyle oldu", "kendimi anlamamak", "ders çıkarmak", "öğrenmek"],
    keywordsEn: ["where did it go wrong", "why did this happen", "not understanding myself", "learn from it", "take a lesson"],
    content: "Ruminasyon ile yansıma arasındaki fark: Ruminasyon sorular sorar ama cevap aramaz; yansıma cevap arar. 'Neden başarısız oldum?' (ruminasyon) → 'Bu deneyimden ne öğrenebilirim?' (yansıma). Yapıcı yansıma eyleme işaret eder.",
    contentEn: "The difference between rumination and reflection: Rumination asks questions but doesn't seek answers; reflection seeks answers. 'Why did I fail?' (rumination) → 'What can I learn from this experience?' (reflection). Constructive reflection points toward action.",
    socraaticPrompt: "Bu deneyimden eyleme dönüştürebileceğin tek bir öğrenim ne olurdu?",
    socraaticPromptEn: "What is one learning from this experience that you could turn into action?",
    intervention: "Yansıma → Eylem köprüsü: Öğrendiğini tek cümleyle yaz ve 'Bu konuda şimdi yapabileceğim şey...' diye bitir.",
    interventionEn: "Reflection → Action bridge: Write your learning in one sentence and complete: 'What I can do about this now is...'",
    source: "Nolen-Hoeksema (1991); Watkins, E. (2008). Constructive and Unconstructive Repetitive Thought. Psychological Bulletin.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 20: Davranışsal Aktivasyon (Lewinsohn / Jacobson)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "ba_01",
    theory: "Behavioral Activation",
    topic: "Duygu-Eylem Döngüsü",
    topicEn: "Mood-Action Cycle",
    keywords: ["zaten canım istemez", "önce iyi hissetsem", "moduma göre", "hissetmeden yapamam", "içimden gelmiyor"],
    keywordsEn: ["don't feel like it", "feel good first", "depends on my mood", "can't without feeling it", "not motivated"],
    content: "Lewinsohn — Davranışsal Aktivasyon: Çoğu insan 'önce iyi hissedeyim, sonra yapayım' der. Ancak araştırmalar tersi sırayı kanıtlar: Önce eylemin küçük adımı, sonra ruh hali iyileşmesi. Eylem duygudan önce gelir; bekleme tuzağından çıkmanın yolu harekettir.",
    contentEn: "Lewinsohn — Behavioral Activation: Most people say 'I'll feel better first, then I'll do it.' But research proves the reverse order: first a small step of action, then mood improvement. Action precedes emotion; the way out of the waiting trap is movement.",
    socraaticPrompt: "Şu an nasıl hissettiğini bir yana bırak — bu görevin en küçük fiziksel adımı ne olurdu?",
    socraaticPromptEn: "Setting aside how you feel right now — what would be the smallest physical step for this task?",
    intervention: "Aktivasyon deneyi: Sonucunu tahmin etme, sadece 5 dakika yap. Sonrasında ruh halinin nasıl değiştiğini not et.",
    interventionEn: "Activation experiment: Don't predict the outcome, just do it for 5 minutes. Note how your mood shifts afterward.",
    source: "Lewinsohn (1974); Jacobson et al. (1996). Behavioral activation for depression. JCCP. TherapistAid (2020).",
  },
  {
    id: "ba_02",
    theory: "Behavioral Activation",
    topic: "Keyifli Aktivite Planlama",
    topicEn: "Pleasant Activity Scheduling",
    keywords: ["hiçbir şeyden zevk almıyorum", "her şey renksiz", "ne yapsam aynı", "keyif yok", "motivasyon sıfır"],
    keywordsEn: ["nothing feels enjoyable", "everything is grey", "no matter what", "no pleasure", "zero motivation"],
    content: "Davranışsal Aktivasyon: Keyifli ve anlamlı aktivitelerin planlanması, depresyon ve kaçınma döngüsünü kırar. Aktivite seçimi keyif + kolaylık matrisine göre yapılır. En kolay ve en az keyif veren aktivitelerle başlanarak ağır adım adım artırılır.",
    contentEn: "Behavioral Activation: Scheduling enjoyable and meaningful activities breaks the depression and avoidance cycle. Activity selection follows a pleasure + ease matrix. Start with the easiest and slightly enjoyable activities and gradually increase.",
    socraaticPrompt: "Geçmişte sana enerji veren üç aktivite neydi — bunlardan en küçüğünü bu hafta programına koyabilir misin?",
    socraaticPromptEn: "What are three activities that gave you energy in the past — can you schedule the smallest one this week?",
    intervention: "Aktivite listesi oluştur: Kolaylık 1-5, Keyif 1-5. En yüksek kolaylık skorundan başla ve planına yaz.",
    interventionEn: "Build an activity list: Ease 1-5, Pleasure 1-5. Start from the highest ease score and write it in your schedule.",
    source: "Lewinsohn (1974); TherapistAid Behavioral Activation Worksheets (2020).",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 21: Değişimin Aşamaları — TTM (Prochaska & DiClemente)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "ttm_01",
    theory: "TTM",
    topic: "Değişim Aşaması Tespiti",
    topicEn: "Stage of Change Identification",
    keywords: ["değişmek istemiyorum", "belki değiştiririm", "düşünüyorum ama", "bilmiyorum hazır mıyım", "adım atmak zor"],
    keywordsEn: ["don't want to change", "maybe I'll change", "thinking about it", "not sure if ready", "hard to take a step"],
    content: "Prochaska & DiClemente — Değişimin Aşamaları: Değişim bir karar değil, bir süreçtir. Ön düşünme (bilmiyorum) → Düşünme (belki) → Hazırlık (yakında) → Eylem (yapıyorum) → Sürdürme (devam). Her aşama farklı bir destek gerektirir.",
    contentEn: "Prochaska & DiClemente — Stages of Change: Change is not a decision — it's a process. Precontemplation (unaware) → Contemplation (maybe) → Preparation (soon) → Action (doing) → Maintenance (continuing). Each stage requires different support.",
    socraaticPrompt: "Bu konuda değişim için hazır hissediyorsun — ama 'hazır' ne demek senin için?",
    socraaticPromptEn: "You feel ready for change here — but what does 'ready' mean for you?",
    intervention: "Aşamanı belirle: 'Değiştirmeyi düşünmüyorum' → 'Belki' → 'Yakında' → 'Yapıyorum.' Hangi aşamada olduğunu bulmak, doğru adımı netleştirir.",
    interventionEn: "Identify your stage: 'Not thinking about it' → 'Maybe' → 'Soon' → 'Doing it.' Finding where you are clarifies the right next step.",
    source: "Prochaska & DiClemente (1983). Stages and Processes of Self-Change. JCCP. TherapistAid (2018).",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 22: Değerlere Doğru / Uzak Hamleler — ACT (Hayes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "act_values_01",
    theory: "ACT",
    topic: "Değerlere Doğru Hamleler",
    topicEn: "Toward & Away Moves",
    keywords: ["değerlerime aykırı", "yaşamak istediğim hayat", "önem verdiğim şey", "uzaklaşıyorum", "kendime ihanet"],
    keywordsEn: ["against my values", "life I want to live", "what matters to me", "drifting away", "betraying myself"],
    content: "Hayes — ACT: Her davranış bir 'değere doğru' veya 'değerden uzak' hamledir. Erteleme çoğu zaman anlık rahatsızlıktan kaçınmak için değerden uzak bir hamledir. Güçlü bir 'neden'e bağlı eylem, kaçınma motivasyonunu devre dışı bırakır.",
    contentEn: "Hayes — ACT: Every behavior is a move 'toward' or 'away from' a value. Procrastination is usually an away-move to escape momentary discomfort. Action connected to a strong 'why' overrides the avoidance motivation.",
    socraaticPrompt: "Bu görevi ertelediğinde — hangi değerinden uzaklaşıyorsun? Ve bunu geri almak için en yakın 'doğru hamle' ne?",
    socraaticPromptEn: "When you procrastinate on this task — which value are you moving away from? And what's the nearest 'toward move' to reclaim it?",
    intervention: "İki sütun oluştur: Değerime doğru hamleler | Değerimden uzak hamleler. Bu görev için birer örnek yaz.",
    interventionEn: "Create two columns: Toward moves | Away moves. Write one example for each related to this task.",
    source: "Hayes, S.C. (2005). Get Out of Your Mind and Into Your Life. New Harbinger. TherapistAid ACT Worksheets.",
  },
  {
    id: "act_defusion_01",
    theory: "ACT",
    topic: "Bilişsel Ayrışma",
    topicEn: "Cognitive Defusion",
    keywords: ["düşünce kafama yapışıyor", "aklımı kurcalıyor", "bu düşünceyi durduramıyorum", "kafam sabit", "takıntı gibi"],
    keywordsEn: ["thought is stuck", "nagging me", "can't stop this thought", "mind fixed", "like an obsession"],
    content: "Hayes — Bilişsel Ayrışma (Defüzyon): Düşüncenin içinden değil, dışından bakmak. 'Ben başaramam' düşüncesini 'Zihnimde bir ses var, o ses başaramayacağımı söylüyor' olarak yeniden çerçevele. Düşünceden uzaklık, düşüncenin davranış üzerindeki gücünü kırar.",
    contentEn: "Hayes — Cognitive Defusion: Looking at a thought from outside, not inside it. Reframe 'I can't succeed' as 'There's a voice in my mind, that voice is saying I can't succeed.' Distance from a thought reduces its power over behavior.",
    socraaticPrompt: "Şu an seni en çok durduran düşünce ne — ve onu 'zihnindeki bir ses' olarak tarif edebilir misin?",
    socraaticPromptEn: "What is the thought most stopping you right now — and can you describe it as 'a voice in your mind'?",
    intervention: "Yapraklar üzerinde düşünce: 'Bu düşünce geçip gidiyor' diye görselleştir. Zihnin akıyorsa, düşünceler de akar.",
    interventionEn: "Leaves on a stream: Visualize 'this thought is passing by.' If your mind flows, thoughts flow too.",
    source: "Hayes et al. (1999). Acceptance and Commitment Therapy. Guilford. TherapistAid ACT Worksheets.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 23: Problem Çözme — CBT (D'Zurilla & Goldfried)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "problem_solving_01",
    theory: "Problem Solving",
    topic: "Beş Adım Problem Çözme",
    topicEn: "Five-Step Problem Solving",
    keywords: ["ne yapacağımı bilmiyorum", "çözüm yok", "nasıl ilerleyeceğim", "tıkandım", "seçenek göremiyorum"],
    keywordsEn: ["don't know what to do", "no solution", "how to move forward", "stuck", "can't see options"],
    content: "D'Zurilla & Goldfried — Problem Çözme Terapisi: Belirsizlik veya çözümsüzlük hissi, sistematik süreçle kırılabilir. 1. Problemi tanımla (yazılı, somut). 2. Çözüm alternatifleri üret (yargısız). 3. Her çözümü değerlendir (artılar/eksiler). 4. En iyisini seç ve uygula. 5. Sonucu gözden geçir.",
    contentEn: "D'Zurilla & Goldfried — Problem Solving Therapy: The feeling of ambiguity or unsolvability can be broken with a systematic process. 1. Define the problem (written, concrete). 2. Generate alternatives (non-judgmentally). 3. Evaluate each option (pros/cons). 4. Select the best and implement. 5. Review the outcome.",
    socraaticPrompt: "Bu problemi tam olarak tek bir cümleyle tanımlayabilir misin — 'Sorun şu ki...' diye başlayarak?",
    socraaticPromptEn: "Can you define this problem in exactly one sentence — starting with 'The problem is...'?",
    intervention: "Problemi yaz. Sonra 3 farklı çözüm yaz — mükemmel olması şart değil. Her birinin tek avantajını not et.",
    interventionEn: "Write the problem. Then write 3 different solutions — they don't have to be perfect. Note one advantage of each.",
    source: "D'Zurilla & Goldfried (1971). Problem-solving and behavior modification. Abnormal Psychology. TherapistAid (2019).",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 24: İç Koç — Öz-Şefkat Tekniği (Neff / TherapistAid)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "inner_coach_01",
    theory: "Self-Compassion",
    topic: "İç Eleştirmenden İç Koça",
    topicEn: "Inner Critic to Inner Coach",
    keywords: ["kendimi sert eleştiriyorum", "aptal gibi hissediyorum", "neden böyle yapıyorum", "kendimi affetmek", "iç ses acımasız"],
    keywordsEn: ["harshly criticizing myself", "feel stupid", "why am I like this", "forgive myself", "inner voice is cruel"],
    content: "Neff (+ TherapistAid) — İç Koç Tekniği: İç eleştirmen 'Yine başaramadın, berbatsın' der. İç koç ise aynı duruma 'Zorlandın, bu normal; bir sonraki adım ne?' der. Aynı olayı iç koç diliyle yeniden çerçevelemek öz-yeterliği ve harekete geçme isteğini artırır.",
    contentEn: "Neff (+ TherapistAid) — Inner Coach Technique: The inner critic says 'You failed again, you're terrible.' The inner coach says 'You struggled, that's normal; what's the next step?' Reframing the same event in inner-coach language increases self-efficacy and the desire to take action.",
    socraaticPrompt: "Şu an kendine ne söylüyorsun — ve bir koç olsaydı, aynı durumu nasıl tarif ederdi?",
    socraaticPromptEn: "What are you saying to yourself right now — and if you were a coach, how would you describe the same situation?",
    intervention: "İç eleştirmen sesini yaz. Sonra aynı cümleyi bir 'destekleyici koç' olarak yeniden yaz — ne değişiyor?",
    interventionEn: "Write what your inner critic says. Then rewrite the same sentence as a 'supportive coach' — what changes?",
    source: "Neff, K. (2011). Self-Compassion. Morrow. TherapistAid Inner Coach Worksheet (2021).",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 25: DBT Stres Toleransı (Linehan)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "dbt_tipp_01",
    theory: "DBT",
    topic: "TIPP: Bedenle Sakinleşme",
    topicEn: "TIPP: Body-Based Calming",
    keywords: ["çok gergin", "panik", "anlık yardım lazım", "bunaltıcı", "bedenimi sakinleştirmek", "soluğum kesildi"],
    keywordsEn: ["very tense", "panic", "need immediate help", "overwhelming", "calm my body", "can't breathe"],
    content: "Linehan — DBT TIPP: Yoğun duygusal uyarılma anında bilişsel teknikler çalışmaz — önce beden sakinleşmeli. TIPP: Sıcaklık (soğuk su ile yüz veya el), Yoğun Egzersiz (hızlı yürüyüş, merdiven), Yavaş Nefes (4-7-8), Progresif Kas Gevşemesi. Bu tekniklerin tümü parasempatik sinir sistemini aktive eder.",
    contentEn: "Linehan — DBT TIPP: During intense emotional activation, cognitive techniques don't work — the body must calm first. TIPP: Temperature (cold water on face/hands), Intense Exercise (fast walk, stairs), Paced Breathing (4-7-8), Progressive Muscle Relaxation. All these techniques activate the parasympathetic nervous system.",
    socraaticPrompt: "Şu an bedeninde yoğunluk 0-10 arasında kaç — ve bunları sakinleştirmek için şu an yapabileceğin en kolay beden hareketi ne?",
    socraaticPromptEn: "What is the intensity in your body right now on a 0-10 scale — and what is the easiest physical movement you can do right now to calm it?",
    intervention: "Hızlı TIPP: Şu an soğuk su ile ellerini ıslatabilirsin. Ya da 30 saniye yerinde zıpla. Beyin sakinleşmeden karar verme.",
    interventionEn: "Quick TIPP: You can wet your hands with cold water right now. Or jump in place for 30 seconds. Don't make decisions before the brain calms.",
    source: "Linehan, M.M. (1993). DBT Skills Training. Guilford. TherapistAid DBT Worksheets (2020).",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 26: Rogers — Fenomenolojik Yaklaşım (simplypsychology.org / ek PDF)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "rogers_01",
    theory: "Person-Centered",
    topic: "Koşulsuz Olumlu Kabul ve Kendini Gerçekleştirme",
    topicEn: "Unconditional Positive Regard & Actualizing Tendency",
    keywords: ["onaylanmamak", "beğenilmek için", "değerimi kanıtlamak", "başkalarını memnun", "onaylarlarsa"],
    keywordsEn: ["not approved", "to be liked", "prove my worth", "please others", "if they approve"],
    content: "Rogers — Danışan Merkezli Terapi: İnsanın özünde bir kendini gerçekleştirme eğilimi vardır. Ancak koşullu kabul (sevgi ve saygının 'belli şeyler yapılırsa' verilmesi) bu eğilimi engeller. Kişi otantik duygularını gizler, 'başkaları ne düşünür' filtresiyle hareket eder. Koşulsuz kabul aldığında özgür büyüme mümkündür.",
    contentEn: "Rogers — Person-Centred Therapy: At the core of every person is an actualizing tendency. But conditional acceptance (love/respect given only 'if you do certain things') blocks this tendency. The person conceals authentic feelings, acts through a 'what will others think' filter. Unconditional acceptance enables free growth.",
    socraaticPrompt: "Bu görevi 'başkalarının beklentisi için' mi yapıyorsun, yoksa gerçekten kendi için mi — aralarındaki fark ne hissettiriyor?",
    socraaticPromptEn: "Are you doing this task 'for others' expectations' or truly for yourself — what does the difference feel like?",
    intervention: "Kendine koşulsuz kabul uygula: 'Bunu başarsam da başaramasam da, değerliyim.' Bu cümleyi bir kez kendi sesini duyarak söyle.",
    interventionEn: "Apply unconditional self-regard: 'Whether I succeed or fail at this, I have worth.' Say this sentence once hearing your own voice.",
    source: "Rogers, C.R. (1959). A theory of therapy. In Psychology: A Study of Science, Vol. 3. McGraw-Hill. Cervone & Pervin (2016).",
  },
  {
    id: "rogers_02",
    theory: "Person-Centered",
    topic: "Gerçek Benlik — İdeal Benlik Uçurumu",
    topicEn: "Real Self vs Ideal Self Gap",
    keywords: ["olmak istediğim kişi değilim", "kendimden beklentim çok yüksek", "hayal kırıklığım kendimden", "olmalıydım"],
    keywordsEn: ["not the person I want to be", "my expectations of myself too high", "disappointed in myself", "I should have been"],
    content: "Rogers ve Higgins (1987) — Benlik Uyuşmazlığı: Gerçek benlik ('şu an kim olduğum') ile ideal benlik ('olmak istediğim') arasındaki mesafe, depresyon ve üzüntü kaynağıdır. 'Olmalı' benlikleri ise ('olmam gereken') kaygı ve ajitasyon üretir. Procrastination bu iki uyuşmazlıktan beslenebilir.",
    contentEn: "Rogers & Higgins (1987) — Self-Discrepancy: The distance between real self ('who I am now') and ideal self ('who I want to be') is a source of depression and sadness. 'Ought' selves ('who I should be') generate anxiety and agitation. Procrastination can feed from both these discrepancies.",
    socraaticPrompt: "Olmak istediğin kişi ile şu an olduğun kişi arasındaki fark — bu fark seni felç mi ediyor, yoksa motive mi?",
    socraaticPromptEn: "The gap between who you want to be and who you are now — does this gap paralyze you, or motivate you?",
    intervention: "Uçurumu köprüye dönüştür: 'İdeal benliğime bir adım daha yaklaşmak için bugün yapabileceğim en küçük şey ne?' Tek cümle yaz.",
    interventionEn: "Turn the gap into a bridge: 'What is the smallest thing I can do today to get one step closer to my ideal self?' Write one sentence.",
    source: "Rogers (1959); Higgins, E.T. (1987). Self-discrepancy. Psychological Review. Cervone & Pervin (2016).",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 27: Duygu Düzenleme Başarısızlığı (Sirois & Pychyl)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "emotion_reg_01",
    theory: "Emotion Regulation",
    topic: "Kısa Vadeli Ruh Hali Tamiri",
    topicEn: "Short-Term Mood Repair",
    keywords: ["önce rahatlamak istiyorum", "şu an iyi hissetmek", "sonra daha iyi çalışırım", "rahatsızlıktan kaçmak"],
    keywordsEn: ["want to relax first", "feel good now", "I'll work better later", "escape discomfort"],
    content: "Sirois & Pychyl (2013) — Duygu Düzenleme Modeli: Erteleme bir zaman yönetimi sorunu değil, duygu düzenleme başarısızlığıdır. Beyin kısa vadeli ruh hali iyileştirmesini uzun vadeli hedef başarısına tercih eder — 'şimdi iyi hissetmek' öncelik alır. Bu 'hedonik kayma' ertelemenin özüdür.",
    contentEn: "Sirois & Pychyl (2013) — Emotion Regulation Model: Procrastination is not a time management problem — it's an emotion regulation failure. The brain prefers short-term mood improvement over long-term goal achievement — 'feeling good now' takes priority. This 'hedonic shift' is the essence of procrastination.",
    socraaticPrompt: "Bu görevi ertelediğinde — tam olarak hangi duygudan kaçıyorsun? Ve bu kaçış sana gerçekten yardımcı oluyor mu?",
    socraaticPromptEn: "When you procrastinate on this task — exactly what feeling are you escaping? And is this escape actually helping you?",
    intervention: "Duygu kabulü dene: Rahatsızlığı bastırmak yerine 'Evet, bu biraz sıkıcı/zor/rahatsız edici — ve yapabilirim.' Kabul, direnç değil.",
    interventionEn: "Try emotion acceptance: Instead of suppressing discomfort — 'Yes, this is a bit boring/hard/uncomfortable — and I can do it.' Acceptance, not resistance.",
    source: "Sirois, F.M. & Pychyl, T.A. (2013). Procrastination and priority of short-term mood regulation. SPPC, 7(2), 115-127.",
  },
  {
    id: "emotion_reg_02",
    theory: "Emotion Regulation",
    topic: "Gelecekteki Benlik Bağlantısı",
    topicEn: "Future Self Connection",
    keywords: ["sonrası beni ilgilendirmiyor", "gelecek çok uzak", "ilerisi için neden çalışayım", "umursamıyorum"],
    keywordsEn: ["future doesn't concern me", "future is too far", "why work for later", "don't care"],
    content: "Pychyl & Sirois — Gelecekteki Benlik: Erteleme yalnızca şimdiki beni değil, gelecekteki beni de etkiler — ancak beyin gelecekteki benliği 'yabancı biri' gibi işler. Gelecekteki benliğe bağlantı güçlendikçe erteleme azalır. Öz-şefkat bu bağlantıyı güçlendirmenin anahtarıdır.",
    contentEn: "Pychyl & Sirois — Future Self: Procrastination affects not just my present self but my future self — but the brain processes future self as 'a stranger.' As connection to future self strengthens, procrastination decreases. Self-compassion is the key to strengthening this connection.",
    socraaticPrompt: "Bir hafta sonraki sen bu kararı nasıl değerlendirecek — ve o 'gelecekteki sen' için ne yapmak istersin?",
    socraaticPromptEn: "How will your self one week from now evaluate this decision — and what would you want to do for that 'future you'?",
    intervention: "Gelecek benliğine mektup: 'Gelecekteki benliğime — bu hafta [şu adımı] atacağım çünkü sen [şu sonucu] hak ediyorsun.' Yaz ve sakla.",
    interventionEn: "Letter to future self: 'To my future self — this week I will take [this step] because you deserve [this outcome].' Write and keep it.",
    source: "Pychyl, T.A. (2013). Solving the Procrastination Puzzle. Tarcher/Perigee. Sirois & Pychyl (2013).",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 28: Sokratik Sorgulama Türleri (Carepatron / Paul, R.W.)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "socratic_01",
    theory: "Socratic Method",
    topic: "Altı Tür Sokratik Soru",
    topicEn: "Six Types of Socratic Questions",
    keywords: ["gerçekten mi", "emin misin", "nereden biliyorsun", "başka bakış açısı", "kanıtın ne"],
    keywordsEn: ["really", "are you sure", "how do you know", "another perspective", "what's your evidence"],
    content: "Paul (1993) — Altı Sokratik Soru Türü: 1. Netleştirme ('Ne demek istiyorsun?'), 2. Varsayım sorgulama ('Bu fikrin altında ne var?'), 3. Kanıt sorgulama ('Bunu neye dayandırıyorsun?'), 4. Bakış açısı ('Başka nasıl görebiliriz?'), 5. Sonuç ('Bu doğruysa ne olur?'), 6. Soruyu sorgulama ('Bu soru neden önemli?'). Her tür, düşünceyi derinleştirir.",
    contentEn: "Paul (1993) — Six Types: 1. Clarification ('What do you mean?'), 2. Probing assumptions ('What underlies this idea?'), 3. Probing evidence ('What do you base this on?'), 4. Perspectives ('How else could we see this?'), 5. Implications ('If true, what follows?'), 6. Questioning the question ('Why is this question important?'). Each type deepens thought.",
    socraaticPrompt: "Bu göreve dair en güçlü inancın ne — ve onu hangi kanıta dayandırıyorsun?",
    socraaticPromptEn: "What is your strongest belief about this task — and what evidence do you base it on?",
    intervention: "Kendi düşünceni sorgula: 'Bu inanç doğruysa ne olur? Yanlışsa? Başka bir açıklama var mı?' Üç soruyu yaz ve yanıtla.",
    interventionEn: "Question your own thought: 'If this belief is true, what follows? If wrong? Is there another explanation?' Write and answer three questions.",
    source: "Paul, R.W. (1993). Critical Thinking. Foundation for Critical Thinking. Carepatron Socratic Questioning Guide (2024).",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 29: OARS — Motivasyonel Görüşme Becerileri (Miller & Rollnick)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "oars_01",
    theory: "Motivational Interviewing",
    topic: "OARS: Dört Temel Beceri",
    topicEn: "OARS: Four Core Skills",
    keywords: ["sizi duymak istiyorum", "anlatın", "bu konuda ne düşünüyorsunuz", "kendi ağzınızdan", "değişmek ister misiniz"],
    keywordsEn: ["I want to hear you", "tell me", "what do you think about this", "in your own words", "do you want to change"],
    content: "Miller & Rollnick — OARS: Motivasyonel Görüşme'nin dört temel etkileşim becerisi. O: Açık sorular (evet/hayır cevabı verilemeyen), A: Onaylama (güçlü yönleri görünür kılmak), R: Yansıtıcı dinleme (söylenenin anlamını geri yansıtmak), S: Özet (söylenenin bütününü bir araya getirmek). Bu beceriler 'değişim konuşması'nı tetikler.",
    contentEn: "Miller & Rollnick — OARS: Four core interaction skills of Motivational Interviewing. O: Open questions (can't be answered yes/no), A: Affirmations (making strengths visible), R: Reflective listening (reflecting back the meaning of what's said), S: Summaries (bringing together the whole of what was said). These skills trigger 'change talk.'",
    socraaticPrompt: "Bu değişimi yapmak istediğinde — geçmişte benzer bir şeyi başardığın bir an var mıydı?",
    socraaticPromptEn: "When you want to make this change — was there a time in the past when you succeeded at something similar?",
    intervention: "Onaylama cümlesi yaz: Bu konuda gösterdiğin bir güçlü yönü adlandır — 'Ben ___ konusunda [güçlü yön] gösteren biriyim.' Bunu kendin söyle.",
    interventionEn: "Write an affirmation: Name one strength you've shown in this area — 'I am someone who shows [strength] when it comes to ___.' Say this to yourself.",
    source: "Miller, W.R. & Rollnick, S. (2013). Motivational Interviewing (3rd ed.). Guilford. Carepatron OARS Guide (2024).",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 30: Çözüm Odaklı Kısa Terapi — SFBT (de Shazer / Erickson)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "sfbt_01",
    theory: "SFBT",
    topic: "Mucize Sorusu ve İstisnalar",
    topicEn: "Miracle Question & Exceptions",
    keywords: ["nasıl olabileceğini hayal edemiyorum", "çözüm yok gibi", "her zaman böyle", "hiçbir zaman değişmez"],
    keywordsEn: ["can't imagine how it could be", "seems like no solution", "always like this", "never changes"],
    content: "de Shazer / Erickson — ÇOKT: Sorunun kökenine odaklanmak yerine çözümün zaten var olduğu anlara odaklan. 'İstisna sorusu': Bu sorunun olmadığı ya da daha az hissedildiği bir an ne zaman? 'Mucize sorusu': Sabah uyandığında her şey iyi olsaydı, ilk ne fark ederdin? Bu teknikler beynin olumsuz kalıptan çözüm yöne dönmesini sağlar.",
    contentEn: "de Shazer / Erickson — SFBT: Instead of focusing on the origin of the problem, focus on moments when the solution already exists. 'Exception question': When is there a time when this problem doesn't exist or feels less? 'Miracle question': If you woke up tomorrow and everything was fine, what would you notice first? These techniques shift the brain from problem patterns to solution directions.",
    socraaticPrompt: "Bu sorunun olmadığı ya da daha az hissedildiği bir gün ya da an hatırlıyor musun — o zaman ne farklıydı?",
    socraaticPromptEn: "Can you remember a day or moment when this problem didn't exist or felt less — what was different then?",
    intervention: "İstisna bul: 'Bu görevi yapmayı başardığım bir zamanı hatırlıyorum — o günü düşününce ne görüyorum?' Üç şey yaz.",
    interventionEn: "Find an exception: 'I remember a time when I managed to do this kind of task — thinking of that day, what do I see?' Write three things.",
    source: "de Shazer, S. (1985). Keys to Solution in Brief Therapy. Norton. Erickson Foundation SFBT Resources.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BÖLÜM 31: Gestalt — İki Sandalye Tekniği (Perls / EFT)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "gestalt_01",
    theory: "Gestalt",
    topic: "İç Çatışma Diyaloğu",
    topicEn: "Inner Conflict Dialogue",
    keywords: ["iki parçam var", "bir yanım istiyor bir yanım istemiyor", "çatışıyorum", "içimdeki ses", "ikilem"],
    keywordsEn: ["two parts of me", "one side wants one side doesn't", "conflicted", "voice inside", "dilemma"],
    content: "Perls — Gestalt Terapi: Her erteleme aslında iki 'iç ses' arasındaki çözümsüz bir çatışmadır. 'Yapıcı ses' (hedef, değer, sorumluluk) ile 'direnç sesi' (korku, tükenmişlik, öfke). İki sandalye tekniği: Her sesi ayrı bir sandalyeye oturt, birbiriyle diyalog kur. Dışavurulmuş iç çatışma, hafızada donmuş kalmaktan daha az güçtür.",
    contentEn: "Perls — Gestalt Therapy: Every procrastination is actually an unresolved conflict between two 'inner voices.' The 'productive voice' (goal, value, responsibility) vs. the 'resistance voice' (fear, exhaustion, anger). Two-chair technique: Seat each voice in a separate chair, create a dialogue between them. An externalized inner conflict has less power than one frozen in memory.",
    socraaticPrompt: "İçindeki iki sesi dinlersen — 'yapmak isteyen ses' ne söylüyor, 'yapmak istemeyen ses' ne söylüyor?",
    socraaticPromptEn: "If you listen to the two voices inside — what does the 'voice that wants to do it' say, and what does the 'voice that doesn't want to' say?",
    intervention: "İki sesi yaz: 'Yapmalıyım çünkü...' ve 'Yapmak istemiyorum çünkü...' — her ikisini de yazdıktan sonra, ortadan bir köprü kur.",
    interventionEn: "Write both voices: 'I should do this because...' and 'I don't want to do this because...' — after writing both, build a bridge from the middle.",
    source: "Perls, F. (1969). Gestalt Therapy Verbatim. Real People Press. Greenberg, L. (2010). Emotion-Focused Therapy. APA.",
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

// ─── Türkçe Morfoloji Yardımcısı ─────────────────────────────────────────────
// Türkçe eklerini soyarak kök formla eşleşme sağlar.
// Örnek: "başaramıyorum" → "başar" ile eşleşir
const TR_SUFFIXES = [
  "ıyorum","iyorum","uyorum","üyorum",
  "ıyor","iyor","uyor","üyor",
  "acak","ecek","acağım","eceğim",
  "mıyorum","miyorum","muyorum","müyorum",
  "amıyorum","emiyorum",
  "amadım","emedim",
  "amam","emem",
  "abilir","ebilir",
  "malıyım","meliyim",
  "ların","lerin","larım","lerim",
  "ların","lerin",
  "ımı","imi","umu","ümü",
  "dan","den","tan","ten",
  "da","de","ta","te",
  "ım","im","um","üm",
  "lar","ler",
  "mak","mek",
  "ma","me",
  "dı","di","du","dü","tı","ti","tu","tü",
  "yı","yi","yu","yü",
  "ı","i","u","ü",
  "a","e",
];

function trStem(word: string): string {
  for (const suffix of TR_SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, word.length - suffix.length);
    }
  }
  return word;
}

function trFuzzyMatch(inputWords: string[], keyword: string): boolean {
  const kwLower = keyword.toLowerCase();
  if (inputWords.some(w => w.includes(kwLower) || kwLower.includes(w))) return true;
  const kwStem = trStem(kwLower);
  return inputWords.some(w => {
    const wStem = trStem(w);
    return wStem.length >= 3 && kwStem.length >= 3 && (wStem === kwStem || wStem.startsWith(kwStem) || kwStem.startsWith(wStem));
  });
}

// ─── Chunk Retrieval ──────────────────────────────────────────────────────────

export function retrieveRelevantChunks(
  inputText: string,
  signal: ResistanceSignal,
  maxChunks = 3
): WikiChunk[] {
  const lower = inputText.toLowerCase();
  const inputWords = lower.split(/\s+/);

  const signalTheoryMap: Record<ResistanceSignal, string[]> = {
    avoidance:    ["ACT", "Pychyl", "Motivational Interviewing", "SDT", "Social Accountability", "Mindfulness", "Behavioral Activation", "TTM", "Emotion Regulation", "SFBT"],
    overwhelm:    ["TMT", "PSI", "Atomic Habits", "Flow", "Mindfulness", "CBT", "DBT", "Problem Solving", "Gestalt"],
    perfectionism:["Perfectionism", "ACT", "Kahneman", "CBT", "Bandura", "Growth Mindset", "Self-Compassion", "Person-Centered"],
    fear:         ["ACT", "Kahneman", "Pychyl", "CBT", "Bandura", "Growth Mindset", "Problem Solving", "Gestalt"],
    ambiguity:    ["TMT", "Implementation Intentions", "PSI", "WOOP", "Chronobiology", "Problem Solving", "SFBT", "Socratic Method"],
    low_energy:   ["PSI", "Pychyl", "Mindfulness", "Chronobiology", "SDT", "Rumination", "Behavioral Activation", "DBT", "Emotion Regulation"],
    shame:        ["Shame", "Active Listening", "Pychyl", "CBT", "Bandura", "Rumination", "Self-Compassion", "Person-Centered", "Gestalt"],
    boredom:      ["Boredom", "ACT", "Atomic Habits", "Flow", "Behavioral Economics", "Behavioral Activation", "SFBT"],
    neutral:      ["TMT", "Atomic Habits", "Socratic Method", "WOOP", "Implementation Intentions", "TTM", "Motivational Interviewing"],
  };

  const scored = WIKI_CHUNKS.map(chunk => {
    let score = 0;
    const allKeywords = [...chunk.keywords, ...chunk.keywordsEn];

    allKeywords.forEach(kw => {
      // Exact substring match (EN + short TR)
      if (lower.includes(kw.toLowerCase())) {
        score += 3;
      // Türkçe morfoloji eşleşmesi
      } else if (trFuzzyMatch(inputWords, kw)) {
        score += 2;
      }
    });

    // Sinyal-teori ağırlığı
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
    avoidance: "kaçınma / erteleme",
    overwhelm: "bunalmışlık / çok fazla şey var",
    perfectionism: "mükemmel olmak zorundayım hissi",
    fear: "başarısızlık veya yargılanma korkusu",
    ambiguity: "ne yapacağını bilmeme / belirsizlik",
    low_energy: "enerji ve istek eksikliği",
    shame: "utanç veya öz-yargı",
    boredom: "sıkılma / anlamsız bulma",
    neutral: "genel durum",
  };

  // Her fazda ne yapılacağı — kısa, net, model başını okur
  const phaseGoal: Record<ConversationPhase, string> = {
    discovery:
      "Kullanıcıyı tanı. Çözüm önerme henüz. Tek, açık uçlu bir soru sor — evet/hayır sorusu değil. Duyguyu nazikçe yansıt.",
    diagnosis:
      `Tespit: kullanıcıda ${signalDescriptions[signal]} var. Bunu nazikçe yansıt ve tek keskin Sokratik soru sor. Hipotez kur: "Şöyle mi oluyor: ...?" — kullanıcının doğrulamasına izin ver.`,
    planning:
      "Birlikte somut plan yap. 1-3 adım, her biri ≤15 dakika. Planı kullanıcıyla şekillendir, dayatma. 'Bunu nasıl buluyorsun?' diye sor.",
    followup:
      "Plan verildi. İlerlemeyi sor: 'İlk adımı denedin mi?' Zorlanmaları normalize et. Küçük ilerlemeleri kutla. Gerekirse planı güncelle.",
  };

  // En alakalı 2 chunk — teori adını kesinlikle ekleme, sadece içgörü + soru
  const chunkContext = chunks.slice(0, 2)
    .map(c => {
      const firstSentence = c.content.split(/[.!?]/)[0].trim();
      return `• ${firstSentence}. Soru önerisi: "${c.socraaticPrompt}"`;
    })
    .join("\n");

  const contextBlock = conversationSummary
    ? `BAĞLAM:\n${conversationSummary}\n\n`
    : "";

  return `Sen Pax Mentis — erteleme ve motivasyon konusunda destek olan, sıcak ve meraklı bir Sokratik mentor.

DİL KURALI — KESİN:
• Yalnızca Türkçe. Tek İngilizce kelime bile yasak.
• Tercih et: "tedirginlik" (anxiety değil), "gerilim" (tension değil), "iç ses" (inner voice değil), "yük" (burden değil), "kalıp" (pattern değil), "dürtü" (drive değil), "irade" (willpower değil).
• Konuşma dili: ama düzgün, aydın, samimi — ne kaba ne de robotik.

YASAK İFADELER:
• "Anlıyorum." ile başlama. "Harika!", "Tabii ki!", "Mükemmel!" yok.
• Teori/kavram adı: "TMT", "ACT", "Görev Tiksintisi", "Temporal Motivation" vb. yasak.
• "Bakıyoruz", "Burada görüyoruz", "Şunu fark ediyoruz" — klinisyen değil, insan ol.
• İki soru, uzun liste, vaaz, yargı yasak.

SES ÖRNEĞİ (böyle yaz):
✓ "Bu görevi düşündükçe içinde bir gerilim var gibi hissettiriyor bana. Tam olarak ne oluyor o an?"
✗ "Anlıyorum. Motivasyonunuzun düştüğü görülüyor. Task aversion belirtisi olabilir."

YANIT KURALLARI:
1. En fazla 2-3 kısa cümle.
2. Tam olarak 1 soru — ikinci soru yasak.
3. Kullanıcının SON mesajına doğrudan yanıt ver.
4. Aynı soruyu iki kez sorma.
5. Çözüm dayatma — önce dinle.

AŞAMA HEDEFİ: ${phaseGoal[phase]}

${contextBlock}PSİKOLOJİK ARAÇLAR (isim vermeden, doğal kullan):
${chunkContext || "Kullanıcıyı dinle, duyguyu yansıt."}`;
}
