"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sprout, Newspaper, Tractor, Search, User, LogIn, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

const mobileTabs = [
  { href: "/", key: "navHome" as const, icon: Home },
  { href: "/search", key: "navSearch" as const, icon: Search },
  { href: "/feed", key: "navFeed" as const, icon: Newspaper },
  { href: "/tools", key: "navTools" as const, icon: Tractor },
];

const desktopLinks = [
  { href: "/feed", key: "navFeed" as const },
  { href: "/tools", key: "navTools" as const },
  { href: "/schemes", key: "navSchemes" as const },
  { href: "/prices", key: "navPrices" as const },
  { href: "/vendors", key: "navVendors" as const },
];

export function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-neutral-800/80 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold text-green-700 dark:text-green-400">
            <Sprout className="h-6 w-6" strokeWidth={2.25} />
            <span>{t("appName")}</span>
          </Link>

          <form onSubmit={submitSearch} className="relative hidden max-w-xs flex-1 lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-1.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-green-400 focus:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:focus:bg-neutral-800"
            />
          </form>

          <nav className="hidden items-center gap-5 text-sm font-medium text-neutral-700 dark:text-neutral-300 md:flex">
            {desktopLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className="relative py-1">
                  <span className={active ? "text-green-700 dark:text-green-400" : ""}>{t(link.key)}</span>
                  {active && (
                    <motion.span
                      layoutId="navActiveUnderline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-green-600"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/search" className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden">
              <Search className="h-5 w-5" />
            </Link>
            <LanguageToggle />
            {userId ? (
              <Link
                href={`/profile/${userId}`}
                className="hidden items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 sm:flex"
              >
                <User className="h-4 w-4" />
                {t("navProfile")}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 sm:flex"
              >
                <LogIn className="h-4 w-4" />
                {t("navLogin")}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 md:hidden">
        {mobileTabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? "text-green-700 dark:text-green-400" : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {t(tab.key)}
            </Link>
          );
        })}
        <Link
          href={userId ? `/profile/${userId}` : "/login"}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
            pathname.startsWith("/profile") || pathname === "/login"
              ? "text-green-700 dark:text-green-400"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          <User className="h-5 w-5" />
          {t("navProfile")}
        </Link>
      </nav>
    </>
  );
}
