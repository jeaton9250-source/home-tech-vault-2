// @ts-nocheck
// @ts-ignore -- Supabase Edge Functions use Deno npm specifiers.
import { createClient } from "npm:@supabase/supabase-js@2";

declare global {
  namespace Deno {
    const env: {
      get(name: string): string | undefined;
    };

    function serve(
      handler: (request: Request) => Response | Promise<Response>
    ): void;
  }
}

type RequestBody = {
  invitationId?: string;
};

type HouseholdRole =
  | "owner"
  | "admin"
  | "member"
  | "viewer";

type InvitationRecord = {
  id: string;
  household_id: string;
  email: string;
  role: HouseholdRole;
  token: string;
  invited_by: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
};

type HouseholdRecord = {
  id: string;
  owner_id: string;
  name: string;
};

type ProfileRecord = {
  full_name: string | null;
  is_admin: boolean | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    }
  );
}

function formatRole(
  role: HouseholdRole
) {
  return role
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

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

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error:
          "Method not allowed.",
      },
      405
    );
  }

  try {
    const supabaseUrl =
      Deno.env.get(
        "SUPABASE_URL"
      );

    const supabaseAnonKey =
      Deno.env.get(
        "SUPABASE_ANON_KEY"
      );

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    const resendApiKey =
      Deno.env.get(
        "RESEND_API_KEY"
      );

    const resendFromEmail =
      Deno.env.get(
        "RESEND_FROM_EMAIL"
      );

    const appUrl =
      Deno.env.get("APP_URL");

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !serviceRoleKey ||
      !resendApiKey ||
      !resendFromEmail ||
      !appUrl
    ) {
      console.error(
        "Missing required Edge Function secrets."
      );

      return jsonResponse(
        {
          error:
            "The invitation email service is not configured.",
        },
        500
      );
    }

    const authorization =
      request.headers.get(
        "Authorization"
      );

    if (!authorization) {
      return jsonResponse(
        {
          error:
            "Authentication is required.",
        },
        401
      );
    }

    /*
     * This client uses the caller's JWT.
     * It identifies the signed-in user.
     */
    const callerClient =
      createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          global: {
            headers: {
              Authorization:
                authorization,
            },
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await callerClient.auth.getUser();

    if (userError || !user) {
      console.error(
        "Unable to authenticate invitation sender:",
        userError
      );

      return jsonResponse(
        {
          error:
            "Authentication is required.",
        },
        401
      );
    }

    const body =
      (await request.json()) as RequestBody;

    const invitationId =
      body.invitationId?.trim();

    if (!invitationId) {
      return jsonResponse(
        {
          error:
            "Invitation ID is required.",
        },
        400
      );
    }

    /*
     * The service-role client may read the invitation
     * and related records after we authenticate the caller.
     *
     * Never expose the service-role key to the browser.
     */
    const adminClient =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

    const {
      data: invitationData,
      error: invitationError,
    } = await adminClient
      .from(
        "household_invitations"
      )
      .select(
        `
          id,
          household_id,
          email,
          role,
          token,
          invited_by,
          accepted_at,
          expires_at,
          created_at
        `
      )
      .eq("id", invitationId)
      .maybeSingle();

    if (
      invitationError ||
      !invitationData
    ) {
      console.error(
        "Unable to load invitation:",
        invitationError
      );

      return jsonResponse(
        {
          error:
            "Invitation not found.",
        },
        404
      );
    }

    const invitation =
      invitationData as InvitationRecord;

    if (
      invitation.accepted_at
    ) {
      return jsonResponse(
        {
          error:
            "This invitation has already been accepted.",
        },
        400
      );
    }

    if (
      new Date(
        invitation.expires_at
      ).getTime() <
      Date.now()
    ) {
      return jsonResponse(
        {
          error:
            "This invitation has expired.",
        },
        400
      );
    }

    const [
      householdResult,
      memberResult,
      subscriptionResult,
      profileResult,
      senderProfileResult,
    ] = await Promise.all([
      adminClient
        .from("households")
        .select(
          `
            id,
            owner_id,
            name
          `
        )
        .eq(
          "id",
          invitation.household_id
        )
        .maybeSingle(),

      adminClient
        .from(
          "household_members"
        )
        .select("role")
        .eq(
          "household_id",
          invitation.household_id
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle(),

      adminClient
        .from(
          "user_subscriptions"
        )
        .select(
          "plan, status"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle(),

      adminClient
        .from("profiles")
        .select(
          "full_name, is_admin"
        )
        .eq("id", user.id)
        .maybeSingle(),

      adminClient
        .from("profiles")
        .select("full_name")
        .eq(
          "id",
          invitation.invited_by
        )
        .maybeSingle(),
    ]);

    if (
      householdResult.error ||
      !householdResult.data
    ) {
      console.error(
        "Unable to load invitation household:",
        householdResult.error
      );

      return jsonResponse(
        {
          error:
            "Household not found.",
        },
        404
      );
    }

    const household =
      householdResult.data as HouseholdRecord;

    const callerRole =
      memberResult.data?.role as
        | HouseholdRole
        | undefined;

    const callerCanManage =
      callerRole === "owner" ||
      callerRole === "admin";

    const callerProfile =
      profileResult.data as
        | ProfileRecord
        | null;

    const callerIsAdmin =
      callerProfile?.is_admin ===
      true;

    const subscriptionPlan =
      subscriptionResult.data?.plan
        ?.trim()
        .toLowerCase();

    const subscriptionStatus =
      subscriptionResult.data?.status
        ?.trim()
        .toLowerCase();

    const callerHasFamilyPlan =
      subscriptionPlan ===
        "family" &&
      (
        subscriptionStatus ===
          "active" ||
        subscriptionStatus ===
          "trialing"
      );

    /*
     * Only Family-plan household managers or
     * master admins may send invitations.
     */
    if (
      !callerIsAdmin &&
      (
        !callerCanManage ||
        !callerHasFamilyPlan
      )
    ) {
      return jsonResponse(
        {
          error:
            "You do not have permission to send this invitation.",
        },
        403
      );
    }

    /*
     * Prevent someone from sending an invitation
     * that was created by a different household.
     */
    if (
      invitation.household_id !==
      household.id
    ) {
      return jsonResponse(
        {
          error:
            "Invitation household mismatch.",
        },
        403
      );
    }

    const senderName =
      senderProfileResult.data
        ?.full_name?.trim() ||
      callerProfile?.full_name?.trim() ||
      user.email?.split("@")[0] ||
      "A household member";

    const safeSenderName =
      escapeHtml(senderName);

    const safeHouseholdName =
      escapeHtml(household.name);

    const safeRole =
      escapeHtml(
        formatRole(
          invitation.role
        )
      );

    const normalizedAppUrl =
      appUrl.replace(/\/+$/, "");

    const acceptanceUrl =
      `${normalizedAppUrl}/family/accept/` +
      encodeURIComponent(
        invitation.token
      );

    const subject =
      `${senderName} invited you to ${household.name}`;

    const emailHtml = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
          <title>${escapeHtml(subject)}</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #F7F5EF;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
          "
        >
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              width: 100%;
              background: #F7F5EF;
              padding: 32px 16px;
            "
          >
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    width: 100%;
                    max-width: 620px;
                    background: #FFFFFF;
                    border: 1px solid #E8E2D6;
                    border-radius: 28px;
                    overflow: hidden;
                  "
                >
                  <tr>
                    <td
                      style="
                        background: #111827;
                        padding: 40px 36px;
                        color: #FFFFFF;
                      "
                    >
                      <p
                        style="
                          margin: 0;
                          color: #C8A96A;
                          font-size: 12px;
                          font-weight: 700;
                          letter-spacing: 2px;
                          text-transform: uppercase;
                        "
                      >
                        Home Tech Vault
                      </p>

                      <h1
                        style="
                          margin: 16px 0 0;
                          color: #FFFFFF;
                          font-size: 34px;
                          line-height: 1.15;
                        "
                      >
                        You’ve been invited.
                      </h1>

                      <p
                        style="
                          margin: 16px 0 0;
                          color: #D1D5DB;
                          font-size: 16px;
                          line-height: 1.7;
                        "
                      >
                        ${safeSenderName} invited you to join
                        ${safeHouseholdName} in Home Tech Vault.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 36px;
                      "
                    >
                      <p
                        style="
                          margin: 0;
                          color: #6B7280;
                          font-size: 15px;
                          line-height: 1.7;
                        "
                      >
                        Once you accept, you’ll be able to access
                        the household’s shared technology records
                        based on your assigned role.
                      </p>

                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                          margin-top: 24px;
                          background: #F7F5EF;
                          border-radius: 18px;
                        "
                      >
                        <tr>
                          <td
                            style="
                              padding: 20px;
                            "
                          >
                            <p
                              style="
                                margin: 0;
                                color: #8A6A2F;
                                font-size: 11px;
                                font-weight: 700;
                                letter-spacing: 1.5px;
                                text-transform: uppercase;
                              "
                            >
                              Household
                            </p>

                            <p
                              style="
                                margin: 8px 0 0;
                                color: #111827;
                                font-size: 18px;
                                font-weight: 700;
                              "
                            >
                              ${safeHouseholdName}
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              padding: 0 20px 20px;
                            "
                          >
                            <p
                              style="
                                margin: 0;
                                color: #8A6A2F;
                                font-size: 11px;
                                font-weight: 700;
                                letter-spacing: 1.5px;
                                text-transform: uppercase;
                              "
                            >
                              Your Role
                            </p>

                            <p
                              style="
                                margin: 8px 0 0;
                                color: #111827;
                                font-size: 16px;
                                font-weight: 700;
                              "
                            >
                              ${safeRole}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                          margin-top: 30px;
                        "
                      >
                        <tr>
                          <td
                            style="
                              background: #111827;
                              border-radius: 12px;
                            "
                          >
                            <a
                              href="${acceptanceUrl}"
                              style="
                                display: inline-block;
                                padding: 15px 24px;
                                color: #FFFFFF;
                                font-size: 15px;
                                font-weight: 700;
                                text-decoration: none;
                              "
                            >
                              Accept Invitation
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p
                        style="
                          margin: 28px 0 0;
                          color: #9CA3AF;
                          font-size: 12px;
                          line-height: 1.7;
                        "
                      >
                        This invitation expires on
                        ${new Date(
                          invitation.expires_at
                        ).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}.
                      </p>

                      <p
                        style="
                          margin: 18px 0 0;
                          color: #9CA3AF;
                          font-size: 12px;
                          line-height: 1.7;
                          word-break: break-all;
                        "
                      >
                        Button not working? Copy and paste this link:
                        <br />
                        ${acceptanceUrl}
                      </p>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin: 22px 0 0;
                    color: #9CA3AF;
                    font-size: 12px;
                  "
                >
                  Home Tech Vault · Protect. Organize. Simplify.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    /*
     * Resend accepts POST requests to /emails with
     * the API key in the Authorization header.
     */
    const resendResponse =
      await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${resendApiKey}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            from: resendFromEmail,
            to: [
              invitation.email,
            ],
            subject,
            html: emailHtml,
          }),
        }
      );

    const resendResult =
      await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Resend email error:",
        resendResult
      );

      return jsonResponse(
        {
          error:
            resendResult?.message ||
            "Unable to send the invitation email.",
        },
        502
      );
    }

    return jsonResponse({
      success: true,
      emailId:
        resendResult?.id || null,
      message:
        "Invitation email sent successfully.",
    });
  } catch (error) {
    console.error(
      "Unexpected family invitation email error:",
      error
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send the invitation email.",
      },
      500
    );
  }
});