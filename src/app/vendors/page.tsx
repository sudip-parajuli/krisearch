import { pageMetadata } from "@/lib/seo";
import { getVendors, getDistricts, getCrops } from "@/lib/data";
import { VendorsClient } from "@/components/VendorsClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import { SourceUpdates } from "@/components/SourceUpdates";
import { LiveRefresh } from "@/components/LiveRefresh";
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
      <LiveRefresh />
      <SourceUpdates kind="vendor" />
    </div>
  );
}

export const metadata = pageMetadata("कृषि विक्रेता र सेवा · Vendors", "कृषि सामग्री, औजार र सेवाका व्यवसायहरूको सार्वजनिक विवरण। Agricultural suppliers and business information for Nepal.", "/vendors");
