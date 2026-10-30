import { pageMetadata } from "@/lib/seo";
import { getCrops } from "@/lib/data";
import { CropsClient } from "@/components/CropsClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function CropsPage() { const crops = await getCrops(); return <><SupabaseSetupNotice /><CropsClient crops={crops} /></>; }

export const metadata = pageMetadata("बाली जानकारी · Crop library", "नेपालका बाली, खेतीको सामान्य जानकारी र किसानका अनुभव। Browse crop references and community discussions for Nepal.", "/crops");
