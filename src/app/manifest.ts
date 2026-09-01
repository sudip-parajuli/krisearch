import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Krisearch — कृषिSearch",
    short_name: "Krisearch",
    description: "A community-driven agriculture platform for Nepali farmers.",
    start_url: "/feed",
    display: "standalone",
    background_color: "#f1f7f3",
    theme_color: "#2f6e4e",
    lang: "ne",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
