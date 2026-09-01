import "server-only";
import * as cheerio from "cheerio";
import { parsePriceCell, normalizeUnit, type ScrapedRow } from "./parse";

/**
 * Scrapes today's vegetable wholesale price table from the homepage of
 * AMPIS (Agriculture Market Price Information System) — the Department of
 * Agriculture / Ministry of Agriculture and Livestock Development's own
 * system. Server-rendered HTML, no JS execution needed; verified live
 * 2026-09-01. Columns: कृषि उपज (commodity) | ईकाइ (unit) | न्यूनतम (min) |
 * अधिकतम (max) | औसत (avg).
 */
export async function fetchAmpisPrices(): Promise<ScrapedRow[]> {
  const res = await fetch("https://ampis.gov.np/", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KrisearchBot/1.0)" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`AMPIS fetch failed: HTTP ${res.status}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  const table = $("table").first(); // the daily commodity price table is the first <table> on the page
  if (table.length === 0) throw new Error("AMPIS: no price table found — page structure may have changed");

  const rows: ScrapedRow[] = [];
  table.find("tbody tr").each((_, tr) => {
    const cells = $(tr).find("td").map((__, td) => $(td).text().trim()).get();
    if (cells.length < 5) return;
    const [commodity, unitRaw, minRaw, maxRaw, avgRaw] = cells;
    const unit = normalizeUnit(unitRaw);
    if (!unit) return; // unrecognized unit — skip rather than guess
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
