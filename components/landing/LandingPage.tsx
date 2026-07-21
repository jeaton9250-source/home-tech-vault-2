"use client";

import {
  ArrowRight,
  Loader2,
  Play,
} from "lucide-react";

import LandingBenefitsSection from "@/components/landing/LandingBenefitsSection";
import LandingProductPreview from "@/components/landing/LandingProductPreview";
import LandingTrustSection from "@/components/landing/LandingTrustSection";
import { HeroAppPreview } from "@/components/landing/LandingPreviews";
import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import { useDemoMode } from "@/hooks/useDemoMode";
import {
  landingMotionRise,
  landingSectionClass,
  marketingPrimaryButtonClass,
  marketingSecondaryButtonClass,
} from "@/lib/marketing/landingStyles";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";
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
    : "Create Your Free Vault";

  return (
    <MarketingLayout
      mainClassName="overflow-x-hidden"
      foundingSummary={foundingSummary}
      minimalNav
    >
      {/* Hero */}
      <section
        className={cn(
          "px-8 lg:px-10",
          landingSectionClass,
          "pt-12 md:pt-16"
        )}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_1fr] lg:gap-16">
          <div className={landingMotionRise}>
            <p className="text-overline text-interaction">
              Home Tech Vault
            </p>

            <h1 className="mt-5 max-w-xl text-4xl font-medium tracking-[-0.04em] text-text-primary md:text-[3.25rem] md:leading-[1.04]">
              The digital home for everything
              that powers yours.
            </h1>

            <p className="mt-5 max-w-md text-[0.9375rem] leading-7 text-text-muted">
              Organize your devices, warranties, receipts,
              subscriptions, and important documents in one
              secure place.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                href={primaryHref}
                size="lg"
                className={marketingPrimaryButtonClass}
              >
                {primaryLabel}
                <ArrowRight size={16} aria-hidden />
              </Button>

              {!isSignedIn ? (
                <Button
                  href={MARKETING_ROUTES.demo}
                  variant="secondary"
                  size="lg"
                  className={marketingSecondaryButtonClass}
                >
                  <Play size={16} aria-hidden />
                  Explore the Demo
                </Button>
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "mx-auto w-full max-w-xl lg:max-w-none",
              landingMotionRise,
              "htv-landing-delay-1"
            )}
          >
            <HeroAppPreview />
          </div>
        </div>
      </section>

      <LandingBenefitsSection />
      <LandingProductPreview />
      <LandingTrustSection />

      {/* Final CTA */}
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
          <h2 className="text-2xl font-medium tracking-[-0.03em] text-text-primary md:text-[2rem] md:leading-tight">
            Ready to build your Home Tech Vault?
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-text-muted">
            Create your free vault and keep everything
            important in one place.
          </p>

          <Button
            href={primaryHref}
            size="lg"
            className={cn(
              "mt-9",
              marketingPrimaryButtonClass
            )}
          >
            {finalCtaLabel}
            <ArrowRight size={16} aria-hidden />
          </Button>
        </PageCard>
      </MarketingContent>
    </MarketingLayout>
  );
}
