import { NextResponse } from "next/server";
import { diagnosePhoto } from "@/lib/ai/photo-diagnosis";
import { aiRequest } from "@/lib/ai/request";
import { budget } from "@/lib/ai/answers";
import { supabaseUrl } from "@/lib/supabase/env";

/** On-demand (button click after upload), not automatic — bounded OpenRouter usage. */
export async function POST(request: Request) {
  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ diagnosis: null }, { status: 503 });
  const parsed = await aiRequest(request); if (parsed instanceof Response) return parsed;
  const body = parsed.body;
  const imageUrl = body?.imageUrl as string | undefined;
  if (typeof imageUrl !== "string" || imageUrl.length > 2000) return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  try { const url = new URL(imageUrl); if (url.origin !== new URL(supabaseUrl).origin || !url.pathname.startsWith("/storage/v1/object/public/post-images/") || url.username || url.password || url.search) throw new Error(); } catch { return NextResponse.json({ error: "Use an uploaded post image" }, { status: 422 }); }
  if (!await budget(parsed.userId)) return NextResponse.json({ diagnosis: null }, { status: 429 });

  const diagnosis = await diagnosePhoto({ imageUrl, title: typeof body.title === "string" ? body.title.slice(0, 300) : "", body: typeof body.body === "string" ? body.body.slice(0, 2000) : "" });
  return NextResponse.json({ diagnosis });
}
