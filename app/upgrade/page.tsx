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
import { PLAN_FEATURES } from "@/lib/permissions/plans";
import { usePermissions } from "@/hooks/usePermissions";
import PlanAccessSummary from "@/components/permissions/PlanAccessSummary";

type PaidPlan = "pro" | "family";

export default function UpgradePage() {
  const {
    loading: permissionsLoading,
    plan,
    planDisplayName,
    roleDisplayName,
    role,
    isDemo,
    isFree,
    isPlatformAdmin,
    billingManagedByHousehold,
    canManageBilling,
    user,
  } = usePermissions();

  const [loadingPlan, setLoadingPlan] =
    useState<PaidPlan | null>(null);

  /*
   * Starting a subscription and managing an existing
   * subscription are different permissions.
   *
   * A brand-new Free owner has no Stripe customer yet,
   * so canManageBilling is correctly false. They must
   * still be allowed to start their first checkout.
   */
  const canPurchase =
    Boolean(user) &&
    !isDemo &&
    !isPlatformAdmin &&
    !billingManagedByHousehold &&
    (
      !role ||
      role === "admin"
    );

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

      {!permissionsLoading &&
        user &&
        !isDemo && (
          <PageCard className="border-warning/40 bg-warning-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-achievement">
              Your Current Plan
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-bold text-text-primary">
                {isPlatformAdmin
                  ? "Master Account"
                  : planDisplayName}
              </p>

              {roleDisplayName && (
                <span className="rounded-full bg-charcoal px-3 py-1 text-xs font-semibold text-surface-card">
                  {roleDisplayName}
                </span>
              )}
            </div>

            {billingManagedByHousehold && (
              <div className="mt-4">
                <PlanAccessSummary
                  showRole={false}
                  compact
                />
              </div>
            )}
          </PageCard>
        )}

      <section className="grid gap-6 xl:grid-cols-3">
        <PlanCard
          name="Free"
          price="$0"
          description="For getting started with your home technology inventory."
          icon={ShieldCheck}
          features={PLAN_FEATURES.free.items}
          buttonText={
            isFree && !isPlatformAdmin
              ? "Current Plan"
              : "Free Plan"
          }
          disabled
        />

        <PlanCard
          name="Pro"
          price="$7.99"
          billingText="/month"
          description="For homeowners who want automation, reporting, and advanced tools."
          icon={Crown}
          featured
          features={PLAN_FEATURES.pro.items}
          buttonText={
            plan === "pro"
              ? "Current Plan"
              : "Upgrade to Pro"
          }
          loading={loadingPlan === "pro"}
          disabled={
            loadingPlan !== null ||
            plan === "pro" ||
            !canPurchase
          }
          onClick={
            canPurchase
              ? () => startCheckout("pro")
              : undefined
          }
        />

        <PlanCard
          name="Family"
          price="$14.99"
          billingText="/month"
          description="For households that want shared access and multiple users."
          icon={Users}
          features={PLAN_FEATURES.family.items}
          buttonText={
            plan === "family"
              ? "Current Plan"
              : "Choose Family"
          }
          loading={loadingPlan === "family"}
          disabled={
            loadingPlan !== null ||
            plan === "family" ||
            !canPurchase
          }
          onClick={
            canPurchase
              ? () => startCheckout("family")
              : undefined
          }
        />
      </section>

      <PageCard>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
            <Sparkles size={24} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Secure Stripe Checkout
            </h2>

            <p className="mt-2 max-w-2xl text-text-secondary">
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
          ? "relative border-accent shadow-lg"
          : ""
      }
    >
      {featured && (
        <div className="absolute right-5 top-5 rounded-full bg-charcoal px-3 py-1 text-xs font-semibold text-surface-card">
          Most Popular
        </div>
      )}

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
        <Icon size={24} />
      </div>

      <p className="mt-5 text-overline text-charcoal-soft">
        {name}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-bold text-text-primary">
          {price}
        </span>

        {billingText && (
          <span className="pb-1 text-text-secondary">
            {billingText}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-text-secondary">
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
              className="mt-0.5 shrink-0 text-interaction"
            />

            <p className="text-sm text-text-primary">
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