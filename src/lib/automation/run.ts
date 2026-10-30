import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { runPriceSync } from "./prices";
import { syncSources } from "./sources";
import { answerPost } from "@/lib/ai/answers";
import { hasTextAI } from "@/lib/ai/openrouter";
export async function runAutomation() {
  const admin = createAdminClient();
  if (!admin)
    return { status: 503, body: { error: "Database admin is not configured" } };
  const { data: claimed, error } = await admin.rpc("claim_automation_lock", {
    p_key: "daily-refresh",
    p_seconds: 300,
  });
  if (error)
    return {
      status: 503,
      body: {
        error: "Apply migration 0010_automation.sql before enabling automation",
      },
    };
  if (!claimed)
    return { status: 409, body: { error: "A refresh is already running" } };
  const { data: run } = await admin
    .from("automation_runs")
    .insert({ status: "running" })
    .select("id")
    .single();
  try {
    const results = await Promise.allSettled([
      runPriceSync(),
      syncSources(),
      (async () => {
        if (!hasTextAI()) return { status: "disabled" };
        const { data: posts } = await admin
          .from("posts")
          .select("id")
          .in("type", ["question", "disease_pest_report"])
          .order("created_at", { ascending: false })
          .limit(5);
        for (const post of posts ?? []) {
          const { data: answered } = await admin
            .from("ai_answers")
            .select("status")
            .eq("post_id", post.id)
            .maybeSingle();
          if (answered?.status === "answered") continue;
          return answerPost(post.id, "scheduled-worker");
        }
        return { status: "up_to_date" };
      })(),
    ]);
    const [prices, sources, ai] = results.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : { error: "Job failed unexpectedly" },
    );
    const partial =
      results.some((result) => result.status === "rejected") ||
      (prices &&
        typeof prices === "object" &&
        "status" in prices &&
        (prices.status !== 200 ||
          ("body" in prices &&
            prices.body.sources?.some((source) => source.error)))) ||
      (Array.isArray(sources) && sources.some((source) => source.error)) ||
      (ai && typeof ai === "object" && "status" in ai && ["failed", "setup_required", "limited"].includes(String(ai.status)));
    const details = { prices, sources, ai };
    if (run)
      await admin
        .from("automation_runs")
        .update({
          status: partial ? "partial" : "success",
          completed_at: new Date().toISOString(),
          details,
        })
        .eq("id", run.id);
    return { status: partial ? 207 : 200, body: details };
  } catch {
    if (run)
      await admin
        .from("automation_runs")
        .update({ status: "failed", completed_at: new Date().toISOString() })
        .eq("id", run.id);
    return {
      status: 500,
      body: { error: "Refresh failed; inspect the automation dashboard" },
    };
  } finally {
    await admin.from("automation_locks").delete().eq("key", "daily-refresh");
  }
}
