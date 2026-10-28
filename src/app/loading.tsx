export default function Loading() {
  return <div role="status" aria-label="खुल्दैछ / Loading" className="space-y-5 py-4"><span className="sr-only">खुल्दैछ / Loading…</span><div className="h-36 animate-pulse rounded-3xl bg-neutral-200 dark:bg-neutral-800" /><div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" />)}</div></div>;
}
