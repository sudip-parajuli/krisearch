export function EmptyState({ icon = "🌱", title, body }: { icon?: string; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-6 py-12 text-center dark:border-neutral-700">
      <span className="text-3xl">{icon}</span>
      <p className="font-medium text-neutral-700 dark:text-neutral-300">{title}</p>
      {body && <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{body}</p>}
    </div>
  );
}
