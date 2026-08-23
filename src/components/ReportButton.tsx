"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ReportButton({ postId, commentId }: { postId?: string; commentId?: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }
    await supabase.from("reports").insert({
      post_id: postId ?? null,
      comment_id: commentId ?? null,
      reported_by: userData.user.id,
      reason: reason || null,
    });
    setSent(true);
    setOpen(false);
  }

  if (sent) {
    return <span className="text-xs text-neutral-400">{t("report")} ✓</span>;
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-neutral-400 hover:text-red-600"
      >
        🚩 {t("report")}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-56 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you reporting this?"
            rows={2}
            className="w-full resize-none rounded border border-neutral-200 p-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-950"
          />
          <button
            type="button"
            onClick={submit}
            className="mt-1.5 w-full rounded bg-red-600 py-1 text-xs font-medium text-white hover:bg-red-700"
          >
            {t("report")}
          </button>
        </div>
      )}
    </div>
  );
}
