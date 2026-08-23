import { createClient } from "@/lib/supabase/server";
import { createAdminClient, getAdminUserIds } from "@/lib/supabase/admin";
import { updateReportStatus, setVerifiedBadge } from "./actions";
import { EmptyState } from "@/components/EmptyState";
import type { Report, Profile } from "@/types/database";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const adminIds = getAdminUserIds();
  const isAdmin = !!authData.user && adminIds.includes(authData.user.id);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md text-center">
        <EmptyState
          icon="🔒"
          title="Not authorized"
          body="This area is restricted to admins listed in the ADMIN_USER_IDS environment variable."
        />
      </div>
    );
  }

  const admin = createAdminClient();
  const [{ data: reports }, { data: profiles }] = admin
    ? await Promise.all([
        admin
          .from("reports")
          .select("*, posts(id, title), comments(id, body)")
          .eq("status", "open")
          .order("created_at", { ascending: false }),
        admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(50),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-3 text-xl font-bold">Open reports ({reports?.length ?? 0})</h1>
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
