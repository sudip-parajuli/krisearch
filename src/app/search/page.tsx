import { searchAll } from "@/lib/data";
import { SearchClient } from "@/components/SearchClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().slice(0, 200);
  const results = q ? await searchAll(q) : { crops: [], equipment: [], vendors: [], schemes: [], posts: [] };

  return (
    <div>
      <SupabaseSetupNotice />
      <SearchClient key={q} initialQuery={q} results={results} />
    </div>
  );
}
