"use client";

import HeroSection from "@/components/landing/public/HeroSection";
import HomeTechHealthCheckSection from "@/components/landing/public/HomeTechHealthCheckSection";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";
import SmartScanDemoSection from "@/components/landing/public/SmartScanDemoSection";
import TrustSection from "@/components/landing/public/TrustSection";

import {
  DeviceRecordsSection,
  DocumentsWarrantySection,
  FamilySection,
  MaintenanceSection,
  NetworkSection,
  VaultOverviewSection,
  WholeVaultFinalSection,
  WhyVaultSection,
} from "@/components/landing/public/VaultStorySections";

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
        {/* WHOLE PRODUCT */}

        <HeroSection
          isSignedIn={isSignedIn}
        />

        {/* FREE ACQUISITION TOOL */}

        <HomeTechHealthCheckSection />

        {/* WHAT THE VAULT HOLDS */}

        <VaultOverviewSection />

        {/* MAJOR DIFFERENTIATOR */}

        <SmartScanDemoSection />

        {/* CORE DEVICE INVENTORY */}

        <DeviceRecordsSection />

        {/* DOCUMENTS + WARRANTIES */}

        <DocumentsWarrantySection />

        {/* NETWORK INTELLIGENCE */}

        <NetworkSection />

        {/* LONG-TERM OWNERSHIP */}

        <MaintenanceSection />

        {/* HOUSEHOLD */}

        <FamilySection />

        {/* PRIVACY + TRUST */}

        <TrustSection />

        {/* DIFFERENTIATION */}

        <WhyVaultSection />

        {/* FINAL CTA */}

        <WholeVaultFinalSection
          isSignedIn={isSignedIn}
        />
      </main>

      <LandingFooter />
    </div>
  );
}