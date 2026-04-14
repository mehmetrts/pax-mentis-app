import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── expo-speech-recognition dinamik import ────────────────────────────────────
// Expo Go'da native STT modülü mevcut değil — try/catch ile güvenli yükleme.
// Dev build sonrası otomatik aktive olur.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SpeechModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SpeechModule = require("expo-speech-recognition").ExpoSpeechRecognitionModule;
} catch {
  // Expo Go / web — STT devre dışı
}

export const IS_STT_NATIVE_AVAILABLE = SpeechModule !== null;

// ─── Tipler ───────────────────────────────────────────────────────────────────

export type TTSStatus = "idle" | "speaking";
export type STTStatus = "idle" | "recording" | "processing" | "unavailable";

export interface VoiceHookReturn {
  isTTSEnabled: boolean;
  toggleTTS: () => void;
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  ttsStatus: TTSStatus;

  sttStatus: STTStatus;
  sttTranscript: string;
  isSTTAvailable: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  requestSTTPermission: () => Promise<boolean>;
}

// ─── useVoice Hook ────────────────────────────────────────────────────────────

export function useVoice(): VoiceHookReturn {
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>("idle");
  const [sttStatus, setSttStatus] = useState<STTStatus>(
    IS_STT_NATIVE_AVAILABLE ? "idle" : "unavailable"
  );
  const [sttTranscript, setSttTranscript] = useState("");

  const isMounted = useRef(true);
  // Pending resolve for stopRecording promise
  const pendingResolveRef = useRef<((text: string | null) => void) | null>(null);
  // Accumulated transcript during session
  const currentTranscriptRef = useRef("");

  // ─── STT Event Listeners (native only) ──────────────────────────────────────
  useEffect(() => {
    if (!SpeechModule) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultSub = SpeechModule.addListener("result", (event: any) => {
      const transcript: string = event.results?.[0]?.transcript ?? "";
      currentTranscriptRef.current = transcript;

      if (isMounted.current) {
        setSttTranscript(transcript);
      }

      if (event.isFinal) {
        if (isMounted.current) setSttStatus("idle");
        pendingResolveRef.current?.(transcript || null);
        pendingResolveRef.current = null;
      }
    });

    const endSub = SpeechModule.addListener("end", () => {
      if (isMounted.current) setSttStatus("idle");
      // Resolve with whatever we have if not resolved yet
      pendingResolveRef.current?.(currentTranscriptRef.current || null);
      pendingResolveRef.current = null;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorSub = SpeechModule.addListener("error", (event: any) => {
      if (isMounted.current) {
        setSttStatus("idle");
        console.warn("[STT] Hata:", event?.error, event?.message);
      }
      pendingResolveRef.current?.(null);
      pendingResolveRef.current = null;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startSub = SpeechModule.addListener("start", (_event: any) => {
      if (isMounted.current) setSttStatus("recording");
    });

    isMounted.current = true;
    return () => {
      isMounted.current = false;
      resultSub?.remove();
      endSub?.remove();
      errorSub?.remove();
      startSub?.remove();
      Speech.stop();
    };
  }, []);

  // ─── TTS ─────────────────────────────────────────────────────────────────────

  const speakText = useCallback(async (text: string) => {
    if (!isTTSEnabled) return;
    try {
      await Speech.stop();
      if (!isMounted.current) return;
      setTtsStatus("speaking");

      const clean = text
        .replace(/[*_`#]/g, "")
        .replace(/\[.*?\]/g, "")
        .trim();

      Speech.speak(clean, {
        language: "tr-TR",
        pitch: 0.95,
        rate: 0.90,
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

  // ─── STT ─────────────────────────────────────────────────────────────────────

  const requestSTTPermission = useCallback(async (): Promise<boolean> => {
    if (!SpeechModule) return false;
    try {
      const { granted } = await SpeechModule.requestPermissionsAsync();
      return granted;
    } catch {
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!SpeechModule || sttStatus === "recording") return;

    try {
      const { granted } = await SpeechModule.requestPermissionsAsync();
      if (!granted) {
        console.warn("[STT] Mikrofon izni reddedildi");
        return;
      }

      currentTranscriptRef.current = "";
      setSttTranscript("");
      setSttStatus("recording");

      SpeechModule.start({
        lang: "tr-TR",
        interimResults: true,
        maxAlternatives: 1,
        // Android: sürekli dinleme — kullanıcı durdurana kadar
        continuous: false,
        requiresOnDeviceRecognition: false,
      });
    } catch (e) {
      console.error("[STT] Başlatma hatası:", e);
      setSttStatus("idle");
    }
  }, [sttStatus]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!SpeechModule) return null;

    setSttStatus("processing");

    return new Promise<string | null>((resolve) => {
      pendingResolveRef.current = resolve;

      // 5 saniyelik timeout — yanıt gelmezse mevcut transkriptle devam et
      const timeout = setTimeout(() => {
        if (pendingResolveRef.current) {
          pendingResolveRef.current(currentTranscriptRef.current || null);
          pendingResolveRef.current = null;
          if (isMounted.current) setSttStatus("idle");
        }
      }, 5000);

      try {
        SpeechModule.stop();
      } catch {
        clearTimeout(timeout);
        pendingResolveRef.current = null;
        resolve(null);
        if (isMounted.current) setSttStatus("idle");
      }
    });
  }, []);

  return {
    isTTSEnabled,
    toggleTTS,
    speakText,
    stopSpeaking,
    ttsStatus,
    sttStatus,
    sttTranscript,
    isSTTAvailable: IS_STT_NATIVE_AVAILABLE,
    startRecording,
    stopRecording,
    requestSTTPermission,
  };
}
