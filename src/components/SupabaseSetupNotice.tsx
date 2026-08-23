import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Renders nothing once a real Supabase project is connected. Until then it
 * flags — on every data page — that what's showing is an empty/dev state,
 * not proof the feature is broken.
 */
export function SupabaseSetupNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <strong>Supabase isn&apos;t connected yet.</strong> Add your project credentials to{" "}
      <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> (see{" "}
      <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local.example</code>) to see live data here.
    </div>
  );
}
