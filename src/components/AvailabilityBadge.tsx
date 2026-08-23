"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { AvailabilityStatus } from "@/types/database";
import type { DictionaryKey } from "@/lib/i18n/dictionary";

const config: Record<AvailabilityStatus, { color: string; key: DictionaryKey }> = {
  available_in_nepal: {
    color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    key: "availableInNepal",
  },
  import_only: {
    color: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    key: "importOnly",
  },
  pilot_stage: {
    color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    key: "pilotStage",
  },
  service_only: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    key: "serviceOnly",
  },
};

export function AvailabilityBadge({ status }: { status: AvailabilityStatus | null }) {
  const { t } = useLanguage();
  if (!status) return null;
  const c = config[status];
  if (!c) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${c.color}`}>
      {t(c.key)}
    </span>
  );
}
