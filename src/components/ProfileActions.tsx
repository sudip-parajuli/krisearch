"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/** Shows an "Edit profile" link only when the viewer is looking at their own profile. */
export function ProfileActions({ profileId }: { profileId: string }) {
  const { t } = useLanguage();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsOwner(data.user?.id === profileId));
  }, [profileId]);

  if (!isOwner) return null;

  return (
    <Link
      href="/profile/edit"
      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      <Pencil className="h-3.5 w-3.5" /> {t("editProfile")}
    </Link>
  );
}
