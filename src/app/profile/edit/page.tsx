import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileById, getCrops, getDistricts } from "@/lib/data";
import { EditProfileForm } from "@/components/EditProfileForm";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const [profile, crops, districts] = await Promise.all([
    getProfileById(authData.user.id),
    getCrops(),
    getDistricts(),
  ]);
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <SupabaseSetupNotice />
      <EditProfileForm profile={profile} crops={crops} districts={districts} />
    </div>
  );
}
