import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type AdminActivationMetrics = {
  cohortStart: string;
  signups: number;
  addedOneDevice: number;
  addedThreeDevices: number;
  zeroDeviceUsers: number;
  oneOrTwoDeviceUsers: number;
};

export async function loadAdminActivationMetrics(): Promise<AdminActivationMetrics> {
  const admin = createAdminClient();

  const cohortStart = new Date();
  cohortStart.setUTCDate(
    cohortStart.getUTCDate() - 30
  );

  /*
   * Activation cohort:
   * users whose profiles were created during
   * the same rolling 30-day period shown in Analytics.
   */
  const {
    data: profiles,
    error: profilesError,
  } = await admin
    .from("profiles")
    .select("id, created_at")
    .gte(
      "created_at",
      cohortStart.toISOString()
    );

  if (profilesError) {
    console.error(
      "[admin activation] profiles query failed:",
      profilesError.message
    );

    return {
      cohortStart:
        cohortStart.toISOString(),
      signups: 0,
      addedOneDevice: 0,
      addedThreeDevices: 0,
      zeroDeviceUsers: 0,
      oneOrTwoDeviceUsers: 0,
    };
  }

  const profileIds = (
    profiles ?? []
  )
    .map((profile) => profile.id)
    .filter(
      (id): id is string =>
        typeof id === "string" &&
        id.length > 0
    );

  if (profileIds.length === 0) {
    return {
      cohortStart:
        cohortStart.toISOString(),
      signups: 0,
      addedOneDevice: 0,
      addedThreeDevices: 0,
      zeroDeviceUsers: 0,
      oneOrTwoDeviceUsers: 0,
    };
  }

  /*
   * Devices already carry user_id, so we can derive
   * current activation without adding another table.
   *
   * This intentionally measures:
   * "Of people who signed up in the last 30 days,
   * how many have reached each device milestone now?"
   */
  const {
    data: devices,
    error: devicesError,
  } = await admin
    .from("devices")
    .select("id, user_id")
    .in("user_id", profileIds);

  if (devicesError) {
    console.error(
      "[admin activation] devices query failed:",
      devicesError.message
    );

    return {
      cohortStart:
        cohortStart.toISOString(),
      signups: profileIds.length,
      addedOneDevice: 0,
      addedThreeDevices: 0,
      zeroDeviceUsers:
        profileIds.length,
      oneOrTwoDeviceUsers: 0,
    };
  }

  const deviceCounts =
    new Map<string, number>();

  for (const device of devices ?? []) {
    if (!device.user_id) {
      continue;
    }

    deviceCounts.set(
      device.user_id,
      (deviceCounts.get(
        device.user_id
      ) ?? 0) + 1
    );
  }

  let addedOneDevice = 0;
  let addedThreeDevices = 0;
  let zeroDeviceUsers = 0;
  let oneOrTwoDeviceUsers = 0;

  for (const profileId of profileIds) {
    const count =
      deviceCounts.get(profileId) ?? 0;

    if (count >= 1) {
      addedOneDevice += 1;
    } else {
      zeroDeviceUsers += 1;
    }

    if (count >= 3) {
      addedThreeDevices += 1;
    }

    if (
      count >= 1 &&
      count < 3
    ) {
      oneOrTwoDeviceUsers += 1;
    }
  }

  return {
    cohortStart:
      cohortStart.toISOString(),
    signups: profileIds.length,
    addedOneDevice,
    addedThreeDevices,
    zeroDeviceUsers,
    oneOrTwoDeviceUsers,
  };
}
