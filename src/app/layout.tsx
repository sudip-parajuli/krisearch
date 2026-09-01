import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari, Fraunces } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

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
  title: "Krisearch — कृषिSearch",
  description: "A community-driven agriculture platform for Nepali farmers.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
        <LanguageProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-20 md:pb-6">{children}</main>
          <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400 dark:border-neutral-800">
            Krisearch — कृषि + Search. Built for Nepali farmers.
          </footer>
          <FeedbackWidget />
          <ServiceWorkerRegister />
        </LanguageProvider>
      </body>
    </html>
  );
}
