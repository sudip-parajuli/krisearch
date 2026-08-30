import { notFound } from "next/navigation";
import {
  getEquipmentBySlug,
  getSchemeById,
  getVendorEquipmentFor,
  getPosts,
} from "@/lib/data";
import { ToolDetailClient } from "@/components/ToolDetailClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function ToolDetailPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const equipment = await getEquipmentBySlug(slug);
  if (!equipment) notFound();

  const [scheme, vendorOfferings, posts] = await Promise.all([
    equipment.related_scheme_id ? getSchemeById(equipment.related_scheme_id) : Promise.resolve(null),
    getVendorEquipmentFor(equipment.id),
    getPosts({ equipmentId: equipment.id }, "new", 30),
  ]);

  return (
    <div>
      <SupabaseSetupNotice />
      <ToolDetailClient equipment={equipment} scheme={scheme} vendorOfferings={vendorOfferings} posts={posts} />
    </div>
  );
}

// No generateStaticParams here: equipment data needs the request-time,
// cookie-based server Supabase client, which isn't available at build time
// — render on demand instead (see the same note on /crops/[crop]).
