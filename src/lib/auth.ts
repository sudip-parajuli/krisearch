"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Zero-friction identity for actions that need a user row (voting, posting,
 * commenting, reporting) without ever showing a login screen. If there's no
 * session yet, this silently creates a Supabase anonymous session (requires
 * "Allow anonymous sign-ins" enabled in Supabase Auth settings) and a matching
 * `profiles` row labeled as a guest. If the visitor later verifies a real
 * phone/email on /login, Supabase's identity-linking flow upgrades this same
 * user id in place — their guest posts/votes stay attributed to them.
 */
export async function ensureSession(supabase: SupabaseClient): Promise<User> {
  const { data } = await supabase.auth.getUser();
  if (data.user) return data.user;

  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error || !anon.user) {
    throw new Error(
      error?.message ??
        "Couldn't start a guest session. If this persists, ask the site owner to enable anonymous sign-ins in Supabase."
    );
  }

  await supabase.from("profiles").upsert(
    { id: anon.user.id, display_name: "Guest", role: "general", is_guest: true, verification_method: "guest" },
    { onConflict: "id" }
  );

  return anon.user;
}

/** Applies an optional display name / contact a guest typed inline on a form. */
export async function applyGuestIdentity(
  supabase: SupabaseClient,
  userId: string,
  { name, contact }: { name?: string; contact?: string }
) {
  const patch: Record<string, string> = {};
  if (name?.trim()) patch.display_name = name.trim();
  if (contact?.trim()) patch.contact_info = contact.trim();
  if (Object.keys(patch).length === 0) return;
  await supabase.from("profiles").update(patch).eq("id", userId);
}
