import { pageMetadata } from "@/lib/seo";
import { getEquipmentList } from "@/lib/data";
import { ToolsClient } from "@/components/ToolsClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import { SourceUpdates } from "@/components/SourceUpdates";
import { LiveRefresh } from "@/components/LiveRefresh";

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const params = await searchParams;
  const scope = params.scope === "global" ? "global" : "nepal";
  const allEquipment = await getEquipmentList();
  const equipment = allEquipment.filter((e) => (e.scope ?? "nepal") === scope);

  return (
    <div>
      <SupabaseSetupNotice />
      <ToolsClient equipment={equipment} scope={scope} />
      <LiveRefresh />
      <SourceUpdates kind="tool" />
    </div>
  );
}

export const metadata = pageMetadata("कृषि औजार र प्रविधि · Farm tools", "कृषि औजार, सिँचाइ र आधुनिक खेती प्रविधिबारे जानकारी। Equipment references and availability information for Nepal.", "/tools");
