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
  isActiveSubscriptionStatus,
  resolveEffectivePlan,
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
    };

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
    normalizeHouseholdRole(
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
      try {
        setRoleLoading(true);
        setRoleError(null);

        if (demoLoading) {
          return;
        }

        if (isDemo || !user) {
          clearHouseholdState(
            householdSetters
          );
          setAdminGrant(null);
          return;
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

          setRoleError(
            "Unable to verify household access."
          );

          return;
        }

        if (grantResponse.ok) {
          const grantData =
            (await grantResponse.json()) as PlanGrantPayload;

          setAdminGrant(
            grantData.grant ?? null
          );
        } else {
          setAdminGrant(null);
        }

        const accessData =
          (await accessResponse.json()) as HouseholdAccessPayload;

        if (
          "membership" in accessData &&
          accessData.membership === null
        ) {
          clearHouseholdState(
            householdSetters
          );

          return;
        }

        if ("householdId" in accessData) {
          applyHouseholdAccess(
            accessData,
            householdSetters
          );
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
      } finally {
        if (!demoLoading) {
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
          filter: `user_id=eq.${user.id}`,
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
        5000
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
    roleLoading;

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
      isDevelopmentAccessOverrideActive
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
    isDevelopmentAccessOverrideActive
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
    usageLimits,
    featureAccess,
  } = effectiveAccess;

  const isActive =
    isActiveSubscriptionStatus(
      effectiveStatus
    ) ||
    hasFamilyFeatureAccess ||
    hasPremiumFeatureAccess;

  const isPro =
    effectivePlan === "pro" &&
    canUseProFeatures;

  const isFamily =
    hasFamilyFeatureAccess;

  const isFree =
    !effectiveIsPlatformAdmin &&
    !canUseProFeatures;

  const isTrial =
    effectiveStatus === "trialing";

  const canUsePremiumFeatures =
    effectiveIsPlatformAdmin ||
    canUseProFeatures;

  const canUseFamilySharing =
    effectiveIsPlatformAdmin ||
    hasFamilyFeatureAccess;

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
        plan: effectivePlan,
        isPlatformAdmin:
          effectiveIsPlatformAdmin,
        canUsePremiumFeatures,
        canUseFamilySharing,
        hasFamilyFeatureAccess,
        billingManagedByHousehold,
        inheritsFamilyPlan,
        featureAccess,
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
      effectivePlan,
      effectiveIsPlatformAdmin,
      canUsePremiumFeatures,
      canUseFamilySharing,
      hasFamilyFeatureAccess,
      billingManagedByHousehold,
      inheritsFamilyPlan,
      featureAccess,
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
    loading,
    permissionsReady,
    error: roleError,

    developmentAccessProfile,
    isDevelopmentAccessOverrideActive,

    personalPlan,
    plan: effectivePlan,
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
    billingManagedByHousehold,
    billingOwnerName,
    inheritsFamilyPlan,
    inheritsProPlan,
    inheritsHouseholdPlan,
    householdSubscriptionOwnerId,
    canUseProFeatures,
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
