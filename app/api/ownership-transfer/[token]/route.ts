import {
  NextResponse,
} from "next/server";

import {
  loadOwnershipTransferByToken,
} from "@/lib/realtor/transfers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const {
      token,
    } = await context.params;

    const transfer =
      await loadOwnershipTransferByToken(
        token
      );

    if (!transfer) {
      return NextResponse.json(
        {
          error:
            "This ownership invitation could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    const expired =
      new Date(
        transfer.expires_at
      ).getTime() <= Date.now();

    if (
      transfer.status !== "pending" ||
      expired
    ) {
      return NextResponse.json(
        {
          error:
            expired
              ? "This ownership invitation has expired."
              : "This ownership invitation is no longer available.",
        },
        {
          status: 410,
        }
      );
    }

    const rawGift =
      transfer.realtor_vault_gifts;

    const gift =
      Array.isArray(rawGift)
        ? rawGift[0] ?? null
        : rawGift ?? null;

    return NextResponse.json({
      transfer: {
        id:
          transfer.id,
        toEmail:
          transfer.to_email,
        expiresAt:
          transfer.expires_at,
      },

      gift:
        gift
          ? {
              buyerFirstName:
                gift.buyer_first_name,
              buyerLastName:
                gift.buyer_last_name,

              addressLine1:
                gift.property_address_line1,

              addressLine2:
                gift.property_address_line2,

              city:
                gift.property_city,

              state:
                gift.property_state,

              postalCode:
                gift.property_postal_code,

              plan:
                gift.gift_plan,

              durationMonths:
                gift.gift_duration_months,

              expiresAt:
                gift.gift_expires_at,
            }
          : null,
    });
  } catch (error) {
    console.error(
      "[ownership-transfer/:token] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load this ownership invitation.",
      },
      {
        status: 500,
      }
    );
  }
}
