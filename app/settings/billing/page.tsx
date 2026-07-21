"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import PlanAccessSummary from "@/components/permissions/PlanAccessSummary";
import {
  formatSubscriptionStatus,
} from "@/lib/permissions/effectivePlan";
import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import IconWell from "@/components/ui/IconWell";
import Button from "@/components/ui/Button";
import { ReadOnlyNotice, ViewerBanner } from "@/components/ui/PermissionUI";

export default function BillingPage() {
  const {
    loading,
    plan,
    planDisplayName,
    roleDisplayName,
    effectiveStatus,
    currentPeriodEnd,
    isActive,
    isFree,
    canManageBilling,
    billingManagedByHousehold,
    isDemo,
  } = usePermissions();

  const [openingPortal, setOpeningPortal] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function openPortal() {
    try {
      setOpeningPortal(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/stripe/customer-portal",
        {
          method: "POST",
        }
      );

      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to open billing management."
        );
      }

      if (!result.url) {
        throw new Error(
          "Stripe did not return a billing portal URL."
        );
      }

      window.location.assign(result.url);
    } catch (error) {
      console.error(
        "Billing portal error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to open billing management."
      );
    } finally {
      setOpeningPortal(false);
    }
  }

  const planName = planDisplayName;

  const monthlyPrice =
    plan === "family"
      ? "$14.99/month"
      : plan === "pro"
        ? "$7.99/month"
        : "$0/month";

  return (
    <PageShell>
      <PageTitle
        eyebrow="Plans & Billing"
        title="Billing & Subscription"
        description="Review your current plan and manage your Home Tech Vault subscription."
        action={
          isFree ? (
            <Button href="/upgrade">
              <Sparkles size={18} />
              View Plans
            </Button>
          ) : canManageBilling ? (
            <Button
              onClick={openPortal}
              disabled={openingPortal}
            >
              {openingPortal ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <ArrowUpRight size={18} />
              )}

              {openingPortal
                ? "Opening..."
                : "Manage Billing"}
            </Button>
          ) : null
        }
      />

      <ViewerBanner />

      <PlanAccessSummary showBillingNote />

      {!canManageBilling &&
        billingManagedByHousehold && (
          <ReadOnlyNotice
            show
            message="Managed by your Family Plan Admin. Billing changes must be made by the household billing owner."
          />
        )}

      {!billingManagedByHousehold && (
        <ReadOnlyNotice
          show={!loading && !isDemo && !canManageBilling}
          message="Only the subscription owner or an authorized household admin can manage billing."
        />
      )}

      {loading ? (
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Loading billing information...
          </div>
        </PageCard>
      ) : (
        <>
          {errorMessage && (
            <PageCard className="border-red-200 bg-red-50 text-red-700">
              {errorMessage}
            </PageCard>
          )}

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <PageCard className="overflow-hidden p-0">
              <div className="border-b border-border-subtle bg-gradient-to-br from-section-insights-soft via-surface-card to-surface-base p-7 md:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-overline text-section-insights">
                      Current Plan
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <IconWell
                        icon={isFree ? ShieldCheck : Crown}
                        section="insights"
                        size="lg"
                      />

                      <div>
                        <h2 className="text-3xl font-bold text-text-primary">
                          {planName}
                        </h2>

                        {roleDisplayName && (
                          <p className="mt-1 text-sm font-semibold text-section-insights">
                            {roleDisplayName}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-text-secondary">
                          {monthlyPrice}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      isActive
                        ? "bg-home-health-soft text-home-health"
                        : "bg-surface-sunken text-text-secondary"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive
                          ? "bg-home-health"
                          : "bg-text-tertiary"
                      }`}
                    />

                    {formatSubscriptionStatus(effectiveStatus)}
                  </span>
                </div>
              </div>

              <div className="grid gap-5 p-7 sm:grid-cols-2 md:p-8">
                <BillingDetail
                  icon={CalendarDays}
                  label={
                    effectiveStatus === "canceled"
                      ? "Access Ends"
                      : "Next Renewal"
                  }
                  value={
                    currentPeriodEnd
                      ? formatDate(currentPeriodEnd)
                      : "Not applicable"
                  }
                />

                <BillingDetail
                  icon={CreditCard}
                  label="Payment Provider"
                  value="Stripe secure billing"
                />
              </div>
            </PageCard>

            <PageCard>
              <p className="text-overline text-section-insights">
                Subscription Access
              </p>

              <h2 className="mt-2 text-2xl font-bold text-text-primary">
                {isFree
                  ? "Upgrade your vault"
                  : `${planName} features unlocked`}
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {isFree
                  ? "Unlock advanced automation, network discovery, reporting, and premium tools."
                  : "Your account currently has access to the premium tools included with this plan."}
              </p>

              <div className="mt-6 space-y-3">
                <FeatureRow
                  text={
                    isFree
                      ? "Basic device inventory"
                      : "Unlimited device tracking"
                  }
                  enabled
                />

                <FeatureRow
                  text="Network device discovery"
                  enabled={!isFree}
                />

                <FeatureRow
                  text="Advanced reports and analytics"
                  enabled={!isFree}
                />

                <FeatureRow
                  text="Insurance-ready exports"
                  enabled={!isFree}
                />

                <FeatureRow
                  text="Household sharing"
                  enabled={plan === "family"}
                />
              </div>

              <Button
                href={
                  isFree
                    ? "/upgrade"
                    : undefined
                }
                onClick={
                  isFree ||
                  !canManageBilling
                    ? undefined
                    : openPortal
                }
                disabled={
                  openingPortal ||
                  (!isFree &&
                    !canManageBilling)
                }
                className="mt-7 w-full justify-center"
              >
                {openingPortal ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : isFree ? (
                  <Sparkles size={18} />
                ) : (
                  <ArrowUpRight size={18} />
                )}

                {openingPortal
                  ? "Opening..."
                  : isFree
                    ? "Upgrade Your Plan"
                    : canManageBilling
                      ? "Manage Subscription"
                      : billingManagedByHousehold
                        ? "Managed by Family Plan Admin"
                        : "Admin Access Required"}
              </Button>
            </PageCard>
          </section>

          <PageCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
                <CreditCard size={23} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  Stripe Customer Portal
                </h2>

                <p className="mt-2 max-w-2xl text-text-secondary">
                  Paid members can securely update payment
                  methods, download invoices, and manage or
                  cancel their subscription through Stripe.
                </p>
              </div>
            </div>
          </PageCard>
        </>
      )}
    </PageShell>
  );
}

function BillingDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CreditCard;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-sunken p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
          <Icon size={19} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            {label}
          </p>

          <p className="mt-1 font-semibold text-text-primary">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  text,
  enabled,
}: {
  text: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface-sunken p-4">
      <CheckCircle2
        size={18}
        className={
          enabled
            ? "text-section-vault"
            : "text-neutral-300"
        }
      />

      <p
        className={
          enabled
            ? "text-sm font-medium text-text-primary"
            : "text-sm text-text-tertiary"
        }
      >
        {text}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}