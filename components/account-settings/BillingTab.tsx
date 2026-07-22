"use client";

import { useState } from "react";

import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  Sparkles,
} from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import PlanAccessSummary from "@/components/permissions/PlanAccessSummary";
import {
  formatSubscriptionStatus,
  getPlanDescription,
} from "@/lib/permissions/effectivePlan";
import Button from "@/components/ui/Button";
import {
  ReadOnlyNotice,
  ViewerBanner,
} from "@/components/ui/PermissionUI";

import {
  formatSubscriptionDate,
  ReadOnlyRow,
  SettingsCard,
} from "@/components/account-settings/shared";

export default function BillingTab() {
  const {
    loading,
    plan,
    planDisplayName,
    roleDisplayName,
    effectiveStatus,
    currentPeriodEnd,
    isActive,
    isFree,
    isPlatformAdmin,
    canManageBilling,
    canUseProFeatures,
    billingManagedByHousehold,
    billingOwnerName,
    inheritsProPlan,
    inheritsFamilyPlan,
    isDemo,
    hasActiveAdminGrant,
    adminGrant,
    isTrial,
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
        { method: "POST" }
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

  const isComplimentaryOnly =
    hasActiveAdminGrant && !canManageBilling;

  const monthlyPrice = isComplimentaryOnly
    ? "Complimentary access"
    : plan === "family"
      ? "$14.99/month"
      : plan === "pro"
        ? "$7.99/month"
        : "$0/month";

  const householdPlanLabel = inheritsFamilyPlan
    ? "Family"
    : inheritsProPlan
      ? "Pro"
      : "household";

  if (loading) {
    return (
      <SettingsCard title="Billing">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading billing information...
        </div>
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-6">
      <ViewerBanner />

      <PlanAccessSummary
        showBillingNote
        showRole
      />

      {!canManageBilling &&
        billingManagedByHousehold &&
        canUseProFeatures && (
          <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-sunken px-5 py-4 text-sm leading-6 text-text-secondary">
            Your household includes {householdPlanLabel}{" "}
            access.
            {billingOwnerName
              ? ` Billing is managed by ${billingOwnerName}.`
              : " Billing is managed by the subscription owner."}
          </div>
        )}

      {!canManageBilling &&
        billingManagedByHousehold &&
        !canUseProFeatures && (
          <ReadOnlyNotice
            show
            message="Managed by your household billing owner. Billing changes must be made by the subscription owner."
          />
        )}

      {!billingManagedByHousehold && (
        <ReadOnlyNotice
          show={
            !isDemo &&
            !canManageBilling &&
            !isComplimentaryOnly
          }
          message="Only the subscription owner or an authorized household admin can manage billing."
        />
      )}

      {errorMessage ? (
        <div className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <SettingsCard
        title="Current plan"
        description={
          isPlatformAdmin
            ? "All Home Tech Vault features are unlocked."
            : getPlanDescription(plan)
        }
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">
              {isPlatformAdmin
                ? "Master Account"
                : planDisplayName}
            </p>

            {roleDisplayName ? (
              <p className="mt-2 text-sm font-medium text-text-secondary">
                {roleDisplayName}
              </p>
            ) : null}

            <p className="mt-1 text-sm text-text-secondary">
              {monthlyPrice}
            </p>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              isActive || isPlatformAdmin
                ? "bg-home-health-soft text-home-health"
                : "bg-surface-sunken text-text-secondary"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isActive || isPlatformAdmin
                  ? "bg-home-health"
                  : "bg-text-tertiary"
              }`}
            />
            {isPlatformAdmin
              ? "Master Access"
              : formatSubscriptionStatus(
                  isComplimentaryOnly
                    ? "active"
                    : effectiveStatus
                )}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ReadOnlyRow
            label={
              isComplimentaryOnly
                ? "Access expires"
                : effectiveStatus === "canceled"
                  ? "Access ends"
                  : isTrial
                    ? "Trial ends"
                    : "Next renewal"
            }
            value={
              isComplimentaryOnly
                ? adminGrant?.expiresAt
                  ? formatSubscriptionDate(
                      adminGrant.expiresAt
                    )
                  : "No expiration"
                : currentPeriodEnd
                  ? formatSubscriptionDate(
                      currentPeriodEnd
                    )
                  : "Not applicable"
            }
          />

          <ReadOnlyRow
            label="Payment provider"
            value={
              isComplimentaryOnly
                ? "Not billed through Stripe"
                : "Stripe secure billing"
            }
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Plan features"
        description={
          isFree
            ? "Upgrade to unlock premium tools for your home technology vault."
            : "Your account currently has access to the features included with this plan."
        }
      >
        <div className="space-y-3">
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
            enabled={canUseProFeatures}
          />
          <FeatureRow
            text="Advanced reports and analytics"
            enabled={canUseProFeatures}
          />
          <FeatureRow
            text="Insurance-ready exports"
            enabled={canUseProFeatures}
          />
          <FeatureRow
            text="Household sharing"
            enabled={plan === "family"}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {isFree && !isPlatformAdmin ? (
            <Button
              href="/upgrade"
              className="w-full justify-center sm:w-auto"
            >
              <Sparkles size={17} />
              View Upgrade Options
            </Button>
          ) : null}

          {canManageBilling ? (
            <Button
              onClick={() => {
                void openPortal();
              }}
              disabled={openingPortal}
              className="w-full justify-center sm:w-auto"
            >
              {openingPortal ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <ArrowUpRight size={17} />
              )}
              {openingPortal
                ? "Opening..."
                : "Manage Billing"}
            </Button>
          ) : billingManagedByHousehold ? (
            <Button
              href="/family"
              variant="secondary"
              className="w-full justify-center sm:w-auto"
            >
              <Crown size={17} />
              View Household
            </Button>
          ) : null}
        </div>
      </SettingsCard>

      {canManageBilling ? (
        <SettingsCard
          title="Stripe customer portal"
          description="Paid members can securely update payment methods, download invoices, and manage or cancel their subscription through Stripe."
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
              <CreditCard size={20} />
            </div>

            <p className="text-sm leading-6 text-text-secondary">
              Billing changes are handled through Stripe&apos;s
              secure customer portal. You will return here
              after making updates.
            </p>
          </div>
        </SettingsCard>
      ) : null}
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
    <div className="flex items-center gap-3 rounded-2xl bg-surface-sunken px-4 py-3">
      <CheckCircle2
        size={18}
        className={
          enabled
            ? "text-home-health"
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
