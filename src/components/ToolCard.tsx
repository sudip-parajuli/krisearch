"use client";

import Link from "next/link";
import { Rocket, Radio, Droplets, Tractor, Warehouse, Sun, Package, Smartphone, Wrench, PlayCircle, type LucideIcon } from "lucide-react";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { slugify } from "@/lib/slug";
import type { Equipment } from "@/types/database";

const categoryIcons: Record<string, LucideIcon> = {
  drone: Rocket,
  iot_sensor: Radio,
  irrigation: Droplets,
  machinery: Tractor,
  greenhouse: Warehouse,
  solar: Sun,
  post_harvest: Package,
  digital_app: Smartphone,
};

export function ToolCard({ equipment }: { equipment: Equipment }) {
  const { t } = useLanguage();
  const Icon = categoryIcons[equipment.category ?? ""] ?? Wrench;
  return (
    <Link
      href={`/tools/${slugify(equipment.name)}`}
      className="group flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-green-400 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700 transition-colors group-hover:bg-green-100 dark:bg-green-950 dark:text-green-400">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <AvailabilityBadge status={equipment.availability_status} />
      </div>
      <h3 className="font-display font-semibold">
        {equipment.name}
        {equipment.name_np && <span className="ml-1.5 font-sans font-normal text-neutral-400">{equipment.name_np}</span>}
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
      {equipment.video_url && (
        <p className="flex items-center gap-1 text-[11px] font-medium text-red-600">
          <PlayCircle className="h-3.5 w-3.5" /> {t("watchVideo")}
        </p>
      )}
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
