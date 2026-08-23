"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";
import type { PostRow } from "@/lib/data";

export function LandingClient({ recentPosts }: { recentPosts: PostRow[] }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-2xl bg-gradient-to-br from-green-600 to-green-800 px-6 py-10 text-center text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("heroTitle")}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-green-50 sm:text-base">{t("heroBody")}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            {t("ctaJoin")}
          </Link>
          <Link
            href="/feed"
            className="rounded-full border border-white/60 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            {t("ctaBrowse")}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("howItWorks")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-2xl">📚</span>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{t("factsLayerExplain")}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-2xl">🧑‍🌾</span>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{t("communityLayerExplain")}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("recentActivity")}</h2>
          <Link href="/feed" className="text-sm font-medium text-green-700 hover:underline dark:text-green-400">
            {t("navFeed")} →
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <EmptyState title={t("noPostsYet")} />
        ) : (
          <div className="flex flex-col gap-3">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        {[
          { href: "/crops/rice", icon: "🌾", label: t("navCrops") },
          { href: "/tools", icon: "🚜", label: t("navTools") },
          { href: "/schemes", icon: "📜", label: t("navSchemes") },
          { href: "/vendors", icon: "🏪", label: t("navVendors") },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white p-4 text-center hover:border-green-400 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
