import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

import AppChrome from "@/components/AppChrome";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const siteTitle = "Home Tech Vault — Organize. Protect. Simplify.";
const siteDescription =
  "The digital home for everything that powers yours. Organize your devices, warranties, receipts, subscriptions, and important documents in one secure place.";

const ogImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Home Tech Vault — The digital home for everything that powers yours",
} as const;

export const metadata: Metadata = {
  metadataBase: new URL("https://hometechvault.com"),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "https://hometechvault.com",
  },
  icons: {
    icon: "/brand/icon.svg",
    apple: "/brand/icon.svg",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://hometechvault.com",
    siteName: "Home Tech Vault",
    type: "website",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage.url],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={GeistSans.className}
    >
      <body className="bg-surface-base text-text-primary antialiased">
        <GoogleAnalytics />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
