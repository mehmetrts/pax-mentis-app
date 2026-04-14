import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConversationPhase } from "./wikiKnowledge";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMConfig {
  modelName: string;
  maxTokens: number;
  temperature: number;
}

const DEFAULT_CONFIG: LLMConfig = {
  modelName: "gemma-2b-it-q4",
  maxTokens: 512,
  temperature: 0.7,
};

// ─── Faz bazlı mock yanıtlar ─────────────────────────────────────────────────
// Gerçek LLM entegre edildiğinde bu kısım tamamen kaldırılır.
// Sistem prompt'u her fazda LLM'e iletilir — LLM o kurallara göre üretir.
const PHASE_MOCK_RESPONSES: Record<ConversationPhase, string[]> = {
  discovery: [
    "Bunu benimle paylaşman güzel. Biraz daha anlamak istiyorum — bu durum ne zamandan beri böyle?",
    "Duyuyorum seni. Peki tam olarak ne oluyor içinde, bunu düşündüğünde?",
    "Anlıyorum. Bu görev sana nasıl hissettiriyor — söylersen daha iyi anlayabilirim.",
    "Buradayım. Bu konuda ne zamandır bu şekilde hissediyorsun?",
  ],
  diagnosis: [
    "Söylediklerinden bir şey dikkatimi çekti — bu görevi düşündüğünde beynin seni nereye götürüyor, geçmişe mi yoksa geleceğe mi?",
    "Şunu merak ediyorum: Bu görevi ertelemek sana anlık bir rahatlama veriyor mu, yoksa tam tersi mi?",
    "İlginç. Seni durduran şey görevin kendisi mi, yoksa başarısız olma ihtimali mi?",
    "Bir adım geri çekilelim — eğer bu görevi yapamazsam diye düşündüğünde, aslında ne yaşanmasından korkuyorsun?",
  ],
  planning: [
    "Seninle birlikte somut bir plan yapmak istiyorum. Şu an için sadece üç adım: ilki sadece 10 dakika. Bunun nasıl görünmesini istersin?",
    "Anlattıklarından yola çıkarak bir şey önerebilirim. Önce en küçük adımı belirleyelim — yarın sabah sadece 5 dakika bu işe ayırsan, o 5 dakikada ne yapardın?",
    "Sana bir çerçeve sunmak istiyorum: Bugün için tek bir hedef, tek bir zaman, tek bir ortam. Hangi saat sana en uygun gelir?",
  ],
  followup: [
    "Geçen seferden beri nasıl gidiyor? İlk adımı denedin mi?",
    "O planı düşündüğünde ne hissediyorsun şu an — daha yakın mı hissettiriyor?",
    "Küçük de olsa bir ilerleme oldu mu? Bana anlat.",
  ],
};

export class LocalLLMBridge {
  private config: LLMConfig;
  private isModelLoaded: boolean = false;
  private modelLoadError: string | null = null;

  constructor(config?: Partial<LLMConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async loadModel(): Promise<boolean> {
    try {
      const savedConfig = await AsyncStorage.getItem("llm_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed };
      }
      this.isModelLoaded = true;
      return true;
    } catch {
      this.modelLoadError = "Model yüklenemedi";
      return false;
    }
  }

  isLoaded(): boolean {
    return this.isModelLoaded;
  }

  getLoadError(): string | null {
    return this.modelLoadError;
  }

  getConfig(): LLMConfig {
    return this.config;
  }

  /**
   * Yanıt üretir.
   * - Gerçek LLM entegre edildiğinde: messages[0].content sistem prompt'u içerir
   *   ve LLM o talimatlara göre üretim yapar. Bu mock ise faz bilgisini
   *   signals parametresinden alıp faz uyumlu cevap döner.
   * - onToken callback'i streaming simülasyonu için kullanılır.
   */
  async generateResponse(
    messages: LLMMessage[],
    resistanceSignal: string = "neutral",
    onToken?: (token: string) => void,
    phase: ConversationPhase = "discovery"
  ): Promise<string> {
    // Gerçekçi gecikme simülasyonu
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 900));

    const responses = PHASE_MOCK_RESPONSES[phase];
    const response = responses[Math.floor(Math.random() * responses.length)];

    if (onToken) {
      const words = response.split(" ");
      for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 60));
        onToken(word + " ");
      }
    }

    return response;
  }

  async saveConfig(config: Partial<LLMConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await AsyncStorage.setItem("llm_config", JSON.stringify(this.config));
  }
}

export const llmBridge = new LocalLLMBridge();

export const MODEL_OPTIONS = [
  { id: "gemma-2b-it-q4", name: "Gemma 2B IT (Q4)", size: "1.4 GB", speed: "Hızlı", quality: "İyi" },
  { id: "llama-3.2-3b-q4", name: "Llama 3.2 3B (Q4)", size: "1.8 GB", speed: "Hızlı", quality: "Çok İyi" },
  { id: "gemma-3-4b-q4", name: "Gemma 3 4B (Q4)", size: "2.5 GB", speed: "Orta", quality: "Çok İyi" },
  { id: "mistral-7b-q4", name: "Mistral 7B (Q4)", size: "4.1 GB", speed: "Orta", quality: "Mükemmel" },
];
