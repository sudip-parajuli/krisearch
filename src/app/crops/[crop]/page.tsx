import { notFound } from "next/navigation";
import Link from "next/link";
import { getCropBySlug, getCropZones, getZones, getPosts, getCrops } from "@/lib/data";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
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

  const zoneById = new Map(zones.map((z) => [z.id, z]));

  return (
    <div className="flex flex-col gap-6">
      <SupabaseSetupNotice />

      <div>
        <h1 className="text-2xl font-bold">
          {crop.name_en}
          {crop.name_np && <span className="ml-2 text-lg text-neutral-400">{crop.name_np}</span>}
        </h1>
        {crop.category && (
          <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {crop.category.replace("_", " ")}
          </span>
        )}
      </div>

      <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
          <span>📚</span> General guidance — reference only, not a substitute for the community below
        </div>
        {crop.baseline_notes && (
          <p className="text-sm text-amber-900 dark:text-amber-200">{crop.baseline_notes}</p>
        )}
        {cropZones.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {cropZones.map((cz) => {
              const zone = zoneById.get(cz.zone_id);
              return (
                <div key={cz.zone_id} className="rounded-lg bg-white/60 px-3 py-2 text-xs dark:bg-black/20">
                  <span className="font-semibold">{zone?.name}</span>
                  {cz.typical_planting_months && (
                    <span className="text-neutral-500 dark:text-neutral-400"> — plant {cz.typical_planting_months}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Community feed</h2>
          <Link
            href={`/post/new`}
            className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
          >
            + Share about {crop.name_en}
          </Link>
        </div>
        {posts.length === 0 ? (
          <EmptyState title="No community posts for this crop yet" body="Be the first to share your experience." />
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

export async function generateStaticParams() {
  const crops = await getCrops();
  const { slugify } = await import("@/lib/slug");
  return crops.map((c) => ({ crop: slugify(c.name_en) }));
}
