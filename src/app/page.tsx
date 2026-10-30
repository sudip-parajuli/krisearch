import { isDemoPost } from "@/lib/demo-content";
import { pageMetadata } from "@/lib/seo";
import { getPosts, getPlatformStats } from "@/lib/data";
import { LandingClient } from "@/components/LandingClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function Home() {
  const [recentPosts, stats] = await Promise.all([
    getPosts({}, "new", 5),
    getPlatformStats(),
  ]);

  return (
    <div>
      <SupabaseSetupNotice />
      {recentPosts.some(isDemoPost) && (
        <p className="mb-4 rounded-xl border border-amber-300 p-3 text-sm text-amber-800 dark:border-amber-800 dark:text-amber-300">
          नमुना समुदाय · Community examples and counts currently include
          demonstration data. Posts marked “Demo scenario” are not real farmer
          reports.
        </p>
      )}
      <LandingClient recentPosts={recentPosts} stats={stats} />
    </div>
  );
}

export const metadata = pageMetadata(
  "कृषि जानकारी र किसान समुदाय",
  "बाली, मौसम, स्रोत र मितिसहित बजार मूल्य, कृषि औजार र किसानका प्रश्न–उत्तर। Agriculture information and practical community knowledge for Nepal.",
  "/",
);
