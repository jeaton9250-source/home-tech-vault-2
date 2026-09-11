import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  maintenanceReminderCopy,
  maintenanceReminderKind,
  shiftUtcDateKey,
  utcDateKey,
  type MaintenanceReminderKind,
} from "@/lib/push/maintenanceReminderSchedule";

const EXPO_SEND_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts";
const MAX_TASKS = 5000;
const MAX_RECEIPTS = 1000;
const RECEIPT_DELAY_MS = 15 * 60 * 1000;

type RunOptions = {
  dryRun?: boolean;
  now?: Date;
};

type TaskRow = {
  id: string;
  user_id: string | null;
  household_id: string | null;
  device_id: string | null;
  title: string | null;
  due_date: string;
};

type PushTokenRow = {
  id: string;
  user_id: string;
  expo_push_token: string;
};

type ClaimedDelivery = {
  id: string;
  maintenance_task_id: string;
  user_id: string;
  push_token_id: string;
  reminder_kind: MaintenanceReminderKind;
  due_date: string;
  status: string;
  expo_ticket_id: string | null;
  error_code: string | null;
  sent_at: string | null;
  receipt_checked_at: string | null;
};

type ExpoTicket = {
  status?: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

function expoHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const accessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function disableToken(pushTokenId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("device_push_tokens")
    .update({ enabled: false, updated_at: new Date().toISOString() })
    .eq("id", pushTokenId);
  if (error) throw error;
}

async function checkExpoReceipts(now: Date) {
  const admin = createAdminClient();
  const cutoff = new Date(now.getTime() - RECEIPT_DELAY_MS).toISOString();
  const { data, error } = await admin
    .from("maintenance_push_deliveries")
    .select("id, push_token_id, expo_ticket_id")
    .eq("status", "accepted")
    .is("receipt_checked_at", null)
    .not("expo_ticket_id", "is", null)
    .lte("sent_at", cutoff)
    .limit(MAX_RECEIPTS);
  if (error) throw error;
  if (!data?.length) return { checked: 0, disabled: 0 };

  const byTicket = new Map(
    data.map((delivery) => [delivery.expo_ticket_id as string, delivery]),
  );
  let checked = 0;
  let disabled = 0;

  for (const batch of chunks([...byTicket.keys()], 1000)) {
    const response = await fetch(EXPO_RECEIPTS_URL, {
      method: "POST",
      headers: expoHeaders(),
      body: JSON.stringify({ ids: batch }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Expo receipt request failed (${response.status}).`);
    const payload = await response.json() as { data?: Record<string, ExpoTicket> };

    for (const [ticketId, receipt] of Object.entries(payload.data ?? {})) {
      const delivery = byTicket.get(ticketId);
      if (!delivery) continue;
      const errorCode = receipt.details?.error || null;
      const { error: updateError } = await admin
        .from("maintenance_push_deliveries")
        .update({
          status: receipt.status === "ok" ? "delivered" : "failed",
          error_code: errorCode || receipt.message || null,
          receipt_checked_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", delivery.id);
      if (updateError) throw updateError;
      checked += 1;
      if (errorCode === "DeviceNotRegistered") {
        await disableToken(delivery.push_token_id);
        disabled += 1;
      }
    }
  }

  return { checked, disabled };
}

export async function runMaintenancePushReminders(options: RunOptions = {}) {
  const admin = createAdminClient();
  const now = options.now ?? new Date();
  const today = utcDateKey(now);
  const latestDueDate = shiftUtcDateKey(today, 2)!;

  const { data: taskData, error: taskError } = await admin
    .from("maintenance_tasks")
    .select("id, user_id, household_id, device_id, title, due_date")
    .eq("completed", false)
    .not("due_date", "is", null)
    .lte("due_date", latestDueDate)
    .order("due_date", { ascending: true })
    .limit(MAX_TASKS);
  if (taskError) throw taskError;

  const tasks = (taskData ?? []) as TaskRow[];
  const dueTasks = tasks
    .map((task) => ({
      task,
      kind: maintenanceReminderKind(task.due_date, today),
    }))
    .filter((candidate): candidate is { task: TaskRow; kind: MaintenanceReminderKind } => Boolean(candidate.kind));

  const householdIds = [...new Set(dueTasks.map(({ task }) => task.household_id).filter((id): id is string => Boolean(id)))];
  const deviceIds = [...new Set(dueTasks.map(({ task }) => task.device_id).filter((id): id is string => Boolean(id)))];

  const [membersResult, devicesResult] = await Promise.all([
    householdIds.length
      ? admin.from("household_members").select("household_id, user_id").in("household_id", householdIds)
      : Promise.resolve({ data: [], error: null }),
    deviceIds.length
      ? admin.from("devices").select("id, device_name").in("id", deviceIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (membersResult.error) throw membersResult.error;
  if (devicesResult.error) throw devicesResult.error;

  const membersByHousehold = new Map<string, Set<string>>();
  for (const member of membersResult.data ?? []) {
    const members = membersByHousehold.get(member.household_id) ?? new Set<string>();
    members.add(member.user_id);
    membersByHousehold.set(member.household_id, members);
  }
  const deviceNames = new Map((devicesResult.data ?? []).map((device) => [device.id, device.device_name]));

  const recipientIds = new Set<string>();
  for (const { task } of dueTasks) {
    if (task.user_id) recipientIds.add(task.user_id);
    if (task.household_id) {
      for (const userId of membersByHousehold.get(task.household_id) ?? []) recipientIds.add(userId);
    }
  }

  const { data: tokenData, error: tokenError } = recipientIds.size
    ? await admin
        .from("device_push_tokens")
        .select("id, user_id, expo_push_token")
        .in("user_id", [...recipientIds])
        .eq("enabled", true)
    : { data: [], error: null };
  if (tokenError) throw tokenError;

  const tokensByUser = new Map<string, PushTokenRow[]>();
  for (const token of (tokenData ?? []) as PushTokenRow[]) {
    const tokens = tokensByUser.get(token.user_id) ?? [];
    tokens.push(token);
    tokensByUser.set(token.user_id, tokens);
  }

  const candidates = dueTasks.flatMap(({ task, kind }) => {
    const users = new Set<string>();
    if (task.user_id) users.add(task.user_id);
    if (task.household_id) {
      for (const userId of membersByHousehold.get(task.household_id) ?? []) users.add(userId);
    }
    const copy = maintenanceReminderCopy({
      kind,
      taskTitle: task.title,
      deviceName: task.device_id ? deviceNames.get(task.device_id) ?? null : null,
    });

    return [...users].flatMap((userId) =>
      (tokensByUser.get(userId) ?? []).map((token) => ({ task, kind, userId, token, copy })),
    );
  });

  if (options.dryRun) {
    return {
      dryRun: true,
      tasks: dueTasks.length,
      candidateDeliveries: candidates.length,
      receipts: { checked: 0, disabled: 0 },
      accepted: 0,
      failed: 0,
    };
  }

  const receipts = await checkExpoReceipts(now);
  if (!candidates.length) {
    return { dryRun: false, tasks: dueTasks.length, candidateDeliveries: 0, receipts, accepted: 0, failed: 0 };
  }

  const claims = candidates.map(({ task, kind, userId, token }) => ({
    maintenance_task_id: task.id,
    user_id: userId,
    push_token_id: token.id,
    reminder_kind: kind,
    due_date: task.due_date,
    status: "pending",
  }));
  const { data: claimedData, error: claimError } = await admin
    .from("maintenance_push_deliveries")
    .upsert(claims, {
      onConflict: "maintenance_task_id,user_id,push_token_id,reminder_kind,due_date",
      ignoreDuplicates: true,
    })
    .select("id, maintenance_task_id, user_id, push_token_id, reminder_kind, due_date, status, expo_ticket_id, error_code, sent_at, receipt_checked_at");
  if (claimError) throw claimError;

  const claimed = (claimedData ?? []) as ClaimedDelivery[];
  const candidateByKey = new Map(candidates.map((candidate) => [
    [candidate.task.id, candidate.userId, candidate.token.id, candidate.kind, candidate.task.due_date].join(":"),
    candidate,
  ]));
  let accepted = 0;
  let failed = 0;

  for (const deliveryBatch of chunks(claimed, 100)) {
    const batchCandidates = deliveryBatch.map((delivery) => candidateByKey.get([
      delivery.maintenance_task_id,
      delivery.user_id,
      delivery.push_token_id,
      delivery.reminder_kind,
      delivery.due_date,
    ].join(":"))!);

    let response: Response;
    try {
      response = await fetch(EXPO_SEND_URL, {
        method: "POST",
        headers: expoHeaders(),
        body: JSON.stringify(batchCandidates.map((candidate) => ({
          to: candidate.token.expo_push_token,
          title: candidate.copy.title,
          body: candidate.copy.body,
          sound: "default",
          priority: "high",
          channelId: "home-reminders",
          data: {
            source: "home-tech-vault",
            kind: "maintenance",
            reminderKind: candidate.kind,
            maintenanceId: candidate.task.id,
            url: "/(tabs)/care",
          },
        }))),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`Expo push request failed (${response.status}).`);
    } catch (error) {
      await admin.from("maintenance_push_deliveries").delete().in("id", deliveryBatch.map((delivery) => delivery.id));
      throw error;
    }

    const payload = await response.json() as { data?: ExpoTicket | ExpoTicket[] };
    const tickets = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
    for (let index = 0; index < deliveryBatch.length; index += 1) {
      const delivery = deliveryBatch[index];
      const ticket = tickets[index];
      const errorCode = ticket?.details?.error || null;
      const wasAccepted = ticket?.status === "ok" && Boolean(ticket.id);
      const { error: updateError } = await admin
        .from("maintenance_push_deliveries")
        .update({
          status: wasAccepted ? "accepted" : "failed",
          expo_ticket_id: ticket?.id || null,
          error_code: errorCode || ticket?.message || (ticket ? null : "missing_ticket"),
          sent_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", delivery.id);
      if (updateError) throw updateError;
      if (wasAccepted) accepted += 1;
      else failed += 1;
      if (errorCode === "DeviceNotRegistered") await disableToken(delivery.push_token_id);
    }
  }

  return {
    dryRun: false,
    tasks: dueTasks.length,
    candidateDeliveries: candidates.length,
    receipts,
    accepted,
    failed,
  };
}
