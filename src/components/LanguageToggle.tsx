"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex rounded-full border border-neutral-300 bg-white p-0.5 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900">
      <button
        type="button"
        onClick={() => setLang("ne")}
        aria-pressed={lang === "ne"}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          lang === "ne" ? "bg-green-600 text-white" : "text-neutral-600 dark:text-neutral-300"
        }`}
      >
        नेपाली
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          lang === "en" ? "bg-green-600 text-white" : "text-neutral-600 dark:text-neutral-300"
        }`}
      >
        EN
      </button>
    </div>
  );
}
