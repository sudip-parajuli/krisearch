import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SourceUpdatesClient } from "./SourceUpdatesClient";
export async function SourceUpdates({
  kind,
  limit = 6,
}: {
  kind?: string;
  limit?: number;
}) {
  if (!isSupabaseConfigured) return null;
  const client = await createClient();
  let query = client
    .from("automation_items")
    .select("id,title,url,kind,summary,checked_at")
    .eq("state", "published")
    .order("checked_at", { ascending: false })
    .limit(limit);
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  return <SourceUpdatesClient items={error ? [] : (data ?? [])} />;
}
