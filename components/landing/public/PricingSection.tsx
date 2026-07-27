import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_PRICING_PLANS, LANDING_PUBLIC_SECTION_IDS } from "@/lib/marketing/landingPublicContent";
import { PLAN_FEATURES } from "@/lib/permissions/plans";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

type PricingSectionProps = {
  isSignedIn?: boolean;
};

export default function PricingSection({
  isSignedIn = false,
}: PricingSectionProps) {
  const ctaHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.pricing}
      className={cn(
        landingTheme.section,
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="max-w-2xl">
          <p className={landingTheme.eyebrow}>
            Pricing
          </p>
          <h2 className={cn(landingTheme.headline, "mt-3")}>
            Choose the plan that fits how your home
            works.
          </h2>
          <p className={cn(landingTheme.body, "mt-4 max-w-xl")}>
            Start free. Upgrade when you want deeper network
            intelligence and shared household access.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {LANDING_PRICING_PLANS.map((plan) => {
            const features = PLAN_FEATURES[plan.id];

            return (
              <article
                key={plan.id}
                className={cn(
                  "htv-card-interactive flex flex-col rounded-[1.25rem] border p-8",
                  plan.highlighted
                    ? "border-[#183B56] bg-white shadow-[0_20px_50px_-24px_rgba(23,32,51,0.35)] ring-1 ring-[#183B56]/10"
                    : "border-[#E7E9EC] bg-white"
                )}
              >
                {plan.badge ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3BAF75]">
                    {plan.badge}
                  </p>
                ) : null}

                <h3 className="mt-2 text-xl font-medium text-[#172033]">
                  {features.label}
                </h3>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-medium tracking-[-0.03em] text-[#172033]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#667085]">
                    {plan.period}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-[#667085]">
                  {plan.note}
                </p>

                <ul className="mt-8 flex-1 space-y-3">
                  {features.items.slice(0, 6).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-[#667085]"
                    >
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-[#3BAF75]"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <LandingTrackedLink
                  href={ctaHref}
                  className={cn(
                    "mt-8 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]",
                    plan.highlighted
                      ? "bg-[#183B56] text-white hover:bg-[#122d43]"
                      : "border border-[#E7E9EC] text-[#172033] hover:bg-[#EDF3F7]"
                  )}
                >
                  {plan.id === "free"
                    ? "Start Free"
                    : "Get Started"}
                </LandingTrackedLink>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-[#667085]">
          <Link
            href={MARKETING_ROUTES.pricing}
            className="inline-flex items-center gap-1 font-medium text-[#183B56] hover:underline"
          >
            Compare full plan details
            <ArrowRight size={14} aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
