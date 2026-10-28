"use client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
export function SourceUpdatesClient({
  items,
}: {
  items: {
    id: string;
    title: string;
    url: string;
    kind: string;
    summary: string | null;
    checked_at: string;
  }[];
}) {
  const { lang } = useLanguage();
  const ne = lang === "ne";
  if (!items.length)
    return (
      <p className="my-4 text-sm text-neutral-500">
        {ne
          ? "नयाँ स्रोत सूचना अझै उपलब्ध छैनन्।"
          : "No imported source updates are available yet."}
      </p>
    );
  return (
    <section className="my-6 space-y-3">
      <h2 className="text-lg font-semibold">
        {ne ? "स्रोतका नयाँ सूचना" : "Updates from sources"}
      </h2>
      <p className="text-xs text-neutral-500">
        {ne
          ? "स्वचालित रूपमा संकलित स्रोत लिंकहरू। आवेदन, म्याद र उपलब्धता मूल स्रोतबाट जाँच्नुहोस्।"
          : "Automatically collected source links. Check the original source for eligibility, deadlines and availability."}
      </p>
      <p className="text-xs text-neutral-500">{ne ? "जाँचिएको मिति भनेको लिंक जाँचिएको समय हो, सूचना प्रकाशित भएको मिति होइन। पुराना सूचना पनि देखिन सक्छन्।" : "Checked dates show when links were collected, not when notices were published. Some notices may be old."}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="mb-2 text-xs uppercase text-green-700 dark:text-green-400">
              {item.kind} · {new URL(item.url).hostname}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {item.title} ↗
            </a>
            {item.summary && (
              <p className="mt-2 text-sm text-neutral-500">{item.summary}</p>
            )}
            <p className="mt-3 text-xs text-neutral-400">
              {ne ? "जाँचिएको" : "Checked"}:{" "}
              {new Date(item.checked_at).toLocaleDateString(
                lang === "ne" ? "ne-NP" : "en-GB",
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
