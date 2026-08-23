"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { PostType } from "@/types/database";
import type { DictionaryKey } from "@/lib/i18n/dictionary";

const config: Record<PostType, { icon: string; color: string; key: DictionaryKey }> = {
  question: { icon: "❓", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300", key: "postTypeQuestion" },
  disease_pest_report: { icon: "🐛", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300", key: "postTypeDisease" },
  fertilizer_tip: { icon: "🌱", color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300", key: "postTypeFertilizer" },
  market_price_report: { icon: "💰", color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", key: "postTypeMarket" },
  success_story: { icon: "🏆", color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300", key: "postTypeSuccess" },
  general_discussion: { icon: "💬", color: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300", key: "postTypeGeneral" },
  equipment_review: { icon: "🚜", color: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300", key: "postTypeEquipment" },
};

export function PostTypeBadge({ type }: { type: PostType }) {
  const { t } = useLanguage();
  const c = config[type] ?? config.general_discussion;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.color}`}>
      <span>{c.icon}</span>
      {t(c.key)}
    </span>
  );
}
