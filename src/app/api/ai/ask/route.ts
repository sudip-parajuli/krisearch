import { aiRequest } from "@/lib/ai/request";
import { budget, generateAnswer } from "@/lib/ai/answers";
import { hasTextAI } from "@/lib/ai/openrouter";
import { createAdminClient } from "@/lib/supabase/admin";
export const maxDuration = 60;
export function GET() {
  return Response.json(
    { enabled: hasTextAI() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  const parsed = await aiRequest(request);
  if (parsed instanceof Response) return parsed;
  const { message, language, postId } = parsed.body;
  if (
    typeof message !== "string" ||
    message.trim().length < 5 ||
    message.length > 2000 ||
    !["ne", "en"].includes(String(language))
  )
    return Response.json({ error: "Invalid question" }, { status: 422 });
  if (!(await budget(parsed.userId)))
    return Response.json(
      { error: "AI usage limit reached or automation setup is incomplete" },
      { status: 429 },
    );
  let post;
  if (typeof postId === "string" && /^[0-9a-f-]{36}$/i.test(postId)) {
    const admin = createAdminClient();
    const result = await admin
      ?.from("posts")
      .select("id,title,body,type,crop_id")
      .eq("id", postId)
      .maybeSingle();
    post = result?.data ?? undefined;
  }
  const answer = await generateAnswer(message, language as "ne" | "en", post);
  return Response.json({ result: answer }, { status: answer ? 200 : 502 });
}
