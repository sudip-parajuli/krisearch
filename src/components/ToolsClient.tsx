"use client";

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

  const byCategory = new Map<string, Equipment[]>();
  for (const eq of equipment) {
    const cat = eq.category ?? "other";
    byCategory.set(cat, [...(byCategory.get(cat) ?? []), eq]);
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">{t("toolsTitle")}</h1>
      <p className="mb-4 text-sm text-neutral-500">{t("toolsSubtitle")}</p>
      <div className="mb-5">
        <ScopeTabs />
      </div>
      {scope === "global" && (
        <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
          {t("globalToolsNotice")}
        </p>
      )}

      {equipment.length === 0 ? (
        <EmptyState title={t("noToolsYet")} />
      ) : (
        <div className="flex flex-col gap-6">
          {categoryOrder
            .filter((cat) => byCategory.has(cat))
            .map((cat) => (
              <div key={cat}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  {categoryLabels[cat]?.[lang] ?? cat}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {byCategory.get(cat)!.map((eq) => (
                    <ToolCard key={eq.id} equipment={eq} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
