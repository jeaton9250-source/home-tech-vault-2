"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type PaidPlan = "pro" | "family";

export default function UpgradePage() {
  const [loadingPlan, setLoadingPlan] =
    useState<PaidPlan | null>(null);

  async function startCheckout(plan: PaidPlan) {
    try {
      setLoadingPlan(plan);

      const response = await fetch(
        "/api/stripe/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan }),
        }
      );

      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to start checkout."
        );
      }

      if (!result.url) {
        throw new Error(
          "Stripe Checkout URL was not returned."
        );
      }

      window.location.assign(result.url);
    } catch (error) {
      console.error("Checkout error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to begin checkout."
      );
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <PageShell>
      <PageTitle
        eyebrow="Plans & Billing"
        title="Upgrade Your Home Tech Vault"
        description="Choose the plan that gives you the right level of protection, automation, and household access."
      />

      <section className="grid gap-6 xl:grid-cols-3">
        <PlanCard
          name="Free"
          price="$0"
          description="For getting started with your home technology inventory."
          icon={ShieldCheck}
          features={[
            "Up to 10 devices",
            "Basic device inventory",
            "Photos and documents",
            "Warranty tracking",
            "Basic maintenance",
          ]}
          buttonText="Free Plan"
          disabled
        />

        <PlanCard
          name="Pro"
          price="$7.99"
          billingText="/month"
          description="For homeowners who want automation, reporting, and advanced tools."
          icon={Crown}
          featured
          features={[
            "Unlimited devices",
            "Network device discovery",
            "Advanced reports and analytics",
            "Insurance-ready exports",
            "Smart recommendations",
            "Home technology health score",
          ]}
          buttonText="Upgrade to Pro"
          loading={loadingPlan === "pro"}
          disabled={loadingPlan !== null}
          onClick={() => startCheckout("pro")}
        />

        <PlanCard
          name="Family"
          price="$14.99"
          billingText="/month"
          description="For households that want shared access and multiple users."
          icon={Users}
          features={[
            "Everything in Pro",
            "Household member access",
            "Shared device management",
            "Family permissions",
            "Multiple homes in the future",
            "Priority support",
          ]}
          buttonText="Choose Family"
          loading={loadingPlan === "family"}
          disabled={loadingPlan !== null}
          onClick={() => startCheckout("family")}
        />
      </section>

      <PageCard>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Sparkles size={24} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#111827]">
              Secure Stripe Checkout
            </h2>

            <p className="mt-2 max-w-2xl text-neutral-500">
              Payments are completed through Stripe’s hosted
              checkout page. Use a Stripe test card while your
              account is in test mode.
            </p>
          </div>
        </div>
      </PageCard>
    </PageShell>
  );
}

type PlanCardProps = {
  name: string;
  price: string;
  billingText?: string;
  description: string;
  icon: typeof Crown;
  features: string[];
  buttonText: string;
  featured?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
};

function PlanCard({
  name,
  price,
  billingText,
  description,
  icon: Icon,
  features,
  buttonText,
  featured = false,
  disabled = false,
  loading = false,
  onClick,
}: PlanCardProps) {
  return (
    <PageCard
      className={
        featured
          ? "relative border-[#C8A96A] shadow-lg"
          : ""
      }
    >
      {featured && (
        <div className="absolute right-5 top-5 rounded-full bg-[#111827] px-3 py-1 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={24} />
      </div>

      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
        {name}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-bold text-[#111827]">
          {price}
        </span>

        {billingText && (
          <span className="pb-1 text-neutral-500">
            {billingText}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-neutral-500">
        {description}
      </p>

      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-3"
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-[#C8A96A]"
            />

            <p className="text-sm text-[#111827]">
              {feature}
            </p>
          </div>
        ))}
      </div>

      <Button
        className="mt-8 w-full justify-center"
        disabled={disabled}
        onClick={onClick}
      >
        {loading && (
          <Loader2
            size={18}
            className="animate-spin"
          />
        )}

        {loading ? "Opening Checkout..." : buttonText}
      </Button>
    </PageCard>
  );
}