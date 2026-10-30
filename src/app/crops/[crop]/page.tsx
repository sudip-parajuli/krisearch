import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { notFound } from "next/navigation";
import {
  getCropBySlug,
  getCropZones,
  getZones,
  getPosts,
  getVendorsForCrop,
  getEquipmentForCrop,
  getDistricts,
  getBestAnswersForCrop,
} from "@/lib/data";
import { CropDetailClient } from "@/components/CropDetailClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function CropDetailPage({ params }: { params: Promise<{ crop: string }> }) {
  const { crop: slug } = await params;
  const crop = await getCropBySlug(slug);
  if (!crop) notFound();

  const [cropZones, zones, posts, vendors, districts, equipmentLinks, bestAnswers] = await Promise.all([
    getCropZones(crop.id),
    getZones(),
    getPosts({ cropId: crop.id }, "new", 50),
    getVendorsForCrop(crop.id),
    getDistricts(),
    getEquipmentForCrop(crop.id),
    getBestAnswersForCrop(crop.id),
  ]);

  return (
    <div>
      <JsonLd data={{ "@context":"https://schema.org", "@type":"WebPage", name:`${crop.name_np ?? crop.name_en} · ${crop.name_en}`, url:absoluteUrl(`/crops/${slug}`), description:crop.baseline_notes, inLanguage:["ne","en"], about:{"@type":"Thing",name:crop.name_en,alternateName:crop.name_np} }} />
      <SupabaseSetupNotice />
      <CropDetailClient
        crop={crop}
        cropZones={cropZones}
        zones={zones}
        posts={posts}
        vendors={vendors}
        districts={districts}
        equipmentLinks={equipmentLinks}
        bestAnswers={bestAnswers}
      />
    </div>
  );
}

// No generateStaticParams here: crop data (and RLS/auth cookies) are only
// available at request time via the server Supabase client, not at build
// time, and this is live community content anyway — render on demand.

export async function generateMetadata({ params }: { params: Promise<{ crop: string }> }) {
 const {crop:slug}=await params; const crop=await getCropBySlug(slug); if(!crop) return { title:"Crop not found", robots:{index:false} };
 return pageMetadata(`${crop.name_np ?? crop.name_en} (${crop.name_en}) — खेती जानकारी`, crop.baseline_notes ?? `Agricultural reference and community questions about ${crop.name_en} in Nepal.`, `/crops/${slug}`);
}
