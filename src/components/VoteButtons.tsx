"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/auth";

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
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);
  const [busy, setBusy] = useState(false);

  async function castVote(value: 1 | -1) {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();

    let user;
    try {
      user = await ensureSession(supabase); // silently starts a guest session if needed
    } catch {
      setBusy(false);
      return;
    }
    const userData = { user };

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
    <div className="flex flex-col items-center gap-0.5 text-neutral-400 dark:text-neutral-500">
      <motion.button
        type="button"
        aria-label="Upvote"
        disabled={busy}
        whileTap={{ scale: 0.85 }}
        onClick={() => castVote(1)}
        className={`rounded-lg p-1 transition-colors hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-950 ${myVote === 1 ? "text-green-600" : ""}`}
      >
        <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
      </motion.button>
      <motion.span key={score} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
        {score}
      </motion.span>
      <motion.button
        type="button"
        aria-label="Downvote"
        disabled={busy}
        whileTap={{ scale: 0.85 }}
        onClick={() => castVote(-1)}
        className={`rounded-lg p-1 transition-colors hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 ${myVote === -1 ? "text-red-600" : ""}`}
      >
        <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
