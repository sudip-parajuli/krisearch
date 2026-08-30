import { getMarketPrices, getCrops } from "@/lib/data";
import { PricesClient } from "@/components/PricesClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function PricesPage({
  searchParams,
}: {
  searchParams: Promise<{ crop?: string }>;
}) {
  const params = await searchParams;
  const cropId = params.crop ? Number(params.crop) : undefined;
  const [crops, prices] = await Promise.all([getCrops(), getMarketPrices(cropId)]);

  return (
    <div>
      <SupabaseSetupNotice />
      <PricesClient crops={crops} prices={prices} />
    </div>
  );
}
