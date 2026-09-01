"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, getAdminUserIds } from "@/lib/supabase/admin";
import type { ReportStatus, VerifiedBadge } from "@/types/database";

type FeedbackStatus = "open" | "reviewed";

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

export async function updateFeedbackStatus(feedbackId: string, status: FeedbackStatus, formData?: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY).");
  const note = formData?.get("note");
  await admin
    .from("feedback")
    .update({ status, resolution_note: typeof note === "string" && note.trim() ? note.trim() : null })
    .eq("id", feedbackId);
  revalidatePath("/admin");
  revalidatePath("/changelog");
}

export async function reviewVerificationRequest(requestId: string, profileId: string, badge: Exclude<VerifiedBadge, null>, approve: boolean) {
  await assertAdmin();
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY).");
  await admin.from("verification_requests").update({ status: approve ? "approved" : "rejected" }).eq("id", requestId);
  if (approve) {
    await admin.from("profiles").update({ verified_badge: badge }).eq("id", profileId);
  }
  revalidatePath("/admin");
}
