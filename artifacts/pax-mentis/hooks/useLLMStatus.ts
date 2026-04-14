import { useEffect, useState } from "react";
import { llmBridge, IS_LLM_NATIVE_AVAILABLE } from "@/lib/localLLM";
import type { ModelStatus } from "@/lib/modelManager";

export interface LLMStatusInfo {
  status: ModelStatus;
  isNative: boolean;
  label: string;
  color: string;
}

const STATUS_META: Record<ModelStatus, { label: string; color: string }> = {
  not_downloaded: { label: "Model Yok",    color: "#9ca3af" },
  downloading:    { label: "İndiriliyor…", color: "#f59e0b" },
  ready:          { label: "Hazır",        color: "#f59e0b" },
  loading:        { label: "Yükleniyor…",  color: "#f59e0b" },
  loaded:         { label: "Aktif",        color: "#5a7a5a" },
  error:          { label: "Hata",         color: "#ef4444" },
};

export function useLLMStatus(): LLMStatusInfo {
  const [status, setStatus] = useState<ModelStatus>(llmBridge.status);

  useEffect(() => {
    let alive = true;
    const poll = setInterval(() => {
      if (alive) setStatus(llmBridge.status);
    }, 2000);
    return () => { alive = false; clearInterval(poll); };
  }, []);

  const meta = STATUS_META[status] ?? STATUS_META.error;
  return {
    status,
    isNative: IS_LLM_NATIVE_AVAILABLE,
    label: IS_LLM_NATIVE_AVAILABLE ? meta.label : "Demo",
    color: IS_LLM_NATIVE_AVAILABLE ? meta.color : "#9ca3af",
  };
}
