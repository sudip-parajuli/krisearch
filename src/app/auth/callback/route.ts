import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Redirect target for supabase.auth.signInWithOAuth (Google/Facebook). */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const provider = data.user.app_metadata?.provider as "google" | "facebook" | undefined;
      const avatarUrl =
        (data.user.user_metadata?.avatar_url as string | undefined) ??
        (data.user.user_metadata?.picture as string | undefined) ??
        null;

      const { data: existing } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
      if (!existing) {
        const fallbackName =
          (data.user.user_metadata?.full_name as string | undefined) ??
          (data.user.user_metadata?.name as string | undefined) ??
          data.user.email?.split("@")[0] ??
          "Farmer";
        await supabase.from("profiles").insert({
          id: data.user.id,
          display_name: fallbackName,
          role: "farmer",
          avatar_url: avatarUrl,
          verification_method: provider ?? null,
        });
      } else {
        // Guest (or an existing account) linking a Google/Facebook identity.
        await supabase
          .from("profiles")
          .update({ is_guest: false, avatar_url: avatarUrl, verification_method: provider ?? null })
          .eq("id", data.user.id);
      }
      return NextResponse.redirect(`${origin}/profile/${data.user.id}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
