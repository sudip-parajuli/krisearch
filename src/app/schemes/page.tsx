import { getSchemes } from "@/lib/data";
import { SchemesClient } from "@/components/SchemesClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function SchemesPage() {
  const schemes = await getSchemes();

  return (
    <div>
      <SupabaseSetupNotice />
      <SchemesClient schemes={schemes} />
    </div>
  );
}
