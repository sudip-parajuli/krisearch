import type { Profile } from "@/types/database";

const methodConfig: Record<Exclude<Profile["verification_method"], null>, { icon: string; label: string }> = {
  phone: { icon: "📱", label: "Phone verified" },
  email: { icon: "✉️", label: "Email verified" },
  google: { icon: "🔵G", label: "Verified via Google" },
  facebook: { icon: "📘", label: "Verified via Facebook" },
  guest: { icon: "", label: "Guest — not verified" },
};

type AuthorProfile = Pick<Profile, "display_name" | "avatar_url" | "verification_method" | "verified_badge"> | null;

/**
 * Shows who actually posted something — an avatar (real photo when someone
 * signed in with Google/Facebook, a generic icon otherwise) plus a "verified
 * via phone/email/Google/Facebook" signal, or an explicit "Guest" label when
 * there's no verification at all. Deliberately never shows a raw phone
 * number or email publicly — that's what `contact_info` /
 * profiles.avatar_url are for, not this.
 */
export function AuthorIdentity({ profile, size = "sm" }: { profile: AuthorProfile; size?: "sm" | "md" }) {
  const name = profile?.display_name ?? "Anonymous";
  const method = profile?.verification_method;
  const isGuest = !profile || method === "guest" || method == null;
  const dim = size === "md" ? "h-9 w-9 text-base" : "h-6 w-6 text-xs";

  return (
    <span className="inline-flex items-center gap-1.5">
      {profile?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatar_url} alt="" className={`${dim} shrink-0 rounded-full object-cover`} />
      ) : (
        <span
          className={`${dim} flex shrink-0 items-center justify-center rounded-full ${
            isGuest ? "bg-neutral-200 dark:bg-neutral-700" : "bg-green-100 dark:bg-green-950"
          }`}
        >
          {isGuest ? "👤" : "🧑‍🌾"}
        </span>
      )}
      <span className="font-medium text-neutral-700 dark:text-neutral-300">{name}</span>
      {profile?.verified_badge && <span title={profile.verified_badge}>✅</span>}
      {isGuest ? (
        <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">
          Guest
        </span>
      ) : (
        method && (
          <span title={methodConfig[method].label} className="text-[11px]">
            {methodConfig[method].icon}
          </span>
        )
      )}
    </span>
  );
}
