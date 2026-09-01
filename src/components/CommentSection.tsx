"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureSession, applyGuestIdentity } from "@/lib/auth";
import { ReportButton } from "./ReportButton";
import { AIVerdictBadge } from "./AIVerdictBadge";
import { GuestIdentityFields } from "./GuestIdentityFields";
import { AuthorIdentity } from "./AuthorIdentity";
import { VoiceInputButton } from "./VoiceInputButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Comment, Profile } from "@/types/database";

type CommentWithAuthor = Comment & {
  profiles: Pick<Profile, "id" | "display_name" | "verified_badge" | "avatar_url" | "verification_method"> | null;
};

export function CommentSection({
  postId,
  postAuthorId,
  comments,
}: {
  postId: string;
  postAuthorId: string | null;
  comments: CommentWithAuthor[];
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [showGuestFields, setShowGuestFields] = useState(false);
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setViewerId(data.user?.id ?? null));
  }, []);

  const isPostAuthor = !!postAuthorId && viewerId === postAuthorId;
  const topLevel = comments.filter((c) => !c.parent_comment_id);
  const repliesOf = (id: string) => comments.filter((c) => c.parent_comment_id === id);

  async function submit() {
    if (!body.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    let user;
    try {
      user = await ensureSession(supabase);
    } catch {
      setSubmitting(false);
      return;
    }
    await applyGuestIdentity(supabase, user.id, { name: guestName, contact: guestContact });

    const { data: comment } = await supabase
      .from("comments")
      .insert({ post_id: postId, author_id: user.id, body: body.trim() })
      .select("id")
      .single();

    if (comment) {
      fetch("/api/ai/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "comment", id: comment.id }),
      }).catch(() => {});
    }

    setBody("");
    setSubmitting(false);
    router.refresh();
  }

  async function markBestAnswer(commentId: string) {
    const supabase = createClient();
    await supabase.from("comments").update({ is_best_answer: true }).eq("id", commentId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder={t("addComment")}
            className="flex-1 resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="self-end rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md hover:bg-green-700 disabled:opacity-50"
          >
            {t("send")}
          </button>
        </div>
        <VoiceInputButton onResult={(text) => setBody((prev) => (prev ? `${prev} ${text}` : text))} />
        {!viewerId && (
          <button
            type="button"
            onClick={() => setShowGuestFields((s) => !s)}
            className="self-start text-xs text-neutral-400 underline"
          >
            {showGuestFields ? "Hide name/contact" : t("addNameOptional")}
          </button>
        )}
        {showGuestFields && (
          <GuestIdentityFields name={guestName} onNameChange={setGuestName} contact={guestContact} onContactChange={setGuestContact} compact />
        )}
      </div>

      {topLevel.length === 0 ? (
        <p className="text-sm text-neutral-400">{t("noCommentsYet")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {[...topLevel].sort((a, b) => Number(b.is_best_answer) - Number(a.is_best_answer)).map((c) => (
            <li
              key={c.id}
              className={`rounded-lg border p-3 ${
                c.is_best_answer
                  ? "border-green-400 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <CommentRow comment={c} isPostAuthor={isPostAuthor} onMarkBest={markBestAnswer} />
              {repliesOf(c.id).length > 0 && (
                <ul className="ml-4 mt-2 flex flex-col gap-2 border-l border-neutral-200 pl-3 dark:border-neutral-800">
                  {repliesOf(c.id).map((r) => (
                    <li key={r.id}>
                      <CommentRow comment={r} isPostAuthor={isPostAuthor} onMarkBest={markBestAnswer} />
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

function CommentRow({
  comment,
  isPostAuthor,
  onMarkBest,
}: {
  comment: CommentWithAuthor;
  isPostAuthor: boolean;
  onMarkBest: (id: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
        <AuthorIdentity profile={comment.profiles} />
        <span>·</span>
        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
        {comment.is_best_answer && (
          <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            ✓ {t("bestAnswer")}
          </span>
        )}
        <AIVerdictBadge verdict={comment.ai_verdict} rationale={comment.ai_rationale} />
      </div>
      <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">{comment.body}</p>
      <div className="mt-1 flex items-center gap-3">
        <ReportButton commentId={comment.id} />
        {isPostAuthor && !comment.is_best_answer && (
          <button
            type="button"
            onClick={() => onMarkBest(comment.id)}
            className="text-xs text-green-700 hover:underline dark:text-green-400"
          >
            {t("markBestAnswer")}
          </button>
        )}
      </div>
    </div>
  );
}
