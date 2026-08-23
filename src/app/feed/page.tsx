import Link from "next/link";
import { getPosts, getCrops, getDistricts } from "@/lib/data";
import { PostCard } from "@/components/PostCard";
import { FeedFilters } from "@/components/FeedFilters";
import { EmptyState } from "@/components/EmptyState";
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
    <div className="flex flex-col gap-4">
      <SupabaseSetupNotice />

      <div className="flex items-center justify-between gap-2">
        <FeedFilters crops={crops} districts={districts} />
        <Link
          href="/post/new"
          className="hidden shrink-0 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 md:inline-block"
        >
          + New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyState title="No posts yet" body="Be the first to share something with the community." />
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Mobile floating action button */}
      <Link
        href="/post/new"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl text-white shadow-lg md:hidden"
        aria-label="New post"
      >
        +
      </Link>
    </div>
  );
}
