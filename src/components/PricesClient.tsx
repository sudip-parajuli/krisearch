"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PriceCropSelect } from "./PriceCropSelect";
import { EmptyState } from "./EmptyState";
import type { Crop, MarketPrice } from "@/types/database";

export function PricesClient({ crops, prices }: { crops: Crop[]; prices: MarketPrice[] }) {
  const { t } = useLanguage();
  const cropById = new Map(crops.map((c) => [c.id, c]));

  const grouped = new Map<string, MarketPrice[]>();
  for (const p of prices) {
    const key = `${p.crop_id}-${p.market_name}`;
    grouped.set(key, [...(grouped.get(key) ?? []), p]);
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("pricesTitle")}</h1>
        <PriceCropSelect crops={crops} />
      </div>
      <p className="mb-5 text-sm text-neutral-500">{t("pricesSubtitle")}</p>

      {prices.length === 0 ? (
        <EmptyState title={t("noPricesYet")} body="Farmers can report local prices from any post." />
      ) : (
        <div className="flex flex-col gap-3">
          {Array.from(grouped.entries()).map(([key, entries]) => {
            const crop = cropById.get(entries[0].crop_id!);
            const [latest, previous] = entries;
            const trend =
              previous && latest.price_per_unit != null && previous.price_per_unit != null
                ? latest.price_per_unit - previous.price_per_unit
                : null;
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  <p className="font-semibold">
                    {crop?.name_en}
                    {crop?.name_np && <span className="ml-1 font-normal text-neutral-400">{crop.name_np}</span>}{" "}
                    <span className="text-xs text-neutral-400">· {entries[0].market_name}</span>
                  </p>
                  <p className="text-xs text-neutral-400">
                    {t("updated")} {latest.date_recorded} {latest.source && `· ${latest.source}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    NPR {latest.price_per_unit} <span className="text-xs font-normal text-neutral-400">/{latest.unit}</span>
                  </p>
                  {trend !== null && (
                    <p className={`text-xs font-medium ${trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-neutral-400"}`}>
                      {trend > 0 ? "▲" : trend < 0 ? "▼" : "—"} {Math.abs(trend).toFixed(2)} {t("vsPrevious")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
