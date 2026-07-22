import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

import AppChrome from "@/components/AppChrome";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/next";

const siteDescription =
  "Stop searching through drawers and emails. Organize your home devices, warranties, documents, subscriptions, maintenance, Wi-Fi information, and receipts in one secure place.";

export const metadata: Metadata = {
  metadataBase: new URL("https://hometechvault.com"),
  title: "Home Tech Vault",
  description: siteDescription,
  icons: {
    icon: "/brand/icon.svg",
    apple: "/brand/icon.svg",
  },
  openGraph: {
    title: "Home Tech Vault",
    description: siteDescription,
    url: "https://hometechvault.com",
    siteName: "Home Tech Vault",
    type: "website",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Home Tech Vault Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Tech Vault",
    description:
      "Organize your entire home's technology in one secure place.",
    images: ["/social-preview.png"],
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
        <Analytics />
      </body>
    </html>
  );
}
