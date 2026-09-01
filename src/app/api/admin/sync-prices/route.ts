import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, getAdminUserIds } from "@/lib/supabase/admin";
import { fetchAmpisPrices } from "@/lib/data-sources/ampis";
import { fetchKalimatiPrices } from "@/lib/data-sources/kalimati";
import { matchCropForCommodity } from "@/lib/data-sources/crop-mapping";
import type { ScrapedRow } from "@/lib/data-sources/parse";

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

type SourceResult = { label: string; marketName: string; rows: ScrapedRow[]; error?: string };

async function runSync() {
  const admin = createAdminClient();
  if (!admin) {
    return { status: 500 as const, body: { error: "Admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY)." } };
  }

  const sources: SourceResult[] = [];

  try {
    sources.push({
      label: "AMPIS — Dept. of Agriculture, MoALD (ampis.gov.np)",
      marketName: "AMPIS national reference",
      rows: await fetchAmpisPrices(),
    });
  } catch (err) {
    sources.push({ label: "AMPIS", marketName: "AMPIS national reference", rows: [], error: err instanceof Error ? err.message : String(err) });
  }

  try {
    sources.push({
      label: "Kalimati Fruits & Vegetable Market Development Board (kalimatimarket.gov.np)",
      marketName: "Kalimati, Kathmandu",
      rows: await fetchKalimatiPrices(),
    });
  } catch (err) {
    sources.push({ label: "Kalimati Market Board", marketName: "Kalimati, Kathmandu", rows: [], error: err instanceof Error ? err.message : String(err) });
  }

  const { data: crops } = await admin.from("crops").select("id, name_en");
  const cropIdByName = new Map((crops ?? []).map((c) => [c.name_en, c.id]));
  const today = new Date().toISOString().slice(0, 10);

  const toUpsert: {
    crop_id: number;
    market_name: string;
    price_per_unit: number;
    unit: string;
    date_recorded: string;
    source: string;
  }[] = [];
  const matchedCropsPerSource = new Set<string>(); // "sourceLabel|cropName" — first match wins per crop per source

  for (const source of sources) {
    for (const row of source.rows) {
      const cropName = matchCropForCommodity(row.commodity);
      if (!cropName) continue;
      const dedupeKey = `${source.label}|${cropName}`;
      if (matchedCropsPerSource.has(dedupeKey)) continue;
      const cropId = cropIdByName.get(cropName);
      const price = row.avg ?? (row.min != null && row.max != null ? (row.min + row.max) / 2 : null);
      if (!cropId || price == null) continue;

      matchedCropsPerSource.add(dedupeKey);
      toUpsert.push({
        crop_id: cropId,
        market_name: source.marketName,
        price_per_unit: price,
        unit: row.unit,
        date_recorded: today,
        source: `${source.label} — ${row.commodity}`,
      });
    }
  }

  let synced = 0;
  if (toUpsert.length > 0) {
    const { error, count } = await admin
      .from("market_prices")
      .upsert(toUpsert, { onConflict: "crop_id,market_name,date_recorded", count: "exact" });
    if (error) {
      return {
        status: 500 as const,
        body: { synced: 0, error: error.message, sources: sources.map((s) => ({ label: s.label, rowsFound: s.rows.length, error: s.error })) },
      };
    }
    synced = count ?? toUpsert.length;
  }

  return {
    status: 200 as const,
    body: {
      synced,
      message: `Synced ${synced} price row(s) from ${sources.filter((s) => !s.error).length} of ${sources.length} sources.`,
      sources: sources.map((s) => ({ label: s.label, rowsFound: s.rows.length, error: s.error })),
    },
  };
}

export async function POST() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const adminIds = getAdminUserIds();
  if (!authData.user || !adminIds.includes(authData.user.id)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const result = await runSync();
  return NextResponse.json(result.body, { status: result.status });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const result = await runSync();
  return NextResponse.json(result.body, { status: result.status });
}
