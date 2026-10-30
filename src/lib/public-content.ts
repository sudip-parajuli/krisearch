import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
} from "./supabase/env";
// Cookie-free, anonymous RLS reads: discovery must never depend on a visitor's privileges.
export function publicContentClient() {
  return isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          fetch: (url, options) =>
            fetch(url, { ...options, cache: "no-store" }),
        },
      })
    : null;
}
export async function getPublishedAIAnswer(postId: string) {
  const client = publicContentClient();
  if (!client) return null;
  const { data } = await client
    .from("ai_answers")
    .select("answer,citations,language,updated_at")
    .eq("post_id", postId)
    .eq("status", "answered")
    .maybeSingle();
  return data as {
    answer: string;
    citations: { id: string; label: string; href: string }[];
    language: "ne" | "en";
    updated_at: string;
  } | null;
}
