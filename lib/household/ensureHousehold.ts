import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

type EnsureHouseholdInput = {
  admin: SupabaseClient;
  userId: string;
  householdName: string;
};

export type EnsureHouseholdResult = {
  householdId: string;
  householdName: string;
  created: boolean;
};

async function ensureOwnerMembership(
  admin: SupabaseClient,
  householdId: string,
  userId: string
) {
  const { data: existingMembership, error: membershipLookupError } =
    await admin
      .from("household_members")
      .select("id, role")
      .eq("household_id", householdId)
      .eq("user_id", userId)
      .maybeSingle();

  if (membershipLookupError) {
    throw membershipLookupError;
  }

  if (existingMembership) {
    if (
      String(existingMembership.role)
        .trim()
        .toLowerCase() !== "owner"
    ) {
      const { error: roleError } = await admin
        .from("household_members")
        .update({
          role: "owner",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMembership.id);

      if (roleError) {
        throw roleError;
      }
    }

    return;
  }

  const { error: insertError } = await admin
    .from("household_members")
    .insert({
      household_id: householdId,
      user_id: userId,
      role: "owner",
      invited_by: userId,
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (insertError) {
    throw insertError;
  }
}

export async function ensureUserHousehold(
  input: EnsureHouseholdInput
): Promise<EnsureHouseholdResult> {
  const name = input.householdName.trim();

  if (!name) {
    throw new Error("Enter a household name.");
  }

  /*
   * First check whether the user already owns a household.
   * This makes repeated requests idempotent.
   */
  const {
    data: existingOwned,
    error: ownedError,
  } = await input.admin
    .from("households")
    .select("id, name")
    .eq("owner_id", input.userId)
    .limit(1)
    .maybeSingle();

  if (ownedError) {
    throw ownedError;
  }

  if (existingOwned) {
    /*
     * Keep the canonical household name synchronized with
     * the most recent name entered during onboarding/settings.
     */
    if (existingOwned.name !== name) {
      const { error: renameError } =
        await input.admin
          .from("households")
          .update({
            name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingOwned.id);

      if (renameError) {
        throw renameError;
      }
    }

    await ensureOwnerMembership(
      input.admin,
      existingOwned.id,
      input.userId
    );

    const { error: profileError } =
      await input.admin
        .from("profiles")
        .upsert(
          {
            id: input.userId,
            household_name: name,
          },
          {
            onConflict: "id",
          }
        );

    if (profileError) {
      throw profileError;
    }

    return {
      householdId: existingOwned.id,
      householdName: name,
      created: false,
    };
  }

  /*
   * Do not create an independent household for somebody
   * who already belongs to another household.
   */
  const {
    data: existingMembership,
    error: existingMembershipError,
  } = await input.admin
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", input.userId)
    .order("joined_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (existingMembershipError) {
    throw existingMembershipError;
  }

  if (existingMembership) {
    const { data: memberHousehold, error: memberHouseholdError } =
      await input.admin
        .from("households")
        .select("id, name")
        .eq(
          "id",
          existingMembership.household_id
        )
        .maybeSingle();

    if (memberHouseholdError) {
      throw memberHouseholdError;
    }

    if (!memberHousehold) {
      throw new Error(
        "Your household membership could not be resolved."
      );
    }

    return {
      householdId: memberHousehold.id,
      householdName:
        memberHousehold.name || "Household",
      created: false,
    };
  }

  const {
    data: createdHousehold,
    error: householdError,
  } = await input.admin
    .from("households")
    .insert({
      owner_id: input.userId,
      name,
    })
    .select("id, name")
    .single();

  if (householdError) {
    /*
     * A near-simultaneous request may have created the
     * household between our lookup and insert. Re-read once.
     */
    const { data: racedHousehold } =
      await input.admin
        .from("households")
        .select("id, name")
        .eq("owner_id", input.userId)
        .limit(1)
        .maybeSingle();

    if (racedHousehold) {
      await ensureOwnerMembership(
        input.admin,
        racedHousehold.id,
        input.userId
      );

      return {
        householdId: racedHousehold.id,
        householdName:
          racedHousehold.name || name,
        created: false,
      };
    }

    throw householdError;
  }

  try {
    await ensureOwnerMembership(
      input.admin,
      createdHousehold.id,
      input.userId
    );

    const { error: profileError } =
      await input.admin
        .from("profiles")
        .upsert(
          {
            id: input.userId,
            household_name: name,
          },
          {
            onConflict: "id",
          }
        );

    if (profileError) {
      throw profileError;
    }
  } catch (error) {
    /*
     * Avoid leaving another partial household if membership
     * creation fails.
     */
    await input.admin
      .from("households")
      .delete()
      .eq("id", createdHousehold.id);

    throw error;
  }

  return {
    householdId: createdHousehold.id,
    householdName:
      createdHousehold.name || name,
    created: true,
  };
}
