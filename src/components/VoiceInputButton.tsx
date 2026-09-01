"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// The Web Speech API's SpeechRecognition isn't in TypeScript's built-in DOM
// lib yet — minimal shape for what's actually used here.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/**
 * A mic button that transcribes speech straight into a text field, via the
 * browser's built-in Web Speech API — free, no server call, no API key.
 * Support varies (best on Android Chrome, which is a realistic primary
 * browser for many farmers here); feature-detected, so it simply doesn't
 * render when unsupported rather than showing a broken button.
 */
export function VoiceInputButton({ onResult }: { onResult: (text: string) => void }) {
  const { lang, t } = useLanguage();
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    // One-off browser feature check on mount (SSR has no `window`, so this
    // can't be computed in the initial render without a hydration mismatch).
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  function toggle() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = lang === "ne" ? "ne-NP" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ");
      if (transcript) onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? t("voiceInputStop") : t("voiceInputStart")}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        listening
          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      }`}
    >
      {listening ? <Square className="h-3 w-3 animate-pulse" /> : <Mic className="h-3.5 w-3.5" />}
      {listening ? t("voiceInputStop") : t("voiceInputStart")}
    </button>
  );
}
