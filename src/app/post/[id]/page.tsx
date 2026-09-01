import Link from "next/link";
import { notFound } from "next/navigation";
import { Sprout, MapPin, MessageCircle } from "lucide-react";
import { getPostById, getCommentsForPost, getPledgesForPost } from "@/lib/data";
import { PostTypeBadge } from "@/components/PostTypeBadge";
import { VoteButtons } from "@/components/VoteButtons";
import { ReportButton } from "@/components/ReportButton";
import { CommentSection } from "@/components/CommentSection";
import { AIVerdictBadge } from "@/components/AIVerdictBadge";
import { AuthorIdentity } from "@/components/AuthorIdentity";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { GroupBuyPledges } from "@/components/GroupBuyPledges";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import { slugify } from "@/lib/slug";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const [comments, pledges] = await Promise.all([
    getCommentsForPost(id),
    post.type === "group_buy" ? getPledgesForPost(id) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <SupabaseSetupNotice />
      <div className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <VoteButtons postId={post.id} initialScore={post.vote_score} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <AuthorIdentity profile={post.profiles} size="md" />
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
          <h1 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-100">{post.title}</h1>
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
            <ReadAloudButton text={`${post.title}. ${post.body}`} />
            <span>·</span>
            <ReportButton postId={post.id} />
          </div>
        </div>
      </div>

      {post.type === "group_buy" && <GroupBuyPledges postId={post.id} initialPledges={pledges} />}

      <div className="mt-6">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-500">
          <MessageCircle className="h-4 w-4" /> {post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}
        </h2>
        <CommentSection postId={post.id} postAuthorId={post.author_id} comments={comments} />
      </div>
    </div>
  );
}
