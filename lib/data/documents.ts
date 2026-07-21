import type { User } from "@supabase/supabase-js";

import { demoDocuments } from "@/lib/demo/documents";
import {
  fetchHouseholdIdForUser,
  resolveHouseholdScope,
} from "@/lib/data/householdScope";
import { supabase } from "@/lib/supabase";

export async function getDocuments(
  user: User | null,
  householdId?: string | null
) {
  if (!user) {
    return demoDocuments;
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
    .from("documents")
    .select("*")
    .eq(scope.column, scope.value)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}
