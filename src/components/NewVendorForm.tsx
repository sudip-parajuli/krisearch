"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Store, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Crop, District, VendorType } from "@/types/database";

const vendorTypeOptions: { value: VendorType; labelKey: "vendorTypeCropBuyer" | "vendorTypeEquipmentSupplier" | "vendorTypeInputSupplier" | "vendorTypeDroneService" }[] = [
  { value: "crop_buyer", labelKey: "vendorTypeCropBuyer" },
  { value: "input_supplier", labelKey: "vendorTypeInputSupplier" },
  { value: "equipment_supplier", labelKey: "vendorTypeEquipmentSupplier" },
  { value: "drone_service", labelKey: "vendorTypeDroneService" },
];

export function NewVendorForm({ crops, districts }: { crops: Crop[]; districts: District[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [vendorType, setVendorType] = useState<VendorType>("crop_buyer");
  const [districtId, setDistrictId] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggleCrop(id: number) {
    setSelectedCrops((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) {
      setError("Business name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    let user;
    try {
      user = await ensureSession(supabase);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start a session.");
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      profile_id: user.id,
      business_name: businessName.trim(),
      vendor_type: vendorType,
      district_id: districtId ? Number(districtId) : null,
      contact_info: contactInfo.trim() || null,
    };
    if (vendorType === "crop_buyer") payload.crops_bought = selectedCrops.length ? selectedCrops : null;
    if (vendorType === "input_supplier") payload.crops_supplied = selectedCrops.length ? selectedCrops : null;

    const { error: insertError } = await supabase.from("vendors").insert(payload);
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-14 text-center dark:border-green-900 dark:bg-green-950">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        <p className="font-display font-medium text-green-800 dark:text-green-300">{t("vendorSubmitted")}</p>
        <button type="button" onClick={() => router.push("/vendors")} className="mt-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
          {t("navVendors")}
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Store className="h-6 w-6 text-green-600 dark:text-green-400" />
        <h1 className="font-display text-xl font-semibold">{t("addVendorTitle")}</h1>
      </div>
      <p className="text-sm text-neutral-500">{t("addVendorSubtitle")}</p>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("vendorNameLabel")}</label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("vendorTypeLabel")}</label>
        <div className="grid grid-cols-2 gap-2">
          {vendorTypeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setVendorType(opt.value);
                setSelectedCrops([]);
              }}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                vendorType === opt.value
                  ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("districtLabel")}</label>
          <select
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">{t("noneOption")}</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("vendorContactLabel")}</label>
          <input
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder={t("vendorContactPlaceholder")}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
      </div>

      {(vendorType === "crop_buyer" || vendorType === "input_supplier") && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {vendorType === "crop_buyer" ? t("vendorCropsBoughtLabel") : t("vendorCropsSuppliedLabel")}
          </label>
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-neutral-200 p-2 dark:border-neutral-800">
            {crops.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCrop(c.id)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedCrops.includes(c.id)
                    ? "bg-green-600 text-white"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {c.name_en}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md hover:bg-green-700 disabled:opacity-50"
      >
        {submitting ? t("submittingVendor") : t("submitVendor")}
      </button>
    </form>
  );
}
