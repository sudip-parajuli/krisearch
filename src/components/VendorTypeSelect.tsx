"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const vendorTypes = [
  { value: "crop_buyer", ne: "बाली खरिददार", en: "Crop buyers" },
  { value: "equipment_supplier", ne: "औजार आपूर्तिकर्ता", en: "Equipment suppliers" },
  { value: "input_supplier", ne: "कृषि सामग्री आपूर्तिकर्ता", en: "Input suppliers" },
  { value: "drone_service", ne: "ड्रोन सेवा", en: "Drone services" },
];

export function VendorTypeSelect() {
  const { t, lang } = useLanguage();
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
      <option value="">{t("allVendorTypes")}</option>
      {vendorTypes.map((v) => (
        <option key={v.value} value={v.value}>
          {v[lang]}
        </option>
      ))}
    </select>
  );
}
