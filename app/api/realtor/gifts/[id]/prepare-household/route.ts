import {
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext
) {
  let createdHouseholdId:
    | string
    | null = null;

  try {
    const {
      id,
    } = await context.params;

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const admin =
      createAdminClient();

    const {
      data: gift,
      error: giftError,
    } = await admin
      .from("realtor_vault_gifts")
      .select(
        `
          id,
          household_id,
          realtor_user_id,
          property_address_line1,
          status
        `
      )
      .eq(
        "id",
        id
      )
      .eq(
        "realtor_user_id",
        user.id
      )
      .maybeSingle();

    if (giftError) {
      throw giftError;
    }

    if (!gift) {
      return NextResponse.json(
        {
          error:
            "Client Vault not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      [
        "claimed",
        "cancelled",
        "refunded",
      ].includes(
        gift.status
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This Client Vault can no longer be prepared.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Idempotent.
     * If this gift already owns a client household,
     * simply return it.
     */
    if (gift.household_id) {
      return NextResponse.json({
        success: true,
        giftId:
          gift.id,
        householdId:
          gift.household_id,
        alreadyPrepared:
          true,
      });
    }

    const now =
      new Date().toISOString();

    const householdName =
      `${gift.property_address_line1} Home Vault`;

    /*
     * Create a dedicated household for this property.
     * Realtor temporarily owns it until buyer claim.
     */
    const {
      data: household,
      error: householdError,
    } = await admin
      .from("households")
      .insert({
        owner_id:
          user.id,
        name:
          householdName,
        created_at:
          now,
        updated_at:
          now,
      })
      .select(
        `
          id,
          owner_id,
          name
        `
      )
      .single();

    if (householdError) {
      throw householdError;
    }

    createdHouseholdId =
      household.id;

    /*
     * Owner membership is created automatically
     * by the existing household_add_owner_membership
     * database trigger.
     *
     * Do not insert household_members here or the
     * UNIQUE (household_id, user_id) constraint
     * will be hit.
     */

    /*
     * Attach household to gift.
     *
     * Paid gifts become "preparing".
     * Awaiting-payment gifts remain awaiting payment,
     * but the property Vault can still be built.
     */
    const giftUpdate:
      Record<string, unknown> = {
        household_id:
          household.id,
      };

    if (
      gift.status ===
      "paid"
    ) {
      giftUpdate.status =
        "preparing";
    }

    const {
      error: giftUpdateError,
    } = await admin
      .from("realtor_vault_gifts")
      .update(
        giftUpdate
      )
      .eq(
        "id",
        gift.id
      )
      .eq(
        "realtor_user_id",
        user.id
      );

    if (giftUpdateError) {
      throw giftUpdateError;
    }

    return NextResponse.json({
      success: true,

      giftId:
        gift.id,

      householdId:
        household.id,

      householdName:
        household.name,

      alreadyPrepared:
        false,
    });
  } catch (error) {
    console.error(
      "[realtor/prepare-household] failed:",
      error
    );

    /*
     * Best-effort cleanup if something failed
     * after creating the household.
     */
    if (createdHouseholdId) {
      try {
        const admin =
          createAdminClient();

        await admin
          .from("households")
          .delete()
          .eq(
            "id",
            createdHouseholdId
          );
      } catch (
        cleanupError
      ) {
        console.error(
          "[realtor/prepare-household] cleanup failed:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare this Client Vault.",
      },
      {
        status: 500,
      }
    );
  }
}
