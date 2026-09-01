import { getCrops, getDistricts } from "@/lib/data";
import { NewVendorForm } from "@/components/NewVendorForm";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function NewVendorPage() {
  const [crops, districts] = await Promise.all([getCrops(), getDistricts()]);

  return (
    <div className="mx-auto max-w-xl">
      <SupabaseSetupNotice />
      <NewVendorForm crops={crops} districts={districts} />
    </div>
  );
}
