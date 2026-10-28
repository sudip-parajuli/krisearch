"use client";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useSaved } from "./SavedProvider";
import { SaveButton } from "./SaveButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SavedClient() {
  const { items, ready } = useSaved(); const { lang } = useLanguage(); const ne = lang === "ne";
  return <div className="space-y-6"><div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-green-700 dark:text-green-400">{ne ? "तपाईंको सङ्ग्रह" : "Your collection"}</p><h1 className="font-display text-3xl font-semibold">{ne ? "पछि हेर्न राखिएका सामग्री" : "Saved for later"}</h1><p className="mt-3 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">{ne ? "बाली र समुदायका पोस्टका लिंक यही ब्राउजरमा राखिन्छन्। लगइन चाहिँदैन। अर्को उपकरणमा सर्दैनन् र पूरा सामग्री अफलाइन डाउनलोड हुँदैन।" : "Keep crop and community links in this browser. No sign-in needed. Saves do not sync to another device or download full pages for offline use."}</p></div>
    {!ready ? <p role="status">{ne ? "खुल्दैछ…" : "Loading saves…"}</p> : !items.length ? <div className="rounded-3xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700"><Bookmark className="mx-auto mb-4 h-9 w-9 text-green-600" /><h2 className="text-lg font-semibold">{ne ? "अहिलेसम्म केही राखिएको छैन" : "A little space for useful discoveries"}</h2><p className="my-3 text-sm text-neutral-500">{ne ? "बाली वा पोस्टमा रहेको सेभ बटन थिच्नुहोस्।" : "Use the bookmark button on a crop or community post."}</p><Link href="/crops" className="text-sm font-semibold text-green-700 underline dark:text-green-400">{ne ? "बाली हेर्नुहोस्" : "Explore crops"} →</Link></div> : <ul className="space-y-3">{items.map(item => <li key={item.href} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"><div className="min-w-0 flex-1"><p className="mb-1 text-xs text-neutral-500">{item.kind === "crop" ? (ne ? "बाली" : "Crop") : (ne ? "समुदाय" : "Community")}</p><Link href={item.href} className="break-words font-semibold hover:text-green-600">{item.title}</Link></div><SaveButton {...item} /></li>)}</ul>}
  </div>;
}
