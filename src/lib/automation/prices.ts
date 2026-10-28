import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAmpisPrices } from "@/lib/data-sources/ampis";
import { fetchKalimatiPrices } from "@/lib/data-sources/kalimati";
import { matchCropForCommodity } from "@/lib/data-sources/crop-mapping";
import type { ScrapedRow } from "@/lib/data-sources/parse";
import { nepalToday } from "@/lib/data-sources/market-date";

/**
 * Real market-price sync against two official Nepal government sources —
 * see src/lib/data-sources/{ampis,kalimati}.ts for exactly what's scraped
 * and why. Both are plain server-rendered HTML (no API), so this is a
 * scraper, not an API integration: if either site's markup changes, that
 * source's rows are skipped with a reported error rather than the whole
 * sync failing or writing garbage. Callable two ways:
 * - POST from /admin (session-authenticated, in ADMIN_USER_IDS)
 * - GET from Vercel Cron (see vercel.json), authorized via
 *   `Authorization: Bearer ${CRON_SECRET}` — no user session exists on a
 *   cron invocation. Set CRON_SECRET in your Vercel project env vars.
 */

type SourceResult = {
  label: string;
  marketName: string;
  rows: ScrapedRow[];
  error?: string;
};

export async function runPriceSync() {
  const admin = createAdminClient();
  if (!admin) {
    return {
      status: 500 as const,
      body: {
        error:
          "Admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY).",
      },
    };
  }

  const definitions = [
    { label: "AMPIS — Dept. of Agriculture, MoALD (ampis.gov.np)", marketName: "AMPIS national reference", fetch: fetchAmpisPrices },
    { label: "Kalimati Fruits & Vegetable Market Development Board (kalimatimarket.gov.np)", marketName: "Kalimati, Kathmandu", fetch: fetchKalimatiPrices },
  ];
  const sources: SourceResult[] = await Promise.all(definitions.map(async source => {
    try { return { label: source.label, marketName: source.marketName, rows: await source.fetch() }; }
    catch (error) { return { label: source.label, marketName: source.marketName, rows: [], error: error instanceof Error ? error.message : "Source unavailable" }; }
  }));

  const { data: crops } = await admin.from("crops").select("id, name_en");
  const cropIdByName = new Map((crops ?? []).map((c) => [c.name_en, c.id]));
  if (!crops?.length)
    return {
      status: 503 as const,
      body: {
        error: "Crop reference data is unavailable; nothing was imported.",
      },
    };
  const today = nepalToday();

  const toUpsert: {
    crop_id: number;
    market_name: string;
    price_per_unit: number;
    unit: string;
    date_recorded: string;
    source: string;
  }[] = [];
  const matchedCropsPerSource = new Set<string>();

  for (const source of sources) {
    for (const row of source.rows) {
      const cropName = matchCropForCommodity(row.commodity);
      if (!cropName) continue;
      const dedupeKey = `${source.label}|${cropName}|${row.commodity}|${row.unit}`;
      if (matchedCropsPerSource.has(dedupeKey)) continue;
      const cropId = cropIdByName.get(cropName);
      const price =
        row.avg ??
        (row.min != null && row.max != null ? (row.min + row.max) / 2 : null);
      if (
        !cropId ||
        price == null ||
        !Number.isFinite(price) ||
        price <= 0 ||
        !row.dateRecorded ||
        row.dateRecorded > today
      )
        continue;

      matchedCropsPerSource.add(dedupeKey);
      toUpsert.push({
        crop_id: cropId,
        market_name: source.marketName,
        price_per_unit: price,
        unit: row.unit,
        date_recorded: row.dateRecorded,
        source: `${source.label} — ${row.commodity}`,
      });
    }
  }

  let synced = 0;
  if (toUpsert.length > 0) {
    const { error, count } = await admin
      .from("market_prices")
      .upsert(toUpsert, {
        onConflict: "crop_id,market_name,date_recorded,source,unit",
        count: "exact",
      });
    if (error) {
      return {
        status: 500 as const,
        body: {
          synced: 0,
          error: error.message,
          sources: sources.map((s) => ({
            label: s.label,
            rowsFound: s.rows.length,
            error: s.error,
          })),
        },
      };
    }
    synced = count ?? toUpsert.length;
  }

  return {
    status: (synced ? 200 : 502) as 200 | 502,
    body: {
      synced,
      message: `Synced ${synced} price row(s) from ${sources.filter((s) => !s.error).length} of ${sources.length} sources.`,
      sources: sources.map((s) => ({
        label: s.label,
        rowsFound: s.rows.length,
        error: s.error,
      })),
    },
  };
}
