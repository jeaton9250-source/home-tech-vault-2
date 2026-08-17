
import "server-only";

import type {
  User,
} from "@supabase/supabase-js";

import {
  sendEmail,
} from "@/lib/email";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  createLifecycleEmail,
  type LifecycleEmailType,
} from "@/lib/lifecycle/emailTemplates";
import {
  createUnsubscribeUrl,
} from "@/lib/lifecycle/unsubscribe";

const HOUR_MS =
  60 * 60 * 1000;

const MAX_USERS =
  5000;

const LIFECYCLE_COOLDOWN_HOURS =
  72;

type RunOptions = {
  dryRun?: boolean;
};

type DeviceRow = {
  id: string;
  model_number: string | null;
  serial_number: string | null;
  warranty_date: string | null;
  created_at: string | null;
};

type Candidate = {
  userId: string;
  email: string;
  emailType: LifecycleEmailType;
  deviceCount: number;
  documentCount: number;
  accountAgeHours: number;
  firstDeviceAgeHours:
    number | null;
};

function getAppUrl() {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  return (
    configured ||
    "https://www.hometechvault.com"
  ).replace(/\/+$/, "");
}

function ageHours(
  date: string
) {
  return (
    Date.now() -
    new Date(date).getTime()
  ) / HOUR_MS;
}

function chooseNoDeviceEmail(input: {
  ageHours: number;
  sent: Set<string>;
}): LifecycleEmailType | null {
  const {
    ageHours: hours,
    sent,
  } = input;

  if (
    hours >= 168 &&
    !sent.has("no_device_7d")
  ) {
    return "no_device_7d";
  }

  if (
    hours >= 72 &&
    hours < 168 &&
    !sent.has("no_device_3d")
  ) {
    return "no_device_3d";
  }

  if (
    hours >= 24 &&
    hours < 72 &&
    !sent.has("no_device_24h")
  ) {
    return "no_device_24h";
  }

  return null;
}

function chooseActivatedEmail(input: {
  devices: DeviceRow[];
  documentCount: number;
  firstDeviceAgeHours: number;
  sent: Set<string>;
}): LifecycleEmailType | null {
  const {
    devices,
    documentCount,
    firstDeviceAgeHours,
    sent,
  } = input;

  const hasIncompleteDetails =
    devices.some(
      (device) =>
        !device.model_number?.trim() ||
        !device.serial_number?.trim()
    );

  const hasWarranty =
    devices.some(
      (device) =>
        Boolean(
          device.warranty_date
        )
    );

  // Priority 1:
  // Help make the actual device record useful.
  if (
    firstDeviceAgeHours >= 48 &&
    hasIncompleteDetails &&
    !sent.has(
      "device_details_missing"
    )
  ) {
    return "device_details_missing";
  }

  // Priority 2:
  // Get at least one document stored.
  if (
    firstDeviceAgeHours >= 72 &&
    documentCount === 0 &&
    !sent.has("no_documents")
  ) {
    return "no_documents";
  }

  // Priority 3:
  // Encourage warranty tracking.
  if (
    firstDeviceAgeHours >= 120 &&
    !hasWarranty &&
    !sent.has("warranty_missing")
  ) {
    return "warranty_missing";
  }

  return null;
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

async function getDevices(
  userId: string
): Promise<DeviceRow[]> {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from("devices")
    .select(
      "id, model_number, serial_number, warranty_date, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as DeviceRow[];
}

async function getDocumentCount(
  deviceIds: string[]
) {
  if (
    deviceIds.length === 0
  ) {
    return 0;
  }

  const admin =
    createAdminClient();

  const {
    count,
    error,
  } = await admin
    .from("documents")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      }
    )
    .in(
      "device_id",
      deviceIds
    );

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function getSentHistory(
  userId: string
) {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from("lifecycle_email_log")
    .select(
      "email_type, sent_at"
    )
    .eq("user_id", userId)
    .eq("status", "sent")
    .order("sent_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const rows =
    data ?? [];

  return {
    sentTypes: new Set(
      rows.map(
        (row) =>
          row.email_type as string
      )
    ),
    lastSentAt:
      rows[0]?.sent_at ??
      null,
  };
}

function isInCooldown(
  lastSentAt: string | null
) {
  if (!lastSentAt) {
    return false;
  }

  return (
    ageHours(lastSentAt) <
    LIFECYCLE_COOLDOWN_HOURS
  );
}

async function isOnboardingEnabled(
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
      "onboarding_enabled"
    )
    .eq(
      "user_id",
      userId
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data?.onboarding_enabled ??
    true
  );
}

function firstDeviceAge(
  devices: DeviceRow[]
) {
  const firstCreated =
    devices
      .map(
        (device) =>
          device.created_at
      )
      .filter(
        (
          value
        ): value is string =>
          Boolean(value)
      )
      .sort()[0];

  if (!firstCreated) {
    return null;
  }

  return ageHours(
    firstCreated
  );
}

async function createCandidate(
  user: User
): Promise<Candidate | null> {
  if (
    !user.email ||
    !user.email_confirmed_at
  ) {
    return null;
  }

  const enabled =
    await isOnboardingEnabled(
      user.id
    );

  if (!enabled) {
    return null;
  }

  const accountAge =
    ageHours(
      user.created_at
    );

  if (
    accountAge < 24
  ) {
    return null;
  }

  const history =
    await getSentHistory(
      user.id
    );

  // One lifecycle email at most
  // every 72 hours.
  if (
    isInCooldown(
      history.lastSentAt
    )
  ) {
    return null;
  }

  const devices =
    await getDevices(
      user.id
    );

  if (
    devices.length === 0
  ) {
    const emailType =
      chooseNoDeviceEmail({
        ageHours:
          accountAge,
        sent:
          history.sentTypes,
      });

    if (!emailType) {
      return null;
    }

    return {
      userId:
        user.id,
      email:
        user.email,
      emailType,
      deviceCount: 0,
      documentCount: 0,
      accountAgeHours:
        Math.floor(
          accountAge
        ),
      firstDeviceAgeHours:
        null,
    };
  }

  const deviceAge =
    firstDeviceAge(
      devices
    );

  if (
    deviceAge === null ||
    deviceAge < 48
  ) {
    return null;
  }

  const documentCount =
    await getDocumentCount(
      devices.map(
        (device) =>
          device.id
      )
    );

  const emailType =
    chooseActivatedEmail({
      devices,
      documentCount,
      firstDeviceAgeHours:
        deviceAge,
      sent:
        history.sentTypes,
    });

  if (!emailType) {
    return null;
  }

  return {
    userId:
      user.id,
    email:
      user.email,
    emailType,
    deviceCount:
      devices.length,
    documentCount,
    accountAgeHours:
      Math.floor(
        accountAge
      ),
    firstDeviceAgeHours:
      Math.floor(
        deviceAge
      ),
  };
}

function getFirstName(
  user: User
) {
  const value =
    user.user_metadata
      ?.full_name;

  return typeof value ===
    "string"
    ? value
    : null;
}

async function recordPending(
  candidate: Candidate
) {
  const admin =
    createAdminClient();

  const idempotencyKey =
    `${candidate.userId}:${candidate.emailType}`;

  const {
    data,
    error,
  } = await admin
    .from(
      "lifecycle_email_log"
    )
    .upsert(
      {
        user_id:
          candidate.userId,
        recipient_email:
          candidate.email,
        email_type:
          candidate.emailType,
        status:
          "pending",
        idempotency_key:
          idempotencyKey,
        attempted_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "idempotency_key",
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
  providerMessageId:
    string | null
) {
  const admin =
    createAdminClient();

  const {
    error,
  } = await admin
    .from(
      "lifecycle_email_log"
    )
    .update({
      status:
        "sent",
      provider_message_id:
        providerMessageId,
      sent_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
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

  const {
    error,
  } = await admin
    .from(
      "lifecycle_email_log"
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
        new Date().toISOString(),
    })
    .eq(
      "id",
      logId
    );

  if (error) {
    console.error(
      "[lifecycle-email] unable to mark failure",
      error
    );
  }
}

async function candidateStillValid(
  candidate: Candidate
) {
  const devices =
    await getDevices(
      candidate.userId
    );

  if (
    candidate.emailType.startsWith(
      "no_device_"
    )
  ) {
    return (
      devices.length === 0
    );
  }

  if (
    devices.length === 0
  ) {
    return false;
  }

  if (
    candidate.emailType ===
    "device_details_missing"
  ) {
    return devices.some(
      (device) =>
        !device.model_number?.trim() ||
        !device.serial_number?.trim()
    );
  }

  if (
    candidate.emailType ===
    "warranty_missing"
  ) {
    return !devices.some(
      (device) =>
        Boolean(
          device.warranty_date
        )
    );
  }

  if (
    candidate.emailType ===
    "no_documents"
  ) {
    const count =
      await getDocumentCount(
        devices.map(
          (device) =>
            device.id
        )
      );

    return count === 0;
  }

  return false;
}

export async function runLifecycleEmails(
  options: RunOptions = {}
) {
  const dryRun =
    options.dryRun === true;

  const appUrl =
    getAppUrl();

  const users =
    await loadAuthUsers();

  const candidates:
    Candidate[] = [];

  const failures: Array<{
    userId: string;
    error: string;
  }> = [];

  for (
    const user
    of users
  ) {
    try {
      const candidate =
        await createCandidate(
          user
        );

      if (candidate) {
        candidates.push(
          candidate
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error
            ? String(
                (
                  error as {
                    message?: unknown;
                  }
                ).message
              )
            : JSON.stringify(error);

      failures.push({
        userId:
          user.id,
        error:
          errorMessage ||
          "Unknown candidate error",
      });
    }
  }

  if (dryRun) {
    return {
      dryRun: true,
      scannedUsers:
        users.length,
      candidateCount:
        candidates.length,
      candidates,
      failures,
    };
  }

  const sent:
    Candidate[] = [];

  const sendFailures:
    Array<{
      userId: string;
      emailType:
        LifecycleEmailType;
      error: string;
    }> = [];

  for (
    const candidate
    of candidates
  ) {
    try {
      const valid =
        await candidateStillValid(
          candidate
        );

      if (!valid) {
        continue;
      }

      const user =
        users.find(
          (item) =>
            item.id ===
            candidate.userId
        );

      if (!user) {
        continue;
      }

      const unsubscribeUrl =
        createUnsubscribeUrl({
          appUrl,
          userId:
            candidate.userId,
          email:
            candidate.email,
        });

      const template =
        createLifecycleEmail({
          type:
            candidate.emailType,
          firstName:
            getFirstName(
              user
            ),
          appUrl,
          unsubscribeUrl,
        });

      let logId:
        string | null =
        null;

      try {
        logId =
          await recordPending(
            candidate
          );

        const result =
          await sendEmail({
            to:
              candidate.email,
            subject:
              template.subject,
            html:
              template.html,
            text:
              template.text,
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
          error instanceof Error
            ? error.message
            : "Unknown send error";

        if (logId) {
          await markFailed(
            logId,
            message
          );
        }

        sendFailures.push({
          userId:
            candidate.userId,
          emailType:
            candidate.emailType,
          error:
            message,
        });
      }
    } catch (error) {
      sendFailures.push({
        userId:
          candidate.userId,
        emailType:
          candidate.emailType,
        error:
          error instanceof Error
            ? error.message
            : "Unable to re-check lifecycle state",
      });
    }
  }

  return {
    dryRun: false,
    scannedUsers:
      users.length,
    candidateCount:
      candidates.length,
    sentCount:
      sent.length,
    sent,
    failures: [
      ...failures,
      ...sendFailures,
    ],
  };
}
