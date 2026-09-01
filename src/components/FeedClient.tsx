"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Sprout } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { FeedFilters } from "./FeedFilters";
import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";
import type { PostRow } from "@/lib/data";
import type { Crop, District } from "@/types/database";

export function FeedClient({ posts, crops, districts }: { posts: PostRow[]; crops: Crop[]; districts: District[] }) {
  const { t } = useLanguage();
  const [myFarm, setMyFarm] = useState(false);
  const [myFarmProfile, setMyFarmProfile] = useState<{ district_id: number | null; crops_grown: number[] | null } | null>(null);
  const fetchStartedRef = useRef(false);

  useEffect(() => {
    if (!myFarm || fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setMyFarmProfile({ district_id: null, crops_grown: null });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("district_id, crops_grown")
        .eq("id", data.user.id)
        .maybeSingle();
      setMyFarmProfile(profile ?? { district_id: null, crops_grown: null });
    });
  }, [myFarm]);

  const myFarmLoading = myFarm && !myFarmProfile;

  const visiblePosts = useMemo(() => {
    if (!myFarm || !myFarmProfile) return posts;
    const crops = new Set(myFarmProfile.crops_grown ?? []);
    return posts.filter(
      (p) => (myFarmProfile.district_id && p.district_id === myFarmProfile.district_id) || (p.crop_id && crops.has(p.crop_id))
    );
  }, [myFarm, myFarmProfile, posts]);

  const hasMyFarmSignal = !myFarmLoading && myFarmProfile && (myFarmProfile.district_id || (myFarmProfile.crops_grown?.length ?? 0) > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <FeedFilters crops={crops} districts={districts} />
        <Link
          href="/post/new"
          className="hidden shrink-0 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md hover:bg-green-700 md:inline-block"
        >
          + {t("newPost")}
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setMyFarm((v) => !v)}
        className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
          myFarm
            ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
            : "border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400"
        }`}
      >
        <Sprout className="h-3.5 w-3.5" strokeWidth={1.75} />
        {t("myFarmFilter")}
      </button>
      {myFarm && myFarmLoading && <p className="text-xs text-neutral-400">{t("myFarmFeedLoading")}</p>}
      {myFarm && !myFarmLoading && myFarmProfile && !hasMyFarmSignal && (
        <p className="text-xs text-neutral-400">
          {t("myFarmEmpty")}{" "}
          <Link href="/profile/edit" className="font-semibold text-green-700 underline dark:text-green-400">
            {t("editProfile")}
          </Link>
        </p>
      )}

      {visiblePosts.length === 0 ? (
        <EmptyState title={t("noPostsYet")} body="Be the first to share something with the community." />
      ) : (
        <div className="flex flex-col gap-3">
          {visiblePosts.map((post) => (
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
