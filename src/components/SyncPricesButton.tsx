"use client";

import { useState } from "react";

type SourceStatus = { label: string; rowsFound: number; error?: string };

export function SyncPricesButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setMessage(null);
    setSources([]);
    try {
      const res = await fetch("/api/admin/sync-prices", { method: "POST" });
      const data = await res.json();
      setMessage(data.message ?? data.error ?? `Synced ${data.synced ?? 0} price rows.`);
      setSources(data.sources ?? []);
    } catch {
      setMessage("Sync request failed.");
    }
    setBusy(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {busy ? "Syncing from AMPIS + Kalimati..." : "Sync real government prices now"}
      </button>
      {message && <p className="mt-2 max-w-lg text-xs text-neutral-500">{message}</p>}
      {sources.length > 0 && (
        <ul className="mt-1 flex flex-col gap-0.5 text-xs text-neutral-400">
          {sources.map((s) => (
            <li key={s.label}>
              {s.error ? "⚠️" : "✓"} {s.label}: {s.error ? s.error : `${s.rowsFound} rows found`}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 max-w-lg text-xs text-neutral-400">
        Also runs automatically once a day via Vercel Cron (see vercel.json) once{" "}
        <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">CRON_SECRET</code> is set in your Vercel
        project env vars.
      </p>
    </div>
  );
}
