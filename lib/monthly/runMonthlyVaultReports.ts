
import "server-only";

import type {
  User,
} from "@supabase/supabase-js";

import {
  calculateHomeHealth,
  type HomeHealthInput,
  type HomeHealthMaintenanceTask,
} from "@/lib/home-health";

import {
  sendEmail,
} from "@/lib/email";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createMonthlyVaultReportEmail,
} from "@/lib/monthly/emailTemplate";

import {
  createMonthlyUnsubscribeUrl,
} from "@/lib/monthly/unsubscribe";

const MAX_USERS = 5000;

type RunOptions = {
  dryRun?: boolean;
};

type DeviceRow = {
  id: string;
  user_id: string | null;
  household_id: string | null;

  device_name: string | null;
  model_number: string | null;
  serial_number: string | null;

  purchase_date: string | null;
  warranty_date: string | null;
};

type ProfileRow = {
  full_name: string | null;
  household_name: string | null;
};

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://www.hometechvault.com"
  ).replace(/\/+$/, "");
}

function getReportMonth() {
  const now = new Date();

  return [
    now.getUTCFullYear(),
    String(
      now.getUTCMonth() + 1
    ).padStart(2, "0"),
  ].join("-");
}

function getReportLabel() {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(new Date());
}

function getThirtyDayCutoff() {
  return new Date(
    Date.now() -
      30 *
        24 *
        60 *
        60 *
        1000
  ).toISOString();
}

function getDaysRemaining(
  value: string | null
) {
  if (!value) {
    return null;
  }

  const expiration =
    new Date(
      `${value}T12:00:00Z`
    );

  if (
    Number.isNaN(
      expiration.getTime()
    )
  ) {
    return null;
  }

  return Math.ceil(
    (
      expiration.getTime() -
      Date.now()
    ) /
      (
        1000 *
        60 *
        60 *
        24
      )
  );
}

async function loadAuthUsers() {
  const admin =
    createAdminClient();

  const users: User[] = [];
  const perPage = 1000;

  for (
    let page = 1;
    users.length < MAX_USERS;
    page += 1
  ) {
    const {
      data,
      error,
    } =
      await admin.auth.admin.listUsers({
        page,
        perPage,
      });

    if (error) {
      throw error;
    }

    users.push(...data.users);

    if (
      data.users.length <
      perPage
    ) {
      break;
    }
  }

  return users.slice(
    0,
    MAX_USERS
  );
}

async function getHouseholdId(
  userId: string
) {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data?.household_id ??
    null
  ) as string | null;
}


async function resolveHouseholdRecipient(
  householdId: string,
  users: User[]
): Promise<User | null> {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from("household_members")
    .select(
      "user_id, role, joined_at"
    )
    .eq(
      "household_id",
      householdId
    );

  if (error) {
    throw error;
  }

  const rolePriority: Record<
    string,
    number
  > = {
    owner: 0,
    admin: 1,
    member: 2,
    viewer: 3,
  };

  const memberships =
    [...(data ?? [])].sort(
      (a, b) => {
        const aPriority =
          rolePriority[
            String(
              a.role || ""
            ).toLowerCase()
          ] ?? 10;

        const bPriority =
          rolePriority[
            String(
              b.role || ""
            ).toLowerCase()
          ] ?? 10;

        if (
          aPriority !==
          bPriority
        ) {
          return (
            aPriority -
            bPriority
          );
        }

        const aJoined =
          a.joined_at
            ? new Date(
                a.joined_at
              ).getTime()
            : 0;

        const bJoined =
          b.joined_at
            ? new Date(
                b.joined_at
              ).getTime()
            : 0;

        return (
          aJoined -
          bJoined
        );
      }
    );

  for (
    const membership
    of memberships
  ) {
    const matchingUser =
      users.find(
        (user) =>
          user.id ===
          membership.user_id
      );

    if (
      matchingUser?.email &&
      matchingUser
        .email_confirmed_at
    ) {
      return matchingUser;
    }
  }

  return null;
}

async function getProfile(
  userId: string
): Promise<ProfileRow> {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from("profiles")
    .select(
      "full_name, household_name"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    full_name:
      data?.full_name ?? null,
    household_name:
      data?.household_name ?? null,
  };
}

async function monthlyEnabled(
  userId: string
) {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from(
      "lifecycle_email_preferences"
    )
    .select(
      "monthly_report_enabled"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data?.monthly_report_enabled ??
    true
  );
}

async function alreadySent(
  reportKey: string,
  reportMonth: string
) {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from(
      "monthly_vault_report_log"
    )
    .select("id")
    .eq(
      "report_key",
      reportKey
    )
    .eq(
      "report_month",
      reportMonth
    )
    .eq("status", "sent")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function loadDevices(
  userId: string,
  householdId: string | null
): Promise<DeviceRow[]> {
  const admin =
    createAdminClient();

  let query = admin
    .from("devices")
    .select(
      [
        "id",
        "user_id",
        "household_id",
        "device_name",
        "model_number",
        "serial_number",
        "purchase_date",
        "warranty_date",
      ].join(",")
    );

  query = householdId
    ? query.eq(
        "household_id",
        householdId
      )
    : query.eq(
        "user_id",
        userId
      );

  const {
    data,
    error,
  } = await query;

  if (error) {
    throw error;
  }

  return (
    (data ?? []) as unknown
  ) as DeviceRow[];
}

async function loadHouseholdMetrics(
  userId: string,
  householdId: string | null,
  devices: DeviceRow[]
) {
  const admin =
    createAdminClient();

  const ids =
    devices.map(
      (device) => device.id
    );

  let documentQuery = admin
    .from("documents")
    .select(
      "id, device_id",
      {
        count: "exact",
      }
    );

  documentQuery = householdId
    ? documentQuery.eq(
        "household_id",
        householdId
      )
    : documentQuery.eq(
        "user_id",
        userId
      );

  let maintenanceQuery =
    admin
      .from("maintenance_tasks")
      .select(
        "id, device_id, title, due_date, completed"
      );

  maintenanceQuery =
    householdId
      ? maintenanceQuery.eq(
          "household_id",
          householdId
        )
      : maintenanceQuery.eq(
          "user_id",
          userId
        );

  let networkQuery = admin
    .from("network_info")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      }
    );

  networkQuery = householdId
    ? networkQuery.eq(
        "household_id",
        householdId
      )
    : networkQuery.eq(
        "user_id",
        userId
      );

  let subscriptionsQuery =
    admin
      .from("subscriptions")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      );

  subscriptionsQuery =
    householdId
      ? subscriptionsQuery.eq(
          "household_id",
          householdId
        )
      : subscriptionsQuery.eq(
          "user_id",
          userId
        );

  const [
    documentsResult,
    linkedDocumentsResult,
    imagesResult,
    maintenanceResult,
    networkResult,
    subscriptionsResult,
    familyResult,
    activityResult,
  ] = await Promise.all([
    documentQuery,

    ids.length
      ? admin
          .from(
            "device_documents"
          )
          .select("device_id")
          .in(
            "device_id",
            ids
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),

    ids.length
      ? admin
          .from("device_images")
          .select("device_id")
          .in(
            "device_id",
            ids
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),

    maintenanceQuery,

    networkQuery,

    subscriptionsQuery,

    householdId
      ? admin
          .from(
            "household_members"
          )
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          )
          .eq(
            "household_id",
            householdId
          )
      : Promise.resolve({
          count: 1,
          error: null,
        }),

    ids.length
      ? admin
          .from("device_events")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          )
          .in(
            "device_id",
            ids
          )
          .gte(
            "event_date",
            getThirtyDayCutoff()
          )
      : Promise.resolve({
          count: 0,
          error: null,
        }),
  ]);

  if (
    documentsResult.error
  ) {
    throw documentsResult.error;
  }

  if (
    maintenanceResult.error
  ) {
    throw maintenanceResult.error;
  }

  if (
    networkResult.error
  ) {
    throw networkResult.error;
  }

  if (
    subscriptionsResult.error
  ) {
    throw subscriptionsResult.error;
  }

  const directDocumentDeviceIds =
    new Set(
      (
        documentsResult.data ??
        []
      )
        .map(
          (
            row: {
              device_id?:
                string | null;
            }
          ) =>
            row.device_id ??
            null
        )
        .filter(
          (
            value
          ): value is string =>
            Boolean(value)
        )
    );

  const linkedDocumentDeviceIds =
    new Set(
      (
        linkedDocumentsResult.data ??
        []
      ).map(
        (
          row: {
            device_id: string;
          }
        ) =>
          row.device_id
      )
    );

  const documentDeviceIds =
    new Set([
      ...directDocumentDeviceIds,
      ...linkedDocumentDeviceIds,
    ]);

  const photoDeviceIds =
    new Set(
      (
        imagesResult.data ??
        []
      ).map(
        (
          row: {
            device_id: string;
          }
        ) =>
          row.device_id
      )
    );

  const maintenanceTasks =
    (
      maintenanceResult.data ??
      []
    ) as HomeHealthMaintenanceTask[];

  const maintenanceDeviceIds =
    new Set(
      maintenanceTasks
        .map(
          (task) =>
            task.device_id
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    );

  return {
    documentCount:
      documentsResult.count ??
      (
        documentsResult.data ??
        []
      ).length,

    documentDeviceIds,

    photoDeviceIds,

    maintenanceTasks,

    maintenanceDeviceIds,

    networkConfigured:
      (
        networkResult.count ??
        0
      ) > 0,

    subscriptionCount:
      subscriptionsResult.count ??
      0,

    familyMemberCount:
      familyResult.error
        ? 1
        : familyResult.count ??
          1,

    hasRecentActivity:
      !activityResult.error &&
      (
        activityResult.count ??
        0
      ) > 0,
  };
}

async function buildReport(
  user: User
) {
  const profile =
    await getProfile(
      user.id
    );

  const householdId =
    await getHouseholdId(
      user.id
    );

  const devices =
    await loadDevices(
      user.id,
      householdId
    );

  // Monthly reports become valuable after
  // the user has actually started a vault.
  if (
    devices.length === 0
  ) {
    return null;
  }

  const metrics =
    await loadHouseholdMetrics(
      user.id,
      householdId,
      devices
    );

  const rawName =
    profile.full_name?.trim() ||
    (
      typeof user.user_metadata
        ?.full_name === "string"
        ? user.user_metadata
            .full_name
            .trim()
        : ""
    );

  const emailUsername =
    user.email
      ?.split("@")[0]
      ?.trim()
      .toLowerCase() ||
    "";

  const rawFirstName =
    rawName
      ? rawName.split(/\s+/)[0] || null
      : null;

  const firstName =
    rawFirstName &&
    rawFirstName
      .toLowerCase() !==
      emailUsername
      ? rawFirstName
      : null;

  const householdName =
    profile.household_name
      ?.trim() ||
    `${firstName || "My"}'s Home Tech Vault`;

  const healthInput:
    HomeHealthInput = {
      devices:
        devices.map(
          (device) => ({
            id:
              device.id,
            device_name:
              device.device_name
                ?.trim() ||
              "Unnamed Device",
            warranty_date:
              device.warranty_date,
            serial_number:
              device.serial_number,
            purchase_date:
              device.purchase_date,
          })
        ),

      documentCount:
        metrics.documentCount,

      subscriptionCount:
        metrics.subscriptionCount,

      networkConfigured:
        metrics.networkConfigured,

      deviceIdsWithDocuments:
        metrics.documentDeviceIds,

      deviceIdsWithPhotos:
        metrics.photoDeviceIds,

      deviceIdsWithMaintenance:
        metrics.maintenanceDeviceIds,

      maintenanceTasks:
        metrics.maintenanceTasks,

      hasRecentActivity:
        metrics.hasRecentActivity,

      householdName,

      familyMemberCount:
        metrics.familyMemberCount,

      profileHouseholdName:
        profile.household_name,
    };

  const homeHealth =
    calculateHomeHealth(
      healthInput
    );

  const completeDeviceCount =
    devices.filter(
      (device) =>
        Boolean(
          device.model_number?.trim()
        ) &&
        Boolean(
          device.serial_number?.trim()
        ) &&
        Boolean(
          device.warranty_date
        ) &&
        metrics.documentDeviceIds.has(
          device.id
        )
    ).length;

  const missingSerialCount =
    devices.filter(
      (device) =>
        !device.serial_number
          ?.trim()
    ).length;

  const missingWarrantyCount =
    devices.filter(
      (device) =>
        !device.warranty_date
    ).length;

  const warrantyTrackedCount =
    devices.length -
    missingWarrantyCount;

  const expiringWarrantyCount =
    devices.filter(
      (device) => {
        const days =
          getDaysRemaining(
            device.warranty_date
          );

        return (
          days !== null &&
          days >= 0 &&
          days <= 90
        );
      }
    ).length;

  const devicesWithoutDocuments =
    devices.filter(
      (device) =>
        !metrics
          .documentDeviceIds
          .has(device.id)
    ).length;

  return {
    firstName,
    householdId,

    score:
      homeHealth.score ?? 0,

    status:
      homeHealth.status,

    recommendation:
      homeHealth.recommendation
        ? {
            title:
              homeHealth
                .recommendation
                .title,
            description:
              homeHealth
                .recommendation
                .description,
          }
        : null,

    deviceCount:
      devices.length,

    completeDeviceCount,

    documentCount:
      metrics.documentCount,

    warrantyTrackedCount,

    missingWarrantyCount,

    expiringWarrantyCount,

    missingSerialCount,

    devicesWithoutDocuments,

    networkConfigured:
      metrics.networkConfigured,
  };
}

async function recordPending(input: {
  userId: string;
  email: string;
  reportKey: string;
  reportMonth: string;

  score: number;
  status: string | null;

  deviceCount: number;
  documentCount: number;
}) {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from(
      "monthly_vault_report_log"
    )
    .upsert(
      {
        user_id:
          input.userId,

        recipient_email:
          input.email,

        report_key:
          input.reportKey,

        report_month:
          input.reportMonth,

        vault_score:
          input.score,

        vault_status:
          input.status,

        device_count:
          input.deviceCount,

        document_count:
          input.documentCount,

        status:
          "pending",

        attempted_at:
          new Date()
            .toISOString(),

        updated_at:
          new Date()
            .toISOString(),
      },
      {
        onConflict:
          "report_key,report_month",
      }
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

async function markSent(
  logId: string,
  providerId: string | null
) {
  const admin =
    createAdminClient();

  const {
    error,
  } = await admin
    .from(
      "monthly_vault_report_log"
    )
    .update({
      status:
        "sent",

      provider_message_id:
        providerId,

      sent_at:
        new Date()
          .toISOString(),

      updated_at:
        new Date()
          .toISOString(),

      error_message:
        null,
    })
    .eq(
      "id",
      logId
    );

  if (error) {
    throw error;
  }
}

async function markFailed(
  logId: string,
  message: string
) {
  const admin =
    createAdminClient();

  await admin
    .from(
      "monthly_vault_report_log"
    )
    .update({
      status:
        "failed",

      error_message:
        message.slice(
          0,
          1000
        ),

      updated_at:
        new Date()
          .toISOString(),
    })
    .eq(
      "id",
      logId
    );
}

function errorMessage(
  error: unknown
) {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(
      (
        error as {
          message?: unknown;
        }
      ).message
    );
  }

  try {
    return JSON.stringify(
      error
    );
  } catch {
    return "Unknown error";
  }
}

export async function runMonthlyVaultReports(
  options: RunOptions = {}
) {
  const dryRun =
    options.dryRun === true;

  const users =
    await loadAuthUsers();

  const reportMonth =
    getReportMonth();

  const reportLabel =
    getReportLabel();

  const appUrl =
    getAppUrl();

  const candidates: Array<{
    userId: string;
    email: string;
    householdId: string | null;
    reportKey: string;

    score: number;
    status: string | null;

    deviceCount: number;
    completeDeviceCount: number;
    documentCount: number;

    warrantyTrackedCount: number;
    missingWarrantyCount: number;
    expiringWarrantyCount: number;

    missingSerialCount: number;
    devicesWithoutDocuments: number;

    networkConfigured: boolean;

    firstName: string | null;

    recommendation:
      | {
          title: string;
          description: string;
        }
      | null;
  }> = [];

  const failures: Array<{
    userId: string;
    error: string;
  }> = [];

  const processedReportKeys =
    new Set<string>();

  for (
    const discoveredUser
    of users
  ) {
    if (
      !discoveredUser.email ||
      !discoveredUser.email_confirmed_at
    ) {
      continue;
    }

    try {
      const householdId =
        await getHouseholdId(
          discoveredUser.id
        );

      const reportKey =
        householdId
          ? `household:${householdId}`
          : `user:${discoveredUser.id}`;

      if (
        processedReportKeys.has(
          reportKey
        )
      ) {
        continue;
      }

      processedReportKeys.add(
        reportKey
      );

      let recipientUser =
        discoveredUser;

      if (householdId) {
        const resolvedRecipient =
          await resolveHouseholdRecipient(
            householdId,
            users
          );

        if (resolvedRecipient) {
          recipientUser =
            resolvedRecipient;
        }
      }

      if (
        !recipientUser.email ||
        !recipientUser
          .email_confirmed_at
      ) {
        continue;
      }

      const enabled =
        await monthlyEnabled(
          recipientUser.id
        );

      if (!enabled) {
        continue;
      }

      const sent =
        await alreadySent(
          reportKey,
          reportMonth
        );

      if (sent) {
        continue;
      }

      const report =
        await buildReport(
          recipientUser
        );

      if (!report) {
        continue;
      }

      candidates.push({
        userId:
          recipientUser.id,

        email:
          recipientUser.email,

        householdId:
          report.householdId,

        reportKey,

        firstName:
          report.firstName,

        score:
          report.score,

        status:
          report.status,

        deviceCount:
          report.deviceCount,

        completeDeviceCount:
          report.completeDeviceCount,

        documentCount:
          report.documentCount,

        warrantyTrackedCount:
          report.warrantyTrackedCount,

        missingWarrantyCount:
          report.missingWarrantyCount,

        expiringWarrantyCount:
          report.expiringWarrantyCount,

        missingSerialCount:
          report.missingSerialCount,

        devicesWithoutDocuments:
          report.devicesWithoutDocuments,

        networkConfigured:
          report.networkConfigured,

        recommendation:
          report.recommendation,
      });
    } catch (error) {
      failures.push({
        userId:
          discoveredUser.id,
        error:
          errorMessage(error),
      });
    }
  }

  if (dryRun) {
    return {
      dryRun: true,
      reportMonth,
      scannedUsers:
        users.length,
      candidateCount:
        candidates.length,
      candidates,
      failures,
    };
  }

  const sent = [];

  for (
    const candidate
    of candidates
  ) {
    let logId:
      string | null =
      null;

    try {
      const unsubscribeUrl =
        createMonthlyUnsubscribeUrl({
          appUrl,
          userId:
            candidate.userId,
          email:
            candidate.email,
        });

      const email =
        createMonthlyVaultReportEmail({
          firstName:
            candidate.firstName,

          reportLabel,

          score:
            candidate.score,

          status:
            candidate.status,

          deviceCount:
            candidate.deviceCount,

          completeDeviceCount:
            candidate.completeDeviceCount,

          documentCount:
            candidate.documentCount,

          warrantyTrackedCount:
            candidate.warrantyTrackedCount,

          missingWarrantyCount:
            candidate.missingWarrantyCount,

          expiringWarrantyCount:
            candidate.expiringWarrantyCount,

          missingSerialCount:
            candidate.missingSerialCount,

          devicesWithoutDocuments:
            candidate.devicesWithoutDocuments,

          networkConfigured:
            candidate.networkConfigured,

          recommendation:
            candidate.recommendation,

          appUrl,

          unsubscribeUrl,
        });

      logId =
        await recordPending({
          userId:
            candidate.userId,

          email:
            candidate.email,

          reportKey:
            candidate.reportKey,

          reportMonth,

          score:
            candidate.score,

          status:
            candidate.status,

          deviceCount:
            candidate.deviceCount,

          documentCount:
            candidate.documentCount,
        });

      const result =
        await sendEmail({
          to:
            candidate.email,

          subject:
            email.subject,

          html:
            email.html,

          text:
            email.text,
        });

      if (!result.ok) {
        throw new Error(
          `${result.code}: ${result.message}`
        );
      }

      await markSent(
        logId,
        result.id
      );

      sent.push(
        candidate
      );
    } catch (error) {
      const message =
        errorMessage(error);

      if (logId) {
        await markFailed(
          logId,
          message
        );
      }

      failures.push({
        userId:
          candidate.userId,
        error:
          message,
      });
    }
  }

  return {
    dryRun: false,
    reportMonth,
    scannedUsers:
      users.length,
    candidateCount:
      candidates.length,
    sentCount:
      sent.length,
    sent,
    failures,
  };
}
