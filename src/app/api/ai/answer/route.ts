import { createClient } from "@/lib/supabase/server";
import { answerPost } from "@/lib/ai/answers";
import { hasTextAI } from "@/lib/ai/openrouter";
import { aiRequest } from "@/lib/ai/request";
export const maxDuration = 60;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("post");
  if (!id || !uuid.test(id))
    return Response.json({ error: "Invalid post" }, { status: 400 });
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_answers")
    .select("answer,citations,language,updated_at")
    .eq("post_id", id)
    .eq("status", "answered")
    .maybeSingle();
  return Response.json(
    { enabled: hasTextAI(), result: data ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  const parsed = await aiRequest(request);
  if (parsed instanceof Response) return parsed;
  if (typeof parsed.body.postId !== "string" || !uuid.test(parsed.body.postId))
    return Response.json({ error: "Invalid post" }, { status: 400 });
  const result = await answerPost(parsed.body.postId, parsed.userId);
  return Response.json(result, {
    status:
      result.status === "limited"
        ? 429
        : result.status === "setup_required"
          ? 503
          : 200,
  });
}
