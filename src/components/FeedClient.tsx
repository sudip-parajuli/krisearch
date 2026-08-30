"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { FeedFilters } from "./FeedFilters";
import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";
import type { PostRow } from "@/lib/data";
import type { Crop, District } from "@/types/database";

export function FeedClient({ posts, crops, districts }: { posts: PostRow[]; crops: Crop[]; districts: District[] }) {
  const { t } = useLanguage();

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

      {posts.length === 0 ? (
        <EmptyState title={t("noPostsYet")} body="Be the first to share something with the community." />
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
