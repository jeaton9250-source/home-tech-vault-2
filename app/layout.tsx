import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

import AppChrome from "@/components/AppChrome";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

import { brand } from "@/lib/design-system/tokens";

export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
  icons: {
    icon: "/brand/icon.svg",
    apple: "/brand/icon.svg",
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
