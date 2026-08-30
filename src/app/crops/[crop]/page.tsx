import { notFound } from "next/navigation";
import { getCropBySlug, getCropZones, getZones, getPosts } from "@/lib/data";
import { CropDetailClient } from "@/components/CropDetailClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function CropDetailPage({ params }: { params: Promise<{ crop: string }> }) {
  const { crop: slug } = await params;
  const crop = await getCropBySlug(slug);
  if (!crop) notFound();

  const [cropZones, zones, posts] = await Promise.all([
    getCropZones(crop.id),
    getZones(),
    getPosts({ cropId: crop.id }, "new", 50),
  ]);

  return (
    <div>
      <SupabaseSetupNotice />
      <CropDetailClient crop={crop} cropZones={cropZones} zones={zones} posts={posts} />
    </div>
  );
}

// No generateStaticParams here: crop data (and RLS/auth cookies) are only
// available at request time via the server Supabase client, not at build
// time, and this is live community content anyway — render on demand.
