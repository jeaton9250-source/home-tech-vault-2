import type { User } from "@supabase/supabase-js";

import { demoSubscriptions } from "@/lib/demo/subscriptions";
import {
  fetchHouseholdIdForUser,
  resolveHouseholdScope,
} from "@/lib/data/householdScope";
import { supabase } from "@/lib/supabase";

export async function getSubscriptions(
  user: User | null,
  householdId?: string | null
) {
  if (!user) {
    return demoSubscriptions;
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
    .from("subscriptions")
    .select("*")
    .eq(scope.column, scope.value)
    .order("service_name");

  if (error) {
    throw error;
  }

  return data ?? [];
}
