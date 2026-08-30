"use client";

import { useState } from "react";

export function SyncPricesButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/sync-prices", { method: "POST" });
      const data = await res.json();
      setMessage(data.message ?? `Synced ${data.synced ?? 0} price rows.`);
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
        className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {busy ? "Checking..." : "Sync Kalimati prices now"}
      </button>
      {message && <p className="mt-2 max-w-lg text-xs text-neutral-500">{message}</p>}
    </div>
  );
}
