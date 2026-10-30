"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ensureSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { AskAI } from "./AskAI";
import type { Citation } from "@/lib/ai/answers";
type Result = {
  answer: string;
  citations: Citation[];
  updated_at: string;
  language: "ne" | "en";
};
export function AIAnswerCard({
  postId,
  initialAnswer = null,
}: {
  postId: string;
  initialAnswer?: Result | null;
}) {
  const { lang } = useLanguage();
  const ne = lang === "ne";
  const [result, setResult] = useState<Result | null>(initialAnswer);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const load = () => {
      if (document.visibilityState !== "visible") return;
      fetch(`/api/ai/answer?post=${postId}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => {
          setEnabled(d.enabled === true);
          setResult(d.result ?? null);
        })
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, 15000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [postId]);
  async function request() {
    setBusy(true);
    setError(false);
    try {
      await ensureSession(createClient());
      const response = await fetch("/api/ai/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
        signal: AbortSignal.timeout(45_000),
      });
      const data = await response.json();
      if (!["answered", "pending"].includes(data.status)) throw new Error();
      const fresh = await fetch(`/api/ai/answer?post=${postId}`).then((r) =>
        r.json(),
      );
      setResult(fresh.result ?? null);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-6 space-y-4">
      <section className="rounded-2xl border border-green-200 bg-white p-5 dark:border-green-900 dark:bg-neutral-900">
        <h2 className="font-semibold">
          {ne ? "Krisearch AI को जवाफ" : "Krisearch AI response"}
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          {ne
            ? "समुदायको टिप्पणीभन्दा अलग AI सहायकको सामान्य जानकारी।"
            : "General AI assistance, separate from community comments."}
        </p>
        {result ? (
          <>
            <p
              lang={result.language}
              className="mt-4 whitespace-pre-wrap text-sm leading-relaxed"
            >
              {result.answer}
            </p>
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
              {ne
                ? "AI द्वारा तयार। विशेषज्ञको जाँचको विकल्प होइन।"
                : "AI generated. Not a substitute for expert assessment."}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {result.citations.map((c) => (
                <a
                  key={c.id}
                  href={c.href}
                  className="text-xs text-green-700 underline dark:text-green-400"
                >
                  {c.label}
                </a>
              ))}
            </div>
          </>
        ) : (
          <p className="my-4 text-sm text-neutral-500">
            {enabled
              ? ne
                ? "जवाफ अझै तयार भएको छैन।"
                : "An answer has not been prepared yet."
              : ne
                ? "AI सेवा जोडिएपछि यो सुविधा चल्नेछ।"
                : "This feature will work once an AI provider is connected."}
          </p>
        )}
        {!result && enabled && (
          <button
            type="button"
            disabled={busy}
            onClick={request}
            className="mt-3 rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy
              ? ne
                ? "जवाफ तयार हुँदैछ…"
                : "Preparing…"
              : ne
                ? "AI जवाफ माग्नुहोस्"
                : "Request AI response"}
          </button>
        )}
        {error && (
          <p
            role="status"
            className="mt-3 text-xs text-amber-700 dark:text-amber-400"
          >
            {ne
              ? "AI जवाफ उपलब्ध भएन। पछि फेरि प्रयास गर्नुहोस्।"
              : "AI could not answer right now. Please try later."}
          </p>
        )}
      </section>
      <AskAI postId={postId} />
    </div>
  );
}
