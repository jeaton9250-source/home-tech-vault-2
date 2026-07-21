import { supabase } from "@/lib/supabase";

import {
  DEACTIVATED_USER_MESSAGE,
  normalizeProfileAccountStatus,
} from "@/lib/auth/accountStatusMessage";

export { DEACTIVATED_USER_MESSAGE };

export async function fetchProfileAccountStatus(
  userId: string
): Promise<"active" | "deactivated"> {
  const { data, error } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to load account status:",
      error
    );

    return "active";
  }

  return normalizeProfileAccountStatus(
    data?.account_status
  );
}

export async function signOutDeactivatedUser() {
  await supabase.auth.signOut();
}

export async function enforceActiveAccount(
  userId: string
): Promise<
  | { ok: true }
  | { ok: false; message: string }
> {
  const status =
    await fetchProfileAccountStatus(userId);

  if (status === "deactivated") {
    await signOutDeactivatedUser();

    return {
      ok: false,
      message: DEACTIVATED_USER_MESSAGE,
    };
  }

  return { ok: true };
}
