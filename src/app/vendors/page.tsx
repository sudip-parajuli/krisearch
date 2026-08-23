import { getVendors, getDistricts, getCrops } from "@/lib/data";
import { VendorTypeSelect } from "@/components/VendorTypeSelect";
import { EmptyState } from "@/components/EmptyState";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import type { VendorType } from "@/types/database";

const typeLabels: Record<VendorType, string> = {
  crop_buyer: "Crop buyer",
  equipment_supplier: "Equipment supplier",
  input_supplier: "Input supplier",
  drone_service: "Drone service",
};

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const [vendors, districts, crops] = await Promise.all([
    getVendors((params.type as VendorType) || undefined),
    getDistricts(),
    getCrops(),
  ]);
  const districtById = new Map(districts.map((d) => [d.id, d]));
  const cropById = new Map(crops.map((c) => [c.id, c]));

  return (
    <div>
      <SupabaseSetupNotice />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendor directory</h1>
        <VendorTypeSelect />
      </div>

      {vendors.length === 0 ? (
        <EmptyState title="No vendors listed yet" body="Crop buyers, equipment suppliers, and rental/service providers will show up here." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {vendors.map((v) => (
            <div key={v.id} className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{v.business_name ?? "Unnamed vendor"}</h2>
                <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
                  {typeLabels[v.vendor_type]}
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
