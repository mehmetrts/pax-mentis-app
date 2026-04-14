import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Ses desteği ───────────────────────────────────────────────────────────────
// TTS: expo-speech ile Türkçe metin okuma — Expo Go'da çalışır.
// STT: Ses kaydı için expo-av kullanılır, transkripsiyon için llama.rn/Whisper
//      gerektirir. Dev build'de etkinleştirilir. Şimdilik UI hazır, backend bekleniyor.

export type TTSStatus = "idle" | "speaking";
export type STTStatus = "idle" | "recording" | "processing" | "unavailable";

export interface VoiceHookReturn {
  isTTSEnabled: boolean;
  toggleTTS: () => void;
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  ttsStatus: TTSStatus;

  sttStatus: STTStatus;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  isSTTAvailable: boolean;
}

export function useVoice(): VoiceHookReturn {
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>("idle");
  const [sttStatus, setSttStatus] = useState<STTStatus>("unavailable");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      Speech.stop();
    };
  }, []);

  const speakText = useCallback(async (text: string) => {
    if (!isTTSEnabled) return;
    try {
      await Speech.stop();
      if (!isMounted.current) return;
      setTtsStatus("speaking");

      // Metni temizle (markdown, semboller kaldır)
      const clean = text
        .replace(/[*_`#]/g, "")
        .replace(/\[.*?\]/g, "")
        .trim();

      Speech.speak(clean, {
        language: "tr-TR",
        pitch: 0.95,
        rate: 0.92,
        onDone: () => { if (isMounted.current) setTtsStatus("idle"); },
        onError: () => { if (isMounted.current) setTtsStatus("idle"); },
        onStopped: () => { if (isMounted.current) setTtsStatus("idle"); },
      });
    } catch {
      if (isMounted.current) setTtsStatus("idle");
    }
  }, [isTTSEnabled]);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setTtsStatus("idle");
  }, []);

  const toggleTTS = useCallback(() => {
    setIsTTSEnabled(prev => {
      if (prev) Speech.stop();
      return !prev;
    });
  }, []);

  // STT: Expo Go'da mevcut değil — dev build + Whisper ile çalışır.
  // Gerçek entegrasyon için expo-speech-recognition veya llama.rn Whisper bridge kullanılır.
  const startRecording = useCallback(async () => {
    setSttStatus("unavailable");
    // TODO: expo-speech-recognition ile değiştir
    // const { granted } = await Audio.requestPermissionsAsync();
    // if (!granted) return;
    // setSttStatus("recording");
    // ...
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return null;
    // TODO: kaydı durdur ve transkripsiyon döndür
  }, []);

  return {
    isTTSEnabled,
    toggleTTS,
    speakText,
    stopSpeaking,
    ttsStatus,
    sttStatus,
    startRecording,
    stopRecording,
    isSTTAvailable: false, // dev build'de true olacak
  };
}
