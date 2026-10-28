import "server-only";
import { createClient } from "@/lib/supabase/server";
import { hasTextAI } from "./openrouter";
export async function aiRequest(
  request: Request,
): Promise<{ body: Record<string, unknown>; userId: string } | Response> {
  if (!hasTextAI())
    return Response.json(
      { status: "disabled", error: "AI provider is not connected" },
      { status: 503 },
    );
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "Origin not allowed" }, { status: 403 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Missing body" }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 10000) {
      await reader.cancel();
      return Response.json({ error: "Request too large" }, { status: 413 });
    }
    chunks.push(value);
  }
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user)
    return Response.json(
      { error: "A guest or signed-in session is required" },
      { status: 401 },
    );
  return { body, userId: data.user.id };
}
