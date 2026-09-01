"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Sprout,
  MapPin,
  Wheat,
  Tractor,
  ScrollText,
  Store,
  Sparkles,
  BookOpen,
  CalendarCheck,
  Unlock,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";
import { AnimatedCounter } from "./AnimatedCounter";
import { CollapsibleSection } from "./CollapsibleSection";
import type { PostRow } from "@/lib/data";
import type { PlatformStats } from "@/lib/data";

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, rotateX: 4, rotateY: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingClient({ recentPosts, stats }: { recentPosts: PostRow[]; stats: PlatformStats }) {
  const { t } = useLanguage();

  const statItems: { value: number; labelKey: Parameters<typeof t>[0]; icon: LucideIcon }[] = [
    { value: stats.postCount, labelKey: "statPosts", icon: FileText },
    { value: stats.farmerCount, labelKey: "statFarmers", icon: Sprout },
    { value: stats.districtCount, labelKey: "statDistricts", icon: MapPin },
    { value: stats.cropCount, labelKey: "statCrops", icon: Wheat },
  ];

  const whyPoints: { icon: LucideIcon; titleKey: Parameters<typeof t>[0]; bodyKey: Parameters<typeof t>[0] }[] = [
    { icon: Sprout, titleKey: "whyPoint1Title", bodyKey: "whyPoint1Body" },
    { icon: CalendarCheck, titleKey: "whyPoint2Title", bodyKey: "whyPoint2Body" },
    { icon: Unlock, titleKey: "whyPoint3Title", bodyKey: "whyPoint3Body" },
  ];

  const exploreLinks: { href: string; icon: LucideIcon; label: string }[] = [
    { href: "/crops/rice", icon: Wheat, label: t("navCrops") },
    { href: "/tools", icon: Tractor, label: t("navTools") },
    { href: "/schemes", icon: ScrollText, label: t("navSchemes") },
    { href: "/vendors", icon: Store, label: t("navVendors") },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Hero — brand + primary CTAs, kept brief so live content follows fast */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-green-800 to-green-950 px-6 py-12 text-center text-white shadow-xl sm:py-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl"
        />
        <div className="relative">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold-200 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" /> {t("tagline")}
          </motion.span>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-green-50/90 sm:text-base">{t("heroBody")}</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-green-800 shadow-md"
              >
                {t("ctaJoin")}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/feed"
                className="block rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {t("ctaBrowse")}
              </Link>
            </motion.div>
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
          >
            <TiltCard className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">
                <s.icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="mt-1.5 font-display text-2xl font-semibold text-green-800 dark:text-green-300">
                <AnimatedCounter value={s.value} />
              </div>
              <div className="text-xs text-neutral-500">{t(s.labelKey)}</div>
            </TiltCard>
          </motion.div>
        ))}
      </section>

      {/* Recent activity — what visitors actually came for — right after
          the hero, before any explainer copy. */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{t("recentActivity")}</h2>
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
        {exploreLinks.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <TiltCard className="flex flex-col items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm hover:border-green-400 dark:border-neutral-800 dark:bg-neutral-900">
              <Link href={item.href} className="flex flex-col items-center gap-1.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-300">
                  <item.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </section>

      {/* Explainer content — genuinely useful, but not what a visitor came
          for on every visit, so it's collapsed by default. */}
      <section className="flex flex-col gap-2">
        <CollapsibleSection title={t("whyTitle")} icon={Sparkles}>
          <div className="grid gap-3 sm:grid-cols-3">
            {whyPoints.map((p) => (
              <div key={p.titleKey}>
                <p className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
                  <p.icon className="h-4 w-4 text-green-600 dark:text-green-400" /> {t(p.titleKey)}
                </p>
                <p className="mt-1">{t(p.bodyKey)}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
        <CollapsibleSection title={t("howItWorks")} icon={BookOpen}>
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
