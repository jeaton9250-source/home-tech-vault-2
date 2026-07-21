import type { SupabaseClient } from "@supabase/supabase-js";

import {
  applyHouseholdScope,
  loadNetworkInfoRows,
} from "@/lib/data/householdScope";

import type {
  OnboardingDataSnapshot,
  OnboardingProgressSummary,
  OnboardingStep,
} from "@/lib/onboarding/types";

export async function loadOnboardingDataSnapshot(
  supabase: SupabaseClient,
  options: {
    userId: string;
    householdId: string | null;
    householdOwnerId: string | null;
  }
): Promise<OnboardingDataSnapshot> {
  const {
    userId,
    householdId,
    householdOwnerId,
  } = options;

  let sharedHouseholdName:
    | string
    | null = null;

  let hasSharedHousehold = false;

  if (householdId) {
    const {
      data: household,
      error: householdError,
    } = await supabase
      .from("households")
      .select("name")
      .eq("id", householdId)
      .maybeSingle();

    if (!householdError && household) {
      hasSharedHousehold = true;
      sharedHouseholdName =
        household.name?.trim() || null;
    }
  }

  const [
    deviceResult,
    documentResult,
    networkResult,
  ] = await Promise.all([
    applyHouseholdScope(
      supabase
        .from("devices")
        .select("*", {
          count: "exact",
          head: true,
        }),
      householdId,
      userId
    ),

    applyHouseholdScope(
      supabase
        .from("documents")
        .select("*", {
          count: "exact",
          head: true,
        }),
      householdId,
      userId
    ),

    loadNetworkInfoRows(
      supabase,
      householdId,
      userId,
      householdOwnerId
    ),
  ]);

  return {
    deviceCount: deviceResult.count ?? 0,
    documentCount: documentResult.count ?? 0,
    networkConfigured:
      (networkResult.data?.length ?? 0) > 0,
    sharedHouseholdName,
    hasSharedHousehold,
  };
}

export function resolveResumeStep(
  snapshot: OnboardingDataSnapshot,
  profileHouseholdName: string | null,
  storedStep: OnboardingStep | null,
  restart: boolean
): OnboardingStep {
  if (restart) {
    return "welcome";
  }

  if (storedStep) {
    return storedStep;
  }

  return "welcome";
}

export function buildProgressSummary(
  snapshot: OnboardingDataSnapshot,
  profileHouseholdName: string | null
): OnboardingProgressSummary {
  return {
    devicesAdded: snapshot.deviceCount,
    documentsAdded: snapshot.documentCount,
    networkAdded: snapshot.networkConfigured,
    householdNamed: Boolean(
      snapshot.sharedHouseholdName?.trim() ||
        profileHouseholdName?.trim()
    ),
  };
}
