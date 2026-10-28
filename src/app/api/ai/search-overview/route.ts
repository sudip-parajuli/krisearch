import { NextResponse } from "next/server";
import { generateSearchOverview } from "@/lib/ai/search-overview";
import { aiRequest } from "@/lib/ai/request";
import { budget } from "@/lib/ai/answers";
import { createClient } from "@/lib/supabase/server";

/** On-demand (button click, not automatic) so we're not burning OpenRouter calls on every search keystroke. */
export async function POST(request: Request) {
  const parsed = await aiRequest(request); if (parsed instanceof Response) return parsed;
  const body = parsed.body;
  const itemName = body?.itemName as string | undefined;
  if (typeof itemName !== "string" || !itemName || itemName.length > 150) return NextResponse.json({ error: "Invalid item" }, { status: 400 });
  const client = await createClient();
  const { data: crop } = await client.from("crops").select("name_en,category,baseline_notes").eq("name_en", itemName).maybeSingle();
  if (!crop) return NextResponse.json({ overview: null }, { status: 404 });
  if (!await budget(parsed.userId)) return NextResponse.json({ overview: null }, { status: 429 });

  const overview = await generateSearchOverview({
    itemName,
    category: crop.category,
    baselineNotes: crop.baseline_notes,
  });

  return NextResponse.json({ overview });
}
