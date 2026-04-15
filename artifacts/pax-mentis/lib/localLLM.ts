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
        await this.loadModel(activeId);
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
      discovery: 0.80,  // Açık, keşifçi, doğal
      diagnosis: 0.72,  // Analitik ama sıcak
      planning:  0.62,  // Somut, kararlı, düşük halüsinasyon
      followup:  0.68,  // Destekleyici ama odaklı
    };
    return temps[phase] ?? this.config.temperature;
  }

  private async _runInference(
    messages: LLMMessage[],
    onToken?: (token: string) => void,
    phase: ConversationPhase = "discovery"
  ): Promise<string> {
    try {
      const result = await this.llamaContext.completion(
        {
          messages,
          n_predict: this.config.maxTokens,
          temperature: this._phaseTemperature(phase),
          top_p: this.config.topP,
          min_p: 0.05,            // Saçma token olasılığını kes
          repeat_penalty: 1.15,   // Robotik tekrarları azalt
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
        (data: { token: string }) => {
          onToken?.(data.token);
        }
      );
      return (result?.text ?? "").trim();
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
