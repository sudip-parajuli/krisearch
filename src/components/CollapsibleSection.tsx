"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Click-to-expand section — used for the "why"/"how it works" explainer
 * content on the homepage, which visitors need occasionally, not on every
 * visit. Collapsed by default so the page leads with live content
 * (recent posts, prices, tools) instead of marketing copy.
 */
export function CollapsibleSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
      >
        <span className="flex items-center gap-2 font-semibold">
          <span className="text-lg">{icon}</span>
          {title}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
          {open ? t("showLess") : t("learnMore")}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            ▾
          </motion.span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 text-sm text-neutral-600 dark:text-neutral-400">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
