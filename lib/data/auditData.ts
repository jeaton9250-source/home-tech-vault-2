import type { SupabaseClient } from "@supabase/supabase-js";

import {
  applyHouseholdScope,
  loadNetworkInfoRows,
  resolveHouseholdAccess,
} from "@/lib/data/householdScope";

export type AuditData = {
  devices: Record<string, unknown>[];
  subscriptions: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  network: Record<string, unknown> | null;
};

export async function loadAuditData(
  client: SupabaseClient,
  userId: string,
  householdId?: string | null,
  householdOwnerId?: string | null
): Promise<AuditData> {
  let resolvedHouseholdId =
    householdId ?? null;
  let resolvedOwnerId =
    householdOwnerId ?? null;

  if (
    householdId === undefined ||
    householdOwnerId === undefined
  ) {
    const access =
      await resolveHouseholdAccess(
        userId,
        client
      );

    if (householdId === undefined) {
      resolvedHouseholdId =
        access.householdId;
    }

    if (
      householdOwnerId === undefined
    ) {
      resolvedOwnerId =
        access.householdOwnerId;
    }
  }

  const [
    devicesResult,
    subscriptionsResult,
    documentsResult,
    networkResult,
  ] = await Promise.all([
    applyHouseholdScope(
      client.from("devices").select("*"),
      resolvedHouseholdId,
      userId
    ),
    applyHouseholdScope(
      client
        .from("subscriptions")
        .select("*"),
      resolvedHouseholdId,
      userId
    ),
    applyHouseholdScope(
      client.from("documents").select("*"),
      resolvedHouseholdId,
      userId
    ),
    loadNetworkInfoRows(
      client,
      resolvedHouseholdId,
      userId,
      resolvedOwnerId
    ),
  ]);

  const networkRows =
    networkResult.error
      ? []
      : (networkResult.data ?? []);

  return {
    devices: devicesResult.error
      ? []
      : ((devicesResult.data ??
          []) as Record<
          string,
          unknown
        >[]),
    subscriptions: subscriptionsResult.error
      ? []
      : ((subscriptionsResult.data ??
          []) as Record<
          string,
          unknown
        >[]),
    documents: documentsResult.error
      ? []
      : ((documentsResult.data ??
          []) as Record<
          string,
          unknown
        >[]),
    network:
      (networkRows[0] as
        | Record<string, unknown
        > | undefined) ?? null,
  };
}
