import { isDemoPost } from "@/lib/demo-content";
import { publicContentClient } from "@/lib/public-content";
import { absoluteUrl, xmlEscape } from "@/lib/seo";
import { slugify } from "@/lib/slug";
export const dynamic = "force-dynamic";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const client = publicContentClient();
  let entries: { path: string; date?: string }[] = [];
  if (file === "reference.xml") {
    entries = [
      "/",
      "/crops",
      "/feed",
      "/tools",
      "/prices",
      "/weather",
      "/schemes",
      "/vendors",
      "/updates",
      "/about",
    ].map((path) => ({ path }));
    if (client) {
      const results = await Promise.all([
        client.from("crops").select("name_en"),
        client.from("equipment").select("name"),
      ]);
      if (results.some((r) => r.error))
        return new Response("Sitemap temporarily unavailable", { status: 503 });
      entries.push(
        ...(results[0].data ?? []).map((c) => ({
          path: `/crops/${slugify(c.name_en)}`,
        })),
        ...(results[1].data ?? []).map((t) => ({
          path: `/tools/${slugify(t.name)}`,
        })),
      );
    }
  } else {
    const match = /^posts-(\d+)\.xml$/.exec(file);
    if (!match || Number(match[1]) > 100000)
      return new Response("Not found", { status: 404 });
    const start = Number(match[1]) * 1000;
    if (client) {
      const { data, error } = await client
        .from("posts")
        .select("id,title,body,created_at")
        .order("created_at", { ascending: false })
        .order("id")
        .range(start, start + 999);
      if (error)
        return new Response("Sitemap temporarily unavailable", { status: 503 });
      entries = (data ?? [])
        .filter((p) => !isDemoPost(p))
        .map((p) => ({
          path: `/post/${p.id}`,
          date: p.created_at,
        }));
    }
  }
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((e) => `<url><loc>${xmlEscape(absoluteUrl(e.path))}</loc>${e.date ? `<lastmod>${xmlEscape(e.date)}</lastmod>` : ""}</url>`).join("")}</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=300",
      },
    },
  );
}
