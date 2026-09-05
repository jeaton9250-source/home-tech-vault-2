import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Cormorant_Garamond } from "next/font/google";

import "./globals.css";

import ConditionalAppChrome from "@/components/ConditionalAppChrome";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import RealtorClientVaultBanner from "@/components/realtor/RealtorClientVaultBanner";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import InternalAwareVercelAnalytics from "@/components/analytics/InternalAwareVercelAnalytics";
import { rootSiteMetadata } from "@/lib/marketing/socialMetadata";
import HeyCatchIdentity from "@/components/analytics/HeyCatchIdentity";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = rootSiteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.className} ${cormorant.variable}`}
    >
      <body className="bg-surface-base text-text-primary antialiased">
        <HeyCatchIdentity />
        <GoogleAnalytics />
        <ImpersonationBanner />
        <RealtorClientVaultBanner />

        <ConditionalAppChrome>
          {children}
        </ConditionalAppChrome>

        <InternalAwareVercelAnalytics />
      </body>
    </html>
  );
}
