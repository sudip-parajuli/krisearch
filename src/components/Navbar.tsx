"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sprout, Newspaper, Tractor, Search, User, LogIn, Home, Menu, X, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

const mobileTabs = [
  { href: "/", key: "navHome" as const, icon: Home },
  { href: "/search", key: "navSearch" as const, icon: Search },
  { href: "/feed", key: "navFeed" as const, icon: Newspaper },
  { href: "/tools", key: "navTools" as const, icon: Tractor },
];

const desktopLinks = [
  { href: "/feed", key: "navFeed" as const },
  { href: "/tools", key: "navTools" as const },
  { href: "/weather", key: "navWeather" as const },
  { href: "/schemes", key: "navSchemes" as const },
  { href: "/prices", key: "navPrices" as const },
  { href: "/vendors", key: "navVendors" as const },
];

export function Navbar() {
  const { t, lang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

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
          <Link href="/" aria-label={t("appName")} className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold text-green-700 dark:text-green-400">
            <Sprout className="h-6 w-6" strokeWidth={2.25} />
            <span className="hidden min-[360px]:inline">{t("appName")}</span>
          </Link>

          <form onSubmit={submitSearch} className="relative hidden max-w-xs flex-1 lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={q}
              aria-label={t("navSearch")}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-1.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-green-400 focus:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:focus:bg-neutral-800"
            />
          </form>

          <nav aria-label={lang === "ne" ? "मुख्य नेभिगेसन" : "Main navigation"} className="hidden items-center gap-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 xl:flex">
            {desktopLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className="relative py-1">
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
            <Link href="/search" aria-label={t("navSearch")} className="hidden rounded-full p-2 text-neutral-500 hover:bg-neutral-100 md:inline-flex dark:hover:bg-neutral-800 lg:hidden">
              <Search className="h-5 w-5" />
            </Link>
            <LanguageToggle />
            <ThemeToggle />
            <button type="button" aria-label={lang === "ne" ? "सबै पृष्ठहरू" : "All pages"} aria-expanded={menuOpen} aria-controls="all-pages-menu" onClick={() => setMenuPath(menuOpen ? null : pathname)} className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
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
        {menuOpen && <nav id="all-pages-menu" aria-label={lang === "ne" ? "सबै पृष्ठहरू" : "All pages"} onKeyDown={e => { if (e.key === "Escape") setMenuPath(null); }} className="mx-auto grid max-h-[70dvh] max-w-6xl grid-cols-2 gap-2 overflow-y-auto border-t border-neutral-200 p-4 sm:grid-cols-3 dark:border-neutral-800">
          {[{ href: "/crops", key: "navCrops" as const }, ...desktopLinks].map(link => <Link key={link.href} href={link.href} onClick={() => setMenuPath(null)} aria-current={pathname === link.href ? "page" : undefined} className={`rounded-xl border p-3 text-sm font-medium transition-colors hover:border-green-500 ${pathname === link.href ? "border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300" : "border-neutral-200 dark:border-neutral-800"}`}>{t(link.key)}</Link>)}
          <Link href="/saved" onClick={() => setMenuPath(null)} className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 text-sm hover:border-green-500 dark:border-neutral-800"><Bookmark className="h-4 w-4" />{lang === "ne" ? "राखिएका सामग्री" : "Saved resources"}</Link>
        </nav>}
      </header>

      {/* Mobile bottom tab bar */}
      <nav aria-label={lang === "ne" ? "मोबाइल नेभिगेसन" : "Mobile navigation"} className="mobile-tabs fixed bottom-0 left-0 right-0 z-40 flex border-t border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 md:hidden">
        {mobileTabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
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
