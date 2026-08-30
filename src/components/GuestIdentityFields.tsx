"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Optional "Your name" / "Phone or email" inputs shown inline on post and
 * comment forms — nobody is required to fill these in. A signed-in user can
 * ignore them entirely; a guest can leave a name so their post isn't just
 * "Anonymous," and a contact so someone can follow up.
 */
export function GuestIdentityFields({
  name,
  onNameChange,
  contact,
  onContactChange,
  compact = false,
}: {
  name: string;
  onNameChange: (v: string) => void;
  contact: string;
  onContactChange: (v: string) => void;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className={`flex gap-2 ${compact ? "" : "flex-col sm:flex-row"}`}>
      <input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={t("yourNamePlaceholder")}
        className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      <input
        value={contact}
        onChange={(e) => onContactChange(e.target.value)}
        placeholder={t("phoneOrEmailPlaceholder")}
        className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
    </div>
  );
}
