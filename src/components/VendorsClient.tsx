"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star, Plus, Store } from "lucide-react";
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold">{t("vendorsTitle")}</h1>
        <div className="flex items-center gap-2">
          <VendorTypeSelect />
          <Link
            href="/vendors/new"
            className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md hover:bg-green-700"
          >
            <Plus className="h-4 w-4" /> {t("addVendorButton")}
          </Link>
        </div>
      </div>

      {vendors.length === 0 ? (
        <EmptyState icon={Store} title={t("noVendorsListed")} body="Crop buyers, equipment suppliers, and rental/service providers will show up here." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {vendors.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.03 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display font-semibold">{v.business_name ?? "Unnamed vendor"}</h2>
                <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
                  {typeLabels[v.vendor_type][lang]}
                </span>
              </div>
              {v.district_id && districtById.get(v.district_id) && (
                <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                  <MapPin className="h-3 w-3" /> {districtById.get(v.district_id)!.name}
                </p>
              )}
              {v.crops_bought && v.crops_bought.length > 0 && (
                <p className="mt-2 text-xs text-neutral-500">
                  Buys: {v.crops_bought.map((id) => cropById.get(id)?.name_en).filter(Boolean).join(", ")}
                </p>
              )}
              {v.crops_supplied && v.crops_supplied.length > 0 && (
                <p className="mt-1 text-xs text-neutral-500">
                  Supplies: {v.crops_supplied.map((id) => cropById.get(id)?.name_en).filter(Boolean).join(", ")}
                </p>
              )}
              <div className="mt-2 flex items-start justify-between gap-2">
                {v.contact_info && <span className="text-xs text-neutral-500">{v.contact_info}</span>}
                <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-gold-600 dark:text-gold-400">
                  <Star className="h-3 w-3 fill-current" /> {v.rating_avg?.toFixed(1) ?? "—"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
