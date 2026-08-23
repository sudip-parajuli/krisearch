"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Reddit-style up/down voting for a post or a comment (pass one id, not both).
 * Note: the `votes` unique constraint is (user_id, post_id, comment_id), and
 * Postgres treats NULL <> NULL — so a NULL comment_id doesn't dedupe against
 * itself at the DB level. We look up any existing vote for this user+target
 * ourselves before writing, so a user can only ever hold one vote per target.
 */
export function VoteButtons({
  postId,
  commentId,
  initialScore,
}: {
  postId?: string;
  commentId?: string;
  initialScore: number;
}) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);
  const [busy, setBusy] = useState(false);

  async function castVote(value: 1 | -1) {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setBusy(false);
      router.push("/login");
      return;
    }

    let query = supabase.from("votes").select("id, value").eq("user_id", userData.user.id);
    query = postId ? query.eq("post_id", postId).is("comment_id", null) : query.eq("comment_id", commentId!).is("post_id", null);
    const { data: existing } = await query.maybeSingle();

    if (existing && existing.value === value) {
      await supabase.from("votes").delete().eq("id", existing.id);
      setScore((s) => s - value);
      setMyVote(0);
    } else if (existing) {
      await supabase.from("votes").update({ value }).eq("id", existing.id);
      setScore((s) => s - existing.value + value);
      setMyVote(value);
    } else {
      await supabase.from("votes").insert({
        post_id: postId ?? null,
        comment_id: commentId ?? null,
        user_id: userData.user.id,
        value,
      });
      setScore((s) => s + value);
      setMyVote(value);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-center gap-0.5 text-neutral-500 dark:text-neutral-400">
      <button
        type="button"
        aria-label="Upvote"
        disabled={busy}
        onClick={() => castVote(1)}
        className={`rounded p-1 hover:bg-green-100 dark:hover:bg-green-950 ${myVote === 1 ? "text-green-600" : ""}`}
      >
        ▲
      </button>
      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{score}</span>
      <button
        type="button"
        aria-label="Downvote"
        disabled={busy}
        onClick={() => castVote(-1)}
        className={`rounded p-1 hover:bg-red-100 dark:hover:bg-red-950 ${myVote === -1 ? "text-red-600" : ""}`}
      >
        ▼
      </button>
    </div>
  );
}
