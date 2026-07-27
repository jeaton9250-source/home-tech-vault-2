"use client";

import { useEffect } from "react";

import FinalCta from "@/components/landing/public/FinalCta";
import HeroSection from "@/components/landing/public/HeroSection";
import HomeAdvisorStorySection from "@/components/landing/public/HomeAdvisorStorySection";
import HomeDiscoverySection from "@/components/landing/public/HomeDiscoverySection";
import HomeDocumentsSection from "@/components/landing/public/HomeDocumentsSection";
import HomeFamilySection from "@/components/landing/public/HomeFamilySection";
import HomeHealthPreviewSection from "@/components/landing/public/HomeHealthPreviewSection";
import HomeSearchSection from "@/components/landing/public/HomeSearchSection";
import LandingFaq from "@/components/landing/public/LandingFaq";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";
import { landingTheme } from "@/components/landing/public/landingTheme";
import PricingSection from "@/components/landing/public/PricingSection";
import ProblemSection from "@/components/landing/public/ProblemSection";
import SecuritySection from "@/components/landing/public/SecuritySection";
import StructuredData from "@/components/marketing/StructuredData";
import { useDemoMode } from "@/hooks/useDemoMode";
import type { LandingPublicSectionId } from "@/lib/marketing/landingPublicContent";
import { createOrganizationJsonLd } from "@/lib/marketing/metadata";

type LandingPageProps = {
  foundingSummary?: unknown;
};

function scrollToSection(sectionId: LandingPublicSectionId) {
  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function LandingPage({
  foundingSummary: _foundingSummary = null,
}: LandingPageProps) {
  const { user, loading } = useDemoMode();

  useEffect(() => {
    const hash = window.location.hash.replace(
      "#",
      ""
    ) as LandingPublicSectionId;

    if (!hash) {
      return;
    }

    window.requestAnimationFrame(() => {
      scrollToSection(hash);
    });
  }, []);

  // Render marketing content immediately for SEO/CWV.
  // Auth state only swaps header/CTA labels once known.
  const isSignedIn = !loading && Boolean(user);

  return (
    <div className={landingTheme.page}>
      <StructuredData data={createOrganizationJsonLd()} />
      <LandingHeader isSignedIn={isSignedIn} />
      <main id="main-content">
        {/* Section 1: Hero */}
        <HeroSection isSignedIn={isSignedIn} />

        {/* Section 2: The Problem */}
        <ProblemSection />

        {/* Section 3: Meet Home Pulse */}
        <HomeHealthPreviewSection />

        {/* Section 4: Home Advisor */}
        <HomeAdvisorStorySection />

        {/* Section 5: Search Your Home */}
        <HomeSearchSection />

        {/* Section 6: Discovery */}
        <HomeDiscoverySection />

        {/* Section 7: Protection */}
        <HomeDocumentsSection />

        {/* Additional Supporting Sections */}
        <HomeFamilySection />
        <SecuritySection />
        <PricingSection isSignedIn={isSignedIn} />
        <LandingFaq />

        {/* Section 8: Final CTA */}
        <FinalCta isSignedIn={isSignedIn} />
      </main>
      <LandingFooter />
    </div>
  );
}
