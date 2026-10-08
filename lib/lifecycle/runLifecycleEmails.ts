
import "server-only";
import { loadOnboardingSnapshot } from "@/lib/notion/onboardingSnapshot";
import { onboardingDeliveryAllowed } from "./onboardingDeliveryGuard";
import { updateOnboardingEmailState } from "@/lib/notion/updateOnboardingEmailState";

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

async function createCandidate(user: User): Promise<Candidate | null> {
  if (!user.email || !user.email_confirmed_at) return null;
  if (!(await isOnboardingEnabled(user.id))) return null;
  const snapshot = await loadOnboardingSnapshot(user);
  if (!snapshot || snapshot.status === "Complete" || snapshot.emailState["Reminder Sent"] || ageHours(snapshot.lastProgress) < 72) return null;
  const history = await getSentHistory(user.id);
  if (isInCooldown(history.lastSentAt)) return null;
  return {
    userId: user.id, email: user.email, emailType: "onboarding_reminder",
    deviceCount: Number(snapshot.signals.device), documentCount: Number(snapshot.signals.paperwork),
    accountAgeHours: Math.floor(ageHours(user.created_at)), firstDeviceAgeHours: null,
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

async function candidateStillValid(candidate: Candidate) {
  const { data, error } = await createAdminClient().auth.admin.getUserById(candidate.userId);
  if (error || !data.user) return false;
  return onboardingDeliveryAllowed(data.user, "reminder");
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
            idempotencyKey: `${candidate.userId}:${candidate.emailType}`,
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

        await updateOnboardingEmailState(candidate.userId, "Reminder Sent");
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
