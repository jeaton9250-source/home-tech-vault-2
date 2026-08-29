import {
  NextResponse,
} from "next/server";

import {
  createOwnershipTransferToken,
  hashOwnershipTransferToken,
  ownershipTransferExpiresAt,
} from "@/lib/realtor/transfers";

import { sendEmail } from "@/lib/email/sendEmail";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RequestBody = {
  realtorAccessAfterTransfer?: unknown;
};

function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(
  request: Request,
  context: RouteContext
) {
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
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
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

    const body =
      (await request
        .json()
        .catch(() => ({}))) as RequestBody;

    const realtorAccessAfterTransfer =
      body.realtorAccessAfterTransfer ===
        "viewer"
        ? "viewer"
        : "remove";

    const admin =
      createAdminClient();

    const {
      data: gift,
      error: giftError,
    } = await admin
      .from(
        "realtor_vault_gifts"
      )
      .select(
        `
          id,
          realtor_user_id,
          household_id,
          buyer_email,
          buyer_first_name,
          buyer_last_name,
          property_address_line1,
          property_address_line2,
          property_city,
          property_state,
          property_postal_code,
          gift_plan,
          gift_duration_months,
          gift_expires_at,
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

    if (!gift.household_id) {
      return NextResponse.json(
        {
          error:
            "Prepare this Client Vault before sending ownership.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      ![
        "paid",
        "preparing",
        "transfer_sent",
      ].includes(
        gift.status
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Complete the closing gift purchase before sending ownership.",
        },
        {
          status: 409,
        }
      );
    }

    const {
      data: household,
      error: householdError,
    } = await admin
      .from("households")
      .select(
        "id, owner_id"
      )
      .eq(
        "id",
        gift.household_id
      )
      .maybeSingle();

    if (householdError) {
      throw householdError;
    }

    if (!household) {
      return NextResponse.json(
        {
          error:
            "The Client Vault household could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      household.owner_id !==
      user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You no longer own this Client Vault.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Cancel any previous unused ownership links.
     */
    const {
      error: cancelError,
    } = await admin
      .from(
        "household_ownership_transfers"
      )
      .update({
        status:
          "cancelled",
      })
      .eq(
        "household_id",
        household.id
      )
      .eq(
        "status",
        "pending"
      );

    if (cancelError) {
      throw cancelError;
    }

    /*
     * Generate a new secure transfer token.
     *
     * The raw token is sent to the buyer.
     * Only its SHA-256 hash is stored.
     */
    const token =
      createOwnershipTransferToken();

    const tokenHash =
      hashOwnershipTransferToken(
        token
      );

    const expiresAt =
      ownershipTransferExpiresAt();

    const {
      data: transfer,
      error: transferError,
    } = await admin
      .from(
        "household_ownership_transfers"
      )
      .insert({
        household_id:
          household.id,

        gift_id:
          gift.id,

        from_user_id:
          user.id,

        to_email:
          gift.buyer_email,

        token_hash:
          tokenHash,

        status:
          "pending",

        realtor_access_after_transfer:
          realtorAccessAfterTransfer,

        expires_at:
          expiresAt.toISOString(),
      })
      .select(
        `
          id,
          expires_at
        `
      )
      .single();

    if (transferError) {
      throw transferError;
    }

    const origin =
      new URL(
        request.url
      ).origin;

    const claimUrl =
      `${origin}/claim-home/${token}`;

    const buyerFirstName =
      gift.buyer_first_name?.trim() ||
      "there";

    const addressLine =
      [
        gift.property_address_line1,
        gift.property_address_line2,
      ]
        .filter(Boolean)
        .join(" ");

    const cityStateZip =
      [
        gift.property_city,
        gift.property_state,
        gift.property_postal_code,
      ]
        .filter(Boolean)
        .join(", ")
        .replace(
          /, ([A-Z]{2}), /,
          ", $1 "
        );

    const fullAddress =
      [
        addressLine,
        cityStateZip,
      ]
        .filter(Boolean)
        .join(", ");

    const safeFirstName =
      escapeHtml(
        buyerFirstName
      );

    const safeAddress =
      escapeHtml(
        fullAddress
      );

    const safeClaimUrl =
      escapeHtml(
        claimUrl
      );

    /*
     * Send ownership invitation through Home Tech Vault's
     * existing centralized Resend system.
     */
    const emailResult =
      await sendEmail({
        to: [
          gift.buyer_email,
        ],

        subject:
          `Your Home Tech Vault is ready for ${fullAddress}`,

        html: `
<!doctype html>
<html>
  <body
    style="
      margin:0;
      padding:0;
      background:#f7f3ec;
      font-family:Arial,Helvetica,sans-serif;
      color:#183047;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="
        background:#f7f3ec;
        padding:40px 16px;
      "
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="
              max-width:620px;
            "
          >
            <tr>
              <td
                style="
                  padding:0 0 24px;
                  text-align:center;
                "
              >
                <div
                  style="
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:2.2px;
                    text-transform:uppercase;
                    color:#718d4f;
                  "
                >
                  HOME TECH VAULT
                </div>
              </td>
            </tr>

            <tr>
              <td
                style="
                  background:#183047;
                  border-radius:30px;
                  padding:44px 38px;
                  color:#ffffff;
                "
              >
                <div
                  style="
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1.9px;
                    text-transform:uppercase;
                    color:#c3d5ad;
                  "
                >
                  A closing gift for your new home
                </div>

                <h1
                  style="
                    margin:20px 0 0;
                    font-family:Georgia,Times,serif;
                    font-size:42px;
                    line-height:1.04;
                    font-weight:400;
                  "
                >
                  Welcome home, ${safeFirstName}.
                </h1>

                <p
                  style="
                    margin:22px 0 0;
                    font-size:16px;
                    line-height:1.75;
                    color:rgba(255,255,255,.68);
                  "
                >
                  A Home Tech Vault has been prepared for your
                  new home at
                  <strong style="color:#ffffff;">
                    ${safeAddress}
                  </strong>.
                </p>

                <p
                  style="
                    margin:18px 0 0;
                    font-size:16px;
                    line-height:1.75;
                    color:rgba(255,255,255,.68);
                  "
                >
                  Your Vault can hold the home's devices,
                  manuals, warranties, documents, Wi-Fi
                  information, maintenance records, and more.
                </p>

                <table
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="
                    margin-top:32px;
                  "
                >
                  <tr>
                    <td>
                      <a
                        href="${safeClaimUrl}"
                        style="
                          display:inline-block;
                          background:#718d4f;
                          color:#ffffff;
                          text-decoration:none;
                          font-size:15px;
                          font-weight:700;
                          padding:17px 28px;
                          border-radius:999px;
                        "
                      >
                        Claim My Home Vault
                      </a>
                    </td>
                  </tr>
                </table>

                <div
                  style="
                    margin-top:32px;
                    padding-top:26px;
                    border-top:1px solid rgba(255,255,255,.12);
                  "
                >
                  <div
                    style="
                      font-size:11px;
                      font-weight:700;
                      letter-spacing:1.6px;
                      text-transform:uppercase;
                      color:#c3d5ad;
                    "
                  >
                    Included with your closing gift
                  </div>

                  <p
                    style="
                      margin:10px 0 0;
                      font-family:Georgia,Times,serif;
                      font-size:23px;
                      color:#ffffff;
                    "
                  >
                    1 Year of Home Tech Vault Pro
                  </p>

                  <p
                    style="
                      margin:8px 0 0;
                      font-size:13px;
                      line-height:1.6;
                      color:rgba(255,255,255,.48);
                    "
                  >
                    Your gifted access has already been
                    purchased. You will not be charged when
                    claiming your Vault.
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:26px 20px 0;
                  text-align:center;
                  font-size:12px;
                  line-height:1.7;
                  color:#8a938e;
                "
              >
                This secure ownership invitation expires on
                ${expiresAt.toLocaleDateString(
                  "en-US",
                  {
                    month:
                      "long",
                    day:
                      "numeric",
                    year:
                      "numeric",
                  }
                )}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `.trim(),

        text:
          `Welcome home, ${buyerFirstName}!

A Home Tech Vault has been prepared for ${fullAddress}.

Your closing gift includes 1 Year of Home Tech Vault Pro.

Claim your Home Vault:
${claimUrl}

This secure invitation expires ${expiresAt.toLocaleDateString(
            "en-US"
          )}.

Home Tech Vault`,

        tags: [
          {
            name:
              "email_type",
            value:
              "realtor_ownership_transfer",
          },
          {
            name:
              "gift_id",
            value:
              gift.id,
          },
        ],
      });

    if (!emailResult.ok) {
      /*
       * Do not mark the gift transfer_sent if Resend
       * did not accept the email.
       *
       * Cancel this pending transfer because the raw
       * token cannot be recovered after this request.
       */
      await admin
        .from(
          "household_ownership_transfers"
        )
        .update({
          status:
            "cancelled",
        })
        .eq(
          "id",
          transfer.id
        );

      console.error(
        "[realtor/send-transfer] email failed:",
        emailResult
      );

      return NextResponse.json(
        {
          error:
            emailResult.message ||
            "Unable to send the buyer ownership email.",

          emailCode:
            emailResult.code,
        },
        {
          status: 502,
        }
      );
    }

    /*
     * Resend accepted the message.
     * Now mark the gift as transfer_sent.
     */
    const {
      error: updateGiftError,
    } = await admin
      .from(
        "realtor_vault_gifts"
      )
      .update({
        status:
          "transfer_sent",
      })
      .eq(
        "id",
        gift.id
      );

    if (updateGiftError) {
      throw updateGiftError;
    }

    console.info(
      "[realtor/send-transfer] ownership email sent",
      {
        giftId:
          gift.id,

        transferId:
          transfer.id,

        emailId:
          emailResult.id,

        to:
          gift.buyer_email,
      }
    );

    return NextResponse.json({
      success:
        true,

      transferId:
        transfer.id,

      expiresAt:
        transfer.expires_at,

      emailSent:
        true,

      emailId:
        emailResult.id,

      sentTo:
        gift.buyer_email,

    });
  } catch (error) {
    console.error(
      "[realtor/send-transfer] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send ownership transfer.",
      },
      {
        status: 500,
      }
    );
  }
}
