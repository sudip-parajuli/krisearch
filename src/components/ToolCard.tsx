import Link from "next/link";
import { AvailabilityBadge } from "./AvailabilityBadge";
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
  return (
    <Link
      href={`/tools/${slugify(equipment.name)}`}
      className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 hover:border-green-400 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl">{categoryIcons[equipment.category ?? ""] ?? "🔧"}</span>
        <AvailabilityBadge status={equipment.availability_status} />
      </div>
      <h3 className="font-semibold">{equipment.name}</h3>
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
    </Link>
  );
}
