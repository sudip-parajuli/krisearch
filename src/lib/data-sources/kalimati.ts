import "server-only";
import * as cheerio from "cheerio";
import { parsePriceCell, normalizeUnit, type ScrapedRow } from "./parse";

/**
 * Scrapes today's wholesale price table from the official Kalimati Fruits &
 * Vegetable Market Development Board site — the government body that has
 * regulated Nepal's largest wholesale produce market since 1995. Server-
 * rendered HTML (Laravel + DataTables, but the table itself is in the
 * initial response — no JS execution needed); verified live 2026-09-01.
 * Same column order as AMPIS: commodity | unit | min | max | avg.
 */
export async function fetchKalimatiPrices(): Promise<ScrapedRow[]> {
  const res = await fetch("https://kalimatimarket.gov.np/price", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KrisearchBot/1.0)" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Kalimati Market fetch failed: HTTP ${res.status}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  const table = $("#commodityPriceParticular");
  if (table.length === 0) throw new Error("Kalimati Market: price table not found — page structure may have changed");

  const rows: ScrapedRow[] = [];
  table.find("tbody tr").each((_, tr) => {
    const cells = $(tr).find("td").map((__, td) => $(td).text().trim()).get();
    if (cells.length < 5) return;
    const [commodity, unitRaw, minRaw, maxRaw, avgRaw] = cells;
    const unit = normalizeUnit(unitRaw);
    if (!unit) return;
    rows.push({
      commodity,
      unit,
      min: parsePriceCell(minRaw),
      max: parsePriceCell(maxRaw),
      avg: parsePriceCell(avgRaw),
    });
  });
  return rows;
}
