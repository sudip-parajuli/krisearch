"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./env";

/**
 * Browser-side Supabase client, for use inside client components (voting,
 * posting, auth forms, realtime). Safe to call even without real credentials —
 * it just won't successfully reach a backend until NEXT_PUBLIC_SUPABASE_* is set.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-anon-key");
}
