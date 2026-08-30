"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

const mobileTabs = [
  { href: "/", key: "navHome" as const, icon: "🏠" },
  { href: "/feed", key: "navFeed" as const, icon: "📋" },
  { href: "/tools", key: "navTools" as const, icon: "🚜" },
  { href: "/schemes", key: "navSchemes" as const, icon: "📜" },
];

export function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-neutral-800/80 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-green-700 dark:text-green-400">
            <span className="text-2xl">🌾</span>
            <span>{t("appName")}</span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium text-neutral-700 dark:text-neutral-300 md:flex">
            <Link href="/feed" className={pathname === "/feed" ? "text-green-700 dark:text-green-400" : ""}>
              {t("navFeed")}
            </Link>
            <Link href="/tools" className={pathname === "/tools" ? "text-green-700 dark:text-green-400" : ""}>
              {t("navTools")}
            </Link>
            <Link href="/schemes" className={pathname === "/schemes" ? "text-green-700 dark:text-green-400" : ""}>
              {t("navSchemes")}
            </Link>
            <Link href="/prices" className={pathname === "/prices" ? "text-green-700 dark:text-green-400" : ""}>
              {t("navPrices")}
            </Link>
            <Link href="/vendors" className={pathname === "/vendors" ? "text-green-700 dark:text-green-400" : ""}>
              {t("navVendors")}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            {userId ? (
              <Link
                href={`/profile/${userId}`}
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium dark:bg-neutral-800"
              >
                {t("navProfile")}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
              >
                {t("navLogin")}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 md:hidden">
        {mobileTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              pathname === tab.href ? "text-green-700 dark:text-green-400" : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            {t(tab.key)}
          </Link>
        ))}
        <Link
          href={userId ? `/profile/${userId}` : "/login"}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
            pathname.startsWith("/profile") || pathname === "/login"
              ? "text-green-700 dark:text-green-400"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          <span className="text-lg leading-none">👤</span>
          {t("navProfile")}
        </Link>
      </nav>
    </>
  );
}
