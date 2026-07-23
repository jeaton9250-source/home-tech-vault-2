import { ArrowRight, Compass } from "lucide-react";

import LandingHomePulsePreview from "@/components/landing/LandingHomePulsePreview";
import LandingScrollReveal from "@/components/landing/LandingScrollReveal";
import Button from "@/components/ui/Button";
import {
  LANDING_SUPPORTING_MESSAGE,
  LANDING_TAGLINE,
} from "@/lib/marketing/landingContent";
import {
  landingMotionRise,
  landingSectionClass,
  marketingSecondaryButtonClass,
} from "@/lib/marketing/landingStyles";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

type LandingHeroSectionProps = {
  isSignedIn: boolean;
};

export default function LandingHeroSection({
  isSignedIn,
}: LandingHeroSectionProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;
  const primaryLabel = isSignedIn
    ? "Go to Your Vault"
    : "Start Free";

  return (
    <section
      className={cn(
        "px-8 lg:px-10",
        landingSectionClass,
        "pb-12 pt-10 md:pb-16 md:pt-14"
      )}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <LandingScrollReveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-border-subtle/80 bg-surface-sunken/70 px-3 py-1.5 text-overline text-section-network">
            <Compass size={14} aria-hidden />
            {LANDING_TAGLINE}
          </p>

          <h1 className="mt-6 max-w-xl text-4xl font-medium tracking-[-0.04em] text-text-primary md:text-[3.35rem] md:leading-[1.03]">
            Everything your home remembers.
          </h1>

          <p className="mt-5 max-w-lg text-[0.9375rem] leading-7 text-text-muted">
            Your home is filled with technology that helps your family
            every day. Home Tech Vault keeps track of your devices,
            warranties, receipts, maintenance, and network so you
            don&apos;t have to.
          </p>

          <p className="mt-4 max-w-lg text-sm leading-6 text-text-secondary">
            {LANDING_SUPPORTING_MESSAGE}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={primaryHref} size="lg">
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
                Explore Demo
              </Button>
            ) : null}
          </div>
        </LandingScrollReveal>

        <div className={cn(landingMotionRise, "htv-landing-delay-1")}>
          <LandingHomePulsePreview />
        </div>
      </div>
    </section>
  );
}
