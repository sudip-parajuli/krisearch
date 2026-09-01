import "server-only";

/** Converts Devanagari digits (०-९) to Arabic digits, leaving everything else untouched. */
export function devanagariToArabic(text: string): string {
  const map: Record<string, string> = {
    "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
    "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
  };
  return text.replace(/[०-९]/g, (d) => map[d] ?? d);
}

/** Parses a price cell like "रू ७०.००" or "50.00" into a plain number. */
export function parsePriceCell(raw: string): number | null {
  const cleaned = devanagariToArabic(raw)
    .replace(/रू|Rs\.?|,/gi, "")
    .trim();
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Normalizes the unit column ("के.जी.", "केजी", "के जी", "दर्जन", ...) to our `unit` convention. */
export function normalizeUnit(raw: string): string | null {
  const cleaned = raw.trim();
  if (/के\s*\.?\s*जी|kg/i.test(cleaned)) return "per kg";
  if (/दर्जन|dozen/i.test(cleaned)) return "per dozen";
  return null; // unrecognized unit — caller should skip the row rather than guess
}

export type ScrapedRow = { commodity: string; unit: string; min: number | null; max: number | null; avg: number | null };
