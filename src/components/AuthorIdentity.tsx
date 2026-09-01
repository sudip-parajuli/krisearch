import { User, CircleUserRound, Phone, Mail, CheckCircle2, type LucideIcon } from "lucide-react";
import type { Profile } from "@/types/database";

const methodConfig: Record<
  Exclude<Profile["verification_method"], null>,
  { icon: LucideIcon | "google" | "facebook"; label: string }
> = {
  phone: { icon: Phone, label: "Phone verified" },
  email: { icon: Mail, label: "Email verified" },
  google: { icon: "google", label: "Verified via Google" },
  facebook: { icon: "facebook", label: "Verified via Facebook" },
  guest: { icon: User, label: "Guest — not verified" },
};

/** lucide-react deliberately excludes brand logos — a plain letter badge is the lightweight stand-in. */
function BrandBadge({ letter, className }: { letter: string; className: string }) {
  return (
    <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white ${className}`}>
      {letter}
    </span>
  );
}

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
  const dim = size === "md" ? "h-9 w-9" : "h-6 w-6";
  const AvatarIcon = isGuest ? User : CircleUserRound;

  return (
    <span className="inline-flex items-center gap-1.5">
      {profile?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatar_url} alt="" className={`${dim} shrink-0 rounded-full object-cover`} />
      ) : (
        <span
          className={`${dim} flex shrink-0 items-center justify-center rounded-full ${
            isGuest ? "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400" : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
          }`}
        >
          <AvatarIcon className={size === "md" ? "h-5 w-5" : "h-3.5 w-3.5"} strokeWidth={2} />
        </span>
      )}
      <span className="font-medium text-neutral-700 dark:text-neutral-300">{name}</span>
      {profile?.verified_badge && (
        <span title={profile.verified_badge}>
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        </span>
      )}
      {isGuest ? (
        <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">
          Guest
        </span>
      ) : (
        method &&
        (methodConfig[method].icon === "google" ? (
          <BrandBadge letter="G" className="bg-blue-500" />
        ) : methodConfig[method].icon === "facebook" ? (
          <BrandBadge letter="f" className="bg-[#1877F2]" />
        ) : (
          (() => {
            const Icon = methodConfig[method].icon as LucideIcon;
            return (
              <span title={methodConfig[method].label}>
                <Icon className="h-3.5 w-3.5 text-neutral-400" />
              </span>
            );
          })()
        ))
      )}
    </span>
  );
}
