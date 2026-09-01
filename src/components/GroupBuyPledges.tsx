"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, HandHeart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ensureSession, applyGuestIdentity } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { AuthorIdentity } from "./AuthorIdentity";
import type { GroupBuyPledge, Profile } from "@/types/database";

type PledgeWithAuthor = GroupBuyPledge & {
  profiles: Pick<Profile, "id" | "display_name" | "avatar_url" | "verification_method" | "verified_badge"> | null;
};

export function GroupBuyPledges({ postId, initialPledges }: { postId: string; initialPledges: PledgeWithAuthor[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  async function join() {
    setSubmitting(true);
    const supabase = createClient();
    let user;
    try {
      user = await ensureSession(supabase);
    } catch {
      setSubmitting(false);
      return;
    }
    await applyGuestIdentity(supabase, user.id, {});
    await supabase.from("group_buy_pledges").upsert({ post_id: postId, user_id: user.id, note: note.trim() || null });
    setJoined(true);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl border border-gold-200 bg-gold-50 p-4 dark:border-gold-900/40 dark:bg-gold-950/20"
    >
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gold-800 dark:text-gold-300">
        <Users className="h-4 w-4" /> {t("pledgesTitle")} ({initialPledges.length})
      </h2>

      {initialPledges.length === 0 ? (
        <p className="mt-2 text-xs text-neutral-500">{t("noPledgesYet")}</p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {initialPledges.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <AuthorIdentity profile={p.profiles} />
              {p.note && <span className="text-xs text-neutral-500">— {p.note}</span>}
            </div>
          ))}
        </div>
      )}

      {!joined && (
        <div className="mt-3 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("pledgeNotePlaceholder")}
            className="flex-1 rounded-lg border border-gold-200 bg-white px-3 py-1.5 text-xs dark:border-gold-900 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={join}
            disabled={submitting}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gold-600 disabled:opacity-50"
          >
            <HandHeart className="h-3.5 w-3.5" /> {t("joinGroupBuy")}
          </button>
        </div>
      )}
    </motion.div>
  );
}
