"use client";

import FinalCta from "@/components/landing/public/FinalCta";
import HeroSection from "@/components/landing/public/HeroSection";
import HomeDocumentsSection from "@/components/landing/public/HomeDocumentsSection";
import HomeFamilySection from "@/components/landing/public/HomeFamilySection";
import HomeHealthPreviewSection from "@/components/landing/public/HomeHealthPreviewSection";
import HowItWorksSection from "@/components/landing/public/HowItWorksSection";
import LandingFaq from "@/components/landing/public/LandingFaq";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";
import { landingTheme } from "@/components/landing/public/landingTheme";
import PricingSection from "@/components/landing/public/PricingSection";
import RealLifeUseCasesSection from "@/components/landing/public/RealLifeUseCasesSection";
import SecuritySection from "@/components/landing/public/SecuritySection";
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
        {/* 
          1. HERO
          
          Primary goal:
          Immediately explain the problem Home Tech Vault solves.

          Recommended headline:
          "Never Lose Another Receipt, Warranty, Manual, or Serial Number."

          Primary CTA:
          "Create My Free Vault"
        */}
        <HeroSection isSignedIn={isSignedIn} />

        {/*
          2. REAL-LIFE PROBLEMS

          Show why someone would actually need Home Tech Vault
          before explaining all of the features.

          Examples:
          - TV breaks
          - Appliance needs service
          - Need a serial number
          - Can't find receipt
          - Warranty claim
        */}
        <RealLifeUseCasesSection />

        {/*
          3. HOW EASY IT IS

          Reinforce:
          Start with ONE device.
          Don't make users feel like they have to inventory
          their entire house immediately.
        */}
        <HowItWorksSection />

        {/*
          4. DOCUMENTS + RECEIPTS + WARRANTIES

          This should become one of the strongest sections
          because this is the clearest everyday value proposition.
        */}
        <HomeDocumentsSection />

        {/*
          5. ADVANCED HOME TECH FEATURES

          Home health / network / discovery features should
          appear after visitors already understand the core product.
        */}
        <HomeHealthPreviewSection />

        {/*
          6. HOUSEHOLD SHARING
        */}
        <HomeFamilySection />

        {/*
          7. SECURITY / TRUST

          Important because users may upload receipts,
          serial numbers and household information.
        */}
        <SecuritySection />

        {/*
          8. PRICING

          Free plan should be visually dominant.

          Recommended:
          FREE
          $0
          No credit card required

          8 devices
          25 documents
          Warranty tracking
          Receipt storage
          Device information
        */}
        <PricingSection isSignedIn={isSignedIn} />

        {/*
          9. FAQ

          Handle objections after they already understand
          the product.
        */}
        <LandingFaq />

        {/*
          10. FINAL CTA

          Recommended headline:
          "Don't Wait Until Something Breaks."

          CTA:
          "Create Your Free Home Tech Vault"
        */}
        <FinalCta isSignedIn={isSignedIn} />
      </main>

      <LandingFooter />
    </div>
  );
}