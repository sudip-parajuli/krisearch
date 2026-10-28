import { createAdminClient } from "@/lib/supabase/admin";
import { AutomationControls } from "./AutomationControls";
import {
  reviewAutomationItem,
  registerAutomationSource,
} from "@/app/admin/actions";
import { hasTextAI } from "@/lib/ai/openrouter";
export async function AutomationAdmin() {
  const admin = createAdminClient();
  if (!admin) return <p>Database admin is not configured.</p>;
  const [{ data: sources, error }, { data: pending }, { data: runs }] =
    await Promise.all([
      admin
        .from("automation_sources")
        .select(
          "id,label,kind,url,enabled,checked_at,last_success_at,last_error",
        ),
      admin
        .from("automation_items")
        .select("*")
        .eq("state", "pending")
        .order("checked_at", { ascending: false })
        .limit(20),
      admin
        .from("automation_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(5),
    ]);
  return (
    <section className="space-y-4 rounded-2xl border border-green-200 p-5 dark:border-green-900">
      <h2 className="text-xl font-semibold">Automation & AI</h2>
      <p className="text-sm">
        Cron authentication:{" "}
        {process.env.CRON_SECRET ? "configured" : "not configured"} · Text AI:{" "}
        {hasTextAI() ? "configured" : "not configured"}
      </p>
      {error ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Apply supabase/migrations/0010_automation.sql before running jobs.
        </p>
      ) : (
        <>
          <AutomationControls />
          <h3 className="font-semibold">Registered sources</h3>
          {sources?.map((source) => (
            <div
              key={source.id}
              className="rounded-xl bg-neutral-50 p-3 text-xs dark:bg-neutral-900"
            >
              <p className="font-semibold">
                {source.label} · {source.kind} ·{" "}
                {source.enabled ? "enabled" : "disabled"}
              </p>
              <p className="mt-1 break-all">{source.url}</p>
              <p>
                Last checked: {source.checked_at ?? "never"} · Last successful:{" "}
                {source.last_success_at ?? "never"}
              </p>
              {source.last_error && (
                <p className="text-red-600 dark:text-red-400">
                  {source.last_error}
                </p>
              )}
            </div>
          ))}
          <details className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <summary className="text-sm font-semibold">
              Register an approved JSON feed
            </summary>
            <p className="my-3 text-xs text-neutral-500">
              The source hostname must be approved in AUTOMATION_ALLOWED_HOSTS.
              New records are staged for review. See docs/AUTOMATION.md for the
              feed contract.
            </p>
            <form action={registerAutomationSource} className="grid gap-3">
              <input
                name="label"
                required
                aria-label="Source label"
                placeholder="Source label"
                className="rounded border border-neutral-300 bg-transparent p-2 text-sm"
              />
              <input
                name="url"
                type="url"
                required
                aria-label="JSON feed URL"
                placeholder="https://approved-provider.example/feed.json"
                className="rounded border border-neutral-300 bg-transparent p-2 text-sm"
              />
              <select
                name="kind"
                aria-label="Catalog kind"
                className="rounded border border-neutral-300 bg-white p-2 text-sm dark:bg-neutral-900"
              >
                <option value="scheme">Schemes</option>
                <option value="vendor">Vendors</option>
                <option value="tool">Tools</option>
                <option value="notice">Notices</option>
              </select>
              <button className="w-fit rounded-full bg-green-700 px-4 py-2 text-xs text-white">
                Register source
              </button>
            </form>
          </details>
          <h3 className="font-semibold">
            Pending discoveries ({pending?.length ?? 0})
          </h3>
          {pending?.map((item) => (
            <article
              key={item.id}
              className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                {item.title}
              </a>
              <p className="text-xs text-neutral-500">
                {item.kind} · {item.source_id}
              </p>
              <pre className="overflow-auto whitespace-pre-wrap text-xs">
                {JSON.stringify(item.payload, null, 2)}
              </pre>
              <div className="flex gap-3">
                <form
                  action={reviewAutomationItem.bind(null, item.id, "publish")}
                >
                  <button className="rounded-full bg-green-700 px-4 py-2 text-xs text-white">
                    Review complete: publish
                  </button>
                </form>
                <form
                  action={reviewAutomationItem.bind(null, item.id, "ignore")}
                >
                  <button className="rounded-full border border-neutral-300 px-4 py-2 text-xs dark:border-neutral-700">
                    Ignore
                  </button>
                </form>
              </div>
            </article>
          ))}
          <h3 className="font-semibold">Latest job runs</h3>
          {runs?.map((run) => (
            <details
              key={run.id}
              className="rounded-lg bg-neutral-50 p-3 text-xs dark:bg-neutral-900"
            >
              <summary>
                {run.started_at} · {run.status}
              </summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap">
                {JSON.stringify(run.details, null, 2)}
              </pre>
            </details>
          ))}
        </>
      )}
    </section>
  );
}
