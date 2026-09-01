"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";
import { AnimatedCounter } from "./AnimatedCounter";
import { CollapsibleSection } from "./CollapsibleSection";
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
    <div className="flex flex-col gap-8">
      {/* Hero — brand + primary CTAs, kept brief so live content follows fast */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 px-6 py-10 text-center text-white shadow-lg sm:py-12"
      >
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
          <h1 className="mx-auto max-w-2xl text-2xl font-bold leading-tight sm:text-3xl">{t("heroTitle")}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-green-50">{t("heroBody")}</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-green-700 shadow-md transition-transform hover:-translate-y-0.5 hover:bg-green-50"
            >
              {t("ctaJoin")}
            </Link>
            <Link
              href="/feed"
              className="rounded-full border border-white/60 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("ctaBrowse")}
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Live stats — proof the platform is active, right up front */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statItems.map((s, i) => (
          <motion.div
            key={s.labelKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="text-xl">{s.icon}</div>
            <div className="mt-1 text-2xl font-bold text-green-700 dark:text-green-400">
              <AnimatedCounter value={s.value} />
            </div>
            <div className="text-xs text-neutral-500">{t(s.labelKey)}</div>
          </motion.div>
        ))}
      </section>

      {/* Recent activity — what visitors actually came for — right after
          the hero, before any explainer copy. */}
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
            {recentPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i, 4) * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
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
            className="flex flex-col items-center gap-1 rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </section>

      {/* Explainer content — genuinely useful, but not what a visitor came
          for on every visit, so it's collapsed by default. */}
      <section className="flex flex-col gap-2">
        <CollapsibleSection title={t("whyTitle")} icon="💡">
          <div className="grid gap-3 sm:grid-cols-3">
            {whyPoints.map((p) => (
              <div key={p.titleKey}>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {p.icon} {t(p.titleKey)}
                </p>
                <p className="mt-1">{t(p.bodyKey)}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
        <CollapsibleSection title={t("howItWorks")} icon="📚">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
              <p className="text-amber-900 dark:text-amber-200">{t("factsLayerExplain")}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
              <p>{t("communityLayerExplain")}</p>
            </div>
          </div>
        </CollapsibleSection>
      </section>
    </div>
  );
}
