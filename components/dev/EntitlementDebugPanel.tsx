"use client";

import { useState } from "react";

import { usePermissions } from "@/hooks/usePermissions";
import { useHouseholdLimits } from "@/hooks/useHouseholdLimits";
import { isDevelopmentEnvironment } from "@/lib/permissions/developmentAccess";

function formatValue(
  value: string | boolean | number | null | undefined
): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    return String(value);
  }

  return value;
}

/**
 * Temporary entitlement diagnostics for platform admins (production)
 * and local development. Never exposes secrets.
 */
export default function EntitlementDebugPanel() {
  const [isOpen, setIsOpen] =
    useState(false);

  const permissions = usePermissions();
  const quota = useHouseholdLimits();

  const canViewPanel =
    isDevelopmentEnvironment() ||
    permissions.isVerifiedPlatformAdmin;

  if (!canViewPanel) {
    return null;
  }

  const rows: {
    label: string;
    value: string;
  }[] = [
    {
      label: "userId",
      value: formatValue(
        permissions.user?.id
      ),
    },
    {
      label: "activeHouseholdId",
      value: formatValue(
        permissions.householdId
      ),
    },
    {
      label: "householdRole",
      value: formatValue(
        permissions.rawHouseholdRole
      ),
    },
    {
      label: "personalPlan",
      value: formatValue(
        permissions.personalPlan
      ),
    },
    {
      label: "personalStatus",
      value: formatValue(
        permissions.personalStatus
      ),
    },
    {
      label: "householdOwnerId",
      value: formatValue(
        permissions.householdOwnerId
      ),
    },
    {
      label: "ownerPlan (client)",
      value: formatValue(
        permissions.householdOwnerPlan
      ),
    },
    {
      label: "ownerStatus (client)",
      value: formatValue(
        permissions.householdOwnerStatus
      ),
    },
    {
      label: "ownerPlanSource (api)",
      value: formatValue(
        permissions.apiEntitlementSnapshot
          ?.ownerPlanSource
      ),
    },
    {
      label: "effectivePlan (api)",
      value: formatValue(
        permissions.apiEntitlementSnapshot
          ?.effectivePlan
      ),
    },
    {
      label: "canUseProFeatures (api)",
      value: formatValue(
        permissions.apiEntitlementSnapshot
          ?.canUseProFeatures
      ),
    },
    {
      label: "effectivePlan (client)",
      value: formatValue(
        permissions.effectivePlan
      ),
    },
    {
      label: "effectivePlanSource",
      value: formatValue(
        permissions.effectivePlanSource
      ),
    },
    {
      label: "inheritsProPlan",
      value: formatValue(
        permissions.inheritsProPlan
      ),
    },
    {
      label: "inheritsFamilyPlan",
      value: formatValue(
        permissions.inheritsFamilyPlan
      ),
    },
    {
      label: "canUseProFeatures",
      value: formatValue(
        permissions.canUseProFeatures
      ),
    },
    {
      label: "canManageBilling",
      value: formatValue(
        permissions.canManageBilling
      ),
    },
    {
      label: "loading",
      value: formatValue(
        permissions.loading
      ),
    },
    {
      label: "permissionsReady",
      value: formatValue(
        permissions.permissionsReady
      ),
    },
    {
      label: "roleError",
      value: formatValue(
        permissions.error
      ),
    },
    {
      label: "quota.loading",
      value: formatValue(quota.loading),
    },
    {
      label: "quota.usageLoading",
      value: formatValue(
        quota.usageLoading
      ),
    },
    {
      label: "quota.effectivePlan",
      value: formatValue(
        quota.effectivePlan
      ),
    },
    {
      label: "quota.canUseProFeatures",
      value: formatValue(
        quota.canUseProFeatures
      ),
    },
    {
      label: "quota.deviceLimit",
      value: formatValue(
        quota.limits.maxDevices
      ),
    },
    {
      label: "quota.documentLimit",
      value: formatValue(
        quota.limits.maxDocuments
      ),
    },
    {
      label: "quota.usage.devices",
      value: formatValue(
        String(quota.usage.devices)
      ),
    },
    {
      label: "quota.usage.documents",
      value: formatValue(
        String(quota.usage.documents)
      ),
    },
    {
      label: "quota.remaining.devices",
      value: formatValue(
        quota.remaining.devices === null
          ? "unlimited"
          : String(
              quota.remaining.devices
            )
      ),
    },
    {
      label: "quota.canAddDevice",
      value: formatValue(
        quota.canAddDevice
      ),
    },
    {
      label: "quota.canAddDocument",
      value: formatValue(
        quota.canAddDocument
      ),
    },
    {
      label: "quota.limitReason",
      value: formatValue(
        quota.limitReason
      ),
    },
    {
      label: "hasUnlimitedDevices",
      value: formatValue(
        permissions.hasUnlimitedDevices
      ),
    },
    {
      label: "deviceLimit",
      value: formatValue(
        permissions.deviceLimit
      ),
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen((open) => !open);
        }}
        className="fixed bottom-4 right-4 z-[90] rounded-full border border-border-subtle bg-surface-elevated px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-primary shadow-lg"
        aria-expanded={isOpen}
        aria-controls="entitlement-debug-panel"
      >
        Entitlement Debug
      </button>

      {isOpen && (
        <aside
          id="entitlement-debug-panel"
          className="fixed bottom-16 right-4 z-[90] max-h-[70vh] w-[min(420px,calc(100vw-2rem))] overflow-auto rounded-2xl border border-border-subtle bg-surface-elevated p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-text-primary">
              Entitlement Debug
            </h2>

            <button
              type="button"
              onClick={() => {
                void permissions.refreshPermissions();
                void quota.refreshUsage();
              }}
              className="rounded-lg border border-border-subtle px-2 py-1 text-xs font-medium text-text-secondary"
            >
              Refresh
            </button>
          </div>

          <dl className="space-y-2 text-xs">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.2fr_1fr] gap-2 border-b border-border-subtle/60 pb-2"
              >
                <dt className="font-medium text-text-secondary">
                  {row.label}
                </dt>
                <dd className="break-all font-mono text-text-primary">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </>
  );
}
