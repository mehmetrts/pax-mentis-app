import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConversationPhase } from "./wikiKnowledge";
import { modelManager, ModelStatus } from "./modelManager";

// ─── LLM Bridge ───────────────────────────────────────────────────────────────
//
// EXPO GO (geliştirme önizlemesi):
//   → Cihaz içi LLM native build gerektirir.
//   → Expo Go'da mock yanıtlar kullanılır.
//   → Model dosyası indirilebilir (expo-file-system), inferans için dev build gerekir.
//
// DEV BUILD (expo run:android):
//   → llama.rn kurulumu: pnpm add llama.rn
//   → Aşağıdaki yorum bloğunu açın ve mock kodunu kaldırın.
//   → Llama 3.2 3B Q4 (1.85 GB) önerilir — en iyi Türkçe desteği.
//
// LLAMA.RN ENTEGRASYONU (dev build için hazır):
// ─────────────────────────────────────────────
// import { LlamaContext, initLlama } from 'llama.rn';
//
// private llamaContext: LlamaContext | null = null;
//
// async loadModel(): Promise<boolean> {
//   const modelId = await modelManager.getActiveModelId();
//   if (!modelId) return false;
//   const modelPath = modelManager.getModelPath(modelId);
//   try {
//     this.llamaContext = await initLlama({
//       model: modelPath,
//       use_mlock: true,
//       n_ctx: 2048,
//       n_gpu_layers: 1, // Snapdragon NPU için
//     });
//     this.status = 'loaded';
//     return true;
//   } catch (e) {
//     this.status = 'error';
//     return false;
//   }
// }
//
// async generateResponse(messages, signal, onToken, phase) {
//   if (!this.llamaContext) return this.mockResponse(phase);
//   const result = await this.llamaContext.completion({
//     messages,
//     n_predict: 512,
//     temperature: 0.7,
//     top_p: 0.9,
//     onToken: ({ token }) => onToken?.(token),
//   });
//   return result.text;
// }

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMConfig {
  modelId: string;
  maxTokens: number;
  temperature: number;
  contextLength: number;
}

const DEFAULT_CONFIG: LLMConfig = {
  modelId: "llama-3.2-3b-q4",
  maxTokens: 512,
  temperature: 0.7,
  contextLength: 2048,
};

const CONFIG_KEY = "@pax_mentis:llm_config";

// ─── Faz bazlı mock yanıtlar (Expo Go fallback) ────────────────────────────────
const PHASE_RESPONSES: Record<ConversationPhase, string[]> = {
  discovery: [
    "Bunu benimle paylaşman güzel. Biraz daha anlamak istiyorum — bu durum ne zamandan beri böyle?",
    "Duyuyorum seni. Peki tam olarak ne oluyor içinde, bunu düşündüğünde?",
    "Anlıyorum. Bu görev sana nasıl hissettiriyor — söylersen daha iyi anlayabilirim.",
    "Buradayım. Bu konuda ne zamandır bu şekilde hissediyorsun?",
  ],
  diagnosis: [
    "Söylediklerinden bir şey dikkatimi çekti — bu görevi düşündüğünde beynin seni nereye götürüyor, geçmişe mi yoksa geleceğe mi?",
    "Şunu merak ediyorum: Bu görevi ertelemek sana anlık bir rahatlama veriyor mu, yoksa tam tersi mi?",
    "Seni durduran şey görevin kendisi mi, yoksa başarısız olma ihtimali mi?",
    "Eğer bu görevi yapamazsam diye düşündüğünde, aslında ne yaşanmasından korkuyorsun?",
  ],
  planning: [
    "Seninle somut bir plan yapmak istiyorum. Bugün için sadece üç adım — ilki sadece 10 dakika. Bunun nasıl görünmesini istersin?",
    "Anlattıklarından yola çıkarak bir şey önerebilirim. Önce en küçük adımı belirleyelim — yarın sabah 5 dakika bu işe ayırsan, o 5 dakikada ne yapardın?",
    "Bir çerçeve sunmak istiyorum: Bugün için tek bir hedef, tek bir zaman, tek bir ortam. Hangi saat sana en uygun gelir?",
  ],
  followup: [
    "Geçen seferden beri nasıl gidiyor? İlk adımı denedin mi?",
    "O planı düşündüğünde ne hissediyorsun şu an — daha yakın mı hissettiriyor?",
    "Küçük de olsa bir ilerleme oldu mu? Bana anlat.",
  ],
};

export class LocalLLMBridge {
  private config: LLMConfig;
  private _status: ModelStatus = "not_downloaded";
  private _loadError: string | null = null;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  get status(): ModelStatus {
    return this._status;
  }

  get isLoaded(): boolean {
    return this._status === "loaded";
  }

  get loadError(): string | null {
    return this._loadError;
  }

  async initialize(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(CONFIG_KEY);
      if (saved) this.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };

      const activeId = await modelManager.getActiveModelId();
      if (!activeId) {
        this._status = "not_downloaded";
        return;
      }

      const modelStatus = await modelManager.getModelStatus(activeId);
      if (modelStatus === "ready") {
        // llama.rn mevcut değil (Expo Go) → mock modunda bekle
        this._status = "ready";
        // TODO: llama.rn ile: this._status = 'loading'; await this.loadModel();
      } else {
        this._status = modelStatus;
      }
    } catch {
      this._status = "error";
    }
  }

  async saveConfig(updates: Partial<LLMConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
  }

  getConfig(): LLMConfig {
    return this.config;
  }

  /**
   * Yanıt üretir.
   * - Expo Go: mock yanıt (faz uyumlu)
   * - Dev build + llama.rn: gerçek model inferansı
   */
  async generateResponse(
    messages: LLMMessage[],
    resistanceSignal: string = "neutral",
    onToken?: (token: string) => void,
    phase: ConversationPhase = "discovery"
  ): Promise<string> {
    // ─── llama.rn ile değiştir (dev build) ─────────────
    // if (this.llamaContext) {
    //   return this.runInference(messages, onToken);
    // }

    // ─── Expo Go Mock ────────────────────────────────────
    const delay = 500 + Math.random() * 800;
    await new Promise(r => setTimeout(r, delay));

    const pool = PHASE_RESPONSES[phase];
    const response = pool[Math.floor(Math.random() * pool.length)];

    if (onToken) {
      const words = response.split(" ");
      for (const word of words) {
        await new Promise(r => setTimeout(r, 35 + Math.random() * 55));
        onToken(word + " ");
      }
    }

    return response.trim();
  }
}

export const llmBridge = new LocalLLMBridge();

// Alias for backwards compat
export const MODEL_OPTIONS = [
  { id: "llama-3.2-3b-q4", name: "Llama 3.2 3B (Q4_K_M)", size: "1.85 GB", speed: "Hızlı", quality: "Çok İyi", recommended: true },
  { id: "gemma-3-4b-q4", name: "Gemma 3 4B (Q4_K_M)", size: "2.5 GB", speed: "Orta", quality: "Çok İyi", recommended: false },
];
