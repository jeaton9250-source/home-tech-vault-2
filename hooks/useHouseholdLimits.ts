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
  type HouseholdUsageCounts,
} from "@/lib/permissions/householdQuota";

export type {
  HouseholdLimitReason,
  HouseholdQuotaState,
  HouseholdUsageCounts,
} from "@/lib/permissions/householdQuota";

export {
  getHouseholdLimitMessage,
} from "@/lib/permissions/householdQuota";

const USAGE_CACHE_TTL_MS =
  60_000;

const USAGE_CACHE_PREFIX =
  "htv:usage:v1:";

type CachedUsage = {
  cachedAt: number;
  usage: HouseholdUsageCounts;
};

const usageMemoryCache =
  new Map<string, CachedUsage>();

const usageInFlight =
  new Map<
    string,
    Promise<HouseholdUsageCounts>
  >();

function getUsageCacheKey(
  userId: string,
  householdId:
    | string
    | null
    | undefined
) {
  return [
    userId,
    householdId ??
      "personal",
  ].join(":");
}

function readUsageSessionCache(
  key: string
): CachedUsage | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  try {
    const raw =
      window.sessionStorage.getItem(
        USAGE_CACHE_PREFIX +
          key
      );

    if (!raw) {
      return null;
    }

    const cached =
      JSON.parse(
        raw
      ) as CachedUsage;

    if (
      !cached?.cachedAt ||
      Date.now() -
        cached.cachedAt >
        USAGE_CACHE_TTL_MS
    ) {
      window.sessionStorage.removeItem(
        USAGE_CACHE_PREFIX +
          key
      );

      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function writeUsageCache(
  key: string,
  cached: CachedUsage
) {
  usageMemoryCache.set(
    key,
    cached
  );

  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      USAGE_CACHE_PREFIX +
        key,
      JSON.stringify(cached)
    );
  } catch {
    // Usage caching is optional.
  }
}

async function loadUsageWithCache(
  userId: string,
  householdId:
    | string
    | null
    | undefined,
  forceRefresh = false
): Promise<HouseholdUsageCounts> {
  const key =
    getUsageCacheKey(
      userId,
      householdId
    );

  if (!forceRefresh) {
    const memory =
      usageMemoryCache.get(
        key
      );

    if (
      memory &&
      Date.now() -
        memory.cachedAt <=
        USAGE_CACHE_TTL_MS
    ) {
      return memory.usage;
    }

    const stored =
      readUsageSessionCache(
        key
      );

    if (stored) {
      usageMemoryCache.set(
        key,
        stored
      );

      return stored.usage;
    }
  }

  const existingRequest =
    usageInFlight.get(key);

  if (existingRequest) {
    return existingRequest;
  }

  const request =
    loadHouseholdUsageCounts(
      supabase,
      householdId,
      userId
    )
      .then((usage) => {
        writeUsageCache(
          key,
          {
            cachedAt:
              Date.now(),
            usage,
          }
        );

        return usage;
      })
      .finally(() => {
        usageInFlight.delete(
          key
        );
      });

  usageInFlight.set(
    key,
    request
  );

  return request;
}

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

  const loadUsage =
    useCallback(
      async (
        forceRefresh:
          boolean
      ) => {
        if (
          permissions.loading ||
          permissions.isDemo ||
          !permissions.user
        ) {
          setUsage(
            EMPTY_USAGE
          );

          setUsageLoading(
            false
          );

          return;
        }

        try {
          setUsageLoading(
            true
          );

          setUsageError(
            null
          );

          const counts =
            await loadUsageWithCache(
              permissions.user.id,
              permissions.householdId,
              forceRefresh
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
          setUsageLoading(
            false
          );
        }
      },
      [
        permissions.loading,
        permissions.isDemo,
        permissions.user,
        permissions.householdId,
      ]
    );

  const refreshUsage =
    useCallback(async () => {
      /*
       * Explicit refreshes bypass the 60-second
       * cache. This keeps counts accurate after
       * a create/upload/delete action.
       */
      await loadUsage(true);
    }, [loadUsage]);

  useEffect(() => {
    /*
     * Normal navigation can reuse recent counts.
     * All hook instances share the same in-flight
     * request, preventing five-count-query bursts
     * from being duplicated.
     */
    void loadUsage(false);
  }, [loadUsage]);

  const quota = useMemo(
    () =>
      evaluateHouseholdQuota({
        /*
         * Usage is refreshed in the background.
         *
         * Server actions remain authoritative for mutations, so
         * a usage-count request does not need to freeze the UI.
         */
        loading:
          permissions.loading,
        entitlementLoading:
          permissions.loading,
        usageLoading: false,
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

    /*
     * Expose the real background usage state for diagnostics
     * without making quota.loading block the page.
     */
    loading:
      permissions.loading,

    entitlementLoading:
      permissions.loading,

    usageLoading,

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
