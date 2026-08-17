"use client";

import FinalCta from "@/components/landing/public/FinalCta";
import HeroSection from "@/components/landing/public/HeroSection";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";
import SmartImportDemoSection from "@/components/landing/public/SmartImportDemoSection";

import {
  BeforeAfterSection,
  SmartImportBenefitsSection,
  SmartImportProblemSection,
  StartWithOneReceiptSection,
  VaultFeaturesSection,
} from "@/components/landing/public/SmartImportStorySections";

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
  const {
    user,
    loading,
  } = useDemoMode();

  const isSignedIn =
    !loading &&
    Boolean(user);

  return (
    <div className={landingTheme.page}>
      <StructuredData
        data={createOrganizationJsonLd()}
      />

      <LandingHeader
        isSignedIn={isSignedIn}
      />

      <main id="main-content">
        {/* THE HOOK */}

        <HeroSection
          isSignedIn={isSignedIn}
        />

        {/* THE WOW MOMENT */}

        <SmartImportDemoSection />

        {/* THE PAIN */}

        <SmartImportProblemSection />

        {/* WHY SMART IMPORT MATTERS */}

        <SmartImportBenefitsSection />

        {/* SCATTERED -> ORGANIZED */}

        <BeforeAfterSection />

        {/* EASY FIRST ACTION */}

        <StartWithOneReceiptSection
          isSignedIn={isSignedIn}
        />

        {/* BROADER HOME TECH VAULT VALUE */}

        <VaultFeaturesSection />

        {/* CLOSE */}

        <FinalCta
          isSignedIn={isSignedIn}
        />
      </main>

      <LandingFooter />
    </div>
  );
}