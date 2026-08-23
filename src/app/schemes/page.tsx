import { getSchemes } from "@/lib/data";
import { EmptyState } from "@/components/EmptyState";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

function isStale(dateStr: string) {
  const last = new Date(dateStr);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return last < sixMonthsAgo;
}

export default async function SchemesPage() {
  const schemes = await getSchemes();

  return (
    <div>
      <SupabaseSetupNotice />
      <h1 className="mb-1 text-2xl font-bold">Government scheme directory</h1>
      <p className="mb-5 text-sm text-neutral-500">
        Subsidy and program rules change with budget cycles — always check the &quot;last verified&quot; date.
      </p>

      {schemes.length === 0 ? (
        <EmptyState title="No schemes listed yet" />
      ) : (
        <div className="flex flex-col gap-3">
          {schemes.map((scheme) => {
            const stale = isStale(scheme.last_verified);
            return (
              <div
                key={scheme.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold">{scheme.title}</h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      stale
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                    }`}
                  >
                    Last verified: {scheme.last_verified}
                    {stale ? " (may be outdated)" : ""}
                  </span>
                </div>
                {scheme.description && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{scheme.description}</p>
                )}
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  {scheme.eligibility && (
                    <div>
                      <span className="font-semibold text-neutral-500">Eligibility: </span>
                      {scheme.eligibility}
                    </div>
                  )}
                  {scheme.how_to_apply && (
                    <div>
                      <span className="font-semibold text-neutral-500">How to apply: </span>
                      {scheme.how_to_apply}
                    </div>
                  )}
                </div>
                {scheme.source_url && (
                  <a
                    href={scheme.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-green-700 hover:underline dark:text-green-400"
                  >
                    Source ↗
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
