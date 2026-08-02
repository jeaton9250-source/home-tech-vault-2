import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

import ConditionalAppChrome from "@/components/ConditionalAppChrome";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { rootSiteMetadata } from "@/lib/marketing/socialMetadata";

import HeyCatchIdentity from "@/components/analytics/HeyCatchIdentity";
export const metadata: Metadata = rootSiteMetadata;

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
        <HeyCatchIdentity />
        <GoogleAnalytics />
        <ConditionalAppChrome>{children}</ConditionalAppChrome>
        <Analytics />
      </body>
    </html>
  );
}
