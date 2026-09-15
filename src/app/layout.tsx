import type { Metadata } from "next";
import {
  IBM_Plex_Sans_Arabic,
  Cairo,
  Noto_Naskh_Arabic,
} from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

/** UI, navigation, body copy, metadata — the everyday reading face. */
const bodyFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

/**
 * Display, H1/H2 — confident, editorial headlines. Cairo reads contemporary
 * and premium rather than monumental/inscriptional (Kufi-style faces tend
 * to read as formal/governmental in Arabic contexts) — a deliberate choice
 * to move the whole product away from that "official portal" feeling.
 */
const displayFont = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

/** Long-form reading only (episode transcripts) — a traditional Naskh serif. */
const readingFont = Noto_Naskh_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-reading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "ar_AR",
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${bodyFont.variable} ${displayFont.variable} ${readingFont.variable}`}
    >
      <body className="header-glow">{children}</body>
    </html>
  );
}
