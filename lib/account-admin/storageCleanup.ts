import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const STORAGE_BUCKETS = [
  "documents",
  "device-documents",
  "device-images",
] as const;

async function removeStoragePrefix(
  admin: SupabaseClient,
  bucket: string,
  prefix: string
) {
  const limit = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await admin.storage
      .from(bucket)
      .list(prefix, {
        limit,
        offset,
        sortBy: {
          column: "name",
          order: "asc",
        },
      });

    if (error) {
      throw error;
    }

    const entries = data ?? [];

    if (entries.length === 0) {
      break;
    }

    const filePaths = entries
      .filter((entry) => entry.id)
      .map((entry) =>
        prefix
          ? `${prefix}/${entry.name}`
          : entry.name
      );

    if (filePaths.length > 0) {
      const { error: removeError } =
        await admin.storage
          .from(bucket)
          .remove(filePaths);

      if (removeError) {
        throw removeError;
      }
    }

    if (entries.length < limit) {
      break;
    }

    offset += limit;
  }
}

export async function cleanupUserStorage(
  admin: SupabaseClient,
  options: {
    userId: string;
    householdIds: string[];
  }
) {
  const prefixes = new Set<string>([
    options.userId,
    ...options.householdIds,
  ]);

  for (const bucket of STORAGE_BUCKETS) {
    for (const prefix of prefixes) {
      await removeStoragePrefix(
        admin,
        bucket,
        prefix
      );
    }
  }
}
