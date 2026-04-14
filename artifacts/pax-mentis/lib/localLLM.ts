import AsyncStorage from "@react-native-async-storage/async-storage";

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

const MOCK_RESPONSES: Record<string, string[]> = {
  avoidance: [
    "Bunu fark etmek zaten cesaret ister. Şu an kaçmak istediğini hissediyorsun — bu çok insani. Peki bu görevin arkasında gerçekten ne var, seni zorlayan ne?",
    "Kaçınma isteği bir sinyal — beynin seni korumaya çalışıyor. Ama neye karşı? 2 dakika boyunca sadece bu soruyla kal.",
  ],
  overwhelm: [
    "Her şeyi birden görmek bunaltıcı hissettiriyor. Şu an için sadece bir sonraki adımın ne olduğunu düşün — tek bir adım.",
    "Zihnin çok fazla tab açık tutmuş. Hangisini şimdi kapatsan, biraz nefes alabilirsin?",
  ],
  perfectionism: [
    "Mükemmel yapmak yerine tamamlanmış bir şey çok daha değerli. Başlamak için ne kadar 'hazır' olman gerekiyor gerçekten?",
    "Mükemmeliyetçilik bazen korkunun kılık değiştirmesidir. Korku neyle ilgili olabilir?",
  ],
  fear: [
    "Korku bir tehdit değil, bir bilgi. Sana neyi söylüyor?",
    "En kötü senaryo gerçekleşse bile — sonra ne olur? Gerçekten dayanamayacağın bir şey mi?",
  ],
  ambiguity: [
    "Belirsizlik enerji tüketiyor. Şu an için sadece ilk 5 dakikalık adımı netleştirelim. O adım ne olurdu?",
    "Ne bilmediğini bilmek zaten bir başlangıç. Hangi soruyu cevaplayabilirsen devam edebilirsin?",
  ],
  low_energy: [
    "Yorgunluk gerçek — onu yadsımak işe yaramaz. Ama şu an 'yapamam' mı diyorsun yoksa 'yapmak istemiyorum' mu?",
    "Bedenin dinlenme istiyor. Bunu hak ediyorsun. Ama görev de bekliyor. İkisini nasıl dengeleyebilirsin?",
  ],
  neutral: [
    "Şu an nasıl hissediyorsun? Gerçekten nasıl?",
    "Bugün seni en çok ne düşündürüyor?",
    "Hangi görev üzerinde çalışmak istiyorsun — ve içinde buna karşı ne kadar direnç var?",
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

  async generateResponse(
    messages: LLMMessage[],
    resistanceSignal: string = "neutral",
    onToken?: (token: string) => void
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const signal = resistanceSignal as keyof typeof MOCK_RESPONSES;
    const responses = MOCK_RESPONSES[signal] || MOCK_RESPONSES.neutral;
    const response = responses[Math.floor(Math.random() * responses.length)];

    if (onToken) {
      const words = response.split(" ");
      for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 80));
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
  { id: "gemma-7b-it-q4", name: "Gemma 7B IT (Q4)", size: "4.1 GB", speed: "Orta", quality: "Çok İyi" },
  { id: "llama-3.2-3b-q4", name: "Llama 3.2 3B (Q4)", size: "1.8 GB", speed: "Hızlı", quality: "Çok İyi" },
  { id: "mistral-7b-q4", name: "Mistral 7B (Q4)", size: "4.1 GB", speed: "Orta", quality: "Mükemmel" },
];
