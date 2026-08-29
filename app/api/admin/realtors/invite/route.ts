import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import {
  assertCreateAccountSecureActionUrl,
  logCreateAccountEmailLinkType,
} from "@/lib/admin/createAccountInviteEmailLink";
import {
  generateCreateAccountSecureInviteLink,
  logCreateAccountInviteLink,
} from "@/lib/admin/secureInviteLink";
import { sendEmail } from "@/lib/email/sendEmail";
import { isValidEmailAddress } from "@/lib/email/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function cleanText(value: unknown, maxLength = 160) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function normalizeEmail(value: unknown) {
  return cleanText(value, 254).toLowerCase();
}

function buildFullName(
  firstName: string,
  lastName: string
) {
  return [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function buildReferralCode() {
  return `HTV-${randomUUID()
    .replaceAll("-", "")
    .slice(0, 12)
    .toUpperCase()}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildRealtorInviteHtml(input: {
  firstName: string;
  secureActionUrl: string;
}) {
  const firstName = escapeHtml(input.firstName);
  const secureActionUrl = escapeHtml(
    input.secureActionUrl
  );

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f7f7;font-family:Arial,Helvetica,sans-serif;color:#183047;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e9ea;">
            <tr>
              <td style="background:#183047;padding:30px 36px;">
                <div style="font-size:24px;font-weight:700;color:#ffffff;">
                  Home Tech Vault
                </div>
                <div style="margin-top:6px;font-size:14px;color:#cbd7dc;">
                  Realtor Partner Program
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:36px;">
                <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;color:#183047;">
                  You're invited, ${firstName}.
                </h1>

                <p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:#435866;">
                  You've been invited to join the Home Tech Vault Realtor Partner Program.
                </p>

                <p style="margin:0 0 26px;font-size:16px;line-height:1.65;color:#435866;">
                  Your Realtor workspace gives you a simple way to prepare and gift Home Tech Vaults to your clients, helping them keep important home technology, documents, warranties, and device information organized after closing.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="border-radius:10px;background:#238b98;">
                      <a
                        href="${secureActionUrl}"
                        style="display:inline-block;padding:15px 24px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;"
                      >
                        Create My Home Tech Vault
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#74858e;">
                  This invitation was created specifically for your email address. If you weren't expecting it, you can ignore this message.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 36px;background:#f7f9f9;border-top:1px solid #e8eded;font-size:12px;line-height:1.6;color:#7b8a92;">
                Home Tech Vault · Your home's technology, organized.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

function buildRealtorInviteText(input: {
  firstName: string;
  secureActionUrl: string;
}) {
  return `Hi ${input.firstName},

You've been invited to join the Home Tech Vault Realtor Partner Program.

Your Realtor workspace gives you a simple way to prepare and gift Home Tech Vaults to your clients, helping them keep important home technology, documents, warranties, and device information organized after closing.

Create your Home Tech Vault:
${input.secureActionUrl}

If you weren't expecting this invitation, you can ignore this message.

Home Tech Vault
Your home's technology, organized.`;
}

export async function POST(request: Request) {
  try {
    const session =
      await requirePlatformAdminSession(request);

    const body = (await request.json()) as {
      email?: string;
      firstName?: string;
      lastName?: string;
      brokerageName?: string;
      licenseState?: string;
    };

    const email = normalizeEmail(body.email);

    const firstName = cleanText(
      body.firstName,
      80
    );

    const lastName = cleanText(
      body.lastName,
      80
    );

    const brokerageName = cleanText(
      body.brokerageName,
      160
    );

    const licenseState = cleanText(
      body.licenseState,
      40
    ).toUpperCase();

    if (!email || !isValidEmailAddress(email)) {
      return NextResponse.json(
        {
          error:
            "Enter a valid Realtor email address.",
        },
        {
          status: 400,
        }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        {
          error:
            "Enter the Realtor's first and last name.",
        },
        {
          status: 400,
        }
      );
    }

    const admin = createAdminClient();

    /*
     * Prevent duplicate Realtor accounts.
     */
    const existingUsers =
      await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (existingUsers.error) {
      console.error(
        "[realtor-invite] unable to check existing users:",
        existingUsers.error
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify the Realtor email address.",
        },
        {
          status: 500,
        }
      );
    }

    const existingUser =
      existingUsers.data.users.find(
        (user) =>
          user.email?.trim().toLowerCase() ===
          email
      );

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "A Home Tech Vault account already exists for this email.",
        },
        {
          status: 409,
        }
      );
    }

    const fullName = buildFullName(
      firstName,
      lastName
    );

    /*
     * Generate the secure Supabase invitation without
     * asking Supabase to send its own email.
     */
    const generatedLink =
      await generateCreateAccountSecureInviteLink(
        admin,
        {
          email,
          metadata: {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,

            account_role: "realtor",
            onboarding_mode: "realtor",
            platform_access: "realtor",

            brokerage_name:
              brokerageName || undefined,

            license_state:
              licenseState || undefined,

            invited_by_platform_admin:
              session.userId,
          },

          confirmNext: "/invite/setup",
        }
      );

    if (!generatedLink.ok) {
      const message =
        generatedLink.error instanceof Error
          ? generatedLink.error.message
          : "Unable to generate the Realtor invitation.";

      console.error(
        "[realtor-invite] secure invite generation failed:",
        generatedLink.error
      );

      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 500,
        }
      );
    }

    const secureActionUrl =
      generatedLink.confirmUrl;

    assertCreateAccountSecureActionUrl(
      secureActionUrl
    );

    logCreateAccountEmailLinkType({
      route: "/api/admin/realtors/invite",
      secureActionUrl,
    });

    logCreateAccountInviteLink({
      deliveryMethod: "resend",
      redirectTo: generatedLink.redirectTo,
      usesTokenHashConfirm: true,
    });

    /*
     * generateLink() creates the Auth user.
     * Retrieve it so we can authorize the Realtor
     * through realtor_partners.
     */
    const usersAfterInvite =
      await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersAfterInvite.error) {
      console.error(
        "[realtor-invite] unable to retrieve generated user:",
        usersAfterInvite.error
      );

      return NextResponse.json(
        {
          error:
            "The invitation was generated, but the Realtor account could not be finalized.",
        },
        {
          status: 500,
        }
      );
    }

    const invitedUser =
      usersAfterInvite.data.users.find(
        (user) =>
          user.email?.trim().toLowerCase() ===
          email
      );

    if (!invitedUser) {
      console.error(
        "[realtor-invite] generated Auth user not found:",
        email
      );

      return NextResponse.json(
        {
          error:
            "The Realtor Auth account could not be located after invitation generation.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Create Realtor authorization record.
     * It remains inactive until setup is completed.
     */
    const { error: partnerError } =
      await admin
        .from("realtor_partners")
        .insert({
          user_id: invitedUser.id,
          brokerage_name:
            brokerageName || null,
          license_state:
            licenseState || null,
          referral_code:
            buildReferralCode(),
          status: "inactive",
        });

    if (partnerError) {
      console.error(
        "[realtor-invite] partner creation failed:",
        partnerError
      );

      await admin.auth.admin
        .deleteUser(invitedUser.id)
        .catch((cleanupError) => {
          console.error(
            "[realtor-invite] auth cleanup failed:",
            cleanupError
          );
        });

      return NextResponse.json(
        {
          error:
            "The Realtor invitation could not be completed.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * HTV owns delivery through Resend.
     */
    const emailResult = await sendEmail({
      to: email,

      subject:
        "You're invited to Home Tech Vault",

      html: buildRealtorInviteHtml({
        firstName,
        secureActionUrl,
      }),

      text: buildRealtorInviteText({
        firstName,
        secureActionUrl,
      }),

      tags: [
        {
          name: "category",
          value: "realtor_invitation",
        },
      ],
    });

    if (!emailResult.ok) {
      console.error(
        "[realtor-invite] Resend delivery failed:",
        emailResult
      );

      /*
       * Keep the account + Realtor record.
       * This allows us to add a resend action without
       * destroying/recreating the invitation state.
       */
      return NextResponse.json({
        success: true,
        warning:
          "The Realtor account was created, but the invitation email could not be sent.",
        emailStatus: "failed",
      });
    }

    console.info(
      "[realtor-invite] Resend accepted invitation:",
      {
        email,
        resendMessageId: emailResult.id,
      }
    );

    return NextResponse.json({
      success: true,
      message:
        `Realtor invitation submitted for delivery to ${email}.`,
      emailStatus: "sent",
      messageId: emailResult.id,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "[realtor-invite] unexpected error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to invite this Realtor.",
      },
      {
        status: 500,
      }
    );
  }
}
