"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { VendorTypeSelect } from "./VendorTypeSelect";
import { EmptyState } from "./EmptyState";
import type { Vendor, District, Crop, VendorType } from "@/types/database";

const typeLabels: Record<VendorType, { ne: string; en: string }> = {
  crop_buyer: { ne: "बाली खरिददार", en: "Crop buyer" },
  equipment_supplier: { ne: "औजार आपूर्तिकर्ता", en: "Equipment supplier" },
  input_supplier: { ne: "कृषि सामग्री आपूर्तिकर्ता", en: "Input supplier" },
  drone_service: { ne: "ड्रोन सेवा", en: "Drone service" },
};

export function VendorsClient({
  vendors,
  districts,
  crops,
}: {
  vendors: Vendor[];
  districts: District[];
  crops: Crop[];
}) {
  const { t, lang } = useLanguage();
  const districtById = new Map(districts.map((d) => [d.id, d]));
  const cropById = new Map(crops.map((c) => [c.id, c]));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("vendorsTitle")}</h1>
        <VendorTypeSelect />
      </div>

      {vendors.length === 0 ? (
        <EmptyState title={t("noVendorsListed")} body="Crop buyers, equipment suppliers, and rental/service providers will show up here." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {vendors.map((v) => (
            <div key={v.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{v.business_name ?? "Unnamed vendor"}</h2>
                <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
                  {typeLabels[v.vendor_type][lang]}
                </span>
              </div>
              {v.district_id && (
                <p className="mt-1 text-xs text-neutral-400">📍 {districtById.get(v.district_id)?.name}</p>
              )}
              {v.crops_bought && v.crops_bought.length > 0 && (
                <p className="mt-2 text-xs text-neutral-500">
                  Buys: {v.crops_bought.map((id) => cropById.get(id)?.name_en).filter(Boolean).join(", ")}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                {v.contact_info && <span className="text-xs text-neutral-500">{v.contact_info}</span>}
                <span className="text-xs font-medium text-amber-600">★ {v.rating_avg?.toFixed(1) ?? "—"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
