"use client";

import { HelpCircle, Bug, Sprout, CircleDollarSign, Trophy, MessageCircle, Wrench, Share2, HardHat, Users, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { PostType } from "@/types/database";
import type { DictionaryKey } from "@/lib/i18n/dictionary";

const config: Record<PostType, { icon: LucideIcon; color: string; key: DictionaryKey }> = {
  question: { icon: HelpCircle, color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300", key: "postTypeQuestion" },
  disease_pest_report: { icon: Bug, color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300", key: "postTypeDisease" },
  fertilizer_tip: { icon: Sprout, color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300", key: "postTypeFertilizer" },
  market_price_report: { icon: CircleDollarSign, color: "bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-300", key: "postTypeMarket" },
  success_story: { icon: Trophy, color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300", key: "postTypeSuccess" },
  general_discussion: { icon: MessageCircle, color: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300", key: "postTypeGeneral" },
  equipment_review: { icon: Wrench, color: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300", key: "postTypeEquipment" },
  equipment_share: { icon: Share2, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300", key: "postTypeEquipmentShare" },
  labor_share: { icon: HardHat, color: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300", key: "postTypeLaborShare" },
  group_buy: { icon: Users, color: "bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-300", key: "postTypeGroupBuy" },
};

export function PostTypeBadge({ type }: { type: PostType }) {
  const { t } = useLanguage();
  const c = config[type] ?? config.general_discussion;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.color}`}>
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {t(c.key)}
    </span>
  );
}
