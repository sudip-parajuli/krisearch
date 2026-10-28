import { timingSafeEqual } from "node:crypto";
import { runAutomation } from "@/lib/automation/run";
import { createClient } from "@/lib/supabase/server";
import { getAdminUserIds } from "@/lib/supabase/admin";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const actual = request.headers.get("authorization") ?? "";
  const candidate = Buffer.from(actual);
  const required = Buffer.from(`Bearer ${expected ?? ""}`);
  if (
    !expected ||
    candidate.length !== required.length ||
    !timingSafeEqual(candidate, required)
  )
    return Response.json({ error: "Not authorized" }, { status: 403 });
  const result = await runAutomation();
  return Response.json(result.body, { status: result.status });
}
export async function POST() {
  const client = await createClient();
  const { data } = await client.auth.getUser();
  if (!data.user || !getAdminUserIds().includes(data.user.id))
    return Response.json({ error: "Not authorized" }, { status: 403 });
  const result = await runAutomation();
  return Response.json(result.body, { status: result.status });
}
