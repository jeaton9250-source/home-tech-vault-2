"use client";

import { useEffect } from "react";

import DigitalBinderSection from "@/components/landing/public/DigitalBinderSection";
import FinalCta from "@/components/landing/public/FinalCta";
import HeroSection from "@/components/landing/public/HeroSection";
import HomeVaultEstimator from "@/components/landing/public/HomeVaultEstimator";
import HowItWorksSection from "@/components/landing/public/HowItWorksSection";
import LandingFaq from "@/components/landing/public/LandingFaq";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";
import { landingTheme } from "@/components/landing/public/landingTheme";
import PricingSection from "@/components/landing/public/PricingSection";
import ProblemSection from "@/components/landing/public/ProblemSection";
import ProductShowcase from "@/components/landing/public/ProductShowcase";
import ScenarioSection from "@/components/landing/public/ScenarioSection";
import SecuritySection from "@/components/landing/public/SecuritySection";
import StructuredData from "@/components/marketing/StructuredData";
import { useDemoMode } from "@/hooks/useDemoMode";
import type { LandingPublicSectionId } from "@/lib/marketing/landingPublicContent";
import { createOrganizationJsonLd } from "@/lib/marketing/metadata";

type LandingPageProps = {
  foundingSummary?: unknown;
};

function scrollToSection(
  sectionId: LandingPublicSectionId
) {
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
        <HeroSection isSignedIn={isSignedIn} />
        <ProblemSection />
        <DigitalBinderSection />
        <HowItWorksSection />
        <HomeVaultEstimator isSignedIn={isSignedIn} />
        <ScenarioSection />
        <ProductShowcase />
        <SecuritySection />
        <PricingSection isSignedIn={isSignedIn} />
        <LandingFaq />
        <FinalCta isSignedIn={isSignedIn} />
      </main>
      <LandingFooter />
    </div>
  );
}
