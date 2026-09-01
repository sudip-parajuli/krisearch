"use client";

import Link from "next/link";
import { BookOpen, MapPin, Store, Award } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PostCard } from "./PostCard";
import { ToolCard } from "./ToolCard";
import { EmptyState } from "./EmptyState";
import type { PostRow } from "@/lib/data";
import type { Crop, CropZone, Zone, Vendor, Equipment, District, Comment, Post } from "@/types/database";

export function CropDetailClient({
  crop,
  cropZones,
  zones,
  posts,
  vendors,
  districts,
  equipmentLinks,
  bestAnswers,
}: {
  crop: Crop;
  cropZones: CropZone[];
  zones: Zone[];
  posts: PostRow[];
  vendors: Vendor[];
  districts: District[];
  equipmentLinks: { equipment: Equipment | null; notes: string | null }[];
  bestAnswers: (Comment & { posts: Pick<Post, "id" | "title"> | null })[];
}) {
  const { t } = useLanguage();
  const zoneById = new Map(zones.map((z) => [z.id, z]));
  const districtById = new Map(districts.map((d) => [d.id, d]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          {crop.name_en}
          {crop.name_np && <span className="ml-2 text-lg text-neutral-400">{crop.name_np}</span>}
        </h1>
        {crop.category && (
          <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {crop.category.replace("_", " ")}
          </span>
        )}
      </div>

      <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
          <BookOpen className="h-3.5 w-3.5" /> {t("generalGuidanceLong")}
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
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {" "}
                      — {t("plantLabel")} {cz.typical_planting_months}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {bestAnswers.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-1.5 text-lg font-semibold">
            <Award className="h-5 w-5 text-gold-600 dark:text-gold-400" /> {t("topCommunityAnswer")}
          </h2>
          <div className="flex flex-col gap-2">
            {bestAnswers.map((c) => (
              <Link
                key={c.id}
                href={`/post/${c.posts?.id}`}
                className="block rounded-2xl border border-gold-200 bg-gold-50 p-3 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-gold-800/40 dark:bg-gold-900/20"
              >
                {c.posts?.title && <p className="text-xs font-medium text-gold-700 dark:text-gold-400">{c.posts.title}</p>}
                <p className="mt-1 text-neutral-700 dark:text-neutral-300">{c.body}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {equipmentLinks.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">{t("toolsForCrop")}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {equipmentLinks
              .filter((l) => l.equipment)
              .map((l) => (
                <ToolCard key={l.equipment!.id} equipment={l.equipment!} />
              ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("vendorsForCrop")}</h2>
        {vendors.length === 0 ? (
          <EmptyState icon={Store} title={t("noVendorsForCrop")} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {vendors.map((v) => {
              const buys = v.crops_bought?.includes(crop.id);
              const supplies = v.crops_supplied?.includes(crop.id);
              return (
                <div
                  key={v.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <p className="font-semibold">{v.business_name}</p>
                  {v.district_id && districtById.get(v.district_id) && (
                    <p className="flex items-center gap-1 text-xs text-neutral-400">
                      <MapPin className="h-3 w-3" /> {districtById.get(v.district_id)!.name}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {buys && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {t("buysThisCrop")}
                      </span>
                    )}
                    {supplies && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {t("suppliesSeedsFor")}
                      </span>
                    )}
                  </div>
                  {v.contact_info && <p className="mt-1.5 text-xs text-neutral-500">{v.contact_info}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("communityFeedFor")}</h2>
          <Link
            href={`/post/new`}
            className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700"
          >
            + {t("shareAboutPrefix")} {crop.name_en}
          </Link>
        </div>
        {posts.length === 0 ? (
          <EmptyState title={t("noCropPostsYet")} body="Be the first to share your experience." />
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
