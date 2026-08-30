import { getPosts, getCrops, getDistricts } from "@/lib/data";
import { FeedClient } from "@/components/FeedClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import type { PostType } from "@/types/database";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ crop?: string; district?: string; type?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const [crops, districts] = await Promise.all([getCrops(), getDistricts()]);

  const posts = await getPosts(
    {
      cropId: params.crop ? Number(params.crop) : undefined,
      districtId: params.district ? Number(params.district) : undefined,
      type: (params.type as PostType) || undefined,
    },
    params.sort === "top" ? "top" : "new"
  );

  return (
    <div>
      <SupabaseSetupNotice />
      <FeedClient posts={posts} crops={crops} districts={districts} />
    </div>
  );
}
