"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { lang } = useLanguage(); const ne = lang === "ne";
  return <div role="alert" className="mx-auto max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900"><h1 className="font-display text-2xl font-semibold">{ne ? "यो पृष्ठ खुल्न सकेन" : "We couldn’t load this page"}</h1><p className="my-4 text-sm text-neutral-500">{ne ? "जडान जाँच्नुहोस् र फेरि प्रयास गर्नुहोस्।" : "Check your connection and try again."}</p><div className="flex justify-center gap-4"><button onClick={() => retry()} className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white">{ne ? "फेरि प्रयास गर्नुहोस्" : "Try again"}</button><Link href="/" className="px-3 py-2 text-sm text-green-700 underline dark:text-green-400">{ne ? "गृहपृष्ठ" : "Go home"}</Link></div></div>;
}
