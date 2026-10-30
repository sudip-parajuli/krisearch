import { isDemoPost } from "@/lib/demo-content";
import { publicContentClient } from "@/lib/public-content";
import { absoluteUrl, xmlEscape } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function GET() {
  const client = publicContentClient();
  const result = client
    ? await client
        .from("posts")
        .select("id,title,body,created_at")
        .order("created_at", { ascending: false })
        .limit(50)
    : null;
  if (result?.error)
    return new Response("Feed temporarily unavailable", { status: 503 });
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Krisearch · कृषिSearch community</title><link>${absoluteUrl("/feed")}</link><description>Public agricultural questions, experiences and discussions from Nepal.</description><language>ne</language>${(
      result?.data ?? []
    )
      .filter((p) => !isDemoPost(p))
      .map(
        (p) =>
          `<item><title>${xmlEscape(p.title)}</title><link>${absoluteUrl(`/post/${p.id}`)}</link><guid isPermaLink="true">${absoluteUrl(`/post/${p.id}`)}</guid><pubDate>${new Date(p.created_at).toUTCString()}</pubDate><description>${xmlEscape(p.body)}</description></item>`,
      )
      .join("")}</channel></rss>`,
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=300",
      },
    },
  );
}
