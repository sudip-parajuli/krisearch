import { getEquipmentList } from "@/lib/data";
import { ToolCard } from "@/components/ToolCard";
import { EmptyState } from "@/components/EmptyState";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

const categoryOrder = [
  "drone",
  "machinery",
  "irrigation",
  "solar",
  "iot_sensor",
  "greenhouse",
  "post_harvest",
  "digital_app",
];

const categoryLabels: Record<string, string> = {
  drone: "Drones",
  machinery: "Machinery",
  irrigation: "Irrigation",
  solar: "Solar",
  iot_sensor: "IoT Sensors",
  greenhouse: "Greenhouse / Polyhouse",
  post_harvest: "Post-Harvest",
  digital_app: "Digital Apps",
};

export default async function ToolsPage() {
  const equipment = await getEquipmentList();
  const byCategory = new Map<string, typeof equipment>();
  for (const eq of equipment) {
    const cat = eq.category ?? "other";
    byCategory.set(cat, [...(byCategory.get(cat) ?? []), eq]);
  }

  return (
    <div>
      <SupabaseSetupNotice />
      <h1 className="mb-1 text-2xl font-bold">Modern tools & technology</h1>
      <p className="mb-5 text-sm text-neutral-500">
        Scale-appropriate mechanization for small, fragmented hill and Terai plots — purchase and rental/service
        prices shown side by side, since ownership rarely pencils out at Nepal&apos;s average landholding size.
      </p>

      {equipment.length === 0 ? (
        <EmptyState title="No tools listed yet" />
      ) : (
        <div className="flex flex-col gap-6">
          {categoryOrder
            .filter((cat) => byCategory.has(cat))
            .map((cat) => (
              <div key={cat}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  {categoryLabels[cat]}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {byCategory.get(cat)!.map((eq) => (
                    <ToolCard key={eq.id} equipment={eq} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
