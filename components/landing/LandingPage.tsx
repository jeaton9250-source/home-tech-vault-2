"use client";

import FinalCta from "@/components/landing/public/FinalCta";
import HeroSection from "@/components/landing/public/HeroSection";
import HomeDocumentsSection from "@/components/landing/public/HomeDocumentsSection";
import HowItWorksSection from "@/components/landing/public/HowItWorksSection";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";
import RealLifeUseCasesSection from "@/components/landing/public/RealLifeUseCasesSection";
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
        {/*
          1. HERO

          Make the product instantly understandable.

          Message:
          "Never lose another receipt, warranty,
          manual, or serial number."

          Keep this personal and household-focused.
          Do not introduce dashboards, AI, reports,
          network intelligence, or advanced features here.
        */}
        <HeroSection isSignedIn={isSignedIn} />

        {/*
          2. THE REAL-LIFE PROBLEM

          Help visitors picture an ordinary moment:

          "Your refrigerator stops working tomorrow."

          Can you find:
          - the receipt?
          - warranty?
          - model number?
          - serial number?
          - manual?

          This section should make the visitor feel
          the problem before we explain the product.
        */}
        <RealLifeUseCasesSection />

        {/*
          3. WHAT HOME TECH VAULT ACTUALLY DOES

          Keep this centered on the clearest value:

          Devices
          Receipts
          Warranties
          Manuals
          Serial numbers
          Purchase information

          Think "digital home filing cabinet",
          not "SaaS document management".
        */}
        <HomeDocumentsSection />

        {/*
          4. HOW EASY IT IS

          Three steps only:

          1. Add one device
          2. Save the important stuff
          3. Find it when you need it

          Reinforce that visitors do NOT need to
          inventory their entire house today.
        */}
        <HowItWorksSection />

        {/*
          5. FINAL CTA

          End before the homepage becomes a product tour.

          Message:
          "Start with the device you'd hate
          to replace tomorrow."

          Free to start.
          No credit card.
        */}
        <FinalCta isSignedIn={isSignedIn} />
      </main>

      <LandingFooter />
    </div>
  );
}