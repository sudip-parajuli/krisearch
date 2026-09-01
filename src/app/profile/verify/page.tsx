import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerifyBadgeForm } from "@/components/VerifyBadgeForm";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function VerifyBadgePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <SupabaseSetupNotice />
      <VerifyBadgeForm />
    </div>
  );
}
