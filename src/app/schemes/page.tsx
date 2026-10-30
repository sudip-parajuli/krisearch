import { pageMetadata } from "@/lib/seo";
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

export const metadata = pageMetadata("कृषि योजना र अनुदान · Schemes", "कृषि योजनाको सन्दर्भ र आधिकारिक सूचनाका लिंक। Check original sources for eligibility, deadlines and application status.", "/schemes");
