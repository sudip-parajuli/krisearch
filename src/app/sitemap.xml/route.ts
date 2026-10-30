import { publicContentClient } from "@/lib/public-content";
import { absoluteUrl, xmlEscape } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function GET() {
  const client = publicContentClient();
  const result = client
    ? await client.from("posts").select("id", { count: "exact", head: true })
    : null;
  if (result?.error)
    return new Response("Sitemap temporarily unavailable", { status: 503 });
  const pages = Math.max(1, Math.ceil((result?.count ?? 0) / 1000));
  const paths = [
    "/sitemaps/reference.xml",
    ...Array.from({ length: pages }, (_, i) => `/sitemaps/posts-${i}.xml`),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<sitemap><loc>${xmlEscape(absoluteUrl(path))}</loc></sitemap>`).join("")}</sitemapindex>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=300",
      },
    },
  );
}
