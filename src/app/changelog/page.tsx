import { getChangelog } from "@/lib/data";
import { ChangelogClient } from "@/components/ChangelogClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function ChangelogPage() {
  const entries = await getChangelog();
  return (
    <div>
      <SupabaseSetupNotice />
      <ChangelogClient entries={entries} />
    </div>
  );
}
