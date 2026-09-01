import { NextResponse } from "next/server";
import { generateSearchOverview } from "@/lib/ai/search-overview";

/** On-demand (button click, not automatic) so we're not burning OpenRouter calls on every search keystroke. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const itemName = body?.itemName as string | undefined;
  if (!itemName) return NextResponse.json({ error: "Expected { itemName, category?, baselineNotes? }" }, { status: 400 });

  const overview = await generateSearchOverview({
    itemName,
    category: body?.category ?? null,
    baselineNotes: body?.baselineNotes ?? null,
  });

  return NextResponse.json({ overview });
}
