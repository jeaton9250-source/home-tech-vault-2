import type { Metadata } from "next";

import LandingPage from "@/components/landing/LandingPage";
import StructuredData from "@/components/marketing/StructuredData";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadPublicFoundingProgramSummary } from "@/lib/founding-members/loaders";
import { createSoftwareApplicationJsonLd } from "@/lib/marketing/metadata";
import {
  SOCIAL_OG_IMAGE,
  SOCIAL_SITE_URL,
  socialTwitter,
} from "@/lib/marketing/socialMetadata";

const title =
  "Home Tech Vault | Home Inventory & Warranty Tracker That Discovers Your Devices";
const description =
  "Automatically discover the technology connected to your home, then keep devices, receipts, manuals, documents, and warranties organized in one secure vault.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: SOCIAL_SITE_URL,
  },
  keywords: [
    "home inventory",
    "home inventory app",
    "warranty tracker",
    "device inventory",
    "home technology organizer",
    "home network discovery",
    "receipt and manual organizer",
    "home tech vault",
  ],
  openGraph: {
    title,
    description,
    url: SOCIAL_SITE_URL,
    siteName: "Home Tech Vault",
    locale: "en_US",
    type: "website",
    images: [SOCIAL_OG_IMAGE],
  },
  twitter: {
    ...socialTwitter,
    title,
    description,
    images: [SOCIAL_OG_IMAGE.url],
  },
};

export default async function HomePage() {
  let foundingSummary = null;

  try {
    const admin = createAdminClient();
    foundingSummary = await loadPublicFoundingProgramSummary(admin);
  } catch {
    foundingSummary = null;
  }

  return (
    <>
      <StructuredData data={createSoftwareApplicationJsonLd()} />
      <LandingPage foundingSummary={foundingSummary} />
    </>
  );
}
