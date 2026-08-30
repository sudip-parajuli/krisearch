import { getEquipmentList } from "@/lib/data";
import { ToolsClient } from "@/components/ToolsClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

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
    </div>
  );
}
