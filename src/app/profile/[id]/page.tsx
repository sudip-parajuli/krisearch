import { notFound } from "next/navigation";
import Link from "next/link";
import { User, CheckCircle2, MapPin, BadgeCheck } from "lucide-react";
import { getProfileById, getPostsByAuthor, getDistricts, getCrops } from "@/lib/data";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import { ProfileActions } from "@/components/ProfileActions";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) notFound();

  const [posts, districts, crops] = await Promise.all([getPostsByAuthor(id), getDistricts(), getCrops()]);
  const district = districts.find((d) => d.id === profile.district_id);
  const grownCrops = crops.filter((c) => profile.crops_grown?.includes(c.id));

  return (
    <div className="flex flex-col gap-6">
      <SupabaseSetupNotice />

      <div className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
            <User className="h-8 w-8" strokeWidth={1.75} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold">{profile.display_name ?? "Farmer"}</h1>
            {profile.verified_badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <CheckCircle2 className="h-3 w-3" /> {profile.verified_badge.replace("_", " ")}
              </span>
            )}
            <ProfileActions profileId={profile.id} />
          </div>
          <p className="text-sm capitalize text-neutral-500">{profile.role ?? "farmer"}</p>
          {district && (
            <p className="flex items-center gap-1 text-xs text-neutral-400">
              <MapPin className="h-3 w-3" /> {district.name}
            </p>
          )}
          {profile.bio && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{profile.bio}</p>}
          {grownCrops.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {grownCrops.map((c) => (
                <span key={c.id} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800">
                  {c.name_en}
                </span>
              ))}
            </div>
          )}
          {!profile.verified_badge && (
            <Link
              href="/profile/verify"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline dark:text-green-400"
            >
              <BadgeCheck className="h-3.5 w-3.5" /> Apply for a verified badge
            </Link>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Post history ({posts.length})</h2>
        {posts.length === 0 ? (
          <EmptyState title="No posts yet" />
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
