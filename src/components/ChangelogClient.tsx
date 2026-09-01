"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageSquareQuote } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { EmptyState } from "./EmptyState";
import type { Feedback } from "@/types/database";

export function ChangelogClient({ entries }: { entries: Feedback[] }) {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t("changelogTitle")}</h1>
      <p className="mt-1 text-sm text-neutral-500">{t("changelogSubtitle")}</p>

      <div className="mt-6">
        {entries.length === 0 ? (
          <EmptyState icon={Sparkles} title={t("changelogEmpty")} />
        ) : (
          <ol className="relative flex flex-col gap-6 border-l-2 border-green-200 pl-6 dark:border-green-900">
            {entries.map((f, i) => (
              <motion.li
                key={f.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.05 }}
                className="relative"
              >
                <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-white">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{f.resolution_note}</p>
                <p className="mt-1 flex items-start gap-1 text-xs text-neutral-400">
                  <MessageSquareQuote className="mt-0.5 h-3 w-3 shrink-0" />&ldquo;{f.message}&rdquo; — {f.name ?? "Anonymous"}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400">{new Date(f.created_at).toLocaleDateString()}</p>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
