"use client";

import { ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { AIVerdict } from "@/types/database";
import type { DictionaryKey } from "@/lib/i18n/dictionary";

const config: Record<AIVerdict, { icon: LucideIcon; key: DictionaryKey; color: string }> = {
  safe: { icon: ShieldCheck, key: "aiSafe", color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  caution: { icon: ShieldAlert, key: "aiCaution", color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  danger: { icon: ShieldX, key: "aiDanger", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
  unverified: { icon: ShieldQuestion, key: "aiUnverified", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
};

/** Shown on a post/comment once the AI safety classifier has judged it — hidden (not "loading") until then. */
export function AIVerdictBadge({ verdict, rationale }: { verdict: AIVerdict | null; rationale?: string | null }) {
  const { t } = useLanguage();
  if (!verdict) return null;
  const c = config[verdict];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.color}`}
      title={rationale ?? undefined}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {t(c.key)}
    </span>
  );
}
