"use client";

import HeroSection from "@/components/landing/public/HeroSection";
import FinalCta from "@/components/landing/public/FinalCta";
import ManualDiscoverySection from "@/components/landing/public/ManualDiscoverySection";
import HomeTechHealthCheckSection from "@/components/landing/public/HomeTechHealthCheckSection";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";

import VaultStorySections from "@/components/landing/public/VaultStorySections";

import { landingTheme } from "@/components/landing/public/landingTheme";
import StructuredData from "@/components/marketing/StructuredData";
import { useDemoMode } from "@/hooks/useDemoMode";
import { createOrganizationJsonLd } from "@/lib/marketing/metadata";

type LandingPageProps = {
  foundingSummary?: unknown;
};

export default function LandingPage({
  foundingSummary: _foundingSummary = null,
}: LandingPageProps) {
  const { user, loading } = useDemoMode();

  const isSignedIn = !loading && Boolean(user);

  return (
    <div className={landingTheme.page}>
      <StructuredData data={createOrganizationJsonLd()} />

      <LandingHeader isSignedIn={isSignedIn} />

      <main id="main-content">
        {/* 1. CLEAR VALUE PROPOSITION */}
        <HeroSection isSignedIn={isSignedIn} />

        {/* 2. SHOW THE WHOLE PRODUCT */}
        <VaultStorySections />

        {/* 3. SOLVE A REAL HOMEOWNER PAIN POINT */}
        

        {/* 4. LONG-TERM HOME OWNERSHIP VALUE */}
        

        {/* 5. WOW FEATURE / EASIER SETUP */}
        <ManualDiscoverySection isSignedIn={isSignedIn} />

        {/* 6. CONNECTED HOME INTELLIGENCE */}
        

        {/* 7. HOUSEHOLD ACCESS */}
        

        {/* 8. FREE ACQUISITION / VALUE TOOL */}
        <HomeTechHealthCheckSection />


        {/* 9. DIFFERENTIATION */}
        

        {/* 10. FINAL CONVERSION CTA */}
        <FinalCta isSignedIn={isSignedIn} />
        
      </main>

      <LandingFooter />
    </div>
  );
}
