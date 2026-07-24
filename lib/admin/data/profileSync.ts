import "server-only";

import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminClient = SupabaseClient;

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string
) {
  const value = metadata?.[key];

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

export function buildProfileInsertFromAuthUser(
  user: User
) {
  const metadata =
    (user.user_metadata ?? {}) as Record<
      string,
      unknown
    >;

  const firstName = readMetadataString(
    metadata,
    "first_name"
  );
  const lastName = readMetadataString(
    metadata,
    "last_name"
  );

  const fullName =
    readMetadataString(metadata, "full_name") ||
    [firstName, lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    (user.email
      ? user.email.split("@")[0]
      : "Home Tech Vault User");

  const householdName = readMetadataString(
    metadata,
    "household_name"
  );

  return {
    id: user.id,
    full_name: fullName,
    household_name: householdName,
    account_status: "active",
    created_at:
      user.created_at ??
      new Date().toISOString(),
  };
}

export async function ensureProfilesForAuthUsers(
  admin: AdminClient,
  users: User[]
) {
  if (users.length === 0) {
    return 0;
  }

  const userIds = users.map((user) => user.id);

  const [
    { data: existingRows, error: existingError },
    { data: failedDeletionRows, error: failedDeletionError },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id")
      .in("id", userIds),
    admin
      .from("admin_account_deletion_jobs")
      .select("target_user_id, current_step")
      .in("target_user_id", userIds)
      .eq("status", "failed")
      .in("current_step", [
        "delete_auth_user",
        "delete_profile",
      ]),
  ]);

  if (existingError) {
    throw existingError;
  }

  if (failedDeletionError) {
    console.warn(
      "[profile-sync] unable to inspect failed deletion jobs:",
      failedDeletionError.message
    );
  }

  const failedDeletionIds = new Set(
    (failedDeletionRows ?? []).map(
      (row) => row.target_user_id
    )
  );

  const existingIds = new Set(
    (existingRows ?? []).map((row) => row.id)
  );

  const missingUsers = users.filter(
    (user) =>
      !existingIds.has(user.id) &&
      !failedDeletionIds.has(user.id)
  );

  if (missingUsers.length === 0) {
    return 0;
  }

  const verifiedMissingUsers: User[] = [];

  for (const user of missingUsers) {
    const { data, error } =
      await admin.auth.admin.getUserById(user.id);

    if (error || !data.user?.id) {
      continue;
    }

    verifiedMissingUsers.push(user);
  }

  if (verifiedMissingUsers.length === 0) {
    return 0;
  }

  const { error: insertError } = await admin
    .from("profiles")
    .upsert(
      verifiedMissingUsers.map(
        buildProfileInsertFromAuthUser
      ),
      { onConflict: "id" }
    );

  if (insertError) {
    console.error(
      "[profile-sync] failed to create missing profiles:",
      {
        count: missingUsers.length,
        message: insertError.message,
        code: insertError.code,
      }
    );

    throw insertError;
  }

  console.info(
    "[profile-sync] created missing profiles:",
    {
      count: missingUsers.length,
      userIds: missingUsers.map(
        (user) => user.id
      ),
    }
  );

  return missingUsers.length;
}

function matchesAuthUserSearch(
  user: User,
  term: string
) {
  const normalized = term.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const email = user.email?.toLowerCase() ?? "";
  const metadata =
    (user.user_metadata ?? {}) as Record<
      string,
      unknown
    >;
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name.toLowerCase()
      : "";

  return (
    user.id.toLowerCase() === normalized ||
    email.includes(normalized) ||
    fullName.includes(normalized)
  );
}

export async function listAuthUsersForAdmin(
  admin: AdminClient,
  options: {
    page: number;
    perPage: number;
    q?: string;
  }
) {
  if (options.q?.trim()) {
    const normalized = options.q.trim().toLowerCase();
    const matches: User[] = [];
    let scanPage = 1;

    while (scanPage <= 50) {
      const { data, error } =
        await admin.auth.admin.listUsers({
          page: scanPage,
          perPage: 200,
        });

      if (error) {
        throw error;
      }

      const batch = data.users ?? [];

      for (const user of batch) {
        if (matchesAuthUserSearch(user, normalized)) {
          matches.push(user);
        }
      }

      if (batch.length < 200) {
        break;
      }

      scanPage += 1;
    }

    const start = (options.page - 1) * options.perPage;
    const end = start + options.perPage;

    return {
      users: matches.slice(start, end),
      total: matches.length,
    };
  }

  const { data, error } =
    await admin.auth.admin.listUsers({
      page: options.page,
      perPage: options.perPage,
    });

  if (error) {
    throw error;
  }

  const users = data.users ?? [];
  const total =
    typeof (data as { total?: unknown }).total ===
    "number"
      ? ((data as { total: number }).total ??
        users.length)
      : users.length;

  return {
    users,
    total,
  };
}

export async function repairMissingAuthProfiles(
  admin: AdminClient,
  options?: {
    maxRepairs?: number;
  }
) {
  const maxRepairs = options?.maxRepairs ?? 500;
  let repaired = 0;
  let page = 1;

  while (repaired < maxRepairs && page <= 50) {
    const { data, error } =
      await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });

    if (error) {
      throw error;
    }

    const users = data.users ?? [];

    if (users.length === 0) {
      break;
    }

    repaired += await ensureProfilesForAuthUsers(
      admin,
      users.slice(0, maxRepairs - repaired)
    );

    if (users.length < 200) {
      break;
    }

    page += 1;
  }

  return repaired;
}
