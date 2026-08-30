import Link from "next/link";
import { PostTypeBadge } from "./PostTypeBadge";
import { VoteButtons } from "./VoteButtons";
import { AIVerdictBadge } from "./AIVerdictBadge";
import { slugify } from "@/lib/slug";
import type { PostRow } from "@/lib/data";

export function PostCard({ post }: { post: PostRow }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <VoteButtons postId={post.id} initialScore={post.vote_score} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <PostTypeBadge type={post.type} />
          {post.crops && (
            <Link href={`/crops/${slugify(post.crops.name_en)}`} className="text-xs font-medium text-green-700 hover:underline dark:text-green-400">
              {post.crops.name_en}
            </Link>
          )}
          {post.districts && (
            <span className="text-xs text-neutral-400">📍 {post.districts.name}</span>
          )}
          <AIVerdictBadge verdict={post.ai_verdict} rationale={post.ai_rationale} />
        </div>
        <Link href={`/post/${post.id}`} className="block">
          <h3 className="font-semibold text-neutral-900 hover:text-green-700 dark:text-neutral-100 dark:hover:text-green-400">
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{post.body}</p>
        </Link>
        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
          <span>{post.profiles?.display_name ?? "Anonymous"}</span>
          {post.profiles?.verified_badge && <span title={post.profiles.verified_badge}>✅</span>}
          <span>·</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
          <span>·</span>
          <Link href={`/post/${post.id}`}>{post.comment_count} comments</Link>
        </div>
      </div>
    </div>
  );
}
