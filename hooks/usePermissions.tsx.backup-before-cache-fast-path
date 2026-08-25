"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useDemoMode } from "@/hooks/useDemoMode";
import { useDevelopmentAccess } from "@/hooks/useDevelopmentAccess";
import { useSubscription } from "@/hooks/useSubscription";

import {
  buildDevelopmentPlanInput,
  isDevelopmentEnvironment,
} from "@/lib/permissions/developmentAccess";

import {
  computePermissions,
  normalizeHouseholdRole,
  normalizeRawHouseholdRole,
} from "@/lib/permissions/computePermissions";

import {
  buildPlanFeatureAccess,
  isActiveSubscriptionStatus,
  resolveEffectivePlan,
  resolveUsageLimits,
} from "@/lib/permissions/effectivePlan";

import type {
  RawHouseholdRole,
} from "@/lib/permissions/effectivePlan";

import type {
  HouseholdRole,
} from "@/lib/permissions/types";

import type {
  SafePlanGrantSummary,
} from "@/lib/plan-grants/types";

import type {
  SubscriptionPlan,
} from "@/hooks/useSubscription";

import { supabase } from "@/lib/supabase";
import {
  buildUuidRealtimeFilter,
  isSafeUuid,
} from "@/lib/security/supabaseFilters";

export type {
  FeatureKey,
  HouseholdRole,
  UpgradeReasonCode,
} from "@/lib/permissions/types";

export type {
  RawHouseholdRole,
} from "@/lib/permissions/effectivePlan";

export {
  FREE_DEVICE_LIMIT,
  FREE_DOCUMENT_LIMIT,
  PLAN_FEATURES,
  PLAN_LIMITS,
} from "@/lib/permissions/plans";

export {
  formatSubscriptionStatus,
  getPlanDescription,
  getPlanDisplayName,
  getRoleDisplayName,
} from "@/lib/permissions/effectivePlan";

type PlanGrantPayload = {
  grant: SafePlanGrantSummary | null;
};

type HouseholdAccessPayload =
  | { membership: null }
  | {
      householdId: string;
      householdOwnerId: string;
      rawHouseholdRole: string;
      ownerPlan: string | null;
      ownerStatus: string | null;
      ownerCurrentPeriodEnd: string | null;
      ownerName: string | null;
      ownerPlanSource?:
        | "subscription"
        | "admin_grant"
        | "none";
      effectivePlan?: SubscriptionPlan;
      canUseProFeatures?: boolean;
    };

const PERMISSIONS_CACHE_TTL_MS =
  60_000;

const PERMISSIONS_CACHE_PREFIX =
  "htv:permissions:v1:";

type CachedPermissionPayload = {
  cachedAt: number;
  accessData: HouseholdAccessPayload;
  grant: SafePlanGrantSummary | null;
};

function readPermissionCache(
  userId: string
): CachedPermissionPayload | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  try {
    const key =
      PERMISSIONS_CACHE_PREFIX +
      userId;

    const raw =
      window.sessionStorage.getItem(
        key
      );

    if (!raw) {
      return null;
    }

    const cached =
      JSON.parse(
        raw
      ) as CachedPermissionPayload;

    if (
      !cached?.cachedAt ||
      Date.now() -
        cached.cachedAt >
        PERMISSIONS_CACHE_TTL_MS
    ) {
      window.sessionStorage.removeItem(
        key
      );

      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function writePermissionCache(
  userId: string,
  value: CachedPermissionPayload
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      PERMISSIONS_CACHE_PREFIX +
        userId,
      JSON.stringify(value)
    );
  } catch {
    // Cache failure must never affect access.
  }
}

type PermissionsContextValue = ReturnType<
  typeof usePermissionsState
>;

const PermissionsContext =
  createContext<PermissionsContextValue | null>(
    null
  );

function normalizeRawHouseholdRoleValue(
  value: string | null | undefined
) {
  return normalizeRawHouseholdRole(value);
}

/**
 * Map household membership role strings to frontend capability roles.
 * Returns null while membership is unknown so UI does not flash Viewer Access.
 * Treats both `admin` and `family_admin` as admin.
 */
function normalizeRole(
  value: string | null | undefined
): HouseholdRole | null {
  if (value == null || value.trim() === "") {
    return null;
  }

  const token = value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (
    token === "admin" ||
    token === "family_admin" ||
    token === "household_admin" ||
    token === "owner" ||
    token === "household_owner"
  ) {
    return "admin";
  }

  if (token === "member") {
    return "member";
  }

  if (token === "viewer") {
    return "viewer";
  }

  return normalizeHouseholdRole(value);
}

function normalizeSubscriptionPlan(
  value: string | null | undefined
): SubscriptionPlan {
  const normalized =
    value?.trim().toLowerCase();

  if (normalized === "family") {
    return "family";
  }

  if (normalized === "pro") {
    return "pro";
  }

  return "free";
}

function clearHouseholdState(setters: {
  setRole: (role: HouseholdRole | null) => void;
  setRawHouseholdRole: (
    role: RawHouseholdRole | null
  ) => void;
  setHouseholdId: (id: string | null) => void;
  setHouseholdOwnerId: (
    id: string | null
  ) => void;
  setHouseholdOwnerPlan: (
    plan: SubscriptionPlan | null
  ) => void;
  setHouseholdOwnerStatus: (
    status: string | null
  ) => void;
  setHouseholdOwnerCurrentPeriodEnd: (
    value: string | null
  ) => void;
  setHouseholdOwnerName: (
    name: string | null
  ) => void;
}) {
  setters.setRole(null);
  setters.setRawHouseholdRole(null);
  setters.setHouseholdId(null);
  setters.setHouseholdOwnerId(null);
  setters.setHouseholdOwnerPlan(null);
  setters.setHouseholdOwnerStatus(null);
  setters.setHouseholdOwnerCurrentPeriodEnd(
    null
  );
  setters.setHouseholdOwnerName(null);
}

function applyHouseholdAccess(
  accessData: Exclude<
    HouseholdAccessPayload,
    { membership: null }
  >,
  setters: {
    setRole: (role: HouseholdRole | null) => void;
    setRawHouseholdRole: (
      role: RawHouseholdRole | null
    ) => void;
    setHouseholdId: (id: string | null) => void;
    setHouseholdOwnerId: (
      id: string | null
    ) => void;
    setHouseholdOwnerPlan: (
      plan: SubscriptionPlan | null
    ) => void;
    setHouseholdOwnerStatus: (
      status: string | null
    ) => void;
    setHouseholdOwnerCurrentPeriodEnd: (
      value: string | null
    ) => void;
    setHouseholdOwnerName: (
      name: string | null
    ) => void;
  }
) {
  const resolvedRawRole =
    normalizeRawHouseholdRoleValue(
      accessData.rawHouseholdRole
    );

  setters.setRawHouseholdRole(
    resolvedRawRole
  );

  setters.setRole(
    normalizeRole(
      accessData.rawHouseholdRole
    )
  );

  setters.setHouseholdId(
    accessData.householdId
  );

  setters.setHouseholdOwnerId(
    accessData.householdOwnerId
  );

  setters.setHouseholdOwnerPlan(
    accessData.ownerPlan
      ? normalizeSubscriptionPlan(
          accessData.ownerPlan
        )
      : null
  );

  setters.setHouseholdOwnerStatus(
    accessData.ownerStatus
  );

  setters.setHouseholdOwnerCurrentPeriodEnd(
    accessData.ownerCurrentPeriodEnd
  );

  setters.setHouseholdOwnerName(
    accessData.ownerName
  );
}

function usePermissionsState() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const {
    profile: developmentAccessProfile,
    isOverrideActive:
      isDevelopmentAccessOverrideActive,
  } = useDevelopmentAccess();

  const {
    loading: subscriptionLoading,
    personalPlan,
    status: personalStatus,
    hasPersonalStripeCustomer,
    isAdmin: isPlatformAdmin,
    currentPeriodEnd,
    familyMemberLimit,
    refreshSubscription,
  } = useSubscription();

  const [role, setRole] =
    useState<HouseholdRole | null>(null);

  const [
    rawHouseholdRole,
    setRawHouseholdRole,
  ] = useState<RawHouseholdRole | null>(
    null
  );

  const [householdId, setHouseholdId] =
    useState<string | null>(null);

  const [
    householdOwnerId,
    setHouseholdOwnerId,
  ] = useState<string | null>(null);

  const [
    householdOwnerPlan,
    setHouseholdOwnerPlan,
  ] = useState<SubscriptionPlan | null>(
    null
  );

  const [
    householdOwnerStatus,
    setHouseholdOwnerStatus,
  ] = useState<string | null>(null);

  const [
    householdOwnerCurrentPeriodEnd,
    setHouseholdOwnerCurrentPeriodEnd,
  ] = useState<string | null>(null);

  const [
    householdOwnerName,
    setHouseholdOwnerName,
  ] = useState<string | null>(null);

  const [
    adminGrant,
    setAdminGrant,
  ] = useState<SafePlanGrantSummary | null>(
    null
  );

  const [
    roleLoading,
    setRoleLoading,
  ] = useState(true);

  const [
    roleError,
    setRoleError,
  ] = useState<string | null>(null);

  const [
    householdContextLoaded,
    setHouseholdContextLoaded,
  ] = useState(false);

  /*
   * Once permissions have been resolved for the current user,
   * later verification requests should happen in the background.
   *
   * This prevents tab focus, realtime membership events, and
   * manual permission refreshes from blanking the entire app.
   */
  const householdContextLoadedRef =
    useRef(false);

  const loadedPermissionUserRef =
    useRef<string | null>(null);

  const [
    apiEntitlementSnapshot,
    setApiEntitlementSnapshot,
  ] = useState<{
    ownerPlanSource:
      | "subscription"
      | "admin_grant"
      | "none"
      | null;
    effectivePlan: SubscriptionPlan | null;
    canUseProFeatures: boolean | null;
  }>({
    ownerPlanSource: null,
    effectivePlan: null,
    canUseProFeatures: null,
  });

  const householdSetters = {
    setRole,
    setRawHouseholdRole,
    setHouseholdId,
    setHouseholdOwnerId,
    setHouseholdOwnerPlan,
    setHouseholdOwnerStatus,
    setHouseholdOwnerCurrentPeriodEnd,
    setHouseholdOwnerName,
  };

  const loadHouseholdContext =
    useCallback(async () => {
      if (demoLoading) {
        return;
      }

      const currentUserId =
        user?.id ?? null;

      const isBackgroundRefresh =
        householdContextLoadedRef.current &&
        loadedPermissionUserRef.current ===
          currentUserId;

      try {
        /*
         * Only the first permission resolution for a user should
         * block page rendering.
         *
         * Subsequent checks quietly refresh the existing state.
         */
        if (!isBackgroundRefresh) {
          setRoleLoading(true);
          setHouseholdContextLoaded(false);
        }

        setRoleError(null);

        if (isDemo || !user) {
          clearHouseholdState(
            householdSetters
          );
          setAdminGrant(null);
          setApiEntitlementSnapshot({
            ownerPlanSource: null,
            effectivePlan: null,
            canUseProFeatures: null,
          });
          setHouseholdContextLoaded(true);
          return;
        }

        const cachedPermissions =
          readPermissionCache(
            user.id
          );

        if (
          cachedPermissions &&
          !isBackgroundRefresh
        ) {
          const cachedAccess =
            cachedPermissions.accessData;

          setAdminGrant(
            cachedPermissions.grant
          );

          if (
            "membership" in
              cachedAccess &&
            cachedAccess.membership ===
              null
          ) {
            clearHouseholdState(
              householdSetters
            );

            setApiEntitlementSnapshot({
              ownerPlanSource: null,
              effectivePlan: null,
              canUseProFeatures: null,
            });
          } else if (
            "householdId" in
            cachedAccess
          ) {
            applyHouseholdAccess(
              cachedAccess,
              householdSetters
            );

            setApiEntitlementSnapshot({
              ownerPlanSource:
                cachedAccess
                  .ownerPlanSource ??
                null,

              effectivePlan:
                cachedAccess
                  .effectivePlan ??
                null,

              canUseProFeatures:
                cachedAccess
                  .canUseProFeatures ??
                null,
            });
          }

          householdContextLoadedRef.current =
            true;

          loadedPermissionUserRef.current =
            user.id;

          setHouseholdContextLoaded(
            true
          );

          /*
           * Let the UI paint from the recent
           * snapshot while the network verifies
           * it below.
           */
          setRoleLoading(false);
        }

        const [
          accessResponse,
          grantResponse,
        ] = await Promise.all([
          fetch("/api/household/access", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/user/plan-grant", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (!accessResponse.ok) {
          console.error(
            "Household access API failed:",
            accessResponse.status
          );

          clearHouseholdState(
            householdSetters
          );
          setAdminGrant(null);
          setApiEntitlementSnapshot({
            ownerPlanSource: null,
            effectivePlan: null,
            canUseProFeatures: null,
          });
          setHouseholdContextLoaded(true);

          setRoleError(
            "Unable to verify household access."
          );

          return;
        }

        let resolvedGrant:
          | SafePlanGrantSummary
          | null = null;

        if (grantResponse.ok) {
          const grantData =
            (await grantResponse.json()) as PlanGrantPayload;

          resolvedGrant =
            grantData.grant ?? null;

          setAdminGrant(
            resolvedGrant
          );
        } else {
          setAdminGrant(null);
        }

        const accessData =
          (await accessResponse.json()) as HouseholdAccessPayload;

        /*
         * Only cache a fully successful access
         * verification. A temporary grant API
         * failure should not overwrite a good
         * permission snapshot.
         */
        if (grantResponse.ok) {
          writePermissionCache(
            user.id,
            {
              cachedAt:
                Date.now(),

              accessData,

              grant:
                resolvedGrant,
            }
          );
        }

        if (
          "membership" in accessData &&
          accessData.membership === null
        ) {
          /*
           * No household membership does NOT mean
           * the user is Free.
           *
           * A personal-vault user may still have:
           * - a paid Pro subscription
           * - a complimentary Pro admin grant
           * - a complimentary Family admin grant
           *
           * Leave the API entitlement snapshot
           * unset here so resolveEffectivePlan()
           * remains authoritative for personal
           * subscription + admin-grant access.
           */
          clearHouseholdState(
            householdSetters
          );

          setApiEntitlementSnapshot({
            ownerPlanSource: null,
            effectivePlan: null,
            canUseProFeatures: null,
          });

          setHouseholdContextLoaded(true);

          return;
        }

        if ("householdId" in accessData) {
          applyHouseholdAccess(
            accessData,
            householdSetters
          );

          setApiEntitlementSnapshot({
            ownerPlanSource:
              accessData.ownerPlanSource ??
              null,
            effectivePlan:
              accessData.effectivePlan ??
              null,
            canUseProFeatures:
              accessData.canUseProFeatures ??
              null,
          });
          setHouseholdContextLoaded(true);
        } else {
          clearHouseholdState(
            householdSetters
          );
          setHouseholdContextLoaded(true);
        }
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load permissions.";

        console.error(
          "Permission loading error:",
          caughtError
        );

        setRoleError(message);
        clearHouseholdState(
          householdSetters
        );
        setAdminGrant(null);
        setApiEntitlementSnapshot({
          ownerPlanSource: null,
          effectivePlan: null,
          canUseProFeatures: null,
        });
        setHouseholdContextLoaded(true);
      } finally {
        householdContextLoadedRef.current =
          true;

        loadedPermissionUserRef.current =
          currentUserId;

        setHouseholdContextLoaded(true);

        if (!isBackgroundRefresh) {
          setRoleLoading(false);
        }
      }
    }, [
      demoLoading,
      isDemo,
      user,
    ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHouseholdContext();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadHouseholdContext]);

  useEffect(() => {
    if (!user?.id || isDemo) {
      return;
    }

    if (!isSafeUuid(user.id)) {
      console.warn(
        "Skipping household membership realtime subscription because the user identifier is invalid."
      );
      return;
    }

    const channel = supabase
      .channel(
        `household-membership-${user.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "household_members",
          filter: buildUuidRealtimeFilter(
            "user_id",
            user.id
          ),
        },
        () => {
          void loadHouseholdContext();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    user?.id,
    isDemo,
    loadHouseholdContext,
  ]);

  const lastFocusRefreshRef =
    useRef(0);

  useEffect(() => {
    if (!user?.id || isDemo) {
      return;
    }

    function handleWindowFocus() {
      const now = Date.now();

      if (
        now - lastFocusRefreshRef.current <
        60000
      ) {
        return;
      }

      lastFocusRefreshRef.current = now;
      void loadHouseholdContext();
    }

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };
  }, [
    user?.id,
    isDemo,
    loadHouseholdContext,
  ]);

  const loading =
    demoLoading ||
    subscriptionLoading ||
    roleLoading ||
    (Boolean(user) &&
      !isDemo &&
      !householdContextLoaded);

  const permissionsReady = !loading;

  const realHouseholdId = householdId;

  const basePlanInput = useMemo(
    () => ({
      isDemo,
      isPlatformAdmin,
      userId: user?.id ?? null,
      personalPlan,
      personalStatus,
      personalCurrentPeriodEnd:
        currentPeriodEnd,
      hasPersonalStripeCustomer,
      householdId,
      householdOwnerId,
      householdOwnerPlan,
      householdOwnerStatus,
      householdOwnerCurrentPeriodEnd,
      householdOwnerName,
      rawHouseholdRole,
      adminGrant: adminGrant
        ? {
            plan: adminGrant.plan,
            status: "active" as const,
            startsAt: new Date(0).toISOString(),
            expiresAt: adminGrant.expiresAt,
            reason: adminGrant.reason,
            notes: null,
          }
        : null,
    }),
    [
      isDemo,
      isPlatformAdmin,
      user?.id,
      personalPlan,
      personalStatus,
      currentPeriodEnd,
      hasPersonalStripeCustomer,
      householdId,
      householdOwnerId,
      householdOwnerPlan,
      householdOwnerStatus,
      householdOwnerCurrentPeriodEnd,
      householdOwnerName,
      rawHouseholdRole,
      adminGrant,
    ]
  );

  const developmentPlanInput = useMemo(
    () => {
      if (
        !isDevelopmentEnvironment() ||
        developmentAccessProfile ===
          "real"
      ) {
        return basePlanInput;
      }

      return buildDevelopmentPlanInput(
        developmentAccessProfile,
        basePlanInput
      );
    },
    [
      basePlanInput,
      developmentAccessProfile,
    ]
  );

  const effectiveAccess = useMemo(
    () =>
      resolveEffectivePlan(
        developmentPlanInput
      ),
    [developmentPlanInput]
  );

  const effectiveIsDemo =
    isDevelopmentAccessOverrideActive
      ? developmentPlanInput.isDemo
      : isDemo;

  const effectiveIsPlatformAdmin =
    isDevelopmentAccessOverrideActive
      ? developmentPlanInput.isPlatformAdmin
      : isPlatformAdmin;

  const effectiveRole = useMemo(() => {
    if (
      isDevelopmentAccessOverrideActive &&
      developmentPlanInput.rawHouseholdRole
    ) {
      return normalizeHouseholdRole(
        developmentPlanInput.rawHouseholdRole
      );
    }

    return role;
  }, [
    isDevelopmentAccessOverrideActive,
    developmentPlanInput.rawHouseholdRole,
    role,
  ]);

  const effectiveRawHouseholdRole =
    isDevelopmentAccessOverrideActive &&
    developmentPlanInput.rawHouseholdRole
      ? developmentPlanInput.rawHouseholdRole
      : rawHouseholdRole;

  const permissionHouseholdId =
    isDevelopmentAccessOverrideActive
      ? developmentPlanInput.householdId
      : householdId;

  const {
    effectivePlan,
    householdPlan,
    planDisplayName,
    roleDisplayName,
    hasFamilyFeatureAccess,
    hasPremiumFeatureAccess,
    isFamilyPlanMember,
    isFamilyPlanAdmin,
    isFamilyMember,
    isFamilyViewer,
    isBillingOwner,
    canManageBilling,
    billingManagedByHousehold,
    billingOwnerName,
    inheritsFamilyPlan,
    inheritsProPlan,
    inheritsHouseholdPlan,
    householdSubscriptionOwnerId,
    canUseProFeatures,
    effectiveStatus,
    effectivePlanSource,
    adminGrantPlan,
    adminGrantExpiresAt,
    hasActiveAdminGrant,
    featureAccess,
  } = effectiveAccess;

  const authoritativeEntitlement =
    useMemo(() => {
      const apiCanUsePro =
        apiEntitlementSnapshot.canUseProFeatures;
      const apiPlan =
        apiEntitlementSnapshot.effectivePlan;

      return {
        canUseProFeatures:
          apiCanUsePro ??
          canUseProFeatures,
        effectivePlan:
          apiPlan ?? effectivePlan,
      };
    }, [
      apiEntitlementSnapshot.canUseProFeatures,
      apiEntitlementSnapshot.effectivePlan,
      canUseProFeatures,
      effectivePlan,
    ]);

  const usageLimits = useMemo(
    () =>
      resolveUsageLimits(
        authoritativeEntitlement.effectivePlan,
        effectiveIsPlatformAdmin,
        hasFamilyFeatureAccess ||
          authoritativeEntitlement.effectivePlan ===
            "family",
        authoritativeEntitlement.canUseProFeatures ||
          hasPremiumFeatureAccess
      ),
    [
      authoritativeEntitlement.effectivePlan,
      authoritativeEntitlement.canUseProFeatures,
      effectiveIsPlatformAdmin,
      hasFamilyFeatureAccess,
      hasPremiumFeatureAccess,
    ]
  );

  const isActive =
    isActiveSubscriptionStatus(
      effectiveStatus
    ) ||
    hasFamilyFeatureAccess ||
    hasPremiumFeatureAccess;

  const isPro =
    authoritativeEntitlement.effectivePlan ===
      "pro" &&
    authoritativeEntitlement.canUseProFeatures;

  const isFamily =
    hasFamilyFeatureAccess;

  const isFree =
    !effectiveIsPlatformAdmin &&
    !authoritativeEntitlement.canUseProFeatures;

  const isTrial =
    effectiveStatus === "trialing";

  const canUsePremiumFeatures =
    effectiveIsPlatformAdmin ||
    authoritativeEntitlement.canUseProFeatures;

  const canUseFamilySharing =
    effectiveIsPlatformAdmin ||
    hasFamilyFeatureAccess;

  const mergedFeatureAccess = useMemo(
    () => {
      if (
        !authoritativeEntitlement.canUseProFeatures
      ) {
        return featureAccess;
      }

      const planForFeatures =
        authoritativeEntitlement.effectivePlan ===
        "family"
          ? "family"
          : "pro";

      return buildPlanFeatureAccess(
        planForFeatures,
        effectiveIsPlatformAdmin
      );
    },
    [
      authoritativeEntitlement.canUseProFeatures,
      authoritativeEntitlement.effectivePlan,
      featureAccess,
      effectiveIsPlatformAdmin,
    ]
  );

  const mergedInheritsProPlan =
    apiEntitlementSnapshot.canUseProFeatures ===
      true &&
    apiEntitlementSnapshot.effectivePlan === "pro"
      ? true
      : inheritsProPlan;

  const mergedInheritsFamilyPlan =
    apiEntitlementSnapshot.canUseProFeatures ===
      true &&
    apiEntitlementSnapshot.effectivePlan ===
      "family"
      ? true
      : inheritsFamilyPlan;

  const mergedInheritsHouseholdPlan =
    apiEntitlementSnapshot.canUseProFeatures ===
      true &&
    (apiEntitlementSnapshot.effectivePlan ===
      "pro" ||
      apiEntitlementSnapshot.effectivePlan ===
        "family")
      ? true
      : inheritsHouseholdPlan;

  const limits = usageLimits;

  const permissions = useMemo(
    () =>
      computePermissions({
        user,
        isDemo: effectiveIsDemo,
        role: effectiveRole,
        rawHouseholdRole:
          effectiveRawHouseholdRole,
        householdId:
          permissionHouseholdId,
        plan: authoritativeEntitlement.effectivePlan,
        isPlatformAdmin:
          effectiveIsPlatformAdmin,
        canUsePremiumFeatures,
        canUseFamilySharing,
        hasFamilyFeatureAccess,
        billingManagedByHousehold,
        inheritsFamilyPlan:
          mergedInheritsFamilyPlan,
        inheritsProPlan:
          mergedInheritsProPlan,
        inheritsHouseholdPlan:
          mergedInheritsHouseholdPlan,
        featureAccess:
          mergedFeatureAccess,
        hasUnlimitedDevices:
          limits.maxDevices === null,
        hasUnlimitedDocuments:
          limits.maxDocuments === null,
        deviceLimit: limits.maxDevices,
        documentLimit:
          limits.maxDocuments,
        canManageBilling,
      }),
    [
      user,
      effectiveIsDemo,
      effectiveRole,
      effectiveRawHouseholdRole,
      permissionHouseholdId,
      authoritativeEntitlement.effectivePlan,
      effectiveIsPlatformAdmin,
      canUsePremiumFeatures,
      canUseFamilySharing,
      hasFamilyFeatureAccess,
      billingManagedByHousehold,
      mergedInheritsFamilyPlan,
      mergedInheritsProPlan,
      mergedInheritsHouseholdPlan,
      mergedFeatureAccess,
      limits.maxDevices,
      limits.maxDocuments,
      canManageBilling,
    ]
  );

  const refreshPermissions =
    useCallback(async () => {
      await refreshSubscription();
      await loadHouseholdContext();
    }, [
      refreshSubscription,
      loadHouseholdContext,
    ]);

  const vaultContextLabel =
    effectiveIsDemo
      ? null
      : permissions.isPersonalVault
        ? "Personal Vault"
        : roleDisplayName;

  return {
    user,
    isDemo: effectiveIsDemo,
    role: effectiveRole,
    vaultContextLabel,
    rawHouseholdRole:
      effectiveRawHouseholdRole,
    householdId: realHouseholdId,
    realHouseholdId,
    householdOwnerId,
    householdOwnerPlan,
    householdOwnerStatus,
    householdOwnerName,
    loading,
    permissionsReady,
    error: roleError,
    apiEntitlementSnapshot,

    developmentAccessProfile,
    isDevelopmentAccessOverrideActive,

    personalPlan,
    plan: authoritativeEntitlement.effectivePlan,
    effectivePlan:
      authoritativeEntitlement.effectivePlan,
    householdPlan,
    planDisplayName,
    roleDisplayName,
    hasFamilyFeatureAccess,
    hasPremiumFeatureAccess,
    isFamilyPlanMember,
    isFamilyPlanAdmin,
    isFamilyMember,
    isFamilyViewer,
    isBillingOwner,
    billingManagedByHousehold,
    billingOwnerName,
    inheritsFamilyPlan,
    inheritsProPlan,
    inheritsHouseholdPlan,
    householdSubscriptionOwnerId,
    canUseProFeatures:
      authoritativeEntitlement.canUseProFeatures,
    effectivePlanSource,
    adminGrantPlan,
    adminGrantExpiresAt,
    hasActiveAdminGrant,
    adminGrant,
    usageLimits,
    featureAccess,

    status: effectiveStatus,
    effectiveStatus,
    personalStatus,
    isActive,
    isFree,
    isPro,
    isFamily,
    isTrial,
    trialEndsAt: isTrial
      ? inheritsHouseholdPlan
        ? householdOwnerCurrentPeriodEnd
        : currentPeriodEnd
      : null,
    isPlatformAdmin:
      effectiveIsPlatformAdmin,
    /** Real `profiles.is_admin` only — never development-access simulation. */
    isVerifiedPlatformAdmin:
      isPlatformAdmin,
    canUsePremiumFeatures,
    canUseFamilySharing,
    hasUnlimitedDevices:
      limits.maxDevices === null,
    hasUnlimitedDocuments:
      limits.maxDocuments === null,
    deviceLimit: limits.maxDevices,
    documentLimit: limits.maxDocuments,
    familyMemberLimit,
    currentPeriodEnd,

    ...permissions,

    refreshPermissions,
  };
}

export function PermissionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = usePermissionsState();

  return (
    <PermissionsContext.Provider
      value={value}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(
    PermissionsContext
  );

  if (!context) {
    throw new Error(
      "usePermissions must be used within a PermissionsProvider."
    );
  }

  return context;
}
