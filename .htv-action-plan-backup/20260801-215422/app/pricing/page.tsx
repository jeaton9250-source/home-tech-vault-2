import type { Metadata } from "next";

import LandingFaq from "@/components/landing/public/LandingFaq";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";
import PricingSection from "@/components/landing/public/PricingSection";

export const metadata: Metadata = {
  title: "Home Tech Vault Pricing | Free, Pro, and Family Plans",
  description:
    "Compare Home Tech Vault Free, Pro, and Family plans. Choose monthly billing or save about 17% with annual billing.",
  alternates: { canonical: "https://hometechvault.com/pricing" },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      <LandingHeader />
      <main>
        <PricingSection />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  );
}
