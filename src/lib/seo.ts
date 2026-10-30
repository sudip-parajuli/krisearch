import type { Metadata } from "next";
export const SITE_URL = "https://krisearch.vercel.app";
export const SITE_NAME = "Krisearch · कृषिSearch";
export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
export function excerpt(text: string, length = 160) {
  return text.replace(/\s+/g, " ").trim().slice(0, length);
}
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description: excerpt(description),
    alternates: {
      canonical: absoluteUrl(path),
      types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description: excerpt(description),
      url: absoluteUrl(path),
      locale: "ne_NP",
      alternateLocale: ["en_US"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt(description),
    },
  };
}
export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
export function xmlEscape(value: string) {
  return value.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
}
