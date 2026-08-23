"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ReportButton } from "./ReportButton";
import type { Comment, Profile } from "@/types/database";

type CommentWithAuthor = Comment & {
  profiles: Pick<Profile, "id" | "display_name" | "verified_badge"> | null;
};

export function CommentSection({ postId, comments }: { postId: string; comments: CommentWithAuthor[] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topLevel = comments.filter((c) => !c.parent_comment_id);
  const repliesOf = (id: string) => comments.filter((c) => c.parent_comment_id === id);

  async function submit() {
    if (!body.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }
    await supabase.from("comments").insert({
      post_id: postId,
      author_id: userData.user.id,
      body: body.trim(),
    });
    setBody("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Add a comment..."
          className="flex-1 resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="self-end rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {topLevel.length === 0 ? (
        <p className="text-sm text-neutral-400">No comments yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {topLevel.map((c) => (
            <li key={c.id} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <CommentRow comment={c} />
              {repliesOf(c.id).length > 0 && (
                <ul className="ml-4 mt-2 flex flex-col gap-2 border-l border-neutral-200 pl-3 dark:border-neutral-800">
                  {repliesOf(c.id).map((r) => (
                    <li key={r.id}>
                      <CommentRow comment={r} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentRow({ comment }: { comment: CommentWithAuthor }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span className="font-medium text-neutral-700 dark:text-neutral-300">
          {comment.profiles?.display_name ?? "Anonymous"}
        </span>
        {comment.profiles?.verified_badge && <span>✅</span>}
        <span>·</span>
        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
      </div>
      <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">{comment.body}</p>
      <div className="mt-1">
        <ReportButton commentId={comment.id} />
      </div>
    </div>
  );
}
