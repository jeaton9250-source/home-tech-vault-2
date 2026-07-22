import type { SupabaseClient } from "@supabase/supabase-js";

import { applyHouseholdScope } from "@/lib/data/householdScope";
import {
  resolveUsageLimits,
  type UsageLimits,
} from "@/lib/permissions/effectivePlan";
import type { SubscriptionPlan } from "@/hooks/useSubscription";

export type HouseholdUsageCounts = {
  devices: number;
  documents: number;
  maintenance: number;
  photos: number;
  subscriptions: number;
};

export type HouseholdLimitReason =
  | "loading"
  | "allowed"
  | "viewer_read_only"
  | "demo_read_only"
  | "free_device_limit"
  | "free_document_limit"
  | "household_device_limit"
  | "household_document_limit";

export type HouseholdQuotaLimits = UsageLimits;

export type HouseholdQuotaState = {
  loading: boolean;
  entitlementLoading: boolean;
  usageLoading: boolean;
  householdId: string | null;
  effectivePlan: SubscriptionPlan;
  canUseProFeatures: boolean;
  limits: HouseholdQuotaLimits;
  usage: HouseholdUsageCounts;
  remaining: {
    devices: number | null;
    documents: number | null;
  };
  canAddDevice: boolean;
  canAddDocument: boolean;
  canAddPhoto: boolean;
  canAddMaintenanceTask: boolean;
  canAddSubscription: boolean;
  deviceLimitReached: boolean;
  documentLimitReached: boolean;
  limitReason: HouseholdLimitReason;
};

const EMPTY_USAGE: HouseholdUsageCounts = {
  devices: 0,
  documents: 0,
  maintenance: 0,
  photos: 0,
  subscriptions: 0,
};

export function resolveHouseholdQuotaLimits(options: {
  effectivePlan: SubscriptionPlan;
  isPlatformAdmin: boolean;
  hasFamilyFeatureAccess: boolean;
  canUseProFeatures: boolean;
}): HouseholdQuotaLimits {
  if (options.canUseProFeatures) {
    return resolveUsageLimits(
      options.effectivePlan === "family"
        ? "family"
        : "pro",
      options.isPlatformAdmin,
      options.hasFamilyFeatureAccess ||
        options.effectivePlan === "family",
      true
    );
  }

  return resolveUsageLimits(
    options.effectivePlan,
    options.isPlatformAdmin,
    options.hasFamilyFeatureAccess,
    false
  );
}

function remainingAllowance(
  limit: number | null,
  count: number
): number | null {
  if (limit === null) {
    return null;
  }

  return Math.max(limit - count, 0);
}

function isAtLimit(
  limit: number | null,
  count: number
): boolean {
  return limit !== null && count >= limit;
}

export function evaluateHouseholdQuota(options: {
  loading: boolean;
  entitlementLoading: boolean;
  usageLoading: boolean;
  isDemo: boolean;
  canCreate: boolean;
  canUpload: boolean;
  isViewer: boolean;
  householdId: string | null;
  effectivePlan: SubscriptionPlan;
  canUseProFeatures: boolean;
  limits: HouseholdQuotaLimits;
  usage: HouseholdUsageCounts;
}): HouseholdQuotaState {
  const loading =
    options.loading ||
    options.entitlementLoading ||
    options.usageLoading;

  const remaining = {
    devices: remainingAllowance(
      options.limits.maxDevices,
      options.usage.devices
    ),
    documents: remainingAllowance(
      options.limits.maxDocuments,
      options.usage.documents
    ),
  };

  const deviceLimitReached =
    !loading &&
    isAtLimit(
      options.limits.maxDevices,
      options.usage.devices
    );

  const documentLimitReached =
    !loading &&
    isAtLimit(
      options.limits.maxDocuments,
      options.usage.documents
    );

  let limitReason: HouseholdLimitReason =
    "allowed";

  if (loading) {
    limitReason = "loading";
  } else if (options.isDemo) {
    limitReason = "demo_read_only";
  } else if (options.isViewer) {
    limitReason = "viewer_read_only";
  } else if (deviceLimitReached) {
    limitReason = options.canUseProFeatures
      ? "household_device_limit"
      : "free_device_limit";
  } else if (documentLimitReached) {
    limitReason = options.canUseProFeatures
      ? "household_document_limit"
      : "free_document_limit";
  }

  const roleAllowsCreate =
    options.canCreate && !options.isViewer;

  const canAddDevice =
    !loading &&
    roleAllowsCreate &&
    !deviceLimitReached;

  const canAddDocument =
    !loading &&
    options.canUpload &&
    !options.isViewer &&
    !documentLimitReached;

  const canAddPhoto = canAddDocument;
  const canAddMaintenanceTask = canAddDevice;
  const canAddSubscription = canAddDevice;

  return {
    loading,
    entitlementLoading:
      options.entitlementLoading,
    usageLoading: options.usageLoading,
    householdId: options.householdId,
    effectivePlan: options.effectivePlan,
    canUseProFeatures:
      options.canUseProFeatures,
    limits: options.limits,
    usage: options.usage,
    remaining,
    canAddDevice,
    canAddDocument,
    canAddPhoto,
    canAddMaintenanceTask,
    canAddSubscription,
    deviceLimitReached,
    documentLimitReached,
    limitReason,
  };
}

async function countScopedRows(
  client: SupabaseClient,
  table:
    | "devices"
    | "documents"
    | "maintenance_tasks"
    | "device_images"
    | "subscriptions",
  householdId: string | null | undefined,
  userId: string
): Promise<number> {
  const { count, error } =
    await applyHouseholdScope(
      client
        .from(table)
        .select("*", {
          count: "exact",
          head: true,
        }),
      householdId,
      userId
    );

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function loadHouseholdUsageCounts(
  client: SupabaseClient,
  householdId: string | null | undefined,
  userId: string
): Promise<HouseholdUsageCounts> {
  const [
    devices,
    documents,
    maintenance,
    photos,
    subscriptions,
  ] = await Promise.all([
    countScopedRows(
      client,
      "devices",
      householdId,
      userId
    ),
    countScopedRows(
      client,
      "documents",
      householdId,
      userId
    ),
    countScopedRows(
      client,
      "maintenance_tasks",
      householdId,
      userId
    ),
    countScopedRows(
      client,
      "device_images",
      householdId,
      userId
    ),
    countScopedRows(
      client,
      "subscriptions",
      householdId,
      userId
    ),
  ]);

  return {
    devices,
    documents,
    maintenance,
    photos,
    subscriptions,
  };
}

export function getHouseholdLimitMessage(
  reason: HouseholdLimitReason,
  options?: {
    inheritsHouseholdPlan?: boolean;
    billingManagedByHousehold?: boolean;
    canManageBilling?: boolean;
  }
): {
  title: string;
  description: string;
  actionLabel: string | null;
  actionHref: string | null;
} {
  switch (reason) {
    case "loading":
      return {
        title: "Checking allowance",
        description:
          "Loading your household plan and usage.",
        actionLabel: null,
        actionHref: null,
      };

    case "viewer_read_only":
      return {
        title: "Viewer access is read-only",
        description:
          "Your Viewer role can browse this household, but only members and admins can add or edit content. Contact a household admin if you need write access.",
        actionLabel: "Contact a household admin",
        actionHref: "/family",
      };

    case "demo_read_only":
      return {
        title: "Demo mode is read-only",
        description:
          "Create your vault to save and manage your own home technology.",
        actionLabel: "Create your vault",
        actionHref: "/signup",
      };

    case "free_device_limit":
      return {
        title:
          "You've reached the Free plan device limit",
        description:
          "This household has used all Free plan device slots. Upgrade the household to add more devices.",
        actionLabel: options?.canManageBilling
          ? "Upgrade Household"
          : "View household billing",
        actionHref: options?.canManageBilling
          ? "/upgrade?reason=device-limit"
          : "/family",
      };

    case "free_document_limit":
      return {
        title:
          "You've reached the Free plan document limit",
        description:
          "This household has used all Free plan document slots. Upgrade the household to upload more documents.",
        actionLabel: options?.canManageBilling
          ? "Upgrade Household"
          : "View household billing",
        actionHref: options?.canManageBilling
          ? "/upgrade?reason=document-limit"
          : "/family",
      };

    case "household_device_limit":
      return {
        title:
          "This household has reached its Pro device limit",
        description:
          "The household allowance for devices is full. Contact a household admin if you need more capacity.",
        actionLabel: "Contact a household admin",
        actionHref: "/family",
      };

    case "household_document_limit":
      return {
        title:
          "This household has reached its Pro document limit",
        description:
          "The household allowance for documents is full. Contact a household admin if you need more capacity.",
        actionLabel: "Contact a household admin",
        actionHref: "/family",
      };

    default:
      return {
        title: "You can add more",
        description:
          "Your household allowance has room for more content.",
        actionLabel: null,
        actionHref: null,
      };
  }
}

export { EMPTY_USAGE };
