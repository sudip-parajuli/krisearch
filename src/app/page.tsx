import { getPosts } from "@/lib/data";
import { LandingClient } from "@/components/LandingClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function Home() {
  const recentPosts = await getPosts({}, "new", 5);

  return (
    <div>
      <SupabaseSetupNotice />
      <LandingClient recentPosts={recentPosts} />
    </div>
  );
}
