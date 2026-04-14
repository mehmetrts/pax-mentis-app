/**
 * Pax Mentis — useVoice
 *
 * Manages TTS (expo-speech) and STT (expo-speech-recognition).
 * Both are optional: the hook degrades gracefully in Expo Go / web.
 *
 * STT uses the official `useSpeechRecognitionEvent` React hook which is
 * lifecycle-safe. We import it at module-level with a try/catch and provide
 * a no-op fallback so hook call counts never change between renders.
 */

import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Safe dynamic imports ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _nativeModule: any   = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _useSTTEvent: any    = null;

try {
  const mod = require("expo-speech-recognition");
  _nativeModule = mod.ExpoSpeechRecognitionModule;
  _useSTTEvent  = mod.useSpeechRecognitionEvent;
} catch {
  // Expo Go or web — STT unavailable
}

export const IS_STT_NATIVE_AVAILABLE = _nativeModule !== null;

/**
 * No-op hook used in place of useSpeechRecognitionEvent when the native
 * module is absent. Hook call count stays constant → no Rules-of-Hooks violation.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _useNoopEvent(_name: string, _handler: (...args: unknown[]) => void) {}

// Stable reference that never changes after module eval
const useSafeSTTEvent: (name: string, handler: (...args: any[]) => void) => void =
  _useSTTEvent ?? _useNoopEvent;

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── useVoice ─────────────────────────────────────────────────────────────────

export function useVoice(): VoiceHookReturn {
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [ttsStatus, setTtsStatus]       = useState<TTSStatus>("idle");
  const [sttStatus, setSttStatus]       = useState<STTStatus>(
    IS_STT_NATIVE_AVAILABLE ? "idle" : "unavailable"
  );
  const [sttTranscript, setSttTranscript]     = useState("");
  const [isSTTAvailable, setIsSTTAvailable]   = useState(IS_STT_NATIVE_AVAILABLE);

  const isMounted             = useRef(true);
  const pendingResolveRef     = useRef<((text: string | null) => void) | null>(null);
  const currentTranscriptRef  = useRef("");

  // Dynamic availability check at mount
  useEffect(() => {
    isMounted.current = true;
    if (!_nativeModule) return;
    _nativeModule.isRecognitionAvailable?.().then((avail: boolean) => {
      if (isMounted.current) setIsSTTAvailable(avail);
    }).catch(() => {});
    return () => { isMounted.current = false; };
  }, []);

  // ─── STT event listeners via hook ──────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useSafeSTTEvent("start", (_e: any) => {
    if (isMounted.current) setSttStatus("recording");
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useSafeSTTEvent("result", (event: any) => {
    const transcript: string = event.results?.[0]?.transcript ?? "";
    currentTranscriptRef.current = transcript;
    if (isMounted.current) setSttTranscript(transcript);

    if (event.isFinal) {
      if (isMounted.current) setSttStatus("idle");
      pendingResolveRef.current?.(transcript || null);
      pendingResolveRef.current = null;
    }
  });

  useSafeSTTEvent("end", () => {
    if (isMounted.current) setSttStatus("idle");
    pendingResolveRef.current?.(currentTranscriptRef.current || null);
    pendingResolveRef.current = null;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useSafeSTTEvent("error", (event: any) => {
    if (isMounted.current) {
      setSttStatus(IS_STT_NATIVE_AVAILABLE ? "idle" : "unavailable");
      console.warn("[STT] Hata:", event?.error, event?.message);
    }
    pendingResolveRef.current?.(null);
    pendingResolveRef.current = null;
  });

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  // ─── TTS ─────────────────────────────────────────────────────────────────────

  const speakText = useCallback(async (text: string) => {
    if (!isTTSEnabled) return;
    try {
      await Speech.stop();
      if (!isMounted.current) return;
      setTtsStatus("speaking");
      const clean = text.replace(/[*_`#]/g, "").replace(/\[.*?\]/g, "").trim();
      Speech.speak(clean, {
        language: "tr-TR",
        pitch:    0.95,
        rate:     0.90,
        onDone:    () => { if (isMounted.current) setTtsStatus("idle"); },
        onError:   () => { if (isMounted.current) setTtsStatus("idle"); },
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
    if (!_nativeModule) return false;
    try {
      const { granted } = await _nativeModule.requestPermissionsAsync();
      return granted;
    } catch {
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!_nativeModule || sttStatus === "recording") return;
    try {
      const { granted } = await _nativeModule.requestPermissionsAsync();
      if (!granted) {
        console.warn("[STT] Mikrofon izni reddedildi");
        return;
      }
      currentTranscriptRef.current = "";
      setSttTranscript("");
      setSttStatus("recording");
      _nativeModule.start({
        lang:                     "tr-TR",
        interimResults:           true,
        maxAlternatives:          1,
        continuous:               false,
        requiresOnDeviceRecognition: false,
      });
    } catch (e) {
      console.error("[STT] Başlatma hatası:", e);
      setSttStatus("idle");
    }
  }, [sttStatus]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!_nativeModule) return null;
    setSttStatus("processing");
    return new Promise<string | null>(resolve => {
      pendingResolveRef.current = resolve;
      const timeout = setTimeout(() => {
        if (pendingResolveRef.current) {
          pendingResolveRef.current(currentTranscriptRef.current || null);
          pendingResolveRef.current = null;
          if (isMounted.current) setSttStatus("idle");
        }
      }, 5000);
      try {
        _nativeModule.stop();
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
    isSTTAvailable,
    startRecording,
    stopRecording,
    requestSTTPermission,
  };
}
