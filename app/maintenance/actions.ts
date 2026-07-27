"use server";

import { revalidatePath } from "next/cache";

import { getDefaultActivityTitle, recordActivity } from "@/lib/activity";
import {
  applyHouseholdScope,
  fetchHouseholdIdForUser,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";
import { createClient } from "@/lib/supabase/server";

export type MaintenanceTaskInput = {
  title: string;
  description: string | null;
  taskType: string;
  dueDate: string | null;
  recurringInterval: string | null;
};

export type CreateMaintenanceTasksResult =
  | {
      success: true;
      createdCount: number;
      skippedCount: number;
    }
  | {
      success: false;
      error: string;
      code?: "UNAUTHENTICATED" | "VALIDATION_ERROR" | "UNKNOWN";
    };

type ExistingMaintenanceTask = {
  title: string | null;
  task_type: string | null;
  description: string | null;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function taskKey(
  task: MaintenanceTaskInput | ExistingMaintenanceTask
) {
  const taskType =
    "taskType" in task ? task.taskType : task.task_type;

  return normalize(
    [task.title, taskType, task.description]
      .filter(Boolean)
      .join(" ")
  );
}

function buildDueDate(dueDate: string | null) {
  if (!dueDate) {
    return null;
  }

  return dueDate.slice(0, 10);
}

export async function createMaintenanceTasksForDevice(input: {
  deviceId: string;
  tasks: MaintenanceTaskInput[];
}): Promise<CreateMaintenanceTasksResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "You must be signed in to add maintenance tasks.",
      code: "UNAUTHENTICATED",
    };
  }

  const cleanedTasks = input.tasks
    .map((task) => ({
      title: task.title.trim(),
      description: task.description?.trim() || null,
      taskType: task.taskType.trim(),
      dueDate: buildDueDate(task.dueDate),
      recurringInterval: task.recurringInterval?.trim() || null,
    }))
    .filter((task) => task.title !== "");

  if (cleanedTasks.length === 0) {
    return {
      success: false,
      error: "Select at least one task to add.",
      code: "VALIDATION_ERROR",
    };
  }

  const householdId = await fetchHouseholdIdForUser(
    user.id,
    supabase
  );

  const { data: existingRows, error: existingError } = await applyHouseholdScope(
    supabase
      .from("maintenance_tasks")
      .select("title, task_type, description")
      .eq("device_id", input.deviceId),
    householdId,
    user.id
  );

  if (existingError) {
    console.error("Unable to load existing maintenance tasks:", existingError);

    return {
      success: false,
      error: "Unable to add these tasks right now. Please try again.",
      code: "UNKNOWN",
    };
  }

  const existingTaskKeys = new Set(
    ((existingRows ?? []) as ExistingMaintenanceTask[]).map(taskKey)
  );

  const dedupedTasks = cleanedTasks.filter(
    (task) => !existingTaskKeys.has(taskKey(task))
  );

  if (dedupedTasks.length === 0) {
    return {
      success: true,
      createdCount: 0,
      skippedCount: cleanedTasks.length,
    };
  }

  const payload = dedupedTasks.map((task) =>
    withHouseholdInsertFields(
      {
        device_id: input.deviceId,
        title: task.title,
        description: task.description,
        task_type: task.taskType,
        due_date: task.dueDate,
        completed: false,
        recurring_interval: task.recurringInterval,
      },
      householdId,
      user.id
    )
  );

  const { data: createdRows, error } = await supabase
    .from("maintenance_tasks")
    .insert(payload)
    .select("id, title");

  if (error) {
    console.error("Unable to create maintenance tasks:", error);

    return {
      success: false,
      error: "Unable to add these tasks right now. Please try again.",
      code: "UNKNOWN",
    };
  }

  await Promise.all(
    (createdRows ?? []).map((row, index) =>
      recordActivity({
        activityType: "maintenance.scheduled",
        title: getDefaultActivityTitle(
          "maintenance.scheduled",
          row.title ?? dedupedTasks[index]?.title ?? "Maintenance task"
        ),
        description: "Recommended maintenance added to your vault.",
        userId: user.id,
        householdId,
        deviceId: input.deviceId,
      })
    )
  );

  revalidatePath(`/devices/${input.deviceId}`);
  revalidatePath("/maintenance");
  revalidatePath("/dashboard");

  return {
    success: true,
    createdCount: createdRows?.length ?? dedupedTasks.length,
    skippedCount: cleanedTasks.length - (createdRows?.length ?? dedupedTasks.length),
  };
}
