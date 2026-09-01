import { searchAll } from "@/lib/data";
import { SearchClient } from "@/components/SearchClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const results = q ? await searchAll(q) : { crops: [], equipment: [], vendors: [], schemes: [], posts: [] };

  return (
    <div>
      <SupabaseSetupNotice />
      <SearchClient initialQuery={q} results={results} />
    </div>
  );
}
