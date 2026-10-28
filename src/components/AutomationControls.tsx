"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function AutomationControls() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function run() {
    setBusy(true);
    try {
      const response = await fetch("/api/cron/refresh", {
        method: "POST",
        signal: AbortSignal.timeout(65000),
      });
      const result = await response.json();
      setMessage(JSON.stringify(result, null, 2));
      router.refresh();
    } catch {
      setMessage(
        "Refresh did not complete. Check the latest job run before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={run}
        className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Refreshing sources…" : "Refresh all sources now"}
      </button>
      {message && (
        <pre
          role="status"
          className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-neutral-200 p-4 text-xs dark:border-neutral-800"
        >
          {message}
        </pre>
      )}
    </div>
  );
}
