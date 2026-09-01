"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/** Reads text aloud via the browser's built-in speech synthesis — free, no API, no server call. */
export function ReadAloudButton({ text }: { text: string }) {
  const { lang, t } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // One-off browser feature check on mount (SSR has no `window`, so this
    // can't be computed in the initial render without a hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported("speechSynthesis" in window);
  }, []);

  function toggle() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ne" ? "ne-NP" : "en-US";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={t("readAloud")}
      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-green-700 dark:hover:text-green-400"
    >
      {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      {t("readAloud")}
    </button>
  );
}
