"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import LandingFinalCtaSection from "@/components/landing/LandingFinalCtaSection";
import LandingHeroSection from "@/components/landing/LandingHeroSection";
import LandingMemoriesSection from "@/components/landing/LandingMemoriesSection";
import LandingPricingSection from "@/components/landing/LandingPricingSection";
import LandingRealHomesSection from "@/components/landing/LandingRealHomesSection";
import LandingRoomsSection from "@/components/landing/LandingRoomsSection";
import LandingSmartConnectorSection from "@/components/landing/LandingSmartConnectorSection";
import LandingVaultSection from "@/components/landing/LandingVaultSection";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { useDemoMode } from "@/hooks/useDemoMode";
import type { LandingSectionId } from "@/lib/marketing/landingNav";
import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";

type LandingPageProps = {
  foundingSummary?: PublicFoundingProgramSummary | null;
};

function scrollToLandingSection(
  sectionId: LandingSectionId
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
  foundingSummary = null,
}: LandingPageProps) {
  const {
    user,
    loading,
  } = useDemoMode();

  useEffect(() => {
    const hash = window.location.hash.replace(
      "#",
      ""
    ) as LandingSectionId;

    if (!hash) {
      return;
    }

    window.requestAnimationFrame(() => {
      scrollToLandingSection(hash);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2
            size={22}
            className="animate-spin"
            aria-hidden
          />
          Loading...
        </div>
      </div>
    );
  }

  const isSignedIn = Boolean(user);

  return (
    <MarketingLayout
      mainClassName="overflow-x-hidden"
      foundingSummary={foundingSummary}
      minimalNav
    >
      <LandingHeroSection isSignedIn={isSignedIn} />
      <LandingRealHomesSection />
      <LandingSmartConnectorSection isSignedIn={isSignedIn} />
      <LandingRoomsSection />
      <LandingMemoriesSection />
      <LandingVaultSection />
      <LandingPricingSection isSignedIn={isSignedIn} />
      <LandingFinalCtaSection isSignedIn={isSignedIn} />
    </MarketingLayout>
  );
}
