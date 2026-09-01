import "server-only";
import { callOpenRouter } from "./openrouter";

/**
 * Generates a general-knowledge overview (climate, farming process, care,
 * selling considerations) for a crop/product the user searched for.
 * Deliberately scoped to NOT invent vendor names, prices, or specific local
 * facts — those come from Krisearch's own real, sourced data shown
 * alongside this on the search page. This is general agricultural
 * knowledge, framed the same honest way as `crops.baseline_notes`: a
 * starting point, not verified fact, and the UI labels it that way.
 */

export type SearchOverview = {
  climate: string;
  process: string;
  care: string;
  selling: string;
} | null;

const SYSTEM_PROMPT = `You are an agricultural knowledge assistant for Nepali smallholder farmers using Krisearch. \
Given a crop/product name and whatever baseline context is provided, write a short general-knowledge overview. \
Focus on Nepal's growing conditions (Terai/hill/mountain zones) where relevant.

Respond with ONLY a JSON object, no other text, no markdown formatting inside the values:
{"climate": "...", "process": "...", "care": "...", "selling": "..."}

- "climate": what climate/altitude/season this needs, 1-2 sentences.
- "process": the general farming process from planting to harvest, 2-3 sentences.
- "care": nourishing/care needs — water, nutrients, common pests/diseases to watch for, 2-3 sentences.
- "selling": general considerations for selling/marketing this product, 1-2 sentences.

Do NOT mention specific company names, vendor names, or specific prices — you don't have real-time access to \
those and Krisearch shows real vendor/price data separately. Stay general. If you genuinely don't have reliable \
knowledge about this specific item, write "Not enough reliable information available for this item." for each field.`;

export async function generateSearchOverview(context: {
  itemName: string;
  category: string | null;
  baselineNotes: string | null;
}): Promise<SearchOverview> {
  const userPrompt = `Item: ${context.itemName}${context.category ? ` (category: ${context.category})` : ""}\n${
    context.baselineNotes ? `Known baseline notes: ${context.baselineNotes}` : "No baseline notes available."
  }`;

  const raw = await callOpenRouter(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { maxTokens: 500, temperature: 0.3, timeoutMs: 30_000 }
  );
  if (!raw) return null;

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.climate || !parsed.process || !parsed.care || !parsed.selling) return null;
    return {
      climate: String(parsed.climate).slice(0, 600),
      process: String(parsed.process).slice(0, 600),
      care: String(parsed.care).slice(0, 600),
      selling: String(parsed.selling).slice(0, 600),
    };
  } catch {
    return null;
  }
}
