import { getSchemes } from "@/lib/data";
import { SchemesClient } from "@/components/SchemesClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import { SourceUpdates } from "@/components/SourceUpdates";
import { LiveRefresh } from "@/components/LiveRefresh";

export default async function SchemesPage() {
  const schemes = await getSchemes();

  return (
    <div>
      <SupabaseSetupNotice />
      <SchemesClient schemes={schemes} />
      <LiveRefresh />
      <SourceUpdates kind="scheme" />
    </div>
  );
}
