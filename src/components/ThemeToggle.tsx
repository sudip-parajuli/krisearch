"use client";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { lang } = useLanguage();
  const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  const labels = lang === "ne" ? { light: "उज्यालो", dark: "अँध्यारो", system: "उपकरणअनुसार" } : { light: "Light", dark: "Dark", system: "System" };
  const label = lang === "ne" ? `थिम: ${labels[theme]}। ${labels[next]} बनाउनुहोस्` : `Theme: ${labels[theme]}. Switch to ${labels[next]}`;
  const Icon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;
  return <button type="button" onClick={() => setTheme(next)} title={label} aria-label={label} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-green-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"><Icon className="h-4 w-4" /></button>;
}
