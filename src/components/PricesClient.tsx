"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PriceCropSelect } from "./PriceCropSelect";
import { EmptyState } from "./EmptyState";
import type { Crop, MarketPrice } from "@/types/database";
import { groupPrices, priceAge } from "@/lib/market-display";
import { useAutoRefresh } from "@/lib/useAutoRefresh";

export function PricesClient({ crops, prices }: { crops: Crop[]; prices: MarketPrice[] }) {
  useAutoRefresh();
  const { t, lang } = useLanguage();
  const cropById = new Map(crops.map((c) => [c.id, c]));

  const grouped = groupPrices(prices);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("pricesTitle")}</h1>
        <PriceCropSelect crops={crops} />
      </div>
      <p className="mb-5 text-sm text-neutral-500">{t("pricesSubtitle")}</p>
      <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">{lang === "ne" ? "प्रकाशित मिति, बजार र एकाइ हेर्नुहोस्। तीन दिन वा सोभन्दा पुराना अभिलेखलाई पुरानो भनेर देखाइएको छ। यी सन्दर्भ मूल्य हुन्, अहिलेको कारोबारको ग्यारेन्टी होइनन्।" : "Check the recorded date, market and unit. Records at least three days old are flagged as older data. These are reference prices, not guaranteed current trading quotes."}</p>

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
                    {latest.price_per_unit == null ? "—" : `NPR ${latest.price_per_unit.toLocaleString(lang === "ne" ? "ne-NP" : "en-NP")}`} <span className="text-xs font-normal text-neutral-400">/{latest.unit ?? "—"}</span>
                  </p>
                  {priceAge(latest.date_recorded) !== "recent" && <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">{priceAge(latest.date_recorded) === "old" ? (lang === "ne" ? "पुरानो अभिलेख · ताजा भाउ जाँच्नुहोस्" : "Older record · verify today's price") : (lang === "ne" ? "मिति पुष्टि भएको छैन" : "Date unconfirmed")}</p>}
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
