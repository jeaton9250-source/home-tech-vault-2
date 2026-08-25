"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  Home,
  ShieldCheck,
  Users,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type PricingSectionProps = {
  isSignedIn?: boolean;
};

const plans = [
  {
    name: "Free",
    eyebrow: "Start here",
    price: "$0",
    billing: "forever",
    description:
      "For getting the important details about your home organized without paying anything.",
    icon: Home,
    featured: false,
    features: [
      "Up to 8 devices",
      "Up to 25 documents",
      "Device and appliance records",
      "Receipts and manuals",
      "Warranty tracking",
      "Purchase, serial, and model details",
    ],
  },
  {
    name: "Pro",
    eyebrow: "For most homeowners",
    price: "$7.99",
    billing: "/month",
    description:
      "For homeowners who want to organize more of the home, unlock advanced tools, and keep a larger vault in one place.",
    icon: Crown,
    featured: true,
    features: [
      "More devices and documents",
      "Expanded warranty tracking",
      "Advanced Home Health features",
      "Additional organization tools",
      "More room for your whole home",
    ],
  },
  {
    name: "Family",
    eyebrow: "For shared households",
    price: "$14.99",
    billing: "/month",
    description:
      "For households that want more than one person to help manage the important details of the home.",
    icon: Users,
    featured: false,
    features: [
      "Everything in a larger home vault",
      "Household sharing",
      "Multiple household members",
      "Shared device information",
      "More devices and documents",
    ],
  },
] as const;

export default function PricingSection({
  isSignedIn = false,
}: PricingSectionProps) {
  const freeHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const paidHref = isSignedIn
    ? "/upgrade"
    : MARKETING_ROUTES.signup;

  return (
    <section
      id="pricing"
      className="bg-[#f5f1e8] px-5 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#617c43]/15 bg-[#edf2e7] px-4 py-2">
            <ShieldCheck
              size={14}
              className="text-[#617c43]"
              aria-hidden
            />

            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
              Simple pricing
            </span>
          </div>

          <h1 className="mt-6 font-serif text-5xl font-medium leading-[0.98] tracking-[-0.05em] text-[#17212a] sm:text-6xl">
            Start free.
            <br />
            <span className="text-[#617c43]">
              Upgrade when your vault grows.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#68716c] sm:text-lg">
            You do not need to pay to find out whether Home Tech Vault works
            for your home. Start with the Free plan and move up only when you
            need more space or household sharing.
          </p>

          <p className="mt-4 text-sm text-[#8e9690]">
            No credit card required to start.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const href =
              plan.name === "Free"
                ? freeHref
                : paidHref;

            const buttonLabel =
              plan.name === "Free"
                ? isSignedIn
                  ? "Open My Vault"
                  : "Start Free"
                : `Choose ${plan.name}`;

            return (
              <article
                key={plan.name}
                className={[
                  "relative flex flex-col rounded-[30px] border bg-[#fffdf8] p-7 sm:p-8",
                  plan.featured
                    ? "border-[#617c43] shadow-[0_25px_70px_-38px_rgba(70,90,55,0.55)] lg:-translate-y-3"
                    : "border-[#ded7ca] shadow-[0_18px_50px_-42px_rgba(15,25,35,0.3)]",
                ].join(" ")}
              >
                {plan.featured ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#617c43] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                    Most Popular
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-5">
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      plan.featured
                        ? "bg-[#edf2e7] text-[#617c43]"
                        : "bg-[#f5f1e8] text-[#365066]",
                    ].join(" ")}
                  >
                    <Icon size={20} strokeWidth={1.8} aria-hidden />
                  </div>

                  <span className="rounded-full border border-[#ded7ca] bg-[#f5f1e8] px-3 py-1 text-[10px] font-semibold text-[#68716c]">
                    {plan.eyebrow}
                  </span>
                </div>

                <h2 className="mt-7 font-serif text-3xl font-medium text-[#17212a]">
                  {plan.name}
                </h2>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.055em] text-[#17212a]">
                    {plan.price}
                  </span>

                  <span className="pb-1.5 text-sm font-medium text-[#8e9690]">
                    {plan.billing}
                  </span>
                </div>

                <p className="mt-5 min-h-[84px] text-sm leading-7 text-[#68716c]">
                  {plan.description}
                </p>

                <div className="my-7 h-px bg-[#ded7ca]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#617c43]">
                  What you get
                </p>

                <div className="mt-5 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#edf2e7] text-[#617c43]">
                        <Check size={12} strokeWidth={2.2} aria-hidden />
                      </div>

                      <span className="text-sm leading-6 text-[#59625d]">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href={href}
                  className={[
                    "mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition",
                    plan.featured
                      ? "bg-[#617c43] text-white hover:bg-[#718d4f]"
                      : "border border-[#17212a]/15 bg-[#f5f1e8] text-[#17212a] hover:bg-[#eee8dc]",
                  ].join(" ")}
                >
                  {buttonLabel}
                  <ArrowRight size={15} aria-hidden />
                </Link>

                {plan.name !== "Free" && !isSignedIn ? (
                  <p className="mt-3 text-center text-xs leading-5 text-[#8e9690]">
                    Sign up first, then upgrade securely.
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#8e9690]">
          <span>Cancel anytime.</span>
          <span className="hidden sm:inline">•</span>
          <span>Secure checkout through Stripe.</span>
          <span className="hidden sm:inline">•</span>
          <span>No credit card required for Free.</span>
        </div>

        <div className="mx-auto mt-14 max-w-4xl rounded-[28px] border border-[#ded7ca] bg-[#fffdf8] p-7 text-center sm:p-9">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
            Not sure which plan?
          </p>

          <h2 className="mt-4 font-serif text-3xl font-medium text-[#17212a]">
            Start with Free.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#68716c]">
            Add the appliance, device, receipt, warranty, or document you care
            about most. If you eventually need more room, advanced tools, or
            household sharing, your vault can grow with you.
          </p>

          <Link
            href={freeHref}
            className="mt-6 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[#183047] px-7 text-sm font-semibold text-white transition hover:bg-[#223e58]"
          >
            {isSignedIn ? "Open My Vault" : "Create My Free Vault"}
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
