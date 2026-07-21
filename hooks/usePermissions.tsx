"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
} from "@/lib/permissions/computePermissions";

import {
  isActiveSubscriptionStatus,
  resolveEffectivePlan,
} from "@/lib/permissions/effectivePlan";

import type {
  RawHouseholdRole,
} from "@/lib/permissions/effectivePlan";

import type {
  FeatureKey,
  HouseholdRole,
} from "@/lib/permissions/types";

import type {
  SubscriptionPlan,
} from "@/hooks/useSubscription";

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

function normalizeRawHouseholdRole(
  value: string | null | undefined
): RawHouseholdRole | null {
  if (
    value === "owner" ||
    value === "admin" ||
    value === "member" ||
    value === "viewer"
  ) {
    return value;
  }

  return null;
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
  setRole: (role: HouseholdRole) => void;
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
  setters.setRole("viewer");
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
    setRole: (role: HouseholdRole) => void;
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
    normalizeRawHouseholdRole(
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
    useState<HouseholdRole>("viewer");

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
          return;
        }

        const response = await fetch(
          "/api/household/access",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          console.error(
            "Household access API failed:",
            response.status
          );

          clearHouseholdState(
            householdSetters
          );

          setRoleError(
            "Unable to verify household access."
          );

          return;
        }

        const accessData =
          (await response.json()) as HouseholdAccessPayload;

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
    void loadHouseholdContext();
  }, [loadHouseholdContext]);

  const loading =
    demoLoading ||
    subscriptionLoading ||
    roleLoading;

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
    effectiveStatus,
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
    (isActive || hasPremiumFeatureAccess);

  const isFamily =
    hasFamilyFeatureAccess;

  const isFree =
    !effectiveIsPlatformAdmin &&
    !hasPremiumFeatureAccess;

  const canUsePremiumFeatures =
    effectiveIsPlatformAdmin ||
    hasPremiumFeatureAccess;

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

  return {
    user,
    isDemo: effectiveIsDemo,
    role: effectiveRole,
    rawHouseholdRole:
      effectiveRawHouseholdRole,
    householdId: realHouseholdId,
    realHouseholdId,
    householdOwnerId,
    loading,
    error: roleError,

    developmentAccessProfile,
    isDevelopmentAccessOverrideActive,

    personalPlan,
    plan: effectivePlan,
    effectivePlan,
    householdPlan,
    planDisplayName,
    householdRole:
      effectiveRawHouseholdRole,
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
    usageLimits,
    featureAccess,

    status: effectiveStatus,
    effectiveStatus,
    personalStatus,
    isActive,
    isFree,
    isPro,
    isFamily,
    isPlatformAdmin:
      effectiveIsPlatformAdmin,
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
