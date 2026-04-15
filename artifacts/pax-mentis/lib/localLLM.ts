import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConversationPhase } from "./wikiKnowledge";
import { modelManager, MODEL_CATALOG, ModelStatus } from "./modelManager";

// ─── llama.rn dinamik import ───────────────────────────────────────────────────
// Expo Go'da llama.rn native modülü mevcut değil — try/catch ile güvenli yükleme.
// Dev build (expo run:android) kurulduktan sonra otomatik aktive olur.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _initLlama: ((params: any) => Promise<any>) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  _initLlama = require("llama.rn").initLlama;
} catch {
  // Expo Go veya web — mock modunda çalış
}

export const IS_LLM_NATIVE_AVAILABLE = _initLlama !== null;

// ─── Türkçe post-processing ────────────────────────────────────────────────────
// Küçük modellerin İngilizce/Türkçe karıştırması durumunda sık hata yapılan
// kelimeler Türkçe karşılıklarıyla değiştirilir.
const EN_TR_MAP: [RegExp, string][] = [
  // Zaman / miktar
  [/\bfew\b/gi,             "birkaç"],
  [/\bsome\b/gi,            "bazı"],
  [/\bjust\b/gi,            "sadece"],
  [/\brecently\b/gi,        "son zamanlarda"],
  [/\btoday\b/gi,           "bugün"],
  [/\btomorrow\b/gi,        "yarın"],
  [/\bnow\b/gi,             "şimdi"],
  [/\balways\b/gi,          "her zaman"],
  [/\boften\b/gi,           "sık sık"],
  [/\bnever\b/gi,           "asla"],
  // Psikoloji / erteleme terimleri
  [/\bmotivation\b/gi,      "motivasyon"],
  [/\bfocus\b/gi,           "odak"],
  [/\bchallenge\b/gi,       "zorluk"],
  [/\bgoals?\b/gi,          "hedef"],
  [/\btasks?\b/gi,          "görev"],
  [/\bprocrastination\b/gi, "erteleme"],
  [/\bstress\b/gi,          "stres"],
  [/\bperfect\b/gi,         "mükemmel"],
  [/\bperfectionism\b/gi,   "mükemmeliyetçilik"],
  [/\benergy\b/gi,          "enerji"],
  [/\bactions?\b/gi,        "eylem"],
  [/\bplans?\b/gi,          "plan"],
  [/\bsupport\b/gi,         "destek"],
  [/\bprimary\b/gi,         "asıl"],
  [/\bsecondary\b/gi,       "ikincil"],
  [/\bprocess\b/gi,         "süreç"],
  [/\bprogress\b/gi,        "ilerleme"],
  [/\bfeedback\b/gi,        "geri bildirim"],
  [/\bstrategy\b/gi,        "yöntem"],
  [/\bsession\b/gi,         "sohbet"],
  [/\bmindset\b/gi,         "bakış açısı"],
  [/\bresistance\b/gi,      "direnç"],
  [/\bcourage\b/gi,         "cesaret"],
  [/\bcompassion\b/gi,      "şefkat"],
  [/\bawareness\b/gi,       "farkındalık"],
  [/\bcomfort\b/gi,         "rahatlık"],
  [/\btriggers?\b/gi,       "tetikleyici"],
  [/\bpatterns?\b/gi,       "kalıp"],
  [/\bhabits?\b/gi,         "alışkanlık"],
  [/\bcommitment\b/gi,      "kararlılık"],
  [/\bidentity\b/gi,        "kimlik"],
  [/\bsteps?\b/gi,          "adım"],
  [/\bblocking\b/gi,        "engelleyen"],
  [/\bavoidance\b/gi,       "kaçınma"],
  [/\boverwhelm\b/gi,       "bunalmışlık"],
  [/\bperfectionist\b/gi,   "mükemmeliyetçi"],
  [/\bimpossible\b/gi,      "imkânsız"],
  [/\bdifficult\b/gi,       "zor"],
  [/\bimportant\b/gi,       "önemli"],
  [/\bspecific\b/gi,        "belirli"],
  [/\bsimple\b/gi,          "basit"],
  [/\bsmall\b/gi,           "küçük"],
  [/\bclear\b/gi,           "net"],
  [/\bmeaningful\b/gi,      "anlamlı"],
  [/\bintention\b/gi,       "niyet"],
  [/\bemotions?\b/gi,       "duygu"],
  [/\bfeelings?\b/gi,       "his"],
  [/\bthoughts?\b/gi,       "düşünce"],
  [/\bbreaks?\b/gi,         "mola"],
  [/\bdeadlines?\b/gi,      "son tarih"],
  [/\bprioritize\b/gi,      "önceliklendir"],
  [/\bovercome\b/gi,        "aş"],
  // Ruhsal/psikolojik doğal Türkçe
  [/\banxiety\b/gi,         "tedirginlik"],
  [/\btension\b/gi,         "gerilim"],
  [/\bdrive\b/gi,           "dürtü"],
  [/\bsuppressed?\b/gi,     "bastırılmış"],
  [/\bsuppression\b/gi,     "bastırma"],
  [/\binner\b/gi,           "iç"],
  [/\bbalance\b/gi,         "denge"],
  [/\binsight\b/gi,         "içgörü"],
  [/\bpotential\b/gi,       "gizilgüç"],
  [/\bunconscious\b/gi,     "bilinçdışı"],
  [/\bself[\s-]compassion\b/gi, "öz-şefkat"],
  [/\bself[\s-]criticism\b/gi,  "öz-eleştiri"],
  [/\binternalize\b/gi,     "içselleştir"],
  [/\bintegrate\b/gi,       "bütünleştir"],
  [/\bconflict\b/gi,        "çatışma"],
  [/\binstinct\b/gi,        "içgüdü"],
  [/\bwillpower\b/gi,       "irade"],
  [/\bsense of control\b/gi,"kontrol duygusu"],
  [/\bpurpose\b/gi,         "amaç"],
  [/\bvalue\b/gi,           "değer"],
  [/\bblock(ed|ing)?\b/gi,  "tıkanma"],
  [/\bstruggle\b/gi,        "mücadele"],
  [/\bburden\b/gi,          "yük"],
  [/\brelief\b/gi,          "rahatlama"],
  [/\bpause\b/gi,           "duraksamak"],
  [/\broot cause\b/gi,      "asıl neden"],
  [/\bsymptom\b/gi,         "belirti"],
  [/\bloop\b/gi,            "döngü"],
  [/\bcycle\b/gi,           "kısır döngü"],
  // Türk araştırma literatüründen doğal terimler
  [/\bresilience\b/gi,      "psikolojik sağlamlık"],
  [/\bcognitive flexibility\b/gi, "bilişsel esneklik"],
  [/\bcoping strategies?\b/gi,   "başa çıkma yolları"],
  [/\bcoping\b/gi,          "baş etme"],
  [/\bemotion regulation\b/gi,   "duygu düzenleme"],
  [/\bself-efficacy\b/gi,   "öz yeterlilik"],
  [/\bprocrastinator\b/gi,  "erteleyen kişi"],
  [/\bavoidant\b/gi,        "kaçınan"],
  [/\btask aversion\b/gi,   "görev tiksinmesi"],
  [/\bdiscomfort\b/gi,      "rahatsızlık"],
  [/\bdiscomfort tolerance\b/gi, "rahatsızlığa dayanma"],
  [/\btemptation\b/gi,      "cazibeye kapılma"],
  [/\bimpulse\b/gi,         "dürtü"],
  [/\bself-regulation\b/gi, "öz düzenleme"],
  [/\bsetback\b/gi,         "aksaklık"],
  [/\bpersistence\b/gi,     "kararlı devam"],
  [/\bmindfulness\b/gi,     "şimdiki an farkındalığı"],
  [/\bacceptance\b/gi,      "kabul"],
  [/\bvulnerability\b/gi,   "kırılganlık"],
  [/\brecovery\b/gi,        "toparlanma"],
  [/\bgrowth\b/gi,          "büyüme"],
];

function applyTurkishCorrections(text: string): string {
  // Qwen3 "thinking" bloklarını çıkar (<think>...</think>)
  let out = text.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
  // Boş think açılışlarını da çıkar
  out = out.replace(/<think>\s*/g, "").replace(/<\/think>\s*/g, "");

  // ── Yasaklı açılış ifadelerini sil ─────────────────────────────────────────
  // Sistem prompt yasaklamasına rağmen modeller bunları üretiyor — post-process güvence
  out = out.replace(/^(Anlıyorum|Tabii ki|Elbette|Kesinlikle|Harika|Mükemmel)[.!,]?\s*/i, "");
  out = out.replace(/^(I understand|Of course|Certainly|Absolutely|Great|Sure)[.!,]?\s*/i, "");

  // ── "ya da" çift soru kalıbını düzelt ──────────────────────────────────────
  // "ne hissediyorsun ya da ne düşünüyorsun?" → sadece ilk soruyu bırak
  // Yalnızca cümle sonundaki "ya da <alternatif soru>" kesimini kaldır
  out = out.replace(/\s+ya da\s+[^.!?]*\?(\s*)$/, "?$1");

  // ── "siz" formlarını "sen" formuna çevir ───────────────────────────────────
  // Çoğul emir veya geniş zaman ekleri
  out = out.replace(/\b(bakabilirsiniz|yapabilirsiniz|edebilirsiniz|atabilirsiniz|görebilirsiniz|deneyebilirsiniz|söyleyebilirsiniz)\b/g,
    (m) => m.replace("siniz", "sin"));
  out = out.replace(/\b(bulunduruyorsunuz|düşünüyorsunuz|hissediyorsunuz|söylüyorsunuz)\b/g,
    (m) => m.replace("sunuz", "sun").replace("sunuz", "sun"));

  for (const [re, tr] of EN_TR_MAP) {
    out = out.replace(re, tr);
  }
  return out.trim();
}

// ─── Tipler ───────────────────────────────────────────────────────────────────

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMConfig {
  modelId: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  contextLength: number;
  nGpuLayers: number;
}

const DEFAULT_CONFIG: LLMConfig = {
  modelId: "llama-3.2-3b-q4",
  maxTokens: 280,
  temperature: 0.72,
  topP: 0.9,
  contextLength: 2048, // Samsung S23 Ultra 12GB RAM — 2048 güvenli ve yeterli
  nGpuLayers: 0,
};

const CONFIG_KEY = "@pax_mentis:llm_config";

// ─── Faz bazlı mock yanıtlar (Expo Go fallback) ────────────────────────────────
const PHASE_RESPONSES: Record<ConversationPhase, string[]> = {
  discovery: [
    "Bunu benimle paylaşman güzel. Biraz daha anlamak istiyorum — bu durum ne zamandan beri böyle?",
    "Duyuyorum seni. Peki tam olarak ne oluyor içinde, bunu düşündüğünde?",
    "Buradayım. Bu görev sana nasıl hissettiriyor — söylersen daha iyi anlayabilirim.",
    "Anlat bana. Bu konuda ne zamandır böyle hissediyorsun?",
  ],
  diagnosis: [
    "Söylediklerinden bir şey dikkatimi çekti — bu görevi düşündüğünde beynin seni nereye götürüyor, geçmişe mi yoksa geleceğe mi?",
    "Şunu merak ediyorum: Bu görevi ertelemek sana anlık bir rahatlama veriyor mu, yoksa tam tersi mi?",
    "Seni durduran şey görevin kendisi mi, yoksa başarısız olma ihtimali mi?",
    "Eğer bu görevi yapamazsam diye düşündüğünde, aslında ne yaşanmasından endişeleniyorsun?",
  ],
  planning: [
    "Seninle somut bir plan yapmak istiyorum. Bugün için sadece üç adım — ilki sadece 10 dakika. Bunun nasıl görünmesini istersin?",
    "Anlattıklarından yola çıkarak bir şey önerebilirim. Önce en küçük adımı belirleyelim — şu an 5 dakika bu işe ayırsan, ne yapardın?",
    "Bir çerçeve sunmak istiyorum: Bugün için tek bir hedef, tek bir zaman, tek bir ortam. Hangi saat sana en uygun gelir?",
  ],
  followup: [
    "Geçen seferden beri nasıl gidiyor? İlk adımı denedin mi?",
    "O planı düşündüğünde ne hissediyorsun şu an — daha yakın mı hissettiriyor?",
    "Küçük de olsa bir ilerleme oldu mu? Bana anlat.",
  ],
};

// ─── LLM Bridge ───────────────────────────────────────────────────────────────

export class LocalLLMBridge {
  private config: LLMConfig;
  private _status: ModelStatus = "not_downloaded";
  private _loadError: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private llamaContext: any = null;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  get status(): ModelStatus { return this._status; }
  get isLoaded(): boolean { return this._status === "loaded"; }
  get loadError(): string | null { return this._loadError; }
  get isNativeAvailable(): boolean {
    return IS_LLM_NATIVE_AVAILABLE && !this._initLlamaUnavailable;
  }

  async initialize(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = {
          ...DEFAULT_CONFIG,
          ...parsed,
          // contextLength: 2048'i aşmasın — S23 Ultra 12GB için optimum
          contextLength: Math.min(parsed.contextLength ?? DEFAULT_CONFIG.contextLength, 2048),
          nGpuLayers: 0, // Her zaman CPU-only
        };
      }

      let activeId = await modelManager.getActiveModelId();

      // Aktif model dosyası gerçekten var mı kontrol et
      if (activeId) {
        const activeStatus = await modelManager.getModelStatus(activeId);
        if (activeStatus !== "ready") {
          // Aktif model dosyası yok — tüm katalogda indirilmiş model ara
          activeId = null;
          for (const m of MODEL_CATALOG) {
            const s = await modelManager.getModelStatus(m.id);
            if (s === "ready") {
              activeId = m.id;
              await modelManager.setActiveModelId(m.id);
              break;
            }
          }
        }
      }

      if (!activeId) {
        this._status = "not_downloaded";
        return;
      }

      if (_initLlama) {
        await this.loadModelSafe(activeId);
      } else {
        this._status = "ready"; // Expo Go: model var ama native modül yok
      }
    } catch {
      this._status = "error";
    }
  }

  async loadModel(modelId?: string): Promise<boolean> {
    if (!_initLlama || this._initLlamaUnavailable) {
      this._loadError = "Native modül mevcut değil (Expo Go veya JSI eksik APK)";
      return false;
    }

    const id = modelId ?? (await modelManager.getActiveModelId());
    if (!id) return false;

    // Dosyanın gerçekten var olduğunu kontrol et
    const fileStatus = await modelManager.getModelStatus(id);
    if (fileStatus !== "ready") {
      this._loadError = `Model dosyası bulunamadı: ${id}`;
      this._status = "not_downloaded";
      return false;
    }

    const modelPath = modelManager.getModelPath(id);
    this._status = "loading";
    this._loadError = null;

    try {
      // Android güvenli parametreler — use_mlock ve use_metal Android'de çökmeye yol açar
      this.llamaContext = await _initLlama({
        model: modelPath,
        n_ctx: this.config.contextLength,
        n_gpu_layers: this.config.nGpuLayers,
      });
      this._status = "loaded";
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[LLM] loadModel failed:", msg);

      if (msg.includes("JSI bindings not installed") || msg.includes("JSI")) {
        // APK llama.rn native kodu içermiyor — EAS dev build yeniden derlenmeli
        // Demo moduna düş, "Hata" yerine "Model Yok" göster
        this._initLlamaUnavailable = true;
        this._status = "not_downloaded";
        this._loadError = "Bu APK llama.rn native modülünü içermiyor. Lütfen EAS dev build'i yeniden derle: cd artifacts/pax-mentis && eas build --profile development --platform android";
      } else {
        this._status = "error";
        this._loadError = msg;
      }
      return false;
    }
  }

  private _initLlamaUnavailable = false;
  private _loadingPromise: Promise<boolean> | null = null;

  // Çift yüklemeyi önler — aynı anda iki kez initLlama çağrılmaz
  async loadModelSafe(modelId?: string): Promise<boolean> {
    if (this._loadingPromise) return this._loadingPromise;
    this._loadingPromise = this.loadModel(modelId).finally(() => {
      this._loadingPromise = null;
    });
    return this._loadingPromise;
  }

  async unloadModel(): Promise<void> {
    if (this.llamaContext) {
      try {
        await this.llamaContext.release();
      } catch {}
      this.llamaContext = null;
    }
    this._status = "ready";
  }

  async saveConfig(updates: Partial<LLMConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
  }

  getConfig(): LLMConfig { return this.config; }

  /**
   * Ana yanıt üretici.
   * - Dev build + model yüklü: llama.rn ile gerçek inferans (streaming destekli)
   * - Expo Go / model yok:  bağlam-duyarlı mock yanıt
   */
  async generateResponse(
    messages: LLMMessage[],
    _resistanceSignal: string = "neutral",
    onToken?: (token: string) => void,
    phase: ConversationPhase = "discovery"
  ): Promise<string> {
    // Model yükleniyorsa tamamlanmasını bekle (race condition önleme)
    if (this._loadingPromise) {
      await this._loadingPromise;
    }

    if (this.llamaContext) {
      return this._runInference(messages, onToken, phase);
    }
    return this._mockResponse(phase, onToken, messages);
  }

  // Son kullanıcı mesajının içeriğini al
  private _lastUserText(messages: LLMMessage[]): string {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content.trim().toLowerCase();
    }
    return "";
  }

  // Faz bazlı sıcaklık: Keşif fazı yaratıcı/açık → planning daha kararlı
  private _phaseTemperature(phase: ConversationPhase): number {
    const temps: Record<ConversationPhase, number> = {
      discovery: 0.70,  // Düşük → halüsinasyon azalır (Qwen/Llama için kritik)
      diagnosis: 0.65,  // Analitik, odaklı
      planning:  0.55,  // Somut, kararlı
      followup:  0.60,  // Destekleyici ama odaklı
    };
    return temps[phase] ?? this.config.temperature;
  }

  private async _runInference(
    messages: LLMMessage[],
    onToken?: (token: string) => void,
    phase: ConversationPhase = "discovery"
  ): Promise<string> {
    try {
      const isQwen3 = this.config.modelId?.startsWith("qwen3");

      // Qwen3: sistem mesajına /no_think bayrağı ekle — resmi thinking-off yöntemi.
      // Pre-fill tekniği llama.rn'de çalışmıyor: tamamlanmış mesaj görülüyor,
      // model yeni turn başlatıp yeniden düşünüyor.
      const finalMessages = isQwen3
        ? messages.map((m) =>
            m.role === "system"
              ? { ...m, content: m.content + "\n/no_think" }
              : m
          )
        : messages;

      // Qwen3 streaming: <think>...</think> token'ları UI'a ulaşmasın.
      // Kalan bloklar applyTurkishCorrections'da da temizlenir (çift güvence).
      let thinkDepth = 0;
      const filteredOnToken = isQwen3 && onToken
        ? (data: { token: string }) => {
            const t = data.token;
            if (t.includes("<think>")) { thinkDepth++; return; }
            if (t.includes("</think>")) { thinkDepth = Math.max(0, thinkDepth - 1); return; }
            if (thinkDepth > 0) return;
            onToken(t);
          }
        : onToken
          ? (data: { token: string }) => onToken(data.token)
          : undefined;

      const result = await this.llamaContext.completion(
        {
          messages: finalMessages,
          n_predict: this.config.maxTokens,
          temperature: this._phaseTemperature(phase),
          top_p: this.config.topP,
          top_k: 40,              // En olası 40 token içinde kal — garble azalır
          min_p: 0.08,            // Saçma token olasılığını daha agresif kes
          repeat_penalty: 1.15,
          stop: [
            "<|eot_id|>",
            "<|end_of_text|>",
            "<end_of_turn>",      // Gemma stop token
            "<|im_end|>",         // Qwen stop token
            "User:",
            "Kullanıcı:",
            "\n\n\n",
          ],
        },
        filteredOnToken
      );
      const raw = (result?.text ?? "").trim();
      return applyTurkishCorrections(raw);
    } catch (e: unknown) {
      this._loadError = e instanceof Error ? e.message : "İnferans hatası";
      return this._fallbackError();
    }
  }

  private async _mockResponse(
    phase: ConversationPhase,
    onToken?: (token: string) => void,
    messages: LLMMessage[] = []
  ): Promise<string> {
    const delay = 400 + Math.random() * 600;
    await new Promise(r => setTimeout(r, delay));

    const lastMsg = this._lastUserText(messages);
    let response: string;

    // Selamlama tespiti
    const greetingWords = ["merhaba", "selam", "hey", "iyi günler", "günaydın", "hello", "hi"];
    const isGreeting = greetingWords.some(g => lastMsg.startsWith(g)) && lastMsg.length < 25;

    // Anlamama / tekrar sorma tespiti
    const confusionWords = ["anlamadım", "ne demek", "nasıl yani", "anlat", "açıkla", "ne diyorsun", "neyi"];
    const isConfused = confusionWords.some(w => lastMsg.includes(w));

    if (isGreeting) {
      response = "Merhaba! Bugün seni buraya ne getirdi — üzerinde düşündüğün bir şey mi var?";
    } else if (isConfused) {
      response = "Haklısın, daha net anlatayım. Seni en çok ne durduruyor şu an — bunu biraz daha açabilir misin?";
    } else {
      const pool = PHASE_RESPONSES[phase];
      response = pool[Math.floor(Math.random() * pool.length)];
    }

    if (onToken) {
      const words = response.split(" ");
      for (const word of words) {
        await new Promise(r => setTimeout(r, 25 + Math.random() * 45));
        onToken(word + " ");
      }
    }

    return response.trim();
  }

  private _fallbackError(): string {
    return "Bir sorun oluştu. Lütfen tekrar dene.";
  }
}

export const llmBridge = new LocalLLMBridge();

export const MODEL_OPTIONS = [
  {
    id: "llama-3.2-3b-q4",
    name: "Llama 3.2 3B (Q4_K_M)",
    size: "1.85 GB",
    speed: "Hızlı",
    quality: "Çok İyi",
    recommended: true,
  },
  {
    id: "qwen-2.5-3b-q4",
    name: "Qwen 2.5 3B (Q4_K_M)",
    size: "1.99 GB",
    speed: "Hızlı",
    quality: "Çok İyi",
    recommended: false,
  },
];
