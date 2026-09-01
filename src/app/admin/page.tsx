import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, getAdminUserIds } from "@/lib/supabase/admin";
import { updateReportStatus, setVerifiedBadge, updateFeedbackStatus, reviewVerificationRequest } from "./actions";
import { EmptyState } from "@/components/EmptyState";
import { SyncPricesButton } from "@/components/SyncPricesButton";
import type { Report, Profile, Feedback, VerificationRequest } from "@/types/database";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const adminIds = getAdminUserIds();
  const isAdmin = !!authData.user && adminIds.includes(authData.user.id);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md text-center">
        <EmptyState
          icon={Lock}
          title="Not authorized"
          body="This area is restricted to admins listed in the ADMIN_USER_IDS environment variable."
        />
      </div>
    );
  }

  const admin = createAdminClient();
  const [{ data: reports }, { data: profiles }, { data: feedback }, { data: verifications }] = admin
    ? await Promise.all([
        admin
          .from("reports")
          .select("*, posts(id, title), comments(id, body)")
          .eq("status", "open")
          .order("created_at", { ascending: false }),
        admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(50),
        admin.from("feedback").select("*").eq("status", "open").order("created_at", { ascending: false }),
        admin
          .from("verification_requests")
          .select("*, profiles:profile_id(id, display_name)")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-3 text-xl font-bold">Market price sync</h1>
        <SyncPricesButton />
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold">Feedback inbox ({feedback?.length ?? 0})</h2>
        {!feedback || feedback.length === 0 ? (
          <EmptyState title="No open feedback" />
        ) : (
          <div className="flex flex-col gap-2">
            {(feedback as Feedback[]).map((f) => (
              <div key={f.id} className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                <p>{f.message}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {f.name ?? "Anonymous"} {f.contact ? `· ${f.contact}` : ""} {f.page_url ? `· ${f.page_url}` : ""} ·{" "}
                  {new Date(f.created_at).toLocaleString()}
                </p>
                <form action={updateFeedbackStatus.bind(null, f.id, "reviewed")} className="mt-2 flex gap-2">
                  <input
                    name="note"
                    placeholder="Resolution note (optional, shown on public /changelog)"
                    className="flex-1 rounded-lg border border-neutral-200 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-950"
                  />
                  <button className="shrink-0 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
                    Mark reviewed
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold">Open reports ({reports?.length ?? 0})</h2>
        {!reports || reports.length === 0 ? (
          <EmptyState title="No open reports" />
        ) : (
          <div className="flex flex-col gap-2">
            {(reports as (Report & { posts: { id: string; title: string } | null; comments: { id: string; body: string } | null })[]).map(
              (r) => (
                <div key={r.id} className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                  <p className="font-medium">{r.posts?.title ?? r.comments?.body ?? "Content removed"}</p>
                  {r.reason && <p className="mt-1 text-xs text-neutral-500">Reason: {r.reason}</p>}
                  <div className="mt-2 flex gap-2">
                    <form action={updateReportStatus.bind(null, r.id, "reviewed")}>
                      <button className="rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
                        Mark reviewed
                      </button>
                    </form>
                    <form action={updateReportStatus.bind(null, r.id, "dismissed")}>
                      <button className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                        Dismiss
                      </button>
                    </form>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold">Verification requests ({verifications?.length ?? 0})</h2>
        {!verifications || verifications.length === 0 ? (
          <EmptyState title="No pending verification requests" />
        ) : (
          <div className="flex flex-col gap-2">
            {(verifications as (VerificationRequest & { profiles: { id: string; display_name: string | null } | null })[]).map((v) => (
              <div key={v.id} className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                <p className="font-medium">
                  {v.profiles?.display_name ?? v.profile_id} — <span className="capitalize">{v.requested_badge.replace("_", " ")}</span>
                </p>
                {v.evidence_text && <p className="mt-1 text-xs text-neutral-500">{v.evidence_text}</p>}
                {v.evidence_url && (
                  <a href={v.evidence_url} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-green-700 hover:underline dark:text-green-400">
                    {v.evidence_url}
                  </a>
                )}
                <div className="mt-2 flex gap-2">
                  <form action={reviewVerificationRequest.bind(null, v.id, v.profile_id!, v.requested_badge, true)}>
                    <button className="rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">Approve</button>
                  </form>
                  <form action={reviewVerificationRequest.bind(null, v.id, v.profile_id!, v.requested_badge, false)}>
                    <button className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium hover:bg-neutral-300 dark:bg-neutral-800">Reject</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold">Verified badges</h2>
        <div className="flex flex-col gap-2">
          {(profiles as Profile[] | null)?.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
              <div>
                <p className="font-medium">{p.display_name ?? p.id}</p>
                <p className="text-xs text-neutral-400">{p.verified_badge ?? "no badge"}</p>
              </div>
              <div className="flex gap-1">
                <form action={setVerifiedBadge.bind(null, p.id, "extension_officer")}>
                  <button className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300">
                    Extension officer
                  </button>
                </form>
                <form action={setVerifiedBadge.bind(null, p.id, "agrovet")}>
                  <button className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-800 hover:bg-teal-200 dark:bg-teal-950 dark:text-teal-300">
                    Agrovet
                  </button>
                </form>
                <form action={setVerifiedBadge.bind(null, p.id, null)}>
                  <button className="rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-medium hover:bg-neutral-300 dark:bg-neutral-800">
                    Revoke
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
