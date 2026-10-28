"use client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Renders nothing once a real Supabase project is connected. Until then it
 * flags — on every data page — that what's showing is an empty/dev state,
 * not proof the feature is broken.
 */
export function SupabaseSetupNotice() {
  const { lang } = useLanguage();
  if (isSupabaseConfigured) return null;

  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      {lang === "ne" ? "केही जानकारी अहिले उपलब्ध छैन। केही समयपछि फेरि प्रयास गर्नुहोस्।" : "Some information is unavailable right now. Please try again later."}
    </div>
  );
}
