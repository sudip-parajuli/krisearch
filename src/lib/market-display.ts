import type { MarketPrice } from "@/types/database";

export function groupPrices(prices: MarketPrice[]) {
  const grouped = new Map<string, MarketPrice[]>();
  for (const price of prices) {
    // Keep units and source/variety descriptions separate: mappings can put
    // oyster and button mushrooms under the same crop ID.
    const key = JSON.stringify([price.crop_id, price.market_name, price.unit, price.source]);
    grouped.set(key, [...(grouped.get(key) ?? []), price]);
  }
  for (const entries of grouped.values()) entries.sort((a, b) => (b.date_recorded ?? "").localeCompare(a.date_recorded ?? ""));
  return grouped;
}

export function priceAge(date: string | null, now = new Date()): "recent" | "old" | "unknown" {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "unknown";
  const recorded = Date.parse(`${date}T00:00:00+05:45`);
  if (!Number.isFinite(recorded) || recorded > now.getTime()) return "unknown";
  if (new Date(recorded + 20700000).toISOString().slice(0, 10) !== date) return "unknown";
  return now.getTime() - recorded >= 3 * 86400000 ? "old" : "recent";
}
