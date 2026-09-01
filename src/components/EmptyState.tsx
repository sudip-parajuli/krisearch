import { Sprout, type LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon = Sprout, title, body }: { icon?: LucideIcon; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center dark:border-neutral-700">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <p className="font-display font-medium text-neutral-700 dark:text-neutral-300">{title}</p>
      {body && <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{body}</p>}
    </div>
  );
}
