import { getPosts, getPlatformStats } from "@/lib/data";
import { LandingClient } from "@/components/LandingClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function Home() {
  const [recentPosts, stats] = await Promise.all([getPosts({}, "new", 5), getPlatformStats()]);

  return (
    <div>
      <SupabaseSetupNotice />
      <LandingClient recentPosts={recentPosts} stats={stats} />
    </div>
  );
}
