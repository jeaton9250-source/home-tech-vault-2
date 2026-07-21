// @ts-nocheck
// @ts-ignore -- Supabase Edge Functions use Deno npm specifiers.
import { createClient } from "npm:@supabase/supabase-js@2";

import {
  formatHouseholdRole,
  renderFamilyInvitationEmail,
} from "../_shared/email/familyInvitationEmail.ts";

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

const RESEND_FROM =
  "Home Tech Vault <hello@hometechvault.com>";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOKEN_PATTERN =
  /^[A-Za-z0-9_-]{8,128}$/;

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
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function isValidEmail(email: string) {
  return (
    email.length >= 5 &&
    email.length <= 254 &&
    EMAIL_PATTERN.test(email)
  );
}

function isValidInvitationToken(token: string) {
  return TOKEN_PATTERN.test(token);
}

function formatExpiration(
  expiresAt: string | null | undefined
) {
  if (!expiresAt) {
    return null;
  }

  const date = new Date(expiresAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildAcceptanceUrl(
  appUrl: string,
  token: string
) {
  const normalizedAppUrl = appUrl.replace(
    /\/+$/,
    ""
  );

  return (
    `${normalizedAppUrl}/family/accept/` +
    encodeURIComponent(token)
  );
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed." },
      405
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get(
      "SUPABASE_ANON_KEY"
    );
    const serviceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY"
    );
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const appUrl = Deno.env.get("APP_URL");

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !serviceRoleKey ||
      !resendApiKey ||
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

    const authorization = request.headers.get(
      "Authorization"
    );

    if (!authorization) {
      return jsonResponse(
        { error: "Authentication is required." },
        401
      );
    }

    const callerClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser();

    if (userError || !user) {
      console.error(
        "Unable to authenticate invitation sender:",
        userError
      );

      return jsonResponse(
        { error: "Authentication is required." },
        401
      );
    }

    const body = (await request.json()) as RequestBody;
    const invitationId = body.invitationId?.trim();

    if (!invitationId) {
      return jsonResponse(
        { error: "Invitation ID is required." },
        400
      );
    }

    const adminClient = createClient(
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
      .from("household_invitations")
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

    if (invitationError || !invitationData) {
      console.error(
        "Unable to load invitation:",
        invitationError
      );

      return jsonResponse(
        { error: "Invitation not found." },
        404
      );
    }

    const invitation =
      invitationData as InvitationRecord;

    const recipientEmail = invitation.email
      .trim()
      .toLowerCase();

    if (!isValidEmail(recipientEmail)) {
      return jsonResponse(
        {
          error:
            "The invitation recipient email is invalid.",
        },
        400
      );
    }

    const invitationToken = invitation.token?.trim();

    if (!isValidInvitationToken(invitationToken)) {
      console.error(
        "Invitation token failed validation:",
        invitation.id
      );

      return jsonResponse(
        {
          error:
            "The invitation token is invalid.",
        },
        400
      );
    }

    if (invitation.accepted_at) {
      return jsonResponse(
        {
          error:
            "This invitation has already been accepted.",
        },
        400
      );
    }

    if (
      new Date(invitation.expires_at).getTime() <
      Date.now()
    ) {
      return jsonResponse(
        { error: "This invitation has expired." },
        400
      );
    }

    const [
      householdResult,
      memberResult,
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
        .eq("id", invitation.household_id)
        .maybeSingle(),

      adminClient
        .from("household_members")
        .select("role")
        .eq("household_id", invitation.household_id)
        .eq("user_id", user.id)
        .maybeSingle(),

      adminClient
        .from("profiles")
        .select("full_name, is_admin")
        .eq("id", user.id)
        .maybeSingle(),

      adminClient
        .from("profiles")
        .select("full_name")
        .eq("id", invitation.invited_by)
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
        { error: "Household not found." },
        404
      );
    }

    const household =
      householdResult.data as HouseholdRecord;

    const {
      data: ownerSubscriptionData,
      error: ownerSubscriptionError,
    } = await adminClient
      .from("user_subscriptions")
      .select(
        "plan, status, current_period_end"
      )
      .eq("user_id", household.owner_id)
      .maybeSingle();

    const {
      data: ownerGrantData,
      error: ownerGrantError,
    } = await adminClient
      .from("platform_plan_grants")
      .select(
        "plan, status, starts_at, expires_at"
      )
      .eq("user_id", household.owner_id)
      .eq("status", "active")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (ownerSubscriptionError) {
      console.error(
        "Unable to load household owner subscription:",
        ownerSubscriptionError
      );
    }

    if (ownerGrantError) {
      console.error(
        "Unable to load household owner plan grant:",
        ownerGrantError
      );
    }

    const callerRole = memberResult.data?.role as
      | HouseholdRole
      | undefined;

    const callerCanManage =
      callerRole === "owner" ||
      callerRole === "admin" ||
      user.id === household.owner_id;

    const callerProfile = profileResult.data as
      | ProfileRecord
      | null;

    const callerIsAdmin =
      callerProfile?.is_admin === true;

    const ownerPlan = ownerSubscriptionData?.plan
      ?.trim()
      .toLowerCase();

    const ownerStatus = ownerSubscriptionData?.status
      ?.trim()
      .toLowerCase();

    const ownerCurrentPeriodEnd =
      ownerSubscriptionData?.current_period_end ??
      null;

    function ownerSubscriptionGrantsFamilyAccess(): boolean {
      if (ownerPlan !== "family") {
        return false;
      }

      if (
        ownerStatus === "active" ||
        ownerStatus === "trialing"
      ) {
        return true;
      }

      if (
        ownerStatus === "canceled" &&
        ownerCurrentPeriodEnd
      ) {
        const periodEnd = new Date(
          ownerCurrentPeriodEnd
        );

        return (
          !Number.isNaN(periodEnd.getTime()) &&
          periodEnd.getTime() > Date.now()
        );
      }

      return false;
    }

    function ownerAdminGrantProvidesFamilyAccess(): boolean {
      if (
        !ownerGrantData ||
        ownerGrantData.status !== "active" ||
        ownerGrantData.plan !== "family"
      ) {
        return false;
      }

      const startsAt = new Date(
        ownerGrantData.starts_at
      );

      if (
        Number.isNaN(startsAt.getTime()) ||
        startsAt.getTime() > Date.now()
      ) {
        return false;
      }

      if (!ownerGrantData.expires_at) {
        return true;
      }

      const expiresAt = new Date(
        ownerGrantData.expires_at
      );

      return (
        !Number.isNaN(expiresAt.getTime()) &&
        expiresAt.getTime() > Date.now()
      );
    }

    const householdHasFamilyPlan =
      ownerSubscriptionGrantsFamilyAccess() ||
      ownerAdminGrantProvidesFamilyAccess();

    if (
      !callerIsAdmin &&
      (!callerCanManage || !householdHasFamilyPlan)
    ) {
      return jsonResponse(
        {
          error:
            "You do not have permission to send this invitation.",
        },
        403
      );
    }

    if (invitation.household_id !== household.id) {
      return jsonResponse(
        {
          error: "Invitation household mismatch.",
        },
        403
      );
    }

    const senderName =
      senderProfileResult.data?.full_name?.trim() ||
      callerProfile?.full_name?.trim() ||
      user.email?.split("@")[0] ||
      "A household member";

    const acceptanceUrl = buildAcceptanceUrl(
      appUrl,
      invitationToken
    );

    const emailContent = renderFamilyInvitationEmail({
      inviterName: senderName,
      householdName: household.name,
      roleLabel: formatHouseholdRole(
        invitation.role
      ),
      acceptanceUrl,
      expirationLabel: formatExpiration(
        invitation.expires_at
      ),
    });

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [recipientEmail],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        }),
      }
    );

    let resendResult: Record<string, unknown> = {};

    try {
      resendResult = await resendResponse.json();
    } catch (parseError) {
      console.error(
        "Unable to parse Resend response:",
        parseError
      );
    }

    if (!resendResponse.ok) {
      console.error("Resend email error:", resendResult);

      return jsonResponse(
        {
          error:
            typeof resendResult.message === "string"
              ? resendResult.message
              : "Unable to send the invitation email.",
        },
        502
      );
    }

    return jsonResponse({
      success: true,
      emailId:
        typeof resendResult.id === "string"
          ? resendResult.id
          : null,
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
          "Unable to send the invitation email.",
      },
      500
    );
  }
});
