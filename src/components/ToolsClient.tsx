"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ToolCard } from "./ToolCard";
import { ScopeTabs } from "./ScopeTabs";
import { EmptyState } from "./EmptyState";
import type { Equipment } from "@/types/database";

const categoryOrder = [
  "drone",
  "machinery",
  "irrigation",
  "solar",
  "iot_sensor",
  "greenhouse",
  "post_harvest",
  "digital_app",
];

const categoryIcons: Record<string, string> = {
  drone: "🛸",
  iot_sensor: "📡",
  irrigation: "💧",
  machinery: "🚜",
  greenhouse: "🏡",
  solar: "☀️",
  post_harvest: "📦",
  digital_app: "📱",
};

const categoryLabels: Record<string, { ne: string; en: string }> = {
  drone: { ne: "ड्रोन", en: "Drones" },
  machinery: { ne: "मेसिनरी", en: "Machinery" },
  irrigation: { ne: "सिँचाइ", en: "Irrigation" },
  solar: { ne: "सोलार", en: "Solar" },
  iot_sensor: { ne: "IoT सेन्सर", en: "IoT Sensors" },
  greenhouse: { ne: "ग्रीनहाउस / पोलिहाउस", en: "Greenhouse / Polyhouse" },
  post_harvest: { ne: "उत्पादन पछिको व्यवस्थापन", en: "Post-Harvest" },
  digital_app: { ne: "डिजिटल एप", en: "Digital Apps" },
};

export function ToolsClient({ equipment, scope }: { equipment: Equipment[]; scope: "nepal" | "global" }) {
  const { t, lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const presentCategories = useMemo(
    () => categoryOrder.filter((cat) => equipment.some((e) => e.category === cat)),
    [equipment]
  );
  const visible = activeCategory ? equipment.filter((e) => e.category === activeCategory) : equipment;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">{t("toolsTitle")}</h1>
      <p className="mb-4 text-sm text-neutral-500">{t("toolsSubtitle")}</p>
      <div className="mb-4">
        <ScopeTabs />
      </div>
      {scope === "global" && (
        <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
          {t("globalToolsNotice")}
        </p>
      )}

      {/* One unified grid, filtered by a category chip row — not a full-width
          section per category, which left mostly-empty rows when a category
          has only one or two items. */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeCategory === null
              ? "bg-green-600 text-white"
              : "bg-white text-neutral-600 shadow-sm hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          }`}
        >
          {lang === "ne" ? "सबै" : "All"} ({equipment.length})
        </button>
        {presentCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-green-600 text-white"
                : "bg-white text-neutral-600 shadow-sm hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {categoryIcons[cat]} {categoryLabels[cat]?.[lang] ?? cat}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title={t("noToolsYet")} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((eq) => (
            <ToolCard key={eq.id} equipment={eq} />
          ))}
        </div>
      )}
    </div>
  );
}
