"use client";

import {
  ArrowRight,
  Laptop,
  Loader2,
  Play,
} from "lucide-react";

import LandingBenefitsSection from "@/components/landing/LandingBenefitsSection";
import LandingProductPreview from "@/components/landing/LandingProductPreview";
import LandingTrustSection from "@/components/landing/LandingTrustSection";
import {
  CommandCenterPreview,
  PillarPreview,
} from "@/components/landing/LandingPreviews";
import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import { useDemoMode } from "@/hooks/useDemoMode";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { sections } from "@/lib/design-system/tokens";
import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";

type LandingPageProps = {
  foundingSummary?: PublicFoundingProgramSummary | null;
};

export default function LandingPage({
  foundingSummary = null,
}: LandingPageProps) {
  const {
    user,
    loading,
  } = useDemoMode();

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
  const primaryLabel = isSignedIn
    ? "Go to Your Vault"
    : "Create Your Free Vault";
  const finalCtaLabel = isSignedIn
    ? "Go to Your Vault"
    : "Create My Vault";

  return (
    <MarketingLayout
      mainClassName="overflow-x-hidden"
      foundingSummary={foundingSummary}
      minimalNav
    >
      {/* Hero */}
      <section className="px-6 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <p className="text-overline text-interaction">
              Home Tech Vault
            </p>

            <h1 className="mt-4 max-w-xl text-4xl font-medium tracking-[-0.04em] text-text-primary md:text-5xl md:leading-[1.05]">
              The digital home for everything
              that powers yours.
            </h1>

            <p className="mt-4 max-w-lg text-base leading-7 text-text-muted">
              Organize your devices, warranties, receipts,
              subscriptions, and important documents in one
              secure place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                href={primaryHref}
                size="lg"
              >
                {primaryLabel}
                <ArrowRight size={16} aria-hidden />
              </Button>

              {!isSignedIn ? (
                <Button
                  href={MARKETING_ROUTES.demo}
                  variant="secondary"
                  size="lg"
                >
                  <Play size={16} aria-hidden />
                  Explore the Demo
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl lg:max-w-none">
            <PillarPreview
              icon={Laptop}
              accent={sections.technology.accent}
              soft={sections.technology.soft}
            >
              <CommandCenterPreview />
            </PillarPreview>
          </div>
        </div>
      </section>

      <LandingBenefitsSection />
      <LandingProductPreview />
      <LandingTrustSection />

      {/* Final CTA */}
      <MarketingContent className="py-10 md:py-14">
        <PageCard
          elevated
          className="mx-auto max-w-3xl border-interaction/15 bg-gradient-to-br from-interaction to-interaction-hover px-8 py-10 text-center text-surface-card md:px-12 md:py-12"
        >
          <h2 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">
            Ready to organize your home technology?
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-surface-card/80">
            Create your free vault and keep everything
            important in one place.
          </p>

          <Button
            href={primaryHref}
            variant="secondary"
            size="lg"
            className="mt-6 border-transparent bg-surface-card text-interaction hover:bg-surface-card/95"
          >
            {finalCtaLabel}
            <ArrowRight size={16} aria-hidden />
          </Button>
        </PageCard>
      </MarketingContent>
    </MarketingLayout>
  );
}
