"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionary, type DictionaryKey, type Lang } from "./dictionary";

const STORAGE_KEY = "krisearch-lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictionaryKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Nepali-first by default; a returning visitor's choice is remembered locally.
  const [lang, setLangState] = useState<Lang>("ne");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // One-time read of the visitor's saved choice on mount, to reconcile
      // React state with an external store (localStorage) after hydration —
      // not a derived-state loop, so the setState-in-effect rule is a false
      // positive here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored === "ne" || stored === "en") setLangState(stored);
    } catch {
      // localStorage unavailable (private mode, etc.) — fall back to default.
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => dictionary[key][lang],
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
