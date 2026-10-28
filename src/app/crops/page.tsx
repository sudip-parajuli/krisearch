import { getCrops } from "@/lib/data";
import { CropsClient } from "@/components/CropsClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
export const metadata = { title: "Crop library | Krisearch", description: "Browse crops and agricultural reference information for Nepal in English and Nepali." };
export default async function CropsPage() { const crops = await getCrops(); return <><SupabaseSetupNotice /><CropsClient crops={crops} /></>; }
