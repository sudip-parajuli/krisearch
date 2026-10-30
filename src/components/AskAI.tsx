"use client";
import { useEffect, useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { BotAnswer } from "@/lib/ai/answers";

export function AskAI({ postId }: { postId?: string }) {
  const { lang } = useLanguage();
  const ne = lang === "ne";
  const [question, setQuestion] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BotAnswer | null>(null);
  const [error, setError] = useState<"session" | "limited" | "provider" | "network" | null>(null);
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/ai/ask", { signal: c.signal })
      .then((r) => r.json())
      .then((d) => {
        setEnabled(d.enabled === true);
        setChecked(true);
      })
      .catch(() => setChecked(true));
    return () => c.abort();
  }, []);
  async function ask() {
    if (busy || !enabled || question.trim().length < 5) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      try { await ensureSession(createClient()); } catch { setError("session"); return; }
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, language: lang, postId }),
        signal: AbortSignal.timeout(45_000),
      });
      const data = await response.json();
      if (!response.ok || !data.result) { setError(response.status === 429 ? "limited" : response.status === 401 ? "session" : "provider"); return; }
      setResult(data.result);
    } catch {
      setError("network");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-4 rounded-2xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900 dark:bg-green-950/40">
      <h2 className="flex items-center gap-2 font-semibold">
        <Sparkles className="h-5 w-5 text-green-600" />
        {ne ? "कृषि AI लाई सोध्नुहोस्" : "Ask Krisearch AI"}
      </h2>
      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        {ne
          ? "सामान्य जानकारीका लागि AI सहायक। प्रश्न AI प्रदायकमा पठाइन्छ; व्यक्तिगत वा गोप्य विवरण नलेख्नुहोस्।"
          : "AI assistance for general information. Your question is sent to the configured AI provider; leave out private or sensitive information."}
      </p>
      {checked && !enabled && (
        <p
          role="status"
          className="rounded-xl bg-white/70 p-3 text-sm dark:bg-neutral-900"
        >
          {ne
            ? "AI सेवा अझै जोडिएको छैन। अहिले समुदायमा प्रश्न राख्न सक्नुहुन्छ।"
            : "The AI service is not connected yet. You can still ask the community."}
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
        className="space-y-3"
      >
        <label className="block text-sm">
          <span className="sr-only">
            {ne ? "तपाईंको प्रश्न" : "Your question"}
          </span>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={2000}
            rows={3}
            disabled={!enabled || busy}
            placeholder={
              ne
                ? "आफ्नो बाली, स्थान र देखिएको समस्या लेख्नुहोस्…"
                : "Describe the crop, area and what you have observed…"
            }
            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <button
          disabled={!enabled || busy || question.trim().length < 5}
          className="inline-flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {busy
            ? ne
              ? "जवाफ तयार हुँदैछ…"
              : "Preparing an answer…"
            : ne
              ? "सोध्नुहोस्"
              : "Ask AI"}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-amber-800 dark:text-amber-300">
          {error === "session" ? (ne ? "सत्र सुरु हुन सकेन। लगइन गरेर फेरि प्रयास गर्नुहोस्।" : "A session could not be started. Please sign in and try again.") : error === "limited" ? (ne ? "AI प्रयोग सीमा पुगेको छ वा सेवा सेटअप अपूर्ण छ। पछि फेरि प्रयास गर्नुहोस्।" : "The AI request limit has been reached or setup is incomplete. Please try later.") : error === "provider" ? (ne ? "AI प्रदायकबाट जवाफ आएन। केही समयपछि प्रयास गर्नुहोस्।" : "The AI provider could not return an answer. Please try again later.") : (ne ? "जडानमा समस्या भयो। फेरि प्रयास गर्नुहोस्।" : "The connection failed. Please try again.")}
        </p>
      )}
      {result && (
        <div
          aria-live="polite"
          className="rounded-xl border border-green-200 bg-white p-4 dark:border-green-800 dark:bg-neutral-900"
        >
          <p className="mb-2 text-xs font-semibold text-green-700 dark:text-green-400">
            {ne
              ? "AI द्वारा तयार · स्वतन्त्र रूपमा प्रमाणित होइन"
              : "AI generated · not independently verified"}
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {result.answer}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {result.citations.map((c) => (
              <a
                key={c.id}
                href={c.href}
                className="text-xs font-medium text-green-700 underline dark:text-green-400"
              >
                {c.label}
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            {ne
              ? "खेतको वास्तविक अवस्था जाँच्न स्थानीय कृषि प्राविधिकको सहयोग लिनुहोस्।"
              : "Ask a local agricultural professional to assess actual field conditions."}
          </p>
        </div>
      )}
    </section>
  );
}
