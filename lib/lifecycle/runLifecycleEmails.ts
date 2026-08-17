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

type RunOptions = {
  dryRun?: boolean;
};

type Candidate = {
  userId: string;
  email: string;
  emailType: LifecycleEmailType;
  deviceCount: number;
  accountAgeHours: number;
};

function getAppUrl() {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  return (
    configured ||
    "https://www.hometechvault.com"
  ).replace(/\/+$/, "");
}

function accountAgeHours(
  createdAt: string
) {
  return (
    Date.now() -
    new Date(createdAt).getTime()
  ) / HOUR_MS;
}

function chooseNoDeviceEmail(input: {
  ageHours: number;
  sent: Set<string>;
}): LifecycleEmailType | null {
  const { ageHours, sent } = input;

  // Use time windows instead of playing catch-up.
  // A 20-day-old account should receive the 7-day
  // message, not all three messages back-to-back.

  if (
    ageHours >= 168 &&
    !sent.has("no_device_7d")
  ) {
    return "no_device_7d";
  }

  if (
    ageHours >= 72 &&
    ageHours < 168 &&
    !sent.has("no_device_3d")
  ) {
    return "no_device_3d";
  }

  if (
    ageHours >= 24 &&
    ageHours < 72 &&
    !sent.has("no_device_24h")
  ) {
    return "no_device_24h";
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
    } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    users.push(...data.users);

    if (
      data.users.length < perPage
    ) {
      break;
    }
  }

  return users.slice(0, MAX_USERS);
}

async function getDeviceCount(
  userId: string
) {
  const admin =
    createAdminClient();

  const {
    count,
    error,
  } = await admin
    .from("devices")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      }
    )
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function getSentTypes(
  userId: string
) {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from("lifecycle_email_log")
    .select("email_type")
    .eq("user_id", userId)
    .eq("status", "sent");

  if (error) {
    throw error;
  }

  return new Set(
    (data ?? []).map(
      (row) => row.email_type as string
    )
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
    .from("lifecycle_email_preferences")
    .select(
      "onboarding_enabled"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  // No row means default onboarding behavior:
  // enabled.
  return (
    data?.onboarding_enabled ??
    true
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

  const deviceCount =
    await getDeviceCount(
      user.id
    );

  // Adding the first device automatically
  // exits the no-device onboarding sequence.
  if (deviceCount > 0) {
    return null;
  }

  const ageHours =
    accountAgeHours(
      user.created_at
    );

  if (ageHours < 24) {
    return null;
  }

  const sent =
    await getSentTypes(
      user.id
    );

  const emailType =
    chooseNoDeviceEmail({
      ageHours,
      sent,
    });

  if (!emailType) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    emailType,
    deviceCount,
    accountAgeHours:
      Math.floor(ageHours),
  };
}

function getFirstName(
  user: User
) {
  const value =
    user.user_metadata?.full_name;

  return typeof value === "string"
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
    .from("lifecycle_email_log")
    .upsert(
      {
        user_id:
          candidate.userId,
        recipient_email:
          candidate.email,
        email_type:
          candidate.emailType,
        status: "pending",
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
    .from("lifecycle_email_log")
    .update({
      status: "sent",
      provider_message_id:
        providerMessageId,
      sent_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
      error_message: null,
    })
    .eq("id", logId);

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
    .from("lifecycle_email_log")
    .update({
      status: "failed",
      error_message:
        message.slice(0, 1000),
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", logId);

  if (error) {
    console.error(
      "[lifecycle-email] unable to mark failure",
      error
    );
  }
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

  const candidates: Candidate[] = [];
  const failures: Array<{
    userId: string;
    error: string;
  }> = [];

  // Sequential processing is intentional.
  // It avoids hammering Supabase with hundreds
  // of simultaneous requests.
  for (const user of users) {
    try {
      const candidate =
        await createCandidate(user);

      if (candidate) {
        candidates.push(candidate);
      }
    } catch (error) {
      failures.push({
        userId: user.id,
        error:
          error instanceof Error
            ? error.message
            : "Unknown candidate error",
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

  const sent: Candidate[] = [];
  const sendFailures: Array<{
    userId: string;
    emailType: LifecycleEmailType;
    error: string;
  }> = [];

  for (
    const candidate
    of candidates
  ) {
    // Re-check immediately before sending.
    // If the user added a device while this
    // run was processing, stop the message.
    const latestDeviceCount =
      await getDeviceCount(
        candidate.userId
      );

    if (
      latestDeviceCount > 0
    ) {
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
          getFirstName(user),
        appUrl,
        unsubscribeUrl,
      });

    let logId: string | null =
      null;

    try {
      logId =
        await recordPending(
          candidate
        );

      const result =
        await sendEmail({
          to: candidate.email,
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

      sent.push(candidate);
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
        error: message,
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
