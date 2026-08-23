"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Crop, District } from "@/types/database";

const postTypes = [
  "question",
  "disease_pest_report",
  "fertilizer_tip",
  "market_price_report",
  "success_story",
  "general_discussion",
  "equipment_review",
] as const;

export function FeedFilters({ crops, districts }: { crops: Crop[]; districts: District[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectClass =
    "rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={selectClass}
        value={searchParams.get("crop") ?? ""}
        onChange={(e) => updateParam("crop", e.target.value)}
      >
        <option value="">{t("filterCrop")}</option>
        {crops.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name_en}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get("district") ?? ""}
        onChange={(e) => updateParam("district", e.target.value)}
      >
        <option value="">{t("filterDistrict")}</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get("type") ?? ""}
        onChange={(e) => updateParam("type", e.target.value)}
      >
        <option value="">{t("filterType")}</option>
        {postTypes.map((type) => (
          <option key={type} value={type}>
            {type.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      <div className="ml-auto inline-flex rounded-full border border-neutral-300 p-0.5 text-xs font-medium dark:border-neutral-700">
        {(["new", "top"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => updateParam("sort", s)}
            className={`rounded-full px-3 py-1 ${
              (searchParams.get("sort") ?? "new") === s
                ? "bg-green-600 text-white"
                : "text-neutral-600 dark:text-neutral-300"
            }`}
          >
            {s === "new" ? t("sortNew") : t("sortTop")}
          </button>
        ))}
      </div>
    </div>
  );
}
