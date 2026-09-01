import Link from "next/link";
import { Sprout, MapPin, MessageCircle } from "lucide-react";
import { PostTypeBadge } from "./PostTypeBadge";
import { VoteButtons } from "./VoteButtons";
import { AIVerdictBadge } from "./AIVerdictBadge";
import { AuthorIdentity } from "./AuthorIdentity";
import { slugify } from "@/lib/slug";
import type { PostRow } from "@/lib/data";

export function PostCard({ post }: { post: PostRow }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <VoteButtons postId={post.id} initialScore={post.vote_score} />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <AuthorIdentity profile={post.profiles} />
          <span className="text-xs text-neutral-400">{new Date(post.created_at).toLocaleDateString()}</span>
        </div>

        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <PostTypeBadge type={post.type} />
          {post.crops && (
            <Link
              href={`/crops/${slugify(post.crops.name_en)}`}
              className="inline-flex items-center gap-0.5 text-xs font-medium text-green-700 hover:underline dark:text-green-400"
            >
              <Sprout className="h-3 w-3" /> {post.crops.name_en}
            </Link>
          )}
          {post.districts && (
            <span className="inline-flex items-center gap-0.5 text-xs text-neutral-400">
              <MapPin className="h-3 w-3" /> {post.districts.name}
            </span>
          )}
          <AIVerdictBadge verdict={post.ai_verdict} rationale={post.ai_rationale} />
        </div>

        <Link href={`/post/${post.id}`} className="block">
          <h3 className="font-display font-semibold text-neutral-900 hover:text-green-700 dark:text-neutral-100 dark:hover:text-green-400">
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{post.body}</p>
        </Link>

        <div className="mt-2.5 flex items-center gap-3 text-xs">
          <Link
            href={`/post/${post.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <MessageCircle className="h-3.5 w-3.5" /> {post.comment_count}
          </Link>
        </div>
      </div>
    </div>
  );
}
