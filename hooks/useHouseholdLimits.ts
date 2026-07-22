"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions";
import {
  EMPTY_USAGE,
  evaluateHouseholdQuota,
  loadHouseholdUsageCounts,
  resolveHouseholdQuotaLimits,
  type HouseholdQuotaState,
} from "@/lib/permissions/householdQuota";

export type {
  HouseholdLimitReason,
  HouseholdQuotaState,
  HouseholdUsageCounts,
} from "@/lib/permissions/householdQuota";

export {
  getHouseholdLimitMessage,
} from "@/lib/permissions/householdQuota";

export function useHouseholdLimits(): HouseholdQuotaState & {
  refreshUsage: () => Promise<void>;
  personalPlan: ReturnType<
    typeof usePermissions
  >["personalPlan"];
  role: ReturnType<
    typeof usePermissions
  >["role"];
  rawHouseholdRole: ReturnType<
    typeof usePermissions
  >["rawHouseholdRole"];
  canCreate: boolean;
  canUpload: boolean;
  isViewer: boolean;
  isDemo: boolean;
  billingManagedByHousehold: boolean;
  inheritsHouseholdPlan: boolean;
  canManageBilling: boolean;
  permissionsReady: boolean;
} {
  const permissions = usePermissions();

  const [
    usage,
    setUsage,
  ] = useState(EMPTY_USAGE);

  const [
    usageLoading,
    setUsageLoading,
  ] = useState(true);

  const [
    usageError,
    setUsageError,
  ] = useState<string | null>(null);

  const authoritativeEntitlement =
    useMemo(() => {
      const apiCanUsePro =
        permissions.apiEntitlementSnapshot
          ?.canUseProFeatures;

      const apiPlan =
        permissions.apiEntitlementSnapshot
          ?.effectivePlan;

      const mergedCanUseProFeatures =
        apiCanUsePro ??
        permissions.canUseProFeatures;

      const mergedEffectivePlan =
        apiPlan ??
        permissions.effectivePlan;

      return {
        canUseProFeatures:
          mergedCanUseProFeatures,
        effectivePlan:
          mergedEffectivePlan,
      };
    }, [
      permissions.apiEntitlementSnapshot
        ?.canUseProFeatures,
      permissions.apiEntitlementSnapshot
        ?.effectivePlan,
      permissions.canUseProFeatures,
      permissions.effectivePlan,
    ]);

  const limits = useMemo(
    () =>
      resolveHouseholdQuotaLimits({
        effectivePlan:
          authoritativeEntitlement.effectivePlan,
        isPlatformAdmin:
          permissions.isPlatformAdmin,
        hasFamilyFeatureAccess:
          permissions.hasFamilyFeatureAccess,
        canUseProFeatures:
          authoritativeEntitlement.canUseProFeatures,
      }),
    [
      authoritativeEntitlement.effectivePlan,
      authoritativeEntitlement.canUseProFeatures,
      permissions.isPlatformAdmin,
      permissions.hasFamilyFeatureAccess,
    ]
  );

  const refreshUsage =
    useCallback(async () => {
      if (
        permissions.loading ||
        permissions.isDemo ||
        !permissions.user
      ) {
        setUsage(EMPTY_USAGE);
        setUsageLoading(false);
        return;
      }

      try {
        setUsageLoading(true);
        setUsageError(null);

        const counts =
          await loadHouseholdUsageCounts(
            supabase,
            permissions.householdId,
            permissions.user.id
          );

        setUsage(counts);
      } catch (error) {
        console.error(
          "Unable to load household usage:",
          error
        );

        setUsageError(
          error instanceof Error
            ? error.message
            : "Unable to load household usage."
        );
      } finally {
        setUsageLoading(false);
      }
    }, [
      permissions.loading,
      permissions.isDemo,
      permissions.user,
      permissions.householdId,
    ]);

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage]);

  const quota = useMemo(
    () =>
      evaluateHouseholdQuota({
        loading:
          permissions.loading ||
          usageLoading,
        entitlementLoading:
          permissions.loading,
        usageLoading,
        isDemo: permissions.isDemo,
        canCreate: permissions.canCreate,
        canUpload: permissions.canUpload,
        isViewer: permissions.isViewer,
        householdId:
          permissions.householdId,
        effectivePlan:
          authoritativeEntitlement.effectivePlan,
        canUseProFeatures:
          authoritativeEntitlement.canUseProFeatures,
        limits,
        usage,
      }),
    [
      permissions.loading,
      permissions.isDemo,
      permissions.canCreate,
      permissions.canUpload,
      permissions.isViewer,
      permissions.householdId,
      authoritativeEntitlement.effectivePlan,
      authoritativeEntitlement.canUseProFeatures,
      limits,
      usage,
      usageLoading,
    ]
  );

  return {
    ...quota,
    refreshUsage,
    personalPlan:
      permissions.personalPlan,
    role: permissions.role,
    rawHouseholdRole:
      permissions.rawHouseholdRole,
    canCreate: permissions.canCreate,
    canUpload: permissions.canUpload,
    isViewer: permissions.isViewer,
    isDemo: permissions.isDemo,
    billingManagedByHousehold:
      permissions.billingManagedByHousehold,
    inheritsHouseholdPlan:
      permissions.inheritsHouseholdPlan,
    canManageBilling:
      permissions.canManageBilling,
    permissionsReady:
      permissions.permissionsReady,
  };
}
