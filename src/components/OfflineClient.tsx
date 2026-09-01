"use client";

import { WifiOff } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function OfflineClient() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        <WifiOff className="h-8 w-8 text-neutral-400" strokeWidth={1.5} />
      </div>
      <h1 className="text-lg font-bold">{t("offlineTitle")}</h1>
      <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{t("offlineBody")}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
      >
        {t("offlineRetry")}
      </button>
    </div>
  );
}
