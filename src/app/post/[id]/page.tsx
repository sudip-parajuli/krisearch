import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById, getCommentsForPost } from "@/lib/data";
import { PostTypeBadge } from "@/components/PostTypeBadge";
import { VoteButtons } from "@/components/VoteButtons";
import { ReportButton } from "@/components/ReportButton";
import { CommentSection } from "@/components/CommentSection";
import { AIVerdictBadge } from "@/components/AIVerdictBadge";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import { slugify } from "@/lib/slug";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const comments = await getCommentsForPost(id);

  return (
    <div className="mx-auto max-w-2xl">
      <SupabaseSetupNotice />
      <div className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <VoteButtons postId={post.id} initialScore={post.vote_score} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <PostTypeBadge type={post.type} />
            {post.crops && (
              <Link
                href={`/crops/${slugify(post.crops.name_en)}`}
                className="text-xs font-medium text-green-700 hover:underline dark:text-green-400"
              >
                {post.crops.name_en}
              </Link>
            )}
            {post.districts && <span className="text-xs text-neutral-400">📍 {post.districts.name}</span>}
            <AIVerdictBadge verdict={post.ai_verdict} rationale={post.ai_rationale} />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{post.title}</h1>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">{post.body}</p>

          {post.image_urls && post.image_urls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.image_urls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="h-40 w-40 rounded-lg object-cover" />
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
            <span>{post.profiles?.display_name ?? "Anonymous"}</span>
            {post.profiles?.verified_badge && <span>✅</span>}
            <span>·</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            <span>·</span>
            <ReportButton postId={post.id} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500">
          {post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}
        </h2>
        <CommentSection postId={post.id} postAuthorId={post.author_id} comments={comments} />
      </div>
    </div>
  );
}
