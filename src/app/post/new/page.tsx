import { getCrops, getDistricts, getTags } from "@/lib/data";
import { NewPostForm } from "@/components/NewPostForm";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function NewPostPage() {
  const [crops, districts, tags] = await Promise.all([getCrops(), getDistricts(), getTags()]);

  return (
    <div className="mx-auto max-w-xl">
      <SupabaseSetupNotice />
      <h1 className="mb-4 text-xl font-bold">Share with the community</h1>
      <NewPostForm crops={crops} districts={districts} tags={tags} />
    </div>
  );
}
