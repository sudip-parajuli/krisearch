"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ScopeTabs() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") === "global" ? "global" : "nepal";

  function setScope(next: "nepal" | "global") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex rounded-full border border-neutral-300 p-0.5 text-sm font-medium dark:border-neutral-700">
      <button
        type="button"
        onClick={() => setScope("nepal")}
        className={`rounded-full px-3 py-1.5 ${scope === "nepal" ? "bg-green-600 text-white" : "text-neutral-600 dark:text-neutral-300"}`}
      >
        {t("scopeNepal")}
      </button>
      <button
        type="button"
        onClick={() => setScope("global")}
        className={`rounded-full px-3 py-1.5 ${scope === "global" ? "bg-green-600 text-white" : "text-neutral-600 dark:text-neutral-300"}`}
      >
        {t("scopeGlobal")}
      </button>
    </div>
  );
}
