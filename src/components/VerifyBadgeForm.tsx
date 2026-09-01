"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { VerifiedBadge } from "@/types/database";

export function VerifyBadgeForm() {
  const { t } = useLanguage();
  const [badge, setBadge] = useState<Exclude<VerifiedBadge, null>>("extension_officer");
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Please log in first.");
      setSubmitting(false);
      return;
    }
    const { error: insertError } = await supabase.from("verification_requests").insert({
      profile_id: userData.user.id,
      requested_badge: badge,
      evidence_text: evidenceText.trim() || null,
      evidence_url: evidenceUrl.trim() || null,
    });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-14 text-center dark:border-green-900 dark:bg-green-950">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        <p className="font-display font-medium text-green-800 dark:text-green-300">{t("verificationSubmitted")}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BadgeCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
        <h1 className="font-display text-xl font-semibold">{t("verifyBadgeTitle")}</h1>
      </div>
      <p className="text-sm text-neutral-500">{t("verifyBadgeSubtitle")}</p>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("whichBadge")}</label>
        <div className="grid grid-cols-2 gap-2">
          {(["extension_officer", "agrovet"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBadge(b)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                badge === b
                  ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {b.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("evidenceLabel")}</label>
        <textarea
          value={evidenceText}
          onChange={(e) => setEvidenceText(e.target.value)}
          rows={3}
          placeholder="e.g. I work at the Kaski Krishi Gyan Kendra, or I run an agrovet shop in Butwal since 2019..."
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("evidenceLinkLabel")}</label>
        <input
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          placeholder="Business listing, ID card photo link, etc."
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
      >
        {submitting ? "..." : t("submitVerification")}
      </button>
    </form>
  );
}
