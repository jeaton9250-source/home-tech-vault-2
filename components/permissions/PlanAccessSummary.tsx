"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import {
  formatSubscriptionStatus,
} from "@/lib/permissions/effectivePlan";
import { getGrantDisplayLabel } from "@/lib/plan-grants/grantAccess";

function formatGrantExpiration(
  value: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type PlanAccessSummaryProps = {
  showRole?: boolean;
  showBillingNote?: boolean;
  compact?: boolean;
};

export default function PlanAccessSummary({
  showRole = true,
  showBillingNote = true,
  compact = false,
}: PlanAccessSummaryProps) {
  const {
    loading,
    isDemo,
    isPlatformAdmin,
    planDisplayName,
    roleDisplayName,
    effectiveStatus,
    billingManagedByHousehold,
    billingOwnerName,
    canManageBilling,
    hasActiveAdminGrant,
    adminGrant,
    personalPlan,
    personalStatus,
  } = usePermissions();

  if (loading) {
    return (
      <p className="text-sm text-text-secondary">
        Loading plan details...
      </p>
    );
  }

  if (isDemo) {
    return (
      <p className="text-sm text-text-secondary">
        You are browsing the interactive demo. Create
        your vault to activate a plan.
      </p>
    );
  }

  const complimentaryLabel = hasActiveAdminGrant
    ? getGrantDisplayLabel(adminGrant!.plan)
    : null;

  const subscriptionStatusLabel =
    hasActiveAdminGrant &&
    !canManageBilling
      ? "Complimentary access"
      : formatSubscriptionStatus(
          hasActiveAdminGrant
            ? personalStatus
            : effectiveStatus
        );

  return (
    <div className="space-y-3">
      <div
        className={
          compact
            ? "space-y-1"
            : "grid gap-3 sm:grid-cols-2"
        }
      >
        <SummaryItem
          label="Plan"
          value={
            isPlatformAdmin
              ? "Master Account"
              : complimentaryLabel ||
                planDisplayName
          }
        />

        {showRole && roleDisplayName && (
          <SummaryItem
            label={
              billingManagedByHousehold ||
              planDisplayName === "Family" ||
              planDisplayName ===
                "Complimentary Family"
                ? "Role"
                : "Household Role"
            }
            value={roleDisplayName}
          />
        )}

        {!compact && (
          <SummaryItem
            label="Subscription Status"
            value={subscriptionStatusLabel}
          />
        )}

        {hasActiveAdminGrant &&
          adminGrant?.expiresAt && (
            <SummaryItem
              label="Access expires"
              value={formatGrantExpiration(
                adminGrant.expiresAt
              )}
            />
          )}
      </div>

      {hasActiveAdminGrant && !canManageBilling && (
        <div className="rounded-2xl border border-border-subtle bg-surface-sunken p-4 text-sm leading-6 text-text-secondary">
          {complimentaryLabel} was granted to your
          account. This is not a paid subscription.
          {personalPlan !== "free" &&
          personalStatus !== "inactive" ? (
            <>
              {" "}
              Your personal billing plan remains{" "}
              {personalPlan}.
            </>
          ) : null}
        </div>
      )}

      {showBillingNote &&
        billingManagedByHousehold && (
          <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4">
            <LockKeyhole
              size={18}
              className="mt-0.5 shrink-0 text-interaction"
            />

            <div>
              <p className="text-sm font-semibold text-text-primary">
                Managed by your Family Plan Admin
              </p>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {billingOwnerName
                  ? `${billingOwnerName} manages billing for this household.`
                  : "Billing for this household is managed by your Family Plan Admin."}
              </p>

              {!canManageBilling && (
                <Link
                  href="/family"
                  className="mt-2 inline-block text-sm font-semibold text-text-primary underline"
                >
                  View household
                </Link>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-sunken p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}
