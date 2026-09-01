import { NextResponse } from "next/server";
import { diagnosePhoto } from "@/lib/ai/photo-diagnosis";

/** On-demand (button click after upload), not automatic — bounded OpenRouter usage. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const imageUrl = body?.imageUrl as string | undefined;
  if (!imageUrl) return NextResponse.json({ error: "Expected { imageUrl, title?, body? }" }, { status: 400 });

  const diagnosis = await diagnosePhoto({ imageUrl, title: body?.title ?? "", body: body?.body ?? "" });
  return NextResponse.json({ diagnosis });
}
