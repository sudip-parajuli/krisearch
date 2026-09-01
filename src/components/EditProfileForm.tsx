"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Profile, Crop, District } from "@/types/database";

export function EditProfileForm({ profile, crops, districts }: { profile: Profile; crops: Crop[]; districts: District[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [districtId, setDistrictId] = useState(profile.district_id ? String(profile.district_id) : "");
  const [cropsGrown, setCropsGrown] = useState<number[]>(profile.crops_grown ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCrop(id: number) {
    setCropsGrown((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        district_id: districtId ? Number(districtId) : null,
        crops_grown: cropsGrown.length ? cropsGrown : null,
      })
      .eq("id", profile.id);
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push(`/profile/${profile.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sprout className="h-6 w-6 text-green-600 dark:text-green-400" />
        <h1 className="font-display text-xl font-semibold">{t("myFarmTitle")}</h1>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("vendorNameLabel")}</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("districtLabel")}</label>
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">{t("noneOption")}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("cropsGrownLabel")}</label>
        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-neutral-200 p-2 dark:border-neutral-800">
          {crops.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCrop(c.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                cropsGrown.includes(c.id)
                  ? "bg-green-600 text-white"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {c.name_en}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("bioLabel")}</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
      >
        {submitting ? "..." : t("saveProfile")}
      </button>
    </form>
  );
}
