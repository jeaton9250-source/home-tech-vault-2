import type { User } from "@supabase/supabase-js";

import { demoDevices } from "@/lib/demo/devices";
import {
  fetchHouseholdIdForUser,
  resolveHouseholdScope,
} from "@/lib/data/householdScope";
import { supabase } from "@/lib/supabase";

export async function getDevices(
  user: User | null,
  householdId?: string | null
) {
  if (!user) {
    return demoDevices;
  }

  const resolvedHouseholdId =
    householdId ??
    (await fetchHouseholdIdForUser(
      user.id
    ));

  const scope = resolveHouseholdScope(
    resolvedHouseholdId,
    user.id
  );

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq(scope.column, scope.value)
    .order("device_name");

  if (error) {
    throw error;
  }

  return data ?? [];
}
