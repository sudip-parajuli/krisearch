"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";
import type { PostRow } from "@/lib/data";
import type { PlatformStats } from "@/lib/data";

export function LandingClient({ recentPosts, stats }: { recentPosts: PostRow[]; stats: PlatformStats }) {
  const { t } = useLanguage();

  const statItems = [
    { value: stats.postCount, labelKey: "statPosts" as const, icon: "📝" },
    { value: stats.farmerCount, labelKey: "statFarmers" as const, icon: "🧑‍🌾" },
    { value: stats.districtCount, labelKey: "statDistricts" as const, icon: "📍" },
    { value: stats.cropCount, labelKey: "statCrops" as const, icon: "🌾" },
  ];

  const whyPoints = [
    { icon: "🧑‍🌾", titleKey: "whyPoint1Title" as const, bodyKey: "whyPoint1Body" as const },
    { icon: "📅", titleKey: "whyPoint2Title" as const, bodyKey: "whyPoint2Body" as const },
    { icon: "🔓", titleKey: "whyPoint3Title" as const, bodyKey: "whyPoint3Body" as const },
  ];

  return (
    <div className="flex flex-col gap-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 px-6 py-12 text-center text-white shadow-lg sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur">
            🇳🇵 {t("tagline")}
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">{t("heroTitle")}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-green-50 sm:text-base">{t("heroBody")}</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-green-700 shadow-md transition-transform hover:-translate-y-0.5 hover:bg-green-50"
            >
              {t("ctaJoin")}
            </Link>
            <Link
              href="/feed"
              className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("ctaBrowse")}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statItems.map((s) => (
          <div
            key={s.labelKey}
            className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="text-xl">{s.icon}</div>
            <div className="mt-1 text-2xl font-bold text-green-700 dark:text-green-400">{s.value.toLocaleString()}</div>
            <div className="text-xs text-neutral-500">{t(s.labelKey)}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t("whyTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {whyPoints.map((p) => (
            <div
              key={p.titleKey}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span className="text-2xl">{p.icon}</span>
              <p className="mt-2 font-semibold">{t(p.titleKey)}</p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t(p.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t("howItWorks")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <span className="text-2xl">📚</span>
            <p className="mt-2 text-sm text-amber-900 dark:text-amber-200">{t("factsLayerExplain")}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-2xl">🧑‍🌾</span>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{t("communityLayerExplain")}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
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

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t("exploreTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { href: "/crops/rice", icon: "🌾", label: t("navCrops") },
            { href: "/tools", icon: "🚜", label: t("navTools") },
            { href: "/schemes", icon: "📜", label: t("navSchemes") },
            { href: "/vendors", icon: "🏪", label: t("navVendors") },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
