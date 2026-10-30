import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { getPosts, getCrops, getDistricts } from "@/lib/data";
import { FeedClient } from "@/components/FeedClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import type { PostType } from "@/types/database";
import { SourceUpdates } from "@/components/SourceUpdates";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{
    crop?: string;
    district?: string;
    type?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(
    1,
    Math.min(100000, Number.parseInt(params.page ?? "1", 10) || 1),
  );
  const pageLink = (n: number) => {
    const query = new URLSearchParams();
    for (const key of ["crop", "district", "type", "sort"] as const)
      if (params[key]) query.set(key, params[key]);
    if (n > 1) query.set("page", String(n));
    return `/feed${query.size ? `?${query}` : ""}`;
  };
  const [crops, districts] = await Promise.all([getCrops(), getDistricts()]);

  const posts = await getPosts(
    {
      cropId: params.crop ? Number(params.crop) : undefined,
      districtId: params.district ? Number(params.district) : undefined,
      type: (params.type as PostType) || undefined,
    },
    params.sort === "top" ? "top" : "new",
    params.sort === "top" ? 30 : 31,
    params.sort === "top" ? 0 : (page - 1) * 30,
  );

  return (
    <div>
      <h1 className="mb-5 text-2xl font-semibold">
        किसानका प्रश्न, उत्तर र अनुभव · Community
      </h1>
      <SupabaseSetupNotice />
      <FeedClient
        posts={posts.slice(0, 30)}
        crops={crops}
        districts={districts}
      />
      <nav
        aria-label="Community pages"
        className="my-6 flex items-center justify-between gap-4 text-sm text-green-700 dark:text-green-400"
      >
        {page > 1 ? (
          <Link href={pageLink(page - 1)}>← नयाँ पोस्ट · Newer posts</Link>
        ) : (
          <span />
        )}
        <span>Page {page}</span>
        {params.sort !== "top" && posts.length > 30 ? (
          <Link href={pageLink(page + 1)}>पुराना पोस्ट · Older posts →</Link>
        ) : (
          <span />
        )}
      </nav>
      <SourceUpdates limit={4} />
    </div>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(
    1,
    Math.min(100000, Number.parseInt(params.page ?? "1", 10) || 1),
  );
  return pageMetadata(
    `किसानका प्रश्न, उत्तर र अनुभव${page > 1 ? ` · Page ${page}` : ""}`,
    "कृषि समस्याबारे प्रश्न, किसानका अनुभव र समाधान। Agricultural community discussions from Nepal.",
    page > 1 ? `/feed?page=${page}` : "/feed",
  );
}
