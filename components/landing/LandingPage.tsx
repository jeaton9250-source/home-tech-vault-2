"use client";

import { useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import LandingHeroSection, {
  LandingHowItWorksSection,
} from "@/components/landing/LandingHeroSection";
import LandingMonitoringSection from "@/components/landing/LandingMonitoringSection";
import LandingPricingSection from "@/components/landing/LandingPricingSection";
import LandingSmartConnectorSection from "@/components/landing/LandingSmartConnectorSection";
import LandingVaultSection from "@/components/landing/LandingVaultSection";
import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import { useDemoMode } from "@/hooks/useDemoMode";
import type { LandingSectionId } from "@/lib/marketing/landingNav";
import {
  landingMotionRise,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";
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
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;
  const finalCtaLabel = isSignedIn
    ? "Go to Your Vault"
    : "Start Free";

  return (
    <MarketingLayout
      mainClassName="overflow-x-hidden"
      foundingSummary={foundingSummary}
      minimalNav
    >
      <LandingHeroSection isSignedIn={isSignedIn} />
      <LandingSmartConnectorSection />
      <LandingHowItWorksSection />
      <LandingMonitoringSection />
      <LandingVaultSection />
      <LandingPricingSection isSignedIn={isSignedIn} />

      <MarketingContent
        className={cn(landingSectionClass, "pb-14 md:pb-16")}
      >
        <PageCard
          elevated={false}
          className={cn(
            landingMotionRise,
            "mx-auto max-w-3xl border-border-subtle px-8 py-14 text-center md:px-16 md:py-16"
          )}
        >
          <p className="text-overline text-section-network">
            Home Tech Vault
          </p>
          <h2 className="mt-4 text-2xl font-medium tracking-[-0.03em] text-text-primary md:text-[2rem] md:leading-tight">
            Your home already has a memory.
            <span className="block text-text-secondary">
              Now your technology does too.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-text-muted">
            Because your home deserves a memory. Start organizing today.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={primaryHref} size="lg">
              {finalCtaLabel}
              <ArrowRight size={16} aria-hidden />
            </Button>
            {!isSignedIn ? (
              <Button
                href={MARKETING_ROUTES.demo}
                variant="secondary"
                size="lg"
              >
                Watch Demo
              </Button>
            ) : null}
          </div>
        </PageCard>
      </MarketingContent>
    </MarketingLayout>
  );
}
