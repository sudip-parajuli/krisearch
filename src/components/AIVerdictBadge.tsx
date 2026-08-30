import type { AIVerdict } from "@/types/database";

const config: Record<AIVerdict, { icon: string; label: string; color: string }> = {
  safe: { icon: "✅", label: "AI: looks safe", color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  caution: { icon: "⚠️", label: "AI: use caution", color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  danger: { icon: "⛔", label: "AI: possibly harmful", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
  unverified: { icon: "❔", label: "AI: unverified", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
};

/** Shown on a post/comment once the AI safety classifier has judged it — hidden (not "loading") until then. */
export function AIVerdictBadge({ verdict, rationale }: { verdict: AIVerdict | null; rationale?: string | null }) {
  if (!verdict) return null;
  const c = config[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.color}`}
      title={rationale ?? undefined}
    >
      <span>{c.icon}</span>
      {c.label}
    </span>
  );
}
