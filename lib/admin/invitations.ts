import "server-only";

import { createElement } from "react";

import type { SupabaseClient } from "@supabase/supabase-js";

import FamilyInvitationEmail, {
  familyInvitationSubject,
  formatHouseholdRole,
  renderFamilyInvitationPlainText,
} from "@/emails/templates/FamilyInvitationEmail";
import { sendReactEmail } from "@/lib/email/sendEmail";
import { absoluteUrl } from "@/lib/marketing/site";
import type {
  AdminHouseholdInviteRole,
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

type InvitationRow = {
  id: string;
  household_id: string;
  email: string;
  role: string;
  token: string;
  invited_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
};

export function normalizeInviteEmail(value: string) {
  return value.trim().toLowerCase();
}

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

function buildAcceptanceUrl(token: string) {
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
  const acceptanceUrl = buildAcceptanceUrl(input.token);
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

export async function loadAdminPendingInvitations(
  admin: SupabaseClient,
  options?: {
    q?: string;
    role?: string;
    householdId?: string;
  }
): Promise<AdminPendingInvitation[]> {
  let query = admin
    .from("household_invitations")
    .select(
      "id, household_id, email, role, token, invited_by, accepted_at, expires_at, created_at, first_name, last_name"
    )
    .is("accepted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (options?.householdId) {
    query = query.eq("household_id", options.householdId);
  }

  if (options?.role) {
    query = query.eq("role", options.role);
  }

  if (options?.q?.trim()) {
    const term = `%${options.q.trim()}%`;
    query = query.ilike("email", term);
  }

  const { data, error } = await query;

  if (error) {
    // Optional columns may not exist until migration is applied.
    if (
      error.message?.includes("first_name") ||
      error.message?.includes("last_name")
    ) {
      const fallback = await admin
        .from("household_invitations")
        .select(
          "id, household_id, email, role, token, invited_by, accepted_at, expires_at, created_at"
        )
        .is("accepted_at", null)
        .order("created_at", { ascending: false })
        .limit(200);

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
    ...new Set(rows.map((row) => row.household_id)),
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
      admin
        .from("households")
        .select("id, name")
        .in("id", householdIds),
      inviterIds.length > 0
        ? admin
            .from("profiles")
            .select("id, full_name")
            .in("id", inviterIds)
        : Promise.resolve({ data: [] as Array<{
            id: string;
            full_name: string | null;
          }> }),
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
    .filter((row) => {
      const role = parseInviteRole(row.role);
      return role !== null;
    })
    .map((row) => {
      const role = parseInviteRole(row.role)!;

      return {
        id: row.id,
        email: row.email,
        firstName: row.first_name ?? null,
        lastName: row.last_name ?? null,
        householdId: row.household_id,
        householdName:
          householdMap.get(row.household_id) ?? null,
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
    .filter((row) => row.status === "pending");
}

export async function createAdminUserInvitation(input: {
  admin: SupabaseClient;
  actor: {
    userId: string;
    email: string | null;
    fullName?: string | null;
  };
  payload: AdminInviteUserInput;
}) {
  const email = normalizeInviteEmail(input.payload.email);
  const role = parseInviteRole(input.payload.role);
  const householdId = input.payload.householdId.trim();
  const firstName = input.payload.firstName?.trim() || null;
  const lastName = input.payload.lastName?.trim() || null;

  if (!isValidInviteEmail(email)) {
    return {
      ok: false as const,
      status: 400,
      error: "Enter a valid email address.",
    };
  }

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

  const { data: household, error: householdError } =
    await input.admin
      .from("households")
      .select("id, name, owner_id")
      .eq("id", householdId)
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
    email
  );

  if (existingAuthUser) {
    const { data: membership } = await input.admin
      .from("household_members")
      .select("id")
      .eq("household_id", householdId)
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

  const { data: existingInvite } = await input.admin
    .from("household_invitations")
    .select("id")
    .eq("household_id", householdId)
    .ilike("email", email)
    .is("accepted_at", null)
    .maybeSingle();

  if (existingInvite) {
    return {
      ok: false as const,
      status: 409,
      error:
        "A pending invitation already exists for this email in the selected household.",
    };
  }

  const insertPayload: Record<string, unknown> = {
    household_id: householdId,
    email,
    role,
    invited_by: input.actor.userId,
  };

  if (firstName) {
    insertPayload.first_name = firstName;
  }

  if (lastName) {
    insertPayload.last_name = lastName;
  }

  let invitation: InvitationRow | null = null;

  {
    const { data, error } = await input.admin
      .from("household_invitations")
      .insert(insertPayload)
      .select(
        "id, household_id, email, role, token, invited_by, accepted_at, expires_at, created_at, first_name, last_name"
      )
      .single();

    if (
      error &&
      (error.message?.includes("first_name") ||
        error.message?.includes("last_name"))
    ) {
      const fallback = await input.admin
        .from("household_invitations")
        .insert({
          household_id: householdId,
          email,
          role,
          invited_by: input.actor.userId,
        })
        .select(
          "id, household_id, email, role, token, invited_by, accepted_at, expires_at, created_at"
        )
        .single();

      if (fallback.error) {
        throw fallback.error;
      }

      invitation = fallback.data as InvitationRow;
    } else if (error) {
      throw error;
    } else {
      invitation = data as InvitationRow;
    }
  }

  if (!invitation) {
    return {
      ok: false as const,
      status: 500,
      error: "Unable to create the invitation.",
    };
  }

  const inviterName =
    input.actor.fullName?.trim() ||
    input.actor.email ||
    "A Home Tech Vault administrator";

  const householdName =
    (household.name as string | null)?.trim() ||
    "Home Tech Vault household";

  let delivery: "auth_invite" | "household_email" =
    "household_email";
  let deliveryWarning: string | null = null;

  if (!existingAuthUser) {
    const fullName = buildFullName(firstName, lastName);
    const redirectTo = buildAcceptanceUrl(invitation.token);

    const { error: authInviteError } =
      await input.admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: {
          full_name: fullName || undefined,
          invitation_token: invitation.token,
          household_id: householdId,
          household_role: role,
        },
      });

    if (authInviteError) {
      const message = authInviteError.message.toLowerCase();

      if (
        message.includes("already") ||
        message.includes("registered") ||
        message.includes("exists")
      ) {
        delivery = "household_email";
      } else {
        await input.admin
          .from("household_invitations")
          .delete()
          .eq("id", invitation.id);

        return {
          ok: false as const,
          status: 500,
          error:
            "Unable to send the account invitation. Please try again.",
        };
      }
    } else {
      delivery = "auth_invite";
    }
  }

  if (delivery === "household_email" || existingAuthUser) {
    const emailResult = await sendHouseholdInvitationEmail({
      email,
      inviterName,
      householdName,
      role,
      token: invitation.token,
      expiresAt: invitation.expires_at,
    });

    if (!emailResult.ok) {
      deliveryWarning =
        "Invitation saved, but the email could not be delivered. You can resend it from the directory.";
      delivery = "household_email";
    } else {
      delivery = "household_email";
    }
  }

  const [mapped] = await mapInvitationRows(input.admin, [
    invitation,
  ]);

  return {
    ok: true as const,
    invitation: mapped,
    delivery,
    deliveryWarning,
    message:
      delivery === "auth_invite"
        ? "Invitation sent. The invitee will create their password and then join the household."
        : "Invitation sent. The invitee can sign in and accept the household invitation.",
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
}) {
  const { data: invitation, error } = await input.admin
    .from("household_invitations")
    .select(
      "id, household_id, email, role, token, invited_by, accepted_at, expires_at, created_at, first_name, last_name"
    )
    .eq("id", input.invitationId)
    .maybeSingle();

  let row = invitation as InvitationRow | null;

  if (
    error &&
    (error.message?.includes("first_name") ||
      error.message?.includes("last_name"))
  ) {
    const fallback = await input.admin
      .from("household_invitations")
      .select(
        "id, household_id, email, role, token, invited_by, accepted_at, expires_at, created_at"
      )
      .eq("id", input.invitationId)
      .maybeSingle();

    if (fallback.error) {
      throw fallback.error;
    }

    row = fallback.data as InvitationRow | null;
  } else if (error) {
    throw error;
  }

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

  const role = parseInviteRole(row.role);

  if (!role) {
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

  const existingAuthUser = await findAuthUserByEmail(
    input.admin,
    row.email
  );

  const inviterName =
    input.actor.fullName?.trim() ||
    input.actor.email ||
    "A Home Tech Vault administrator";

  const householdName =
    (household?.name as string | null)?.trim() ||
    "Home Tech Vault household";

  if (!existingAuthUser) {
    const fullName = buildFullName(
      row.first_name,
      row.last_name
    );

    const { error: authInviteError } =
      await input.admin.auth.admin.inviteUserByEmail(
        normalizeInviteEmail(row.email),
        {
          redirectTo: buildAcceptanceUrl(row.token),
          data: {
            full_name: fullName || undefined,
            invitation_token: row.token,
            household_id: row.household_id,
            household_role: role,
          },
        }
      );

    if (
      authInviteError &&
      !authInviteError.message.toLowerCase().includes("already")
    ) {
      // Fall through to household email.
    } else if (!authInviteError) {
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
  const { data: invitation, error } = await input.admin
    .from("household_invitations")
    .select("id, accepted_at")
    .eq("id", input.invitationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

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
