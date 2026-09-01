"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  Wheat,
  Wrench,
  Store,
  ScrollText,
  MessageSquare,
  Sparkles,
  Sun,
  Sprout as SproutIcon,
  HeartPulse,
  Banknote,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { slugify } from "@/lib/slug";
import { EmptyState } from "./EmptyState";
import type { SearchResults } from "@/lib/data";
import type { SearchOverview } from "@/lib/ai/search-overview";

export function SearchClient({ initialQuery, results }: { initialQuery: string; results: SearchResults }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [overview, setOverview] = useState<SearchOverview>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overviewTried, setOverviewTried] = useState(false);

  const topCrop = results.crops[0];
  const hasAnyResults =
    results.crops.length + results.equipment.length + results.vendors.length + results.schemes.length + results.posts.length > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  async function loadOverview() {
    if (!topCrop) return;
    setLoadingOverview(true);
    try {
      const res = await fetch("/api/ai/search-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: topCrop.name_en, category: topCrop.category, baselineNotes: topCrop.baseline_notes }),
      });
      const data = await res.json();
      setOverview(data.overview ?? null);
    } catch {
      setOverview(null);
    }
    setLoadingOverview(false);
    setOverviewTried(true);
  }

  const relatedVendors = topCrop
    ? results.vendors.filter((v) => v.crops_bought?.includes(topCrop.id) || v.crops_supplied?.includes(topCrop.id))
    : [];

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={submit} className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          autoFocus
          className="w-full rounded-full border border-neutral-200 bg-white py-3 pl-12 pr-4 text-base shadow-sm outline-none transition-colors focus:border-green-400 dark:border-neutral-800 dark:bg-neutral-900"
        />
      </form>

      {!initialQuery && <EmptyState icon={SearchIcon} title={t("searchEmptyPrompt")} />}

      {initialQuery && !hasAnyResults && <EmptyState title={t("searchNoResults")} />}

      {topCrop && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm dark:border-green-900 dark:from-green-950 dark:to-neutral-900"
        >
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold">{topCrop.name_en}</h1>
              {topCrop.name_np && <span className="text-lg text-neutral-400">{topCrop.name_np}</span>}
              {topCrop.category && (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {topCrop.category.replace("_", " ")}
                </span>
              )}
            </div>
            {topCrop.baseline_notes && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{topCrop.baseline_notes}</p>}

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/crops/${slugify(topCrop.name_en)}`}
                className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-700"
              >
                {t("communityFeedFor")} →
              </Link>
              {!overview && (
                <button
                  type="button"
                  onClick={loadOverview}
                  disabled={loadingOverview}
                  className="inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-white px-4 py-2 text-xs font-semibold text-green-700 shadow-sm hover:bg-green-50 disabled:opacity-60 dark:border-green-800 dark:bg-neutral-900 dark:text-green-400"
                >
                  {loadingOverview ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {loadingOverview ? t("aiOverviewLoading") : t("aiOverviewButton")}
                </button>
              )}
            </div>
            {overviewTried && !overview && !loadingOverview && (
              <p className="mt-2 text-xs text-neutral-400">{t("aiOverviewUnavailable")}</p>
            )}

            {relatedVendors.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {relatedVendors.map((v) => (
                  <span
                    key={v.id}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 shadow-sm dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    <Store className="h-3 w-3" /> {v.business_name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {overview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden border-t border-green-100 bg-white/60 dark:border-green-900 dark:bg-black/20"
              >
                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  {[
                    { icon: Sun, titleKey: "aiOverviewClimate" as const, text: overview.climate },
                    { icon: SproutIcon, titleKey: "aiOverviewProcess" as const, text: overview.process },
                    { icon: HeartPulse, titleKey: "aiOverviewCare" as const, text: overview.care },
                    { icon: Banknote, titleKey: "aiOverviewSelling" as const, text: overview.selling },
                  ].map((section) => (
                    <div key={section.titleKey}>
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
                        <section.icon className="h-3.5 w-3.5" /> {t(section.titleKey)}
                      </p>
                      <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{section.text}</p>
                    </div>
                  ))}
                </div>
                <p className="border-t border-green-100 px-5 py-3 text-xs text-neutral-400 dark:border-green-900">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  {t("aiOverviewDisclaimer")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      <ResultGroup
        icon={Wheat}
        titleKey="resultsCrops"
        items={results.crops.slice(topCrop ? 1 : 0)}
        render={(c) => (
          <Link key={c.id} href={`/crops/${slugify(c.name_en)}`} className="block">
            <p className="font-medium">
              {c.name_en} {c.name_np && <span className="text-neutral-400">{c.name_np}</span>}
            </p>
            {c.baseline_notes && <p className="line-clamp-1 text-xs text-neutral-500">{c.baseline_notes}</p>}
          </Link>
        )}
      />
      <ResultGroup
        icon={Wrench}
        titleKey="resultsTools"
        items={results.equipment}
        render={(e) => (
          <Link key={e.id} href={`/tools/${slugify(e.name)}`} className="block">
            <p className="font-medium">{e.name}</p>
            {e.description && <p className="line-clamp-1 text-xs text-neutral-500">{e.description}</p>}
          </Link>
        )}
      />
      <ResultGroup
        icon={Store}
        titleKey="resultsVendors"
        items={results.vendors}
        render={(v) => (
          <div key={v.id}>
            <p className="font-medium">{v.business_name}</p>
            <p className="text-xs capitalize text-neutral-500">{v.vendor_type.replace("_", " ")}</p>
          </div>
        )}
      />
      <ResultGroup
        icon={ScrollText}
        titleKey="resultsSchemes"
        items={results.schemes}
        render={(s) => (
          <Link key={s.id} href="/schemes" className="block">
            <p className="font-medium">{s.title}</p>
          </Link>
        )}
      />
      <ResultGroup
        icon={MessageSquare}
        titleKey="resultsPosts"
        items={results.posts}
        render={(p) => (
          <Link key={p.id} href={`/post/${p.id}`} className="block">
            <p className="font-medium">{p.title}</p>
            <p className="line-clamp-1 text-xs text-neutral-500">{p.body}</p>
          </Link>
        )}
      />
    </div>
  );
}

function ResultGroup<T extends { id: string | number }>({
  icon: Icon,
  titleKey,
  items,
  render,
}: {
  icon: typeof Wheat;
  titleKey: "resultsCrops" | "resultsTools" | "resultsVendors" | "resultsSchemes" | "resultsPosts";
  items: T[];
  render: (item: T) => React.ReactNode;
}) {
  const { t } = useLanguage();
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        <Icon className="h-4 w-4" /> {t(titleKey)}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            {render(item)}
          </div>
        ))}
      </div>
    </section>
  );
}
