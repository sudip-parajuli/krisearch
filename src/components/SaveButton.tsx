"use client";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useSaved } from "./SavedProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { SavedItem } from "@/lib/saved";

export function SaveButton({ href, title, kind }: Omit<SavedItem, "savedAt">) {
  const { items, ready, toggle } = useSaved();
  const { lang } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const saved = items.some(item => item.href === href);
  const label = lang === "ne" ? (saved ? "सुरक्षित छ" : "पछि हेर्न राख्नुहोस्") : saved ? "Saved" : "Save for later";
  return <span className="inline-flex flex-col items-start gap-1"><button disabled={!ready} aria-pressed={saved} aria-label={`${label}: ${title}`} onClick={() => setError(toggle({ href, title, kind }))} type="button" className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${saved ? "border-green-400 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300" : "border-neutral-200 text-neutral-600 hover:border-green-500 dark:border-neutral-700 dark:text-neutral-300"}`}><Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} />{label}</button>{error && <span role="status" className="text-xs text-red-600 dark:text-red-400">{lang === "ne" ? "सुरक्षित भएन। ब्राउजर भण्डारण वा २०० सामग्रीको सीमा जाँच्नुहोस्।" : "Could not save. Check browser storage or the 200-item limit."}</span>}</span>;
}
