import { NextResponse } from "next/server";

import {
  applyHouseholdScope,
  fetchHouseholdIdForUser,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";
import { validateMaintenanceTaskInput } from "@/lib/maintenance/maintenanceInputValidation";
import { syncNotionOnboardingProgress } from "@/lib/notion/syncOnboardingProgress";
import { authenticateRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateMaintenanceBody = {
  deviceId?: unknown;
  title?: unknown;
  description?: unknown;
  taskType?: unknown;
  dueDate?: unknown;
  recurringInterval?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const { client, user, error: userError } = await authenticateRequest(request);
  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    let raw: unknown;
    try { raw = await request.json(); } catch {
      return NextResponse.json({ error: "The care details could not be read." }, { status: 400 });
    }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return NextResponse.json({ error: "The care details are not valid." }, { status: 400 });
    }
    const body = raw as CreateMaintenanceBody;
    const validation = validateMaintenanceTaskInput({
      title: text(body.title),
      description: text(body.description),
      taskType: text(body.taskType),
      dueDate: text(body.dueDate),
      recurringInterval: text(body.recurringInterval),
    });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const householdId = await fetchHouseholdIdForUser(user.id, client);
    const deviceId = text(body.deviceId).trim();
    let deviceName = "Whole Home";

    if (deviceId) {
      const { data: device, error: deviceError } = await applyHouseholdScope(
        client.from("devices").select("id, device_name").eq("id", deviceId),
        householdId,
        user.id,
      ).maybeSingle();
      if (deviceError) throw deviceError;
      if (!device) {
        return NextResponse.json({ error: "That device could not be found in your home." }, { status: 404 });
      }
      deviceName = device.device_name?.trim() || "Unnamed device";
    }

    const normalized = validation.data;
    const { data: task, error } = await client
      .from("maintenance_tasks")
      .insert(withHouseholdInsertFields({
        device_id: deviceId || null,
        title: normalized.title,
        description: normalized.description,
        task_type: normalized.taskType,
        due_date: normalized.dueDate,
        completed: false,
        recurring_interval: normalized.recurringInterval,
      }, householdId, user.id))
      .select("id, title, device_id, due_date")
      .single();

    if (error || !task) throw error ?? new Error("Maintenance task was not returned after creation.");

    if (deviceId) {
      const { error: activityError } = await client.from("device_events").insert({
        device_id: deviceId,
        user_id: user.id,
        event_type: "Maintenance",
        title: "Maintenance scheduled",
        description: normalized.dueDate
          ? `${normalized.title} scheduled for ${normalized.dueDate}.`
          : `${normalized.title} was added as a maintenance task.`,
        event_date: new Date().toISOString(),
      });
      if (activityError) console.warn("[mobile-maintenance-create] activity failed", activityError.message);
    }

    await syncNotionOnboardingProgress(
      user.id
    );

    return NextResponse.json({
      householdId,
      task: {
        id: task.id,
        title: task.title,
        deviceId: task.device_id,
        deviceName,
        dueDate: task.due_date,
      },
    }, {
      status: 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[mobile-maintenance-create] failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "We couldn't schedule this care task. Please try again." }, { status: 500 });
  }
}
