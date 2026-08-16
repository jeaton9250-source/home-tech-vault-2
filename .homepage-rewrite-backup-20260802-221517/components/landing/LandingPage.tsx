"use client";

import { useEffect } from "react";

import CustomerStorySection from "@/components/landing/public/CustomerStorySection";
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
import SocialProofSection from "@/components/landing/public/SocialProofSection";
import StructuredData from "@/components/marketing/StructuredData";
import { useDemoMode } from "@/hooks/useDemoMode";
import type { LandingPublicSectionId } from "@/lib/marketing/landingPublicContent";
import { createOrganizationJsonLd } from "@/lib/marketing/metadata";

type LandingPageProps = {
  foundingSummary?: unknown;
};

function scrollToSection(sectionId: LandingPublicSectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

const organizationSameAs = [
  process.env.NEXT_PUBLIC_HOME_TECH_VAULT_LINKEDIN_URL,
  process.env.NEXT_PUBLIC_HOME_TECH_VAULT_X_URL,
].filter((value): value is string => Boolean(value));

export default function LandingPage({
  foundingSummary = null,
}: LandingPageProps) {
  const { user, loading } = useDemoMode();

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as LandingPublicSectionId;
    if (!hash) return;
    window.requestAnimationFrame(() => scrollToSection(hash));
  }, []);

  const isSignedIn = !loading && Boolean(user);
  const organizationJsonLd = {
    ...createOrganizationJsonLd(),
    ...(organizationSameAs.length > 0 ? { sameAs: organizationSameAs } : {}),
  };

  return (
    <div className={landingTheme.page}>
      <StructuredData data={organizationJsonLd} />
      <LandingHeader isSignedIn={isSignedIn} />
      <main id="main-content">
        <HeroSection isSignedIn={isSignedIn} />
        <ProblemSection />
        <HomeHealthPreviewSection />
        <HomeAdvisorStorySection />
        <HomeSearchSection />
        <HomeDiscoverySection />
        <HomeDocumentsSection />
        <HomeFamilySection />
        <SocialProofSection foundingSummary={foundingSummary} />
        <CustomerStorySection />
        <SecuritySection />
        <PricingSection isSignedIn={isSignedIn} />
        <LandingFaq />
        <FinalCta isSignedIn={isSignedIn} />
      </main>
      <LandingFooter />
    </div>
  );
}
