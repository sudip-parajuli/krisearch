"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Crop } from "@/types/database";

export function PriceCropSelect({ crops }: { crops: Crop[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={searchParams.get("crop") ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set("crop", e.target.value);
        else params.delete("crop");
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
    >
      <option value="">All crops</option>
      {crops.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name_en}
        </option>
      ))}
    </select>
  );
}
