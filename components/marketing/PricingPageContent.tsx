"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import MarketingLayout, {
  MarketingContent,
  MarketingPageHero,
} from "@/components/marketing/MarketingLayout";
import { PLAN_FEATURES } from "@/lib/permissions/plans";
import {
  FAQ_ITEMS,
  type FaqCategory,
} from "@/lib/marketing/faq";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

const plans = [
  {
    id: "free" as const,
    price: "$0",
    period: "forever",
    note: "Start organizing without commitment.",
    highlighted: false,
  },
  {
    id: "pro" as const,
    price: "$7.99",
    period: "per month",
    note: "Unlimited inventory and premium intelligence.",
    highlighted: false,
  },
  {
    id: "family" as const,
    price: "$14.99",
    period: "per month",
    note: "The complete homeowner plan with household sharing.",
    highlighted: true,
  },
] as const;

const pricingFaqCategories: FaqCategory[] = [
  "Billing",
  "Family",
  "Accounts",
];

export default function PricingPageContent() {
  const pricingFaqs = FAQ_ITEMS.filter((item) =>
    pricingFaqCategories.includes(item.category)
  ).slice(0, 4);

  return (
    <MarketingLayout>
      <MarketingPageHero
        eyebrow="Pricing"
        title="Simple plans. No surprises."
        description="Start free. Upgrade when your home outgrows the basics."
      />

      <MarketingContent className="pt-0">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const features =
              PLAN_FEATURES[plan.id];

            return (
              <article
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-[var(--radius-card)] border p-8",
                  plan.highlighted
                    ? "border-charcoal bg-surface-card shadow-[var(--shadow-md)] ring-1 ring-charcoal/10"
                    : "border-border-subtle bg-surface-card/80"
                )}
              >
                {plan.highlighted && (
                  <p className="text-overline text-home-health">
                    Recommended for homeowners
                  </p>
                )}

                <h2 className="mt-2 text-xl font-medium">
                  {features.label}
                </h2>

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
                  {features.items.map((item) => (
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
                  href={MARKETING_ROUTES.signup}
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

        <section
          className="mt-24"
          aria-labelledby="pricing-faq-heading"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-overline text-text-muted">
              FAQ
            </p>
            <h2
              id="pricing-faq-heading"
              className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl"
            >
              Common pricing questions
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl divide-y divide-border-subtle rounded-[var(--radius-card)] border border-border-subtle bg-surface-card">
            {pricingFaqs.map((item) => (
              <details
                key={item.question}
                className="group px-6 py-5"
              >
                <summary className="cursor-pointer list-none text-base font-medium marker:content-none">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-text-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-text-muted">
            <Link
              href={MARKETING_ROUTES.faq}
              className="font-medium text-interaction hover:text-interaction-hover"
            >
              View all FAQs
            </Link>
          </p>
        </section>
      </MarketingContent>
    </MarketingLayout>
  );
}
