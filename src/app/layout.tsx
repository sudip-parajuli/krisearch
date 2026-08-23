import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Navbar } from "@/components/Navbar";

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

export const metadata: Metadata = {
  title: "Krisearch — कृषिSearch",
  description: "A community-driven agriculture platform for Nepali farmers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ne"
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <LanguageProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-20 md:pb-6">{children}</main>
          <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400 dark:border-neutral-800">
            Krisearch — कृषि + Search. Built for Nepali farmers.
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
