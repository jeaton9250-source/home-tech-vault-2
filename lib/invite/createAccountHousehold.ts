import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isCreateAccountInvitation,
  normalizeInvitationType,
} from "@/lib/admin/invitationTypes";
import {
  normalizeInviteEmail,
  type InvitationRowLike,
} from "@/lib/admin/invitationLookup";

function buildFullName(
  firstName: string,
  lastName: string
) {
  return [firstName.trim(), lastName.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function invitationExpired(expiresAt: string) {
  const expiresMs = new Date(expiresAt).getTime();

  return (
    Number.isFinite(expiresMs) &&
    expiresMs < Date.now()
  );
}

export async function findPendingCreateAccountInvitation(
  admin: SupabaseClient,
  email: string
) {
  const normalized = normalizeInviteEmail(email);

  const { data, error } = await admin
    .from("household_invitations")
    .select(
      "id, email, token, invited_by, accepted_at, expires_at, first_name, last_name, invitation_type, household_id"
    )
    .ilike("email", normalized)
    .in("invitation_type", [
      "create_account",
      "new_account",
    ])
    .is("accepted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as InvitationRowLike | null;
}

export async function completeCreateAccountHousehold(input: {
  admin: SupabaseClient;
  userId: string;
  userEmail: string | null;
  firstName: string;
  lastName: string;
  householdName: string;
  homeNickname?: string | null;
  invitation?: InvitationRowLike | null;
}) {
  const invitation =
    input.invitation ??
    (await findPendingCreateAccountInvitation(
      input.admin,
      input.userEmail || ""
    ));

  if (!invitation || invitation.accepted_at) {
    return {
      ok: false as const,
      status: 404,
      error: "This invitation is invalid or already used.",
    };
  }

  if (invitationExpired(invitation.expires_at)) {
    return {
      ok: false as const,
      status: 410,
      error: "This invitation has expired.",
    };
  }

  const invitationType = normalizeInvitationType(
    invitation.invitation_type
  );

  if (
    !isCreateAccountInvitation(invitationType)
  ) {
    return {
      ok: false as const,
      status: 400,
      error:
        "This invitation is for joining an existing household.",
    };
  }

  const inviteEmail = normalizeInviteEmail(
    invitation.email
  );
  const sessionEmail = normalizeInviteEmail(
    input.userEmail || ""
  );

  if (!sessionEmail || sessionEmail !== inviteEmail) {
    return {
      ok: false as const,
      status: 403,
      error:
        "Sign in with the invited email address to finish setup.",
    };
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const householdName = input.householdName.trim();
  const homeNickname =
    input.homeNickname?.trim() || null;

  if (!firstName || !lastName) {
    return {
      ok: false as const,
      status: 400,
      error: "Enter your first and last name.",
    };
  }

  if (!householdName) {
    return {
      ok: false as const,
      status: 400,
      error: "Enter a household name.",
    };
  }

  const { data: existingOwned } = await input.admin
    .from("households")
    .select("id")
    .eq("owner_id", input.userId)
    .maybeSingle();

  if (existingOwned) {
    return {
      ok: false as const,
      status: 409,
      error: "Your account already owns a household.",
    };
  }

  const fullName = buildFullName(firstName, lastName);
  const now = new Date().toISOString();

  const { error: profileError } = await input.admin
    .from("profiles")
    .upsert({
      id: input.userId,
      full_name: fullName,
      household_name:
        homeNickname || householdName,
      onboarding_completed_at: now,
      onboarding_step: "complete",
      onboarding_skipped_at: null,
    });

  if (profileError) {
    throw profileError;
  }

  const { data: household, error: householdError } =
    await input.admin
      .from("households")
      .insert({
        owner_id: input.userId,
        name: householdName,
      })
      .select("id, name")
      .single();

  if (householdError) {
    throw householdError;
  }

  const { error: membershipError } = await input.admin
    .from("household_members")
    .insert({
      household_id: household.id,
      user_id: input.userId,
      role: "owner",
      invited_by: invitation.invited_by,
    });

  if (
    membershipError &&
    !membershipError.message
      .toLowerCase()
      .includes("duplicate")
  ) {
    await input.admin
      .from("households")
      .delete()
      .eq("id", household.id);

    throw membershipError;
  }

  const { error: acceptError } = await input.admin
    .from("household_invitations")
    .update({
      accepted_at: now,
      accepted_by: input.userId,
    })
    .eq("id", invitation.id)
    .is("accepted_at", null);

  if (acceptError) {
    throw acceptError;
  }

  return {
    ok: true as const,
    householdId: household.id as string,
    householdName: household.name as string,
    message: "Your household is ready.",
  };
}
