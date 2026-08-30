"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { AIVerdict } from "@/types/database";
import type { DictionaryKey } from "@/lib/i18n/dictionary";

const config: Record<AIVerdict, { icon: string; key: DictionaryKey; color: string }> = {
  safe: { icon: "✅", key: "aiSafe", color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  caution: { icon: "⚠️", key: "aiCaution", color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  danger: { icon: "⛔", key: "aiDanger", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
  unverified: { icon: "❔", key: "aiUnverified", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
};

/** Shown on a post/comment once the AI safety classifier has judged it — hidden (not "loading") until then. */
export function AIVerdictBadge({ verdict, rationale }: { verdict: AIVerdict | null; rationale?: string | null }) {
  const { t } = useLanguage();
  if (!verdict) return null;
  const c = config[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.color}`}
      title={rationale ?? undefined}
    >
      <span>{c.icon}</span>
      {t(c.key)}
    </span>
  );
}
