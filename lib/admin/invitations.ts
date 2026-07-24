import "server-only";

import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { SupabaseClient } from "@supabase/supabase-js";

import FamilyInvitationEmail, {
  familyInvitationSubject,
  formatHouseholdRole,
  renderFamilyInvitationPlainText,
} from "@/emails/templates/FamilyInvitationEmail";
import NewAccountInvitationEmail, {
  newAccountInvitationSubject,
  renderNewAccountInvitationPlainText,
} from "@/emails/templates/NewAccountInvitationEmail";
import { sendReactEmail } from "@/lib/email/sendEmail";
import {
  buildCreateAccountInviteRedirectUrl,
  buildJoinHouseholdInviteRedirectUrl,
} from "@/lib/admin/inviteAuthRedirect";
import {
  assertCreateAccountSecureActionUrl,
  logCreateAccountEmailLinkType,
} from "@/lib/admin/createAccountInviteEmailLink";
import {
  generateCreateAccountSecureInviteLink,
  logCreateAccountInviteLink,
} from "@/lib/admin/secureInviteLink";
import {
  INVITATION_TYPE_CREATE_ACCOUNT,
  INVITATION_TYPE_JOIN_HOUSEHOLD,
  isUuid,
  normalizeInvitationType,
} from "@/lib/admin/invitationTypes";
import { normalizeInviteEmail } from "@/lib/admin/invitationLookup";
import { completeCreateAccountHousehold } from "@/lib/invite/createAccountHousehold";
import { absoluteUrl, getSiteUrl } from "@/lib/marketing/site";
import type {
  AdminHouseholdInviteRole,
  AdminInvitationType,
  AdminInviteUserInput,
  AdminPendingInvitation,
} from "@/lib/admin/types";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INVITE_ROLES: AdminHouseholdInviteRole[] = [
  "admin",
  "member",
  "viewer",
];

const INVITATION_SELECT =
  "id, household_id, email, role, token, invited_by, accepted_at, expires_at, created_at, first_name, last_name, invitation_type";

const INVITATION_SELECT_FALLBACK =
  "id, household_id, email, role, token, invited_by, accepted_at, expires_at, created_at, first_name, last_name";

type InvitationRow = {
  id: string;
  household_id: string | null;
  email: string;
  role: string | null;
  token: string;
  invited_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
  invitation_type?: string | null;
};


export { normalizeInviteEmail } from "@/lib/admin/invitationLookup";

export function isValidInviteEmail(email: string) {
  return (
    email.length >= 5 &&
    email.length <= 254 &&
    EMAIL_PATTERN.test(email)
  );
}

export function parseInviteRole(
  value: unknown
): AdminHouseholdInviteRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (
    INVITE_ROLES.includes(
      normalized as AdminHouseholdInviteRole
    )
  ) {
    return normalized as AdminHouseholdInviteRole;
  }

  return null;
}

export function parseInvitationType(
  value: unknown
): AdminInvitationType | null {
  const normalized = normalizeInvitationType(value);

  if (!normalized) {
    return null;
  }

  return normalized;
}

const INVITATION_EXPIRY_DAYS = 7;

type DbError = {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
};

function generateInvitationToken() {
  return randomUUID();
}

function validateInvitationUuidInputs(input: {
  invitedBy?: unknown;
  householdId?: unknown;
  token?: unknown;
  invitationType?: unknown;
}) {
  const fields: Array<[string, unknown]> = [
    ["invited_by", input.invitedBy],
    ["household_id", input.householdId],
    ["token", input.token],
  ];

  for (const [field, value] of fields) {
    if (
      value != null &&
      value !== "" &&
      !isUuid(value)
    ) {
      console.error("Invitation insert UUID inputs", {
        requesterAuthId: input.invitedBy,
        householdId: input.householdId,
        invitationType: input.invitationType,
        invalidField: field,
        invalidValue: value,
      });

      throw new Error(
        `Invalid UUID for ${field}.`
      );
    }
  }
}

function buildInvitationExpiresAt(
  days = INVITATION_EXPIRY_DAYS
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt.toISOString();
}

function logInvitationInsertError(error: DbError) {
  console.error("Invitation record insert failed:", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export function mapInvitationInsertError(
  error: DbError
): string {
  const message = (error.message ?? "").toLowerCase();
  const code = error.code ?? "";

  if (
    code === "42P01" ||
    (message.includes("household_invitations") &&
      message.includes("does not exist"))
  ) {
    return "The household_invitations table does not exist. Apply the latest Supabase migrations in your project.";
  }

  if (
    code === "42703" &&
    message.includes("invitation_type")
  ) {
    return "The invitation_type column is missing. Apply migration 20260723170000_invitation_types.sql in Supabase.";
  }

  if (
    code === "42703" &&
    (message.includes("first_name") ||
      message.includes("last_name"))
  ) {
    return "Invitation name columns are missing. Apply migration 20260723160000_household_invitation_names.sql in Supabase.";
  }

  if (code === "23502") {
    if (message.includes("household_id")) {
      return "New-account invitations require household_id to be nullable. Apply migration 20260723170000_invitation_types.sql in Supabase.";
    }

    if (message.includes("role")) {
      return "New-account invitations require role to be nullable. Apply migration 20260723170000_invitation_types.sql in Supabase.";
    }

    return "The invitation could not be saved because a required value was missing.";
  }

  if (code === "23505") {
    return "An invitation record already exists for this email.";
  }

  if (code === "23514") {
    if (
      message.includes("type_shape_check") ||
      message.includes("invitation_type")
    ) {
      return "The invitation could not be saved because invitation_type, household_id, and role do not match. Apply migration 20260723170000_invitation_types.sql in Supabase.";
    }

    return "The invitation could not be saved because it violated a database constraint.";
  }

  if (message.includes("permission denied")) {
    return "The invitation record could not be saved because database access was denied. Confirm the server admin client is configured.";
  }

  return (
    error.message ||
    "The invitation record could not be saved."
  );
}

async function deleteInvitedAuthUserIfNew(
  admin: SupabaseClient,
  email: string,
  hadExistingUser: boolean
) {
  if (hadExistingUser) {
    return;
  }

  const user = await findAuthUserByEmail(
    admin,
    email
  );

  if (!user) {
    return;
  }

  if (
    user.email_confirmed_at ||
    user.last_sign_in_at
  ) {
    return;
  }

  const { error } =
    await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error(
      "[admin-invite] failed to clean up invited auth user after database error:",
      {
        message: error.message,
        code: error.code,
      }
    );
  }
}

function logInviteStage(
  stage: string,
  details?: Record<string, unknown>
) {
  console.info("[admin-invite]", stage, details ?? {});
}

function mapAuthInviteErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("already") ||
    normalized.includes("registered") ||
    normalized.includes("exists")
  ) {
    return "A user with this email address already exists.";
  }

  if (
    normalized.includes("rate") ||
    normalized.includes("limit")
  ) {
    return "Too many invitations have been sent. Please try again shortly.";
  }

  if (
    normalized.includes("redirect") ||
    normalized.includes("url")
  ) {
    return "The invitation redirect URL is not allowed in Supabase. Add https://www.hometechvault.com/auth/confirm and https://www.hometechvault.com/invite/setup to the Supabase redirect allowlist.";
  }

  return message || "The invitation email could not be sent.";
}

function buildCreateAccountAuthInviteMetadata(input: {
  firstName?: string | null;
  lastName?: string | null;
  invitationToken: string;
  invitedByPlatformAdmin: string;
}) {
  const firstName = input.firstName?.trim() || "";
  const lastName = input.lastName?.trim() || "";
  const fullName = buildFullName(firstName, lastName);

  return {
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    full_name: fullName || undefined,
    invitation_type: INVITATION_TYPE_CREATE_ACCOUNT,
    onboarding_mode: "create_household",
    platform_access: "standard_user",
    invited_by_platform_admin:
      input.invitedByPlatformAdmin,
    invitation_token: input.invitationToken,
  };
}

function buildJoinHouseholdAuthInviteMetadata(input: {
  firstName?: string | null;
  lastName?: string | null;
  invitationToken: string;
  invitedByPlatformAdmin: string;
  householdId: string;
  householdRole: AdminHouseholdInviteRole;
}) {
  const firstName = input.firstName?.trim() || "";
  const lastName = input.lastName?.trim() || "";
  const fullName = buildFullName(firstName, lastName);

  return {
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    full_name: fullName || undefined,
    invitation_type: INVITATION_TYPE_JOIN_HOUSEHOLD,
    onboarding_mode: "join_household",
    platform_access: "standard_user",
    invited_by_platform_admin:
      input.invitedByPlatformAdmin,
    invitation_token: input.invitationToken,
    household_id: input.householdId,
    household_role: input.householdRole,
  };
}

async function saveInvitationRecord(
  admin: SupabaseClient,
  payload: Record<string, unknown>,
  options?: {
    existingId?: string;
  }
) {
  validateInvitationUuidInputs({
    invitedBy: payload.invited_by,
    householdId: payload.household_id,
    token: payload.token,
    invitationType: payload.invitation_type,
  });

  if (options?.existingId) {
    const { data, error } = await admin
      .from("household_invitations")
      .update(payload)
      .eq("id", options.existingId)
      .select(INVITATION_SELECT)
      .single();

    if (error) {
      logInvitationInsertError(error);
      throw error;
    }

    return data as InvitationRow;
  }

  const { data, error } = await admin
    .from("household_invitations")
    .insert(payload)
    .select(INVITATION_SELECT)
    .single();

  if (
    error &&
    payload.invitation_type === INVITATION_TYPE_CREATE_ACCOUNT &&
    (error.message?.includes("invitation_type") ||
      error.message?.includes("first_name") ||
      error.message?.includes("last_name"))
  ) {
    logInvitationInsertError(error);
    throw error;
  }

  if (
    error &&
    (error.message?.includes("invitation_type") ||
      error.message?.includes("first_name") ||
      error.message?.includes("last_name"))
  ) {
    const fallbackPayload = { ...payload };
    delete fallbackPayload.invitation_type;
    delete fallbackPayload.first_name;
    delete fallbackPayload.last_name;

    const fallback = await admin
      .from("household_invitations")
      .insert(fallbackPayload)
      .select(INVITATION_SELECT_FALLBACK)
      .single();

    if (fallback.error) {
      logInvitationInsertError(fallback.error);
      throw fallback.error;
    }

    return fallback.data as InvitationRow;
  }

  if (error) {
    logInvitationInsertError(error);
    throw error;
  }

  return data as InvitationRow;
}

async function findCreateAccountInvitationByEmail(
  admin: SupabaseClient,
  email: string
) {
  const { data, error } = await admin
    .from("household_invitations")
    .select(INVITATION_SELECT)
    .ilike("email", email)
    .in("invitation_type", [
      INVITATION_TYPE_CREATE_ACCOUNT,
      "new_account",
    ])
    .is("accepted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error?.message?.includes("invitation_type")) {
    const fallback = await admin
      .from("household_invitations")
      .select(INVITATION_SELECT_FALLBACK)
      .ilike("email", email)
      .is("accepted_at", null)
      .is("household_id", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallback.error) {
      throw fallback.error;
    }

    return fallback.data as InvitationRow | null;
  }

  if (error) {
    throw error;
  }

  return data as InvitationRow | null;
}

async function findHouseholdInvitationByEmail(
  admin: SupabaseClient,
  email: string,
  householdId: string
) {
  const { data, error } = await admin
    .from("household_invitations")
    .select(INVITATION_SELECT)
    .eq("household_id", householdId)
    .ilike("email", email)
    .is("accepted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as InvitationRow | null;
}

async function sendAuthInviteEmail(
  admin: SupabaseClient,
  input: {
    email: string;
    metadata: Record<string, unknown>;
    redirectTo: string;
  }
) {
  const { error } = await admin.auth.admin.inviteUserByEmail(
    input.email,
    {
      redirectTo: input.redirectTo,
      data: input.metadata,
    }
  );

  return error;
}

function formatExpirationLabel(expiresAt: string) {
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

function invitationStatus(
  expiresAt: string
): "pending" | "expired" {
  const expiresMs = new Date(expiresAt).getTime();

  if (
    Number.isFinite(expiresMs) &&
    expiresMs < Date.now()
  ) {
    return "expired";
  }

  return "pending";
}

function buildHouseholdAcceptanceUrl(token: string) {
  return absoluteUrl(
    `/family/accept/${encodeURIComponent(token)}`
  );
}

function buildFullName(
  firstName?: string | null,
  lastName?: string | null
) {
  return [firstName?.trim(), lastName?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function resolveInvitationType(
  row: InvitationRow
): AdminInvitationType | null {
  const parsed = parseInvitationType(
    row.invitation_type
  );

  if (parsed) {
    return parsed;
  }

  if (row.invitation_type != null) {
    return null;
  }

  if (!row.household_id) {
    return INVITATION_TYPE_CREATE_ACCOUNT;
  }

  return INVITATION_TYPE_JOIN_HOUSEHOLD;
}

async function findAuthUserByEmail(
  admin: SupabaseClient,
  email: string
) {
  const normalized = normalizeInviteEmail(email);
  let page = 1;

  while (page <= 20) {
    const { data, error } =
      await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });

    if (error) {
      throw error;
    }

    const match = (data.users ?? []).find(
      (user) =>
        user.email?.trim().toLowerCase() === normalized
    );

    if (match) {
      return match;
    }

    if ((data.users ?? []).length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function sendHouseholdInvitationEmail(input: {
  email: string;
  inviterName: string;
  householdName: string;
  role: AdminHouseholdInviteRole;
  token: string;
  expiresAt: string;
}) {
  const acceptanceUrl = buildHouseholdAcceptanceUrl(input.token);
  const roleLabel = formatHouseholdRole(input.role);
  const expirationLabel = formatExpirationLabel(
    input.expiresAt
  );

  return sendReactEmail({
    to: input.email,
    subject: familyInvitationSubject,
    template: createElement(FamilyInvitationEmail, {
      inviterName: input.inviterName,
      householdName: input.householdName,
      roleLabel,
      acceptanceUrl,
      expirationLabel,
    }),
    text: renderFamilyInvitationPlainText({
      inviterName: input.inviterName,
      householdName: input.householdName,
      roleLabel,
      acceptanceUrl,
      expirationLabel,
    }),
    tags: [
      { name: "category", value: "family_invitation" },
    ],
  });
}

async function sendNewAccountInvitationEmail(input: {
  email: string;
  inviterName: string;
  secureActionUrl: string;
  expiresAt: string;
  inviteeFirstName?: string | null;
}) {
  const expirationLabel = formatExpirationLabel(
    input.expiresAt
  );

  return sendReactEmail({
    to: input.email,
    subject: newAccountInvitationSubject,
    template: createElement(NewAccountInvitationEmail, {
      inviterName: input.inviterName,
      secureActionUrl: input.secureActionUrl,
      expirationLabel,
      inviteeFirstName: input.inviteeFirstName,
    }),
    text: renderNewAccountInvitationPlainText({
      inviterName: input.inviterName,
      secureActionUrl: input.secureActionUrl,
      expirationLabel,
      inviteeFirstName: input.inviteeFirstName,
    }),
    tags: [
      { name: "category", value: "create_account_invitation" },
    ],
  });
}

async function deliverCreateAccountInvitationEmail(input: {
  admin: SupabaseClient;
  email: string;
  firstName: string | null;
  lastName: string | null;
  invitationToken: string;
  actorUserId: string;
  inviterName: string;
  expiresAt: string;
  existingAuthUser: Awaited<
    ReturnType<typeof findAuthUserByEmail>
  >;
  inviteRoutePath: string;
}): Promise<{
  ok: boolean;
  delivery: "account_email";
  deliveryWarning?: string | null;
  error?: string;
  status?: number;
}> {
  const siteUrl = getSiteUrl();
  const redirectTo =
    buildCreateAccountInviteRedirectUrl();
  const metadata = buildCreateAccountAuthInviteMetadata({
    firstName: input.firstName,
    lastName: input.lastName,
    invitationToken: input.invitationToken,
    invitedByPlatformAdmin: input.actorUserId,
  });

  console.info(
    "Create account invitation configuration",
    {
      siteUrl,
      redirectTo,
      invitationType: "create_account",
      hasExistingAuthUser: Boolean(
        input.existingAuthUser
      ),
    }
  );

  logInviteStage("send_account_email_token_hash", {
    email: input.email,
    hasExistingAuthUser: Boolean(input.existingAuthUser),
  });

  const generatedLink =
    await generateCreateAccountSecureInviteLink(
      input.admin,
      {
        email: input.email,
        metadata,
        redirectTo,
        confirmNext: "/invite/setup",
      }
    );

  if (!generatedLink.ok) {
    const linkError = generatedLink.error as {
      message?: string;
      status?: number;
    };

    return {
      ok: false,
      delivery: "account_email",
      status: linkError.status || 500,
      error: mapAuthInviteErrorMessage(
        linkError.message || "Unable to generate invitation link."
      ),
    };
  }

  const secureActionUrl = generatedLink.confirmUrl;

  assertCreateAccountSecureActionUrl(secureActionUrl);
  logCreateAccountEmailLinkType({
    route: input.inviteRoutePath,
    secureActionUrl,
  });

  logCreateAccountInviteLink({
    deliveryMethod: "resend",
    redirectTo: generatedLink.redirectTo,
    usesTokenHashConfirm: true,
  });

  const emailResult = await sendNewAccountInvitationEmail({
    email: input.email,
    inviterName: input.inviterName,
    secureActionUrl,
    expiresAt: input.expiresAt,
    inviteeFirstName: input.firstName,
  });

  if (!emailResult.ok) {
    return {
      ok: true,
      delivery: "account_email",
      deliveryWarning:
        emailResult.code === "not_configured"
          ? "Invitation saved, but email delivery is not configured. Set RESEND_API_KEY or resend the invitation after configuring email."
          : "Invitation saved, but the email could not be delivered. You can resend it from the directory.",
    };
  }

  return {
    ok: true,
    delivery: "account_email",
  };
}

async function selectInvitationById(
  admin: SupabaseClient,
  invitationId: string
) {
  const { data, error } = await admin
    .from("household_invitations")
    .select(INVITATION_SELECT)
    .eq("id", invitationId)
    .maybeSingle();

  if (
    error &&
    error.message?.includes("invitation_type")
  ) {
    const fallback = await admin
      .from("household_invitations")
      .select(INVITATION_SELECT_FALLBACK)
      .eq("id", invitationId)
      .maybeSingle();

    if (fallback.error) {
      throw fallback.error;
    }

    return fallback.data as InvitationRow | null;
  }

  if (error) {
    throw error;
  }

  return data as InvitationRow | null;
}

export async function loadAdminPendingInvitations(
  admin: SupabaseClient,
  options?: {
    q?: string;
    role?: string;
    householdId?: string;
    invitationType?: string;
  }
): Promise<AdminPendingInvitation[]> {
  let query = admin
    .from("household_invitations")
    .select(INVITATION_SELECT)
    .is("accepted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (options?.householdId) {
    query = query.eq("household_id", options.householdId);
  }

  if (options?.role) {
    query = query.eq("role", options.role);
  }

  if (options?.invitationType) {
    query = query.eq(
      "invitation_type",
      options.invitationType
    );
  }

  if (options?.q?.trim()) {
    const term = `%${options.q.trim()}%`;
    query = query.ilike("email", term);
  }

  const { data, error } = await query;

  if (error) {
    if (
      error.message?.includes("invitation_type") ||
      error.message?.includes("first_name") ||
      error.message?.includes("last_name")
    ) {
      let fallbackQuery = admin
        .from("household_invitations")
        .select(INVITATION_SELECT_FALLBACK)
        .is("accepted_at", null)
        .order("created_at", { ascending: false })
        .limit(200);

      if (options?.householdId) {
        fallbackQuery = fallbackQuery.eq(
          "household_id",
          options.householdId
        );
      }

      if (options?.role) {
        fallbackQuery = fallbackQuery.eq("role", options.role);
      }

      if (options?.q?.trim()) {
        fallbackQuery = fallbackQuery.ilike(
          "email",
          `%${options.q.trim()}%`
        );
      }

      const fallback = await fallbackQuery;

      if (fallback.error) {
        throw fallback.error;
      }

      return mapInvitationRows(
        admin,
        (fallback.data ?? []) as InvitationRow[]
      );
    }

    throw error;
  }

  return mapInvitationRows(
    admin,
    (data ?? []) as InvitationRow[]
  );
}

async function mapInvitationRows(
  admin: SupabaseClient,
  rows: InvitationRow[]
): Promise<AdminPendingInvitation[]> {
  if (rows.length === 0) {
    return [];
  }

  const householdIds = [
    ...new Set(
      rows
        .map((row) => row.household_id)
        .filter((value): value is string => Boolean(value))
    ),
  ];
  const inviterIds = [
    ...new Set(
      rows
        .map((row) => row.invited_by)
        .filter((value): value is string => Boolean(value))
    ),
  ];

  const [{ data: households }, { data: profiles }] =
    await Promise.all([
      householdIds.length > 0
        ? admin
            .from("households")
            .select("id, name")
            .in("id", householdIds)
        : Promise.resolve({
            data: [] as Array<{
              id: string;
              name: string | null;
            }>,
          }),
      inviterIds.length > 0
        ? admin
            .from("profiles")
            .select("id, full_name")
            .in("id", inviterIds)
        : Promise.resolve({
            data: [] as Array<{
              id: string;
              full_name: string | null;
            }>,
          }),
    ]);

  const householdMap = new Map(
    (households ?? []).map((household) => [
      household.id,
      household.name as string | null,
    ])
  );

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      profile.full_name as string | null,
    ])
  );

  const inviterEmails = new Map<string, string | null>();

  for (const inviterId of inviterIds) {
    const { data } = await admin.auth.admin.getUserById(
      inviterId
    );
    inviterEmails.set(
      inviterId,
      data.user?.email ?? null
    );
  }

  return rows
    .map((row) => {
      const invitationType = resolveInvitationType(row);
      const role =
        invitationType === INVITATION_TYPE_JOIN_HOUSEHOLD
          ? parseInviteRole(row.role)
          : null;

      if (!invitationType) {
        return null;
      }

      if (
        invitationType === INVITATION_TYPE_JOIN_HOUSEHOLD &&
        !role
      ) {
        return null;
      }

      return {
        id: row.id,
        email: row.email,
        firstName: row.first_name ?? null,
        lastName: row.last_name ?? null,
        invitationType,
        householdId: row.household_id,
        householdName: row.household_id
          ? householdMap.get(row.household_id) ?? null
          : null,
        role,
        invitedBy: row.invited_by,
        invitedByName: row.invited_by
          ? profileMap.get(row.invited_by) ?? null
          : null,
        invitedByEmail: row.invited_by
          ? inviterEmails.get(row.invited_by) ?? null
          : null,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        status: invitationStatus(row.expires_at),
      } satisfies AdminPendingInvitation;
    })
    .filter(
      (row): row is AdminPendingInvitation =>
        row !== null && row.status === "pending"
    );
}

export async function createAdminUserInvitation(input: {
  admin: SupabaseClient;
  actor: {
    userId: string;
    email: string | null;
    fullName?: string | null;
  };
  payload: AdminInviteUserInput;
  inviteRoutePath?: string;
}) {
  const email = normalizeInviteEmail(input.payload.email);
  const invitationType =
    parseInvitationType(input.payload.invitationType);

  if (!invitationType) {
    return {
      ok: false as const,
      status: 400,
      error: "Select a valid invitation type.",
    };
  }
  const firstName = input.payload.firstName?.trim() || null;
  const lastName = input.payload.lastName?.trim() || null;

  if (!isValidInviteEmail(email)) {
    return {
      ok: false as const,
      status: 400,
      error: "Enter a valid email address.",
    };
  }

  const inviterName =
    input.actor.fullName?.trim() ||
    input.actor.email ||
    "A Home Tech Vault administrator";

  if (invitationType === INVITATION_TYPE_CREATE_ACCOUNT) {
    return createNewAccountInvitation({
      admin: input.admin,
      actorUserId: input.actor.userId,
      email,
      firstName,
      lastName,
      inviterName,
      inviteRoutePath:
        input.inviteRoutePath ??
        "/api/admin/users/invite",
    });
  }

  const role = parseInviteRole(input.payload.role);
  const householdId =
    input.payload.householdId?.trim() || "";

  if (!role) {
    return {
      ok: false as const,
      status: 400,
      error: "Select a valid household role.",
    };
  }

  if (!householdId) {
    return {
      ok: false as const,
      status: 400,
      error: "Select a household.",
    };
  }

  return createHouseholdMemberInvitation({
    admin: input.admin,
    actorUserId: input.actor.userId,
    email,
    firstName,
    lastName,
    role,
    householdId,
    inviterName,
  });
}

async function createNewAccountInvitation(input: {
  admin: SupabaseClient;
  actorUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  inviterName: string;
  inviteRoutePath: string;
}) {
  logInviteStage("validate_new_account", {
    email: input.email,
  });

  const existingAuthUser = await findAuthUserByEmail(
    input.admin,
    input.email
  );

  if (existingAuthUser) {
    const { data: ownedHousehold } = await input.admin
      .from("households")
      .select("id")
      .eq("owner_id", existingAuthUser.id)
      .maybeSingle();

    if (ownedHousehold) {
      return {
        ok: false as const,
        status: 409,
        error:
          "This email already has a Home Tech Vault account.",
      };
    }
  }

  const existingInvite =
    await findCreateAccountInvitationByEmail(
      input.admin,
      input.email
    );

  if (
    existingInvite &&
    invitationStatus(existingInvite.expires_at) ===
      "pending"
  ) {
    return {
      ok: false as const,
      status: 409,
      error:
        "An invitation is already pending for this email.",
    };
  }

  const token = generateInvitationToken();
  const expiresAt = buildInvitationExpiresAt();

  const deliveryResult =
    await deliverCreateAccountInvitationEmail({
      admin: input.admin,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      invitationToken: token,
      actorUserId: input.actorUserId,
      inviterName: input.inviterName,
      expiresAt,
      existingAuthUser,
      inviteRoutePath: input.inviteRoutePath,
    });

  if (!deliveryResult.ok) {
    return {
      ok: false as const,
      status: deliveryResult.status || 500,
      error:
        deliveryResult.error ||
        "The invitation email could not be sent.",
    };
  }

  const shouldCleanupAuthUserOnDbFailure =
    !existingAuthUser;

  const recordPayload: Record<string, unknown> = {
    invitation_type: INVITATION_TYPE_CREATE_ACCOUNT,
    household_id: null,
    role: null,
    email: input.email,
    invited_by: input.actorUserId,
    token,
    expires_at: expiresAt,
  };

  if (input.firstName) {
    recordPayload.first_name = input.firstName;
  }

  if (input.lastName) {
    recordPayload.last_name = input.lastName;
  }

  logInviteStage("save_invitation_record", {
    email: input.email,
    reusingExpiredInvite: Boolean(existingInvite),
  });

  let invitation: InvitationRow;

  try {
    invitation = await saveInvitationRecord(
      input.admin,
      recordPayload,
      existingInvite
        ? { existingId: existingInvite.id }
        : undefined
    );
  } catch (insertError) {
    if (shouldCleanupAuthUserOnDbFailure) {
      console.error(
        "[admin-invite] Invitation email succeeded but database record failed:",
        {
          email: input.email,
        }
      );

      await deleteInvitedAuthUserIfNew(
        input.admin,
        input.email,
        Boolean(existingAuthUser)
      );
    }

    return {
      ok: false as const,
      status: 500,
      error: mapInvitationInsertError(
        insertError as DbError
      ),
    };
  }

  let deliveryWarning: string | null =
    deliveryResult.deliveryWarning ?? null;
  const delivery = deliveryResult.delivery;

  const [mapped] = await mapInvitationRows(input.admin, [
    invitation,
  ]);

  logInviteStage("invite_complete", {
    email: input.email,
    delivery,
  });

  return {
    ok: true as const,
    invitation: mapped,
    delivery,
    deliveryWarning,
    message: `Invitation sent to ${input.email}. The invitee can complete account setup from the email link.`,
  };
}

async function createHouseholdMemberInvitation(input: {
  admin: SupabaseClient;
  actorUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: AdminHouseholdInviteRole;
  householdId: string;
  inviterName: string;
}) {
  const { data: household, error: householdError } =
    await input.admin
      .from("households")
      .select("id, name, owner_id")
      .eq("id", input.householdId)
      .maybeSingle();

  if (householdError) {
    throw householdError;
  }

  if (!household) {
    return {
      ok: false as const,
      status: 404,
      error: "Household not found.",
    };
  }

  const existingAuthUser = await findAuthUserByEmail(
    input.admin,
    input.email
  );

  if (existingAuthUser) {
    const { data: membership } = await input.admin
      .from("household_members")
      .select("id")
      .eq("household_id", input.householdId)
      .eq("user_id", existingAuthUser.id)
      .maybeSingle();

    if (membership) {
      return {
        ok: false as const,
        status: 409,
        error:
          "This user is already a member of the selected household.",
      };
    }
  }

  const existingInvite =
    await findHouseholdInvitationByEmail(
      input.admin,
      input.email,
      input.householdId
    );

  if (
    existingInvite &&
    invitationStatus(existingInvite.expires_at) ===
      "pending"
  ) {
    return {
      ok: false as const,
      status: 409,
      error:
        "An invitation is already pending for this email.",
    };
  }

  const token = generateInvitationToken();
  const expiresAt = buildInvitationExpiresAt();

  const insertPayload: Record<string, unknown> = {
    invitation_type: INVITATION_TYPE_JOIN_HOUSEHOLD,
    household_id: input.householdId,
    email: input.email,
    role: input.role,
    invited_by: input.actorUserId,
    token,
    expires_at: expiresAt,
  };

  if (input.firstName) {
    insertPayload.first_name = input.firstName;
  }

  if (input.lastName) {
    insertPayload.last_name = input.lastName;
  }

  const householdName =
    (household.name as string | null)?.trim() ||
    "Home Tech Vault household";

  let delivery: "auth_invite" | "household_email" =
    "household_email";
  let deliveryWarning: string | null = null;
  let authInviteSent = false;

  if (!existingAuthUser) {
    const fullName = buildFullName(
      input.firstName,
      input.lastName
    );

    logInviteStage("send_household_auth_invite", {
      email: input.email,
    });

    const authInviteError = await sendAuthInviteEmail(
      input.admin,
      {
        email: input.email,
        redirectTo: buildJoinHouseholdInviteRedirectUrl(),
        metadata: buildJoinHouseholdAuthInviteMetadata({
          firstName: input.firstName,
          lastName: input.lastName,
          invitationToken: token,
          invitedByPlatformAdmin: input.actorUserId,
          householdId: input.householdId,
          householdRole: input.role,
        }),
      }
    );

    if (authInviteError) {
      console.error("[admin-invite] Supabase invite failed:", {
        message: authInviteError.message,
        status: authInviteError.status,
        code: authInviteError.code,
      });

      const message = authInviteError.message.toLowerCase();

      if (
        !(
          message.includes("already") ||
          message.includes("registered") ||
          message.includes("exists")
        )
      ) {
        return {
          ok: false as const,
          status: authInviteError.status || 500,
          error: mapAuthInviteErrorMessage(
            authInviteError.message
          ),
        };
      }
    } else {
      authInviteSent = true;
      delivery = "auth_invite";
    }
  }

  logInviteStage("save_household_invitation", {
    email: input.email,
    householdId: input.householdId,
    reusingExpiredInvite: Boolean(existingInvite),
  });

  let invitation: InvitationRow;

  try {
    invitation = await saveInvitationRecord(
      input.admin,
      insertPayload,
      existingInvite
        ? { existingId: existingInvite.id }
        : undefined
    );
  } catch (insertError) {
    if (authInviteSent) {
      console.error(
        "[admin-invite] Auth invitation succeeded but household invitation record failed:",
        {
          email: input.email,
          householdId: input.householdId,
        }
      );

      await deleteInvitedAuthUserIfNew(
        input.admin,
        input.email,
        Boolean(existingAuthUser)
      );
    }

    return {
      ok: false as const,
      status: 500,
      error: mapInvitationInsertError(
        insertError as DbError
      ),
    };
  }

  if (!authInviteSent || existingAuthUser) {
    logInviteStage("send_household_email_fallback", {
      email: input.email,
    });

    const emailResult = await sendHouseholdInvitationEmail({
      email: input.email,
      inviterName: input.inviterName,
      householdName,
      role: input.role,
      token: invitation.token,
      expiresAt: invitation.expires_at,
    });

    if (!emailResult.ok) {
      deliveryWarning =
        emailResult.code === "not_configured"
          ? "Invitation saved, but email delivery is not configured. Set RESEND_API_KEY or resend the invitation after configuring email."
          : "Invitation saved, but the email could not be delivered. You can resend it from the directory.";
    }

    delivery = "household_email";
  }

  const [mapped] = await mapInvitationRows(input.admin, [
    invitation,
  ]);

  logInviteStage("household_invite_complete", {
    email: input.email,
    delivery,
  });

  return {
    ok: true as const,
    invitation: mapped,
    delivery,
    deliveryWarning,
    message:
      delivery === "auth_invite"
        ? `Invitation sent to ${input.email}. The invitee will create their password and then join the household.`
        : `Invitation sent to ${input.email}. The invitee can sign in and accept the household invitation.`,
  };
}

export async function resendAdminUserInvitation(input: {
  admin: SupabaseClient;
  actor: {
    userId: string;
    email: string | null;
    fullName?: string | null;
  };
  invitationId: string;
  inviteRoutePath?: string;
}) {
  const row = await selectInvitationById(
    input.admin,
    input.invitationId
  );

  if (!row || row.accepted_at) {
    return {
      ok: false as const,
      status: 404,
      error: "Pending invitation not found.",
    };
  }

  if (invitationStatus(row.expires_at) === "expired") {
    return {
      ok: false as const,
      status: 410,
      error: "This invitation has expired.",
    };
  }

  const invitationType = resolveInvitationType(row);

  if (!invitationType) {
    return {
      ok: false as const,
      status: 400,
      error: "This invitation has an invalid type.",
    };
  }

  const inviterName =
    input.actor.fullName?.trim() ||
    input.actor.email ||
    "A Home Tech Vault administrator";

  const existingAuthUser = await findAuthUserByEmail(
    input.admin,
    row.email
  );

  if (invitationType === INVITATION_TYPE_CREATE_ACCOUNT) {
    const deliveryResult =
      await deliverCreateAccountInvitationEmail({
        admin: input.admin,
        email: normalizeInviteEmail(row.email),
        firstName: row.first_name ?? null,
        lastName: row.last_name ?? null,
        invitationToken: row.token,
        actorUserId: input.actor.userId,
        inviterName,
        expiresAt: row.expires_at,
        existingAuthUser,
        inviteRoutePath:
          input.inviteRoutePath ??
          "/api/admin/users/invitations/resend",
      });

    if (!deliveryResult.ok) {
      return {
        ok: false as const,
        status: deliveryResult.status || 500,
        error:
          deliveryResult.error ||
          "Unable to resend the invitation email.",
      };
    }

    return {
      ok: true as const,
      message:
        "Invitation resent with a secure setup link.",
      deliveryWarning:
        deliveryResult.deliveryWarning ?? undefined,
    };
  }

  const role = parseInviteRole(row.role);

  if (!role || !row.household_id) {
    return {
      ok: false as const,
      status: 400,
      error: "This invitation has an invalid household role.",
    };
  }

  const { data: household } = await input.admin
    .from("households")
    .select("name")
    .eq("id", row.household_id)
    .maybeSingle();

  const householdName =
    (household?.name as string | null)?.trim() ||
    "Home Tech Vault household";

  if (!existingAuthUser) {
    const authInviteError = await sendAuthInviteEmail(
      input.admin,
      {
        email: normalizeInviteEmail(row.email),
        redirectTo: buildJoinHouseholdInviteRedirectUrl(),
        metadata: buildJoinHouseholdAuthInviteMetadata({
          firstName: row.first_name,
          lastName: row.last_name,
          invitationToken: row.token,
          invitedByPlatformAdmin: input.actor.userId,
          householdId: row.household_id,
          householdRole: role,
        }),
      }
    );

    if (!authInviteError) {
      return {
        ok: true as const,
        message: "Invitation resent.",
      };
    }
  }

  const emailResult = await sendHouseholdInvitationEmail({
    email: normalizeInviteEmail(row.email),
    inviterName,
    householdName,
    role,
    token: row.token,
    expiresAt: row.expires_at,
  });

  if (!emailResult.ok) {
    return {
      ok: false as const,
      status: 500,
      error: "Unable to resend the invitation email.",
    };
  }

  return {
    ok: true as const,
    message: "Invitation resent.",
  };
}

export async function revokeAdminUserInvitation(input: {
  admin: SupabaseClient;
  invitationId: string;
}) {
  const invitation = await selectInvitationById(
    input.admin,
    input.invitationId
  );

  if (!invitation || invitation.accepted_at) {
    return {
      ok: false as const,
      status: 404,
      error: "Pending invitation not found.",
    };
  }

  const { error: deleteError } = await input.admin
    .from("household_invitations")
    .delete()
    .eq("id", input.invitationId);

  if (deleteError) {
    throw deleteError;
  }

  return {
    ok: true as const,
    message: "Invitation revoked.",
  };
}

export async function loadInvitationByToken(
  admin: SupabaseClient,
  token: string
) {
  const { data, error } = await admin
    .from("household_invitations")
    .select(INVITATION_SELECT)
    .eq("token", token)
    .maybeSingle();

  if (
    error &&
    error.message?.includes("invitation_type")
  ) {
    const fallback = await admin
      .from("household_invitations")
      .select(INVITATION_SELECT_FALLBACK)
      .eq("token", token)
      .maybeSingle();

    if (fallback.error) {
      throw fallback.error;
    }

    return fallback.data as InvitationRow | null;
  }

  if (error) {
    throw error;
  }

  return data as InvitationRow | null;
}

export async function acceptNewAccountInvitation(input: {
  admin: SupabaseClient;
  userId: string;
  userEmail: string | null;
  token: string;
  firstName: string;
  lastName: string;
  householdName: string;
}) {
  const invitation = await loadInvitationByToken(
    input.admin,
    input.token
  );

  if (!invitation || invitation.accepted_at) {
    return {
      ok: false as const,
      status: 404,
      error: "This invitation is invalid or already used.",
    };
  }

  if (invitationStatus(invitation.expires_at) === "expired") {
    return {
      ok: false as const,
      status: 410,
      error: "This invitation has expired.",
    };
  }

  const invitationType = resolveInvitationType(invitation);

  if (invitationType !== INVITATION_TYPE_CREATE_ACCOUNT) {
    return {
      ok: false as const,
      status: 400,
      error:
        "This invitation is for joining an existing household.",
    };
  }

  return completeCreateAccountHousehold({
    admin: input.admin,
    userId: input.userId,
    userEmail: input.userEmail,
    firstName: input.firstName,
    lastName: input.lastName,
    householdName: input.householdName,
    invitation,
  });
}

export function getInvitationTypeFromRow(
  row: InvitationRow
): AdminInvitationType | null {
  return resolveInvitationType(row);
}
