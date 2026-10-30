import Link from "next/link";
import { SITE_URL, SITE_NAME, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans_Devanagari,
  Fraunces,
} from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SavedProvider } from "@/components/SavedProvider";
import { FloatingAI } from "@/components/FloatingAI";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
});

// A characterful serif for headings — the single biggest lever against a
// "default SaaS template" feel. Body text stays Geist Sans for readability.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata(
    "Krisearch — नेपालको कृषि जानकारी र किसान समुदाय",
    "बाली जानकारी, स्रोत र मितिसहित बजार मूल्य, मौसम, कृषि औजार र किसानका प्रश्न–उत्तर। Agricultural information and community knowledge for Nepal.",
    "/",
  ),
  title: {
    default: "Krisearch — नेपालको कृषि जानकारी र किसान समुदाय",
    template: "%s | Krisearch",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { types: { "application/rss+xml": `${SITE_URL}/feed.xml` } },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  appleWebApp: { title: "Krisearch", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#2f6e4e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ne"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('krisearch-theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
        <LanguageProvider>
          <ThemeProvider>
            <SavedProvider>
              <a href="#main-content" className="skip-link">
                मुख्य सामग्री / Skip to content
              </a>
              <JsonLd
                data={{
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  name: "Krisearch",
                  alternateName: "कृषिSearch",
                  url: SITE_URL,
                  inLanguage: ["ne", "en"],
                  description:
                    "Agricultural information and community knowledge for Nepal",
                  publisher: {
                    "@type": "Organization",
                    name: SITE_NAME,
                    url: SITE_URL,
                    logo: `${SITE_URL}/icon.svg`,
                  },
                }}
              />
              <Navbar />
              <main
                id="main-content"
                className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-8"
              >
                {children}
              </main>
              <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400 dark:border-neutral-800">
                Krisearch — कृषि + Search. Built for Nepali farmers.
                <div className="mt-3 flex justify-center gap-4">
                  <Link href="/about">हाम्रो बारेमा · About & sources</Link>
                  <Link href="/feed.xml">RSS</Link>
                </div>
              </footer>
              <FeedbackWidget />
              <FloatingAI />
              <ServiceWorkerRegister />
            </SavedProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
