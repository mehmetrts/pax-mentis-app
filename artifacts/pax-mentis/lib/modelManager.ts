import AsyncStorage from "@react-native-async-storage/async-storage";
// expo-file-system v19 uses new Directory/File API; legacy import for GGUF download support
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FileSystem = require("expo-file-system/legacy") as typeof import("expo-file-system/legacy");

// ─── Model Yöneticisi ─────────────────────────────────────────────────────────
// Llama 3.2 / Gemma modellerinin cihaza indirilmesi ve yönetimi.
// Gerçek inferans için llama.rn gerekir (expo run:android / dev build).
// Bu yönetici model dosyasını indirir ve önbelleğe alır.

export type ModelStatus =
  | "not_downloaded" // Model hiç indirilmedi
  | "downloading"   // İndiriliyor (progress 0-100)
  | "ready"         // İndirildi, llama.rn yüklemesini bekliyor
  | "loading"       // llama.rn yüklüyor (native init)
  | "loaded"        // Çalışmaya hazır
  | "error";        // Hata

export interface ModelConfig {
  id: string;
  name: string;
  downloadUrl: string;
  sizeMB: number;
  description: string;
  recommended: boolean;
}

export const MODEL_CATALOG: ModelConfig[] = [
  {
    id: "llama-3.2-3b-q4",
    name: "Llama 3.2 3B (Q4_K_M)",
    downloadUrl: "https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf",
    sizeMB: 1850,
    description: "En iyi Türkçe desteği — hızlı, kompakt",
    recommended: true,
  },
  {
    id: "qwen-2.5-3b-q4",
    name: "Qwen 2.5 3B (Q4_K_M)",
    downloadUrl: "https://huggingface.co/bartowski/Qwen2.5-3B-Instruct-GGUF/resolve/main/Qwen2.5-3B-Instruct-Q4_K_M.gguf",
    sizeMB: 1990,
    description: "Çok dilli güç — Türkçe dahil 29 dil",
    recommended: false,
  },
  {
    id: "qwen3-4b-q4",
    name: "Qwen 3 4B (Q4_K_M)",
    downloadUrl: "https://huggingface.co/unsloth/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf",
    sizeMB: 2500,
    description: "En yeni Qwen3 — derin düşünme, güçlü Türkçe (2.5 GB)",
    recommended: false,
  },
];

const MODEL_DIR = FileSystem.documentDirectory + "llm_models/";
const ACTIVE_MODEL_KEY = "@pax_mentis:active_model_id";

export interface DownloadProgress {
  totalBytes: number;
  downloadedBytes: number;
  percent: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DownloadResumableRef = any;

class ModelManagerClass {
  private downloadResumables: Map<string, DownloadResumableRef> = new Map();

  async ensureModelDir(): Promise<void> {
    const info = await FileSystem.getInfoAsync(MODEL_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
    }
  }

  getModelPath(modelId: string): string {
    return MODEL_DIR + modelId + ".gguf";
  }

  async getModelStatus(modelId: string): Promise<ModelStatus> {
    try {
      const path = this.getModelPath(modelId);
      const info = await FileSystem.getInfoAsync(path);
      if (!info.exists) return "not_downloaded";
      if (info.size && info.size > 0) return "ready";
      return "not_downloaded";
    } catch {
      return "error";
    }
  }

  async getActiveModelId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACTIVE_MODEL_KEY);
    } catch {
      return null;
    }
  }

  async setActiveModelId(modelId: string): Promise<void> {
    await AsyncStorage.setItem(ACTIVE_MODEL_KEY, modelId);
  }

  async downloadModel(
    modelId: string,
    onProgress: (p: DownloadProgress) => void,
    onComplete: () => void,
    onError: (err: string) => void
  ): Promise<void> {
    const config = MODEL_CATALOG.find(m => m.id === modelId);
    if (!config) {
      onError("Model bulunamadı");
      return;
    }

    try {
      await this.ensureModelDir();
      const path = this.getModelPath(modelId);

      const resumable = FileSystem.createDownloadResumable(
        config.downloadUrl,
        path,
        {},
        (progress) => {
          const percent = progress.totalBytesExpectedToWrite > 0
            ? Math.round((progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100)
            : 0;
          onProgress({
            totalBytes: progress.totalBytesExpectedToWrite,
            downloadedBytes: progress.totalBytesWritten,
            percent,
          });
        }
      );

      this.downloadResumables.set(modelId, resumable);
      await resumable.downloadAsync();
      this.downloadResumables.delete(modelId);

      // GGUF doğrulama — ilk 4 byte "GGUF" magic olmalı
      const isValid = await this._validateGGUF(path);
      if (!isValid) {
        await FileSystem.deleteAsync(path, { idempotent: true });
        onError("İndirilen dosya geçersiz. URL erişim hatası veya gated model olabilir.");
        return;
      }

      await this.setActiveModelId(modelId);
      onComplete();
    } catch (e: any) {
      this.downloadResumables.delete(modelId);
      onError(e?.message ?? "İndirme hatası");
    }
  }

  private async _validateGGUF(path: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (!info.exists || (info.size ?? 0) < 100) return false;
      // 100MB altındaki dosya büyük ihtimalle HTML error page
      if ((info.size ?? 0) < 100 * 1024 * 1024) return false;
      return true;
    } catch {
      return false;
    }
  }

  async cancelDownload(modelId: string): Promise<void> {
    const resumable = this.downloadResumables.get(modelId);
    if (resumable) {
      await resumable.cancelAsync();
      this.downloadResumables.delete(modelId);
    }
  }

  async deleteModel(modelId: string): Promise<void> {
    try {
      const path = this.getModelPath(modelId);
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) await FileSystem.deleteAsync(path);
    } catch {}
  }

  formatSize(mb: number): string {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  }
}

export const modelManager = new ModelManagerClass();
