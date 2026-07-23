"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import LandingScrollReveal from "@/components/landing/LandingScrollReveal";
import { landingPricingPlans } from "@/lib/marketing/landingContent";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import {
  landingSectionAnchor,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

type LandingPricingSectionProps = {
  isSignedIn: boolean;
};

export default function LandingPricingSection({
  isSignedIn,
}: LandingPricingSectionProps) {
  const ctaHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  return (
    <section
      id={LANDING_SECTION_IDS.pricing}
      className={cn(
        landingSectionClass,
        landingSectionAnchor,
        "px-8 py-16 md:py-20 lg:px-10"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <LandingScrollReveal className="max-w-2xl">
          <p className="text-overline text-text-muted">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
            Choose the plan that&apos;s right for your home.
          </h2>
        </LandingScrollReveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {landingPricingPlans.map((plan, index) => (
            <LandingScrollReveal
              key={plan.id}
              delayMs={index * 80}
            >
              <article
                className={cn(
                  "htv-card-interactive flex h-full flex-col rounded-[1.25rem] border p-8",
                  plan.highlighted
                    ? "border-charcoal bg-surface-card shadow-[var(--shadow-md)] ring-1 ring-charcoal/10"
                    : "border-border-subtle/80 bg-surface-card/95"
                )}
              >
                {plan.badge ? (
                  <p className="text-overline text-home-health">
                    {plan.badge}
                  </p>
                ) : null}

                <h3 className="mt-2 text-xl font-medium capitalize text-text-primary">
                  {plan.id}
                </h3>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-medium tracking-[-0.03em]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-text-muted">
                    {plan.period}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-text-muted">
                  {plan.note}
                </p>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-text-secondary"
                    >
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-home-health"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href={ctaHref}
                  className={cn(
                    "mt-8 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-medium transition",
                    plan.highlighted
                      ? "bg-charcoal text-surface-card hover:bg-charcoal-hover"
                      : "border border-border-subtle hover:bg-surface-hover"
                  )}
                >
                  {plan.id === "free"
                    ? "Start Free"
                    : "Get Started"}
                </Link>
              </article>
            </LandingScrollReveal>
          ))}
        </div>

        <LandingScrollReveal className="mt-8">
          <p className="text-sm text-text-muted">
            <Link
              href={MARKETING_ROUTES.pricing}
              className="inline-flex items-center gap-1 font-medium text-interaction hover:text-interaction-hover"
            >
              Compare full plan details
              <ArrowRight size={14} aria-hidden />
            </Link>
          </p>
        </LandingScrollReveal>
      </div>
    </section>
  );
}
