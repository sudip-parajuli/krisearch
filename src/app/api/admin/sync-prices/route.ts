import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminUserIds } from "@/lib/supabase/admin";
import { runPriceSync } from "@/lib/automation/prices";
export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const adminIds = getAdminUserIds();
  if (!authData.user || !adminIds.includes(authData.user.id)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const result = await runPriceSync();
  return NextResponse.json(result.body, { status: result.status });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const result = await runPriceSync();
  return NextResponse.json(result.body, { status: result.status });
}
