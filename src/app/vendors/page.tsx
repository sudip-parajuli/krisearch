import { getVendors, getDistricts, getCrops } from "@/lib/data";
import { VendorsClient } from "@/components/VendorsClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import type { VendorType } from "@/types/database";

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

  return (
    <div>
      <SupabaseSetupNotice />
      <VendorsClient vendors={vendors} districts={districts} crops={crops} />
    </div>
  );
}
