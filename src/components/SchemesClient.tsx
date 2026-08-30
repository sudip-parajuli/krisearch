"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { EmptyState } from "./EmptyState";
import type { Scheme } from "@/types/database";

function isStale(dateStr: string) {
  const last = new Date(dateStr);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return last < sixMonthsAgo;
}

export function SchemesClient({ schemes }: { schemes: Scheme[] }) {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">{t("schemesTitle")}</h1>
      <p className="mb-5 text-sm text-neutral-500">{t("schemesSubtitle")}</p>

      {schemes.length === 0 ? (
        <EmptyState title={t("noSchemesYet")} />
      ) : (
        <div className="flex flex-col gap-3">
          {schemes.map((scheme) => {
            const stale = isStale(scheme.last_verified);
            return (
              <div
                key={scheme.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
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
                    {t("lastVerified")}: {scheme.last_verified}
                    {stale ? ` (${t("mayBeOutdated")})` : ""}
                  </span>
                </div>
                {scheme.description && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{scheme.description}</p>
                )}
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  {scheme.eligibility && (
                    <div>
                      <span className="font-semibold text-neutral-500">{t("eligibility")}: </span>
                      {scheme.eligibility}
                    </div>
                  )}
                  {scheme.how_to_apply && (
                    <div>
                      <span className="font-semibold text-neutral-500">{t("howToApply")}: </span>
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
                    {t("source")} ↗
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
