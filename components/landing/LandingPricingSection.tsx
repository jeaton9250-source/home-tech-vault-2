"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import { PLAN_FEATURES } from "@/lib/permissions/plans";
import {
  landingMotionRise,
  landingSectionClass,
  landingSectionAnchor,
} from "@/lib/marketing/landingStyles";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

const plans = [
  {
    id: "free" as const,
    price: "$0",
    period: "forever",
    note: "Manual scans and starter inventory.",
    highlighted: false,
  },
  {
    id: "pro" as const,
    price: "$7.99",
    period: "per month",
    note: "Automatic monitoring and unlimited inventory.",
    highlighted: false,
  },
  {
    id: "family" as const,
    price: "$14.99",
    period: "per month",
    note: "Household sharing with everything in Pro.",
    highlighted: true,
  },
] as const;

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
        "border-t border-border-subtle/80 bg-surface-sunken/35 px-8 py-14 md:py-16 lg:px-10"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-overline text-text-muted">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
            Start free. Upgrade when your home outgrows the basics.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const features = PLAN_FEATURES[plan.id];

            return (
              <article
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-[var(--radius-card)] border p-8 transition-all duration-200 hover:-translate-y-1",
                  plan.highlighted
                    ? "border-charcoal bg-surface-card shadow-[var(--shadow-md)] ring-1 ring-charcoal/10"
                    : "border-border-subtle bg-surface-card/90",
                  landingMotionRise,
                  index === 1 && "htv-landing-delay-1",
                  index === 2 && "htv-landing-delay-2"
                )}
              >
                {plan.highlighted ? (
                  <p className="text-overline text-home-health">
                    Best for households
                  </p>
                ) : null}

                <h3 className="mt-2 text-xl font-medium text-text-primary">
                  {features.label}
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
                  {features.items.slice(0, 6).map((item) => (
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
            );
          })}
        </div>

        <p className="mt-8 text-sm text-text-muted">
          <Link
            href={MARKETING_ROUTES.pricing}
            className="inline-flex items-center gap-1 font-medium text-interaction hover:text-interaction-hover"
          >
            Compare full plan details
            <ArrowRight size={14} aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
