"use client";

import { useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { AskAI } from "./AskAI";

export function FloatingAI() {
  const { lang } = useLanguage();
  const ne = lang === "ne";
  const panel = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState(false);
  const [visited, setVisited] = useState(false);
  const title = ne ? "कृषि AI लाई सोध्नुहोस्" : "Ask Krisearch AI";

  function open() {
    setVisited(true);
    panel.current?.showModal();
    setOpened(true);
  }

  return (
    <>
      <button
        ref={launcher}
        type="button"
        onClick={open}
        aria-label={title}
        aria-haspopup="dialog"
        aria-controls="floating-ai-panel"
        aria-expanded={opened}
        className="fixed bottom-[calc(5rem_+_env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-green-500 bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-950/20 transition-colors hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-600 md:bottom-6 md:right-6"
      >
        <Sparkles aria-hidden="true" className="h-5 w-5" />
        <span>{ne ? "कृषि AI" : "Ask AI"}</span>
      </button>
      <dialog
        ref={panel}
        id="floating-ai-panel"
        aria-labelledby="floating-ai-title"
        onClose={() => {
          setOpened(false);
          launcher.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) panel.current?.close();
        }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/45 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 id="floating-ai-title" className="font-semibold">{title}</h2>
          <button
            type="button"
            onClick={() => panel.current?.close()}
            aria-label={ne ? "AI च्याट बन्द गर्नुहोस्" : "Close AI chat"}
            className="rounded-full p-2 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-green-600 dark:hover:bg-neutral-800"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-5">
          {visited && <AskAI />}
        </div>
      </dialog>
    </>
  );
}
