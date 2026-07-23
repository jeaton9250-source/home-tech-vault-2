import { ArrowRight } from "lucide-react";

import LandingScrollReveal from "@/components/landing/LandingScrollReveal";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import { LANDING_SUPPORTING_MESSAGE } from "@/lib/marketing/landingContent";
import {
  landingSectionClass,
  marketingSecondaryButtonClass,
} from "@/lib/marketing/landingStyles";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

type LandingFinalCtaSectionProps = {
  isSignedIn: boolean;
};

export default function LandingFinalCtaSection({
  isSignedIn,
}: LandingFinalCtaSectionProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;
  const primaryLabel = isSignedIn
    ? "Go to Your Vault"
    : "Start Free";

  return (
    <section
      className={cn(
        landingSectionClass,
        "px-8 pb-16 pt-4 md:pb-20 lg:px-10"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <LandingScrollReveal>
          <PageCard
            elevated={false}
            className="overflow-hidden border-border-subtle/80 bg-[radial-gradient(circle_at_50%_0%,rgb(236_246_240)_0%,rgb(253_252_250)_42%,rgb(248_246_242)_100%)] px-8 py-14 text-center md:px-16 md:py-16"
          >
            <h2 className="mx-auto max-w-2xl text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-[2.35rem] md:leading-tight">
              Spend less time searching.
              <span className="block text-text-secondary">
                Spend more time enjoying your home.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-text-muted">
              {LANDING_SUPPORTING_MESSAGE}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
          </PageCard>
        </LandingScrollReveal>
      </div>
    </section>
  );
}
