import { pageMetadata } from "@/lib/seo";
import { AskAI } from "@/components/AskAI";

export default function AskPage() { return <div className="mx-auto max-w-2xl"><h1 className="mb-5 text-2xl font-semibold">कृषि सहायक · Ask Krisearch AI</h1><AskAI /></div>; }

export const metadata = pageMetadata("कृषि AI लाई सोध्नुहोस् · Ask AI", "नेपाली वा अङ्ग्रेजीमा कृषि प्रश्न सोध्नुहोस्। Clearly labeled AI assistance with available reference sources.", "/ask");
