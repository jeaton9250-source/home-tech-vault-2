import type { Metadata } from "next";

import PublicMarketingShell from "@/components/landing/public/PublicMarketingShell";
import LandingFaq from "@/components/landing/public/LandingFaq";
import PricingSection from "@/components/landing/public/PricingSection";

export const metadata: Metadata = {
  title: "Home Tech Vault Pricing | Free, Pro & Family Plans",
  description:
    "Compare Home Tech Vault plans. Start free, upgrade to Pro for $7.99 per month, or choose Family for $14.99 per month.",
  alternates: {
    canonical: "https://www.hometechvault.com/pricing",
  },
};

export default function PricingPage() {
  return (
    <PublicMarketingShell>
      <PricingSection />
      <LandingFaq />
    </PublicMarketingShell>
  );
}
