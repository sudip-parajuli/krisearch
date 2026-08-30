"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Always-available feedback entry point — genuinely zero-friction: no login,
 * not even a guest session. Writes straight to `feedback` with the public
 * `anon` key (RLS allows insert-only for anyone, see migration 0004).
 */
export function FeedbackWidget() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("feedback").insert({
      name: name.trim() || null,
      contact: contact.trim() || null,
      message: message.trim(),
      page_url: pathname,
    });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSent(true);
    setMessage("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-4 z-40 rounded-full bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-shadow hover:shadow-xl hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 md:bottom-4"
      >
        💬 {t("feedbackButton")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <div className="py-6 text-center">
                <p className="text-2xl">🙏</p>
                <p className="mt-2 text-sm font-medium">{t("feedbackThanks")}</p>
                <button type="button" onClick={() => setOpen(false)} className="mt-4 text-xs text-neutral-400 underline">
                  {t("feedbackClose")}
                </button>
              </div>
            ) : (
              <>
                <h2 className="mb-1 text-sm font-bold">{t("feedbackTitle")}</h2>
                <p className="mb-3 text-xs text-neutral-500">{t("feedbackSubtitle")}</p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder={t("feedbackPlaceholder")}
                  className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                />
                <div className="mt-2 flex gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("feedbackNamePlaceholder")}
                    className="flex-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-950"
                  />
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={t("feedbackContactPlaceholder")}
                    className="flex-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-950"
                  />
                </div>
                {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setOpen(false)} className="rounded-full px-3 py-1.5 text-xs text-neutral-400">
                    {t("feedbackCancel")}
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting || !message.trim()}
                    className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? t("feedbackSending") : t("feedbackSend")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
