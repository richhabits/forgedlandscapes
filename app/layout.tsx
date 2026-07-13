import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site-config";
import { localBusinessJsonLd, JsonLd } from "@/lib/jsonld";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Landscaping in Watford & Hertfordshire`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "landscaping Watford",
    "landscaper Hertfordshire",
    "porcelain patio Watford",
    "resin driveway St Albans",
    "garden design Hertfordshire",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: site.name,
    title: `${site.name} — Design & Build Landscaping, Watford`,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#10140f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className="antialiased">
        <JsonLd data={localBusinessJsonLd()} />
        {children}
      </body>
    </html>
  );
}
