import { getMarketPrices, getCrops } from "@/lib/data";
import { PriceCropSelect } from "@/components/PriceCropSelect";
import { EmptyState } from "@/components/EmptyState";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function PricesPage({
  searchParams,
}: {
  searchParams: Promise<{ crop?: string }>;
}) {
  const params = await searchParams;
  const cropId = params.crop ? Number(params.crop) : undefined;
  const [crops, prices] = await Promise.all([getCrops(), getMarketPrices(cropId)]);
  const cropById = new Map(crops.map((c) => [c.id, c]));

  // Group by crop+market, sorted by date desc (already sorted by query), to derive a simple trend.
  const grouped = new Map<string, typeof prices>();
  for (const p of prices) {
    const key = `${p.crop_id}-${p.market_name}`;
    grouped.set(key, [...(grouped.get(key) ?? []), p]);
  }

  return (
    <div>
      <SupabaseSetupNotice />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Market prices</h1>
        <PriceCropSelect crops={crops} />
      </div>

      {prices.length === 0 ? (
        <EmptyState title="No price data yet" body="Farmers can report local prices from any post." />
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
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  <p className="font-semibold">
                    {crop?.name_en} <span className="text-xs text-neutral-400">· {entries[0].market_name}</span>
                  </p>
                  <p className="text-xs text-neutral-400">
                    Updated {latest.date_recorded} {latest.source && `· ${latest.source}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    NPR {latest.price_per_unit} <span className="text-xs font-normal text-neutral-400">/{latest.unit}</span>
                  </p>
                  {trend !== null && (
                    <p className={`text-xs font-medium ${trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-neutral-400"}`}>
                      {trend > 0 ? "▲" : trend < 0 ? "▼" : "—"} {Math.abs(trend).toFixed(2)} vs previous
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
