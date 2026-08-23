export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * True once real Supabase credentials are in place. Every data-fetch helper in
 * lib/data.ts checks this first and returns an empty result instead of throwing,
 * so the app renders (with empty states) even before a project is connected.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
