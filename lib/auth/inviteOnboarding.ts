import type { User } from "@supabase/supabase-js";

import {
  INVITATION_TYPE_CREATE_ACCOUNT,
  normalizeInvitationType,
} from "@/lib/admin/invitationTypes";

export type InviteUserMetadata = {
  invitationType: ReturnType<
    typeof normalizeInvitationType
  >;
  onboardingMode: string | null;
  passwordSetupCompleted: boolean;
};

export function readInviteUserMetadata(
  user: Pick<User, "user_metadata">
): InviteUserMetadata {
  const metadata =
    (user.user_metadata ?? {}) as Record<
      string,
      unknown
    >;

  return {
    invitationType: normalizeInvitationType(
      metadata.invitation_type
    ),
    onboardingMode:
      typeof metadata.onboarding_mode === "string"
        ? metadata.onboarding_mode
        : null,
    passwordSetupCompleted:
      metadata.password_setup_completed === true,
  };
}

export function isCreateAccountInviteUser(
  user: Pick<User, "user_metadata">
) {
  const metadata = readInviteUserMetadata(user);

  return (
    metadata.invitationType ===
      INVITATION_TYPE_CREATE_ACCOUNT ||
    metadata.onboardingMode === "create_household"
  );
}

export function resolveCreateAccountInvitePath(input: {
  user: Pick<User, "user_metadata">;
  hasHousehold: boolean;
}) {
  if (!isCreateAccountInviteUser(input.user)) {
    return null;
  }

  const metadata = readInviteUserMetadata(
    input.user
  );

  if (!metadata.passwordSetupCompleted) {
    return "/invite/setup";
  }

  if (!input.hasHousehold) {
    return "/onboarding/create-household";
  }

  return null;
}

export async function userHasHouseholdMembership(
  userId: string
) {
  const { supabase } = await import("@/lib/supabase");

  const [
    { data: membership },
    { data: ownedHousehold },
  ] = await Promise.all([
    supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("households")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle(),
  ]);

  return Boolean(
    membership?.household_id || ownedHousehold?.id
  );
}

export async function resolveAuthenticatedInviteDestination(input: {
  user: User;
  requestedPath?: string | null;
}) {
  const hasHousehold =
    await userHasHouseholdMembership(input.user.id);

  const invitePath = resolveCreateAccountInvitePath({
    user: input.user,
    hasHousehold,
  });

  if (invitePath) {
    console.info("Invite onboarding route", {
      userId: input.user.id,
      invitationType:
        readInviteUserMetadata(input.user)
          .invitationType,
      onboardingMode:
        readInviteUserMetadata(input.user)
          .onboardingMode,
      hasHousehold,
      destination: invitePath,
    });

    return invitePath;
  }

  const requested = input.requestedPath?.trim();

  if (
    requested &&
    requested.startsWith("/") &&
    !requested.startsWith("//")
  ) {
    return requested;
  }

  return null;
}
