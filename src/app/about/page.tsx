import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "हाम्रो बारेमा, स्रोत र सम्पादकीय नीति",
  "Krisearch's purpose, source attribution, public community content, AI disclosures and corrections policy.",
  "/about",
);
export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-7 text-sm leading-7">
      <header>
        <p className="text-green-700 dark:text-green-400">
          नेपालको कृषि जानकारी · Agriculture in Nepal
        </p>
        <h1 className="mt-2 text-3xl font-bold">Krisearch · कृषिSearch</h1>
        <p className="mt-3">
          किसानका प्रश्न, अनुभव र स्रोतसहितको कृषि जानकारी एउटै ठाउँमा। A
          platform for agricultural reference information and community
          knowledge in Nepal, built by Sudip Parajuli.
        </p>
      </header>
      <section>
        <h2 className="text-xl font-semibold">
          जानकारी कहाँबाट आउँछ? · Sources
        </h2>
        <p>
          Market records come from{" "}
          <a className="underline" href="https://ampis.gov.np/">
            AMPIS
          </a>{" "}
          and{" "}
          <a className="underline" href="https://kalimatimarket.gov.np/price">
            Kalimati Market
          </a>
          . Price dates describe the original published table, not the time we
          fetched it. Units, varieties and markets differ; these are reference
          records rather than guaranteed local sale prices.
        </p>
        <p>
          Weather is provided by{" "}
          <a className="underline" href="https://open-meteo.com/">
            Open-Meteo
          </a>
          . Public notices link to official agricultural sources. Check the
          original notice for current eligibility and deadlines. Crop and
          equipment references are general information and are not presented as
          independently expert-reviewed.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">
          किसानका अनुभव · Community knowledge
        </h2>
        <p>
          Questions, experiences and comments belong to their individual
          contributors. An author’s identity verification does not verify their
          advice. A “best answer” is selected by the question author and is not
          an expert certification. Post useful observations, location at
          district level, season and outcomes; avoid personal contact details or
          other private information.
        </p>
        <p>
          Public posts and replies are visible without signing in and may appear
          in search engines. Do not publish information you want to keep
          private. Use the report action on a post or comment to flag harmful,
          incorrect or irrelevant content.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">
          AI को प्रयोग · AI transparency
        </h2>
        <p>
          AI responses are labeled separately from human replies. Questions and
          relevant public reference/context are sent to the configured provider,
          currently Google Gemini. On Google’s free API tier, submitted content
          may be used to improve its products. Avoid personal or sensitive
          details. AI may be wrong or outdated; citations identify reference
          material, not a guarantee that every statement is verified.
        </p>
        <p>
          For pesticide use, serious crop disease, animal illness or other
          high-risk decisions, consult a local agricultural professional. AI
          responses must not replace field assessment.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">
          सुधार र प्रतिक्रिया · Corrections
        </h2>
        <p>
          Use the site’s feedback button for missing sources, broken links or
          corrections. Include the page URL, the issue and a reliable supporting
          source. Administrators review reports and imported catalog records.
          Official source updates are collected automatically; manual references
          and community content may need correction.
        </p>
      </section>
      <nav className="flex flex-wrap gap-4 text-green-700 underline dark:text-green-400">
        <Link href="/crops">बाली · Crops</Link>
        <Link href="/feed">समुदाय · Community</Link>
        <Link href="/prices">बजार मूल्य · Prices</Link>
        <Link href="/ask">Ask AI</Link>
      </nav>
    </article>
  );
}
