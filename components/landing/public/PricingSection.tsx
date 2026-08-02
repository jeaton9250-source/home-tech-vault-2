"use client";

import { useState } from "react";
import { Check, CreditCard, ShieldCheck } from "lucide-react";

import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_PUBLIC_SECTION_IDS } from "@/lib/marketing/landingPublicContent";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

const plans = [
  {
    id: "free",
    featured: false,
    name: "Free",
    monthly: 0,
    annual: 0,
    anchor: "Start organizing without a credit card",
    description: "For building your first home technology inventory.",
    features: [
      "Create a home technology inventory",
      "Track important device details",
      "Keep warranty information organized",
      "Use Home Tech Vault in any browser",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 7.99,
    annual: 79.9,
    anchor: "Less than one expired warranty can cost you",
    description: "For homeowners who want the complete vault and discovery tools.",
    features: [
      "Everything in Free",
      "Automatic device discovery with the Mac connector",
      "Receipts, manuals, and document organization",
      "Warranty and maintenance reminders",
      "Advanced search and home insights",
    ],
    featured: true,
  },
  {
    id: "family",
    featured: false,
    name: "Family",
    monthly: 14.99,
    annual: 149.9,
    anchor: "About 50¢ a day for the whole household",
    description: "For households that want shared access and more connected homes.",
    features: [
      "Everything in Pro",
      "Invite household members",
      "Shared home technology records",
      "Up to 3 paired Mac connectors",
      "Expanded household collaboration",
    ],
  },
] as const;

type PricingSectionProps = {
  isSignedIn?: boolean;
};

function formatPrice(value: number) {
  if (value === 0) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function PricingSection({
  isSignedIn = false,
}: PricingSectionProps) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const applePayEnabled =
    process.env.NEXT_PUBLIC_APPLE_PAY_ENABLED === "true";

  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.pricing}
      className="scroll-mt-24 bg-surface-base px-5 py-20 md:px-8 lg:px-12"
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-home-health">
            Simple pricing
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] text-text-primary md:text-5xl">
            Start free. Upgrade when your vault grows.
          </h2>
          <p className="mt-5 text-base leading-8 text-text-secondary">
            Choose monthly flexibility or save about two months with annual billing.
          </p>

          <div className="mx-auto mt-8 inline-flex rounded-full border border-border-subtle bg-surface-sunken p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                billing === "monthly"
                  ? "bg-surface-card text-text-primary shadow-sm"
                  : "text-text-muted"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                billing === "annual"
                  ? "bg-charcoal text-white shadow-sm"
                  : "text-text-muted"
              }`}
            >
              Annual · Save 17%
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const selectedPrice = billing === "annual" ? plan.annual : plan.monthly;
            const signupHref = isSignedIn
              ? "/settings/billing"
              : `${MARKETING_ROUTES.signup}?plan=${plan.id}&billing=${billing}`;

            return (
              <article
                key={plan.id}
                className={`relative flex h-full flex-col rounded-[30px] border p-7 shadow-sm ${
                  plan.featured
                    ? "border-home-health/40 bg-surface-card shadow-lift"
                    : "border-border-subtle bg-surface-card"
                }`}
              >
                {plan.featured ? (
                  <span className="absolute -top-3 left-7 rounded-full bg-home-health px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                ) : null}

                <h3 className="text-xl font-semibold text-text-primary">{plan.name}</h3>
                <p className="mt-2 min-h-14 text-sm leading-6 text-text-secondary">
                  {plan.description}
                </p>

                <div className="mt-6">
                  <span className="text-4xl font-semibold tracking-[-0.04em] text-text-primary">
                    {formatPrice(selectedPrice)}
                  </span>
                  <span className="ml-2 text-sm text-text-muted">
                    {billing === "annual" && selectedPrice > 0 ? "/year" : "/month"}
                  </span>
                </div>

                {billing === "annual" && plan.monthly > 0 ? (
                  <p className="mt-2 text-sm font-semibold text-home-health">
                    Equivalent to {formatPrice(plan.annual / 12)}/month
                  </p>
                ) : null}

                <p className="mt-4 rounded-xl bg-surface-sunken px-3 py-2 text-xs font-semibold text-text-secondary">
                  {plan.anchor}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-6 text-text-secondary"
                    >
                      <Check
                        size={17}
                        className="mt-1 shrink-0 text-home-health"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <LandingTrackedLink
                  href={signupHref}
                  className={`mt-7 ${
                    plan.featured ? landingTheme.btnPrimary : landingTheme.btnSecondary
                  }`}
                >
                  {isSignedIn ? "Manage plan" : plan.id === "free" ? "Start Free" : `Choose ${plan.name}`}
                </LandingTrackedLink>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-surface-card px-5 py-4 text-sm text-text-secondary shadow-sm">
          <ShieldCheck size={18} className="text-home-health" aria-hidden />
          <span>Secure checkout powered by Stripe</span>
          <span aria-hidden>·</span>
          <CreditCard size={17} className="text-text-muted" aria-hidden />
          <span>Payment methods are shown at checkout</span>
          {applePayEnabled ? (
            <>
              <span aria-hidden>·</span>
              <strong className="text-text-primary">Apple Pay</strong>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
