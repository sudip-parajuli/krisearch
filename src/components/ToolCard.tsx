"use client";

import Link from "next/link";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { slugify } from "@/lib/slug";
import type { Equipment } from "@/types/database";

const categoryIcons: Record<string, string> = {
  drone: "🛸",
  iot_sensor: "📡",
  irrigation: "💧",
  machinery: "🚜",
  greenhouse: "🏡",
  solar: "☀️",
  post_harvest: "📦",
  digital_app: "📱",
};

export function ToolCard({ equipment }: { equipment: Equipment }) {
  const { t } = useLanguage();
  return (
    <Link
      href={`/tools/${slugify(equipment.name)}`}
      className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl">{categoryIcons[equipment.category ?? ""] ?? "🔧"}</span>
        <AvailabilityBadge status={equipment.availability_status} />
      </div>
      <h3 className="font-semibold">
        {equipment.name}
        {equipment.name_np && <span className="ml-1.5 font-normal text-neutral-400">{equipment.name_np}</span>}
      </h3>
      {equipment.description && (
        <p className="line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">{equipment.description}</p>
      )}
      <div className="mt-1 flex flex-col gap-0.5 text-xs">
        {(equipment.purchase_price_min || equipment.purchase_price_max) && (
          <span>
            <span className="text-neutral-400">Buy: </span>
            NPR {equipment.purchase_price_min?.toLocaleString()}–{equipment.purchase_price_max?.toLocaleString()}
          </span>
        )}
        {equipment.rental_price && (
          <span>
            <span className="text-neutral-400">Rent: </span>
            NPR {equipment.rental_price.toLocaleString()} {equipment.rental_price_unit}
          </span>
        )}
      </div>
      {equipment.video_url && <p className="text-[11px] font-medium text-red-600">▶ {t("watchVideo")}</p>}
      <p className="mt-1 text-[11px] text-neutral-400">
        {equipment.source_url ? (
          <>
            {t("source")}: {new URL(equipment.source_url).hostname.replace(/^www\./, "")}
          </>
        ) : (
          <>{t("unverifiedEstimate")}</>
        )}
      </p>
    </Link>
  );
}
