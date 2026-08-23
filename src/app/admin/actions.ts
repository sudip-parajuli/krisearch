"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, getAdminUserIds } from "@/lib/supabase/admin";
import type { ReportStatus, VerifiedBadge } from "@/types/database";

async function assertAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const adminIds = getAdminUserIds();
  if (!data.user || !adminIds.includes(data.user.id)) {
    throw new Error("Not authorized.");
  }
}

export async function updateReportStatus(reportId: string, status: ReportStatus) {
  await assertAdmin();
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY).");
  await admin.from("reports").update({ status }).eq("id", reportId);
  revalidatePath("/admin");
}

export async function setVerifiedBadge(profileId: string, badge: VerifiedBadge) {
  await assertAdmin();
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY).");
  await admin.from("profiles").update({ verified_badge: badge }).eq("id", profileId);
  revalidatePath("/admin");
}
