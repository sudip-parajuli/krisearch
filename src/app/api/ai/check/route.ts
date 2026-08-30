import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifyRemedy } from "@/lib/ai/factcheck";

/**
 * Fire-and-forget endpoint called right after a post or comment is created:
 * runs the AI safety classifier and writes the result. Any failure (no key,
 * network error, unrecognized model output) resolves to a 200 with
 * verdict: null — this must never surface as a broken post/comment for the
 * person who just submitted it.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const type = body?.type as "post" | "comment" | undefined;
  const id = body?.id as string | undefined;
  if (!type || !id || (type !== "post" && type !== "comment")) {
    return NextResponse.json({ error: "Expected { type: 'post' | 'comment', id }" }, { status: 400 });
  }

  const supabase = await createClient();

  let postTitle = "";
  let postBody = "";
  let answerBody = "";

  if (type === "comment") {
    const { data: comment } = await supabase.from("comments").select("body, post_id").eq("id", id).maybeSingle();
    if (!comment) return NextResponse.json({ verdict: null });
    const { data: post } = await supabase.from("posts").select("title, body").eq("id", comment.post_id).maybeSingle();
    postTitle = post?.title ?? "";
    postBody = post?.body ?? "";
    answerBody = comment.body;
  } else {
    const { data: post } = await supabase.from("posts").select("title, body").eq("id", id).maybeSingle();
    if (!post) return NextResponse.json({ verdict: null });
    postTitle = post.title;
    answerBody = post.body;
  }

  const result = await classifyRemedy({ postTitle, postBody, answerBody });
  if (!result) return NextResponse.json({ verdict: null });

  const admin = createAdminClient();
  if (admin) {
    const table = type === "comment" ? "comments" : "posts";
    await admin
      .from(table)
      .update({ ai_verdict: result.verdict, ai_rationale: result.rationale, ai_checked_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json(result);
}
