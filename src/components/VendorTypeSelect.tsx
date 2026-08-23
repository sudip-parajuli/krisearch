"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const vendorTypes = [
  { value: "crop_buyer", label: "Crop buyers" },
  { value: "equipment_supplier", label: "Equipment suppliers" },
  { value: "input_supplier", label: "Input suppliers" },
  { value: "drone_service", label: "Drone services" },
];

export function VendorTypeSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={searchParams.get("type") ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set("type", e.target.value);
        else params.delete("type");
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
    >
      <option value="">All vendor types</option>
      {vendorTypes.map((v) => (
        <option key={v.value} value={v.value}>
          {v.label}
        </option>
      ))}
    </select>
  );
}
