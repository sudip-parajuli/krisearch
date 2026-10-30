# Search and AI discovery

## Implemented

- Canonical URLs and unique Nepali/English descriptions for public collections and crop/tool/post details.
- Crawlable post bodies, community replies and published AI replies in the initial HTML. JSON-LD mirrors visible content. Human top-level answers use QAPage on question posts; other posts use DiscussionForumPosting. AI replies are labeled and are never misrepresented as accepted human answers.
- `/robots.txt`, `/sitemap.xml` index, reference sitemap and paginated 1,000-post sitemaps. Reads use the anonymous Supabase role so indexing cannot expose administrator-only data. Sitemap failures return 503 instead of a cached empty success. Posts include their actual creation timestamp; no fabricated fresh modification dates.
- `/feed.xml` RSS with the latest 50 public posts and links to full discussions.
- Open Graph/Twitter sharing metadata and a branded share image.
- Noindex utility, account/profile, submission, internal-search and saved pages. Robots rules are discovery controls, not access protection; RLS and authentication still protect data.
- `/about` explains authorship, sources, community knowledge, reporting/corrections and AI limitations. Posting notices explain public search visibility.

The language toggle is a browser preference on one bilingual URL. No fake `hreflang` URLs are declared. Separate, complete `/ne/` and `/en/` versions would be a future localization project if editorial capacity supports both.

## Owner setup

1. Add `https://krisearch.vercel.app/` as a URL-prefix property in Google Search Console. Use its HTML meta-tag token as Vercel `GOOGLE_SITE_VERIFICATION`, redeploy, then verify. Do not paste credentials. Submit `https://krisearch.vercel.app/sitemap.xml`.
2. Set up Bing Webmaster Tools (or import the verified Search Console property) and submit the same sitemap. Use URL inspection on a crop, question and answered discussion.
3. Monitor indexed pages, crawl errors, search queries and engagement. Indexing and rich results are not guaranteed; give crawlers time and fix actual reported errors rather than repeatedly submitting.
4. Publish original Nepali crop/season/district guides, attach reliable official sources and real update dates, and involve agricultural professionals in high-risk advice. Encourage farmers to document observations and outcomes. Do not generate large volumes of near-duplicate location pages or AI filler.
5. Add original screenshots/photos with contributor permission and descriptive alternative text, and earn relevant references through agricultural communities and institutions. Technical metadata alone does not establish authority.

## Gemini operations

Production uses `gemini-2.5-flash-lite`, listed with free-tier text input/output on Google's pricing page when configured (2026-10-30). Eligibility and quota depend on the AI Studio project. The application cannot force free-tier billing: keep billing disabled for free-only use and inspect project quota in AI Studio. No paid model fallback, paid search grounding or billing changes are enabled by this setup. Existing database request budgets still apply.

Public question text and relevant public reference context reach Google when AI is used. Google's free tier can use submitted content to improve products; the interface and About page explain this. Responses use JSON mode and server-allowed citations. Existing photo analysis still requires OpenRouter vision configuration.

## Limits

Sitemaps and structured data improve discovery and interpretation, not ranking guarantees. Google says the same SEO fundamentals apply to AI features; a special GEO file or AI keyword stuffing is not required. Personal `/ask` interactions are not saved as new searchable pages; actual public feed posts and their completed replies are discoverable.
