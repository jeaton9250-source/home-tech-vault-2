import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildServerPlanAccessContext } from "@/lib/permissions/serverPlanAccess";
import type { SupportSubmissionContext } from "@/lib/support/types";

type ResolveSupportContextOptions = {
  userId: string | null;
  isDemo: boolean;
};

export async function resolveSupportSubmissionContext(
  admin: SupabaseClient,
  options: ResolveSupportContextOptions
): Promise<SupportSubmissionContext> {
  if (!options.userId || options.isDemo) {
    return {
      userId: null,
      householdId: null,
      effectivePlan: options.isDemo ? "demo" : null,
      householdRole: null,
      isSignedIn: Boolean(options.userId),
    };
  }

  const planAccess =
    await buildServerPlanAccessContext(
      admin,
      options.userId
    );

  return {
    userId: options.userId,
    householdId:
      planAccess.input.householdId,
    effectivePlan:
      planAccess.result.effectivePlan,
    householdRole:
      planAccess.result.householdRole,
    isSignedIn: true,
  };
}
