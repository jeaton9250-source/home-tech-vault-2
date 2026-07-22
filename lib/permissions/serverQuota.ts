import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { applyHouseholdScope } from "@/lib/data/householdScope";
import {
  evaluateHouseholdQuota,
  loadHouseholdUsageCounts,
  resolveHouseholdQuotaLimits,
} from "@/lib/permissions/householdQuota";
import { buildServerPlanAccessContext } from "@/lib/permissions/serverPlanAccess";
import {
  hasHouseholdViewerRestrictions,
} from "@/lib/permissions/householdRole";
import {
  normalizeHouseholdRole,
} from "@/lib/permissions/computePermissions";

export class HouseholdQuotaError extends Error {
  readonly code:
    | "viewer_read_only"
    | "free_device_limit"
    | "free_document_limit"
    | "household_device_limit"
    | "household_document_limit";

  constructor(
    code: HouseholdQuotaError["code"],
    message: string
  ) {
    super(message);
    this.name = "HouseholdQuotaError";
    this.code = code;
  }
}

async function countScopedRows(
  admin: SupabaseClient,
  table: "devices" | "documents",
  householdId: string | null,
  userId: string
): Promise<number> {
  const { count, error } =
    await applyHouseholdScope(
      admin
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

export async function buildServerHouseholdQuotaContext(
  admin: SupabaseClient,
  userId: string
) {
  const planAccess =
    await buildServerPlanAccessContext(
      admin,
      userId
    );

  const {
    input,
    result,
  } = planAccess;

  const householdId = input.householdId;
  const role = normalizeHouseholdRole(
    input.rawHouseholdRole
  );

  const isViewer = hasHouseholdViewerRestrictions({
    householdId,
    role,
  });

  const limits = resolveHouseholdQuotaLimits({
    effectivePlan: result.effectivePlan,
    isPlatformAdmin:
      input.isPlatformAdmin,
    hasFamilyFeatureAccess:
      result.hasFamilyFeatureAccess,
    canUseProFeatures:
      result.canUseProFeatures,
  });

  const usage = await loadHouseholdUsageCounts(
    admin,
    householdId,
    userId
  );

  const quota = evaluateHouseholdQuota({
    loading: false,
    entitlementLoading: false,
    usageLoading: false,
    isDemo: input.isDemo,
    canCreate: !input.isDemo && !isViewer,
    canUpload: !input.isDemo && !isViewer,
    isViewer,
    householdId,
    effectivePlan: result.effectivePlan,
    canUseProFeatures:
      result.canUseProFeatures,
    limits,
    usage,
  });

  return {
    planAccess,
    quota,
  };
}

export async function assertCanAddDevice(
  admin: SupabaseClient,
  userId: string
) {
  const { quota } =
    await buildServerHouseholdQuotaContext(
      admin,
      userId
    );

  if (quota.limitReason === "viewer_read_only") {
    throw new HouseholdQuotaError(
      "viewer_read_only",
      "Viewer access is read-only. You cannot add devices."
    );
  }

  if (quota.deviceLimitReached) {
    throw new HouseholdQuotaError(
      quota.canUseProFeatures
        ? "household_device_limit"
        : "free_device_limit",
      quota.canUseProFeatures
        ? "This household has reached its device limit."
        : "This household has reached the Free plan device limit."
    );
  }

  return quota;
}

export async function assertCanAddDocument(
  admin: SupabaseClient,
  userId: string
) {
  const { quota } =
    await buildServerHouseholdQuotaContext(
      admin,
      userId
    );

  if (quota.limitReason === "viewer_read_only") {
    throw new HouseholdQuotaError(
      "viewer_read_only",
      "Viewer access is read-only. You cannot upload documents."
    );
  }

  if (quota.documentLimitReached) {
    throw new HouseholdQuotaError(
      quota.canUseProFeatures
        ? "household_document_limit"
        : "free_document_limit",
      quota.canUseProFeatures
        ? "This household has reached its document limit."
        : "This household has reached the Free plan document limit."
    );
  }

  return quota;
}

export async function getServerDeviceCount(
  admin: SupabaseClient,
  householdId: string | null,
  userId: string
) {
  return countScopedRows(
    admin,
    "devices",
    householdId,
    userId
  );
}

export async function getServerDocumentCount(
  admin: SupabaseClient,
  householdId: string | null,
  userId: string
) {
  return countScopedRows(
    admin,
    "documents",
    householdId,
    userId
  );
}
