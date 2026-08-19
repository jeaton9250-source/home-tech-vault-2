"use server";

import type {
  SupabaseClient,
} from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";
import {
  applyHouseholdScope,
  fetchHouseholdIdForUser,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";
import {
  validateMaintenanceTaskInput,
  type MaintenanceInputForValidation,
  type ValidatedMaintenanceInput,
} from "@/lib/maintenance/maintenanceInputValidation";
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
      code?:
        | "UNAUTHENTICATED"
        | "VALIDATION_ERROR"
        | "NOT_FOUND_OR_FORBIDDEN"
        | "UNKNOWN";
    };

export type CreateMaintenanceTaskResult =
  | {
      success: true;
      taskId: string;
    }
  | {
      success: false;
      error: string;
      code?:
        | "UNAUTHENTICATED"
        | "VALIDATION_ERROR"
        | "NOT_FOUND_OR_FORBIDDEN"
        | "UNKNOWN";
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
  task:
    | ValidatedMaintenanceInput
    | ExistingMaintenanceTask
) {
  const taskType =
    "taskType" in task
      ? task.taskType
      : task.task_type;

  return normalize(
    [
      task.title,
      taskType,
      task.description,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

async function verifyDeviceAccess(options: {
  supabase: SupabaseClient;
  deviceId: string;
  householdId: string | null;
  userId: string;
}): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
      code:
        | "VALIDATION_ERROR"
        | "NOT_FOUND_OR_FORBIDDEN"
        | "UNKNOWN";
    }
> {
  const deviceId =
    options.deviceId.trim();

  if (!deviceId) {
    return {
      success: false,
      error: "Select a valid device.",
      code: "VALIDATION_ERROR",
    };
  }

  const {
    data: device,
    error,
  } = await applyHouseholdScope(
    options.supabase
      .from("devices")
      .select("id")
      .eq("id", deviceId),
    options.householdId,
    options.userId
  ).maybeSingle();

  if (error) {
    console.error(
      "Unable to verify maintenance device:",
      error
    );

    return {
      success: false,
      error:
        "Unable to verify this device right now.",
      code: "UNKNOWN",
    };
  }

  if (!device) {
    return {
      success: false,
      error:
        "This device could not be found or you do not have access to it.",
      code:
        "NOT_FOUND_OR_FORBIDDEN",
    };
  }

  return {
    success: true,
  };
}

export async function createMaintenanceTask(
  input: MaintenanceInputForValidation & {
    deviceId: string;
  }
): Promise<CreateMaintenanceTaskResult> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error:
        "You must be signed in to add a maintenance task.",
      code: "UNAUTHENTICATED",
    };
  }

  const validation =
    validateMaintenanceTaskInput(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
      code: "VALIDATION_ERROR",
    };
  }

  const normalized =
    validation.data;

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const deviceId =
    input.deviceId.trim();

  if (deviceId) {
    const access =
      await verifyDeviceAccess({
        supabase,
        deviceId,
        householdId,
        userId: user.id,
      });

    if (!access.success) {
      return access;
    }
  }

  const {
    data: created,
    error,
  } = await supabase
    .from("maintenance_tasks")
    .insert(
      withHouseholdInsertFields(
        {
          device_id:
            deviceId || null,
          title:
            normalized.title,
          description:
            normalized.description,
          task_type:
            normalized.taskType,
          due_date:
            normalized.dueDate,
          completed: false,
          recurring_interval:
            normalized.recurringInterval,
        },
        householdId,
        user.id
      )
    )
    .select("id")
    .single();

  if (error || !created) {
    console.error(
      "Unable to create maintenance task:",
      error
    );

    return {
      success: false,
      error:
        "Unable to create this maintenance task. Please try again.",
      code: "UNKNOWN",
    };
  }

  if (deviceId) {
    await recordActivity({
      activityType:
        "maintenance.scheduled",
      title:
        "Maintenance scheduled",
      description:
        normalized.dueDate
          ? `${normalized.title} scheduled for ${normalized.dueDate}.`
          : `${normalized.title} was added as a maintenance task.`,
      userId: user.id,
      householdId,
      deviceId,
    });

    revalidatePath(
      `/devices/${deviceId}`
    );
  }

  revalidatePath("/maintenance");
  revalidatePath("/dashboard");

  return {
    success: true,
    taskId: created.id,
  };
}

export async function createMaintenanceTasksForDevice(
  input: {
    deviceId: string;
    tasks: MaintenanceTaskInput[];
  }
): Promise<CreateMaintenanceTasksResult> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error:
        "You must be signed in to add maintenance tasks.",
      code: "UNAUTHENTICATED",
    };
  }

  if (
    !Array.isArray(input.tasks) ||
    input.tasks.length === 0
  ) {
    return {
      success: false,
      error:
        "Select at least one task to add.",
      code: "VALIDATION_ERROR",
    };
  }

  if (input.tasks.length > 25) {
    return {
      success: false,
      error:
        "Too many maintenance tasks were submitted at once.",
      code: "VALIDATION_ERROR",
    };
  }

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const deviceAccess =
    await verifyDeviceAccess({
      supabase,
      deviceId:
        input.deviceId,
      householdId,
      userId: user.id,
    });

  if (!deviceAccess.success) {
    return deviceAccess;
  }

  const cleanedTasks:
    ValidatedMaintenanceInput[] =
    [];

  for (const task of input.tasks) {
    const validation =
      validateMaintenanceTaskInput(
        task
      );

    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code:
          "VALIDATION_ERROR",
      };
    }

    cleanedTasks.push(
      validation.data
    );
  }

  const {
    data: existingRows,
    error: existingError,
  } = await applyHouseholdScope(
    supabase
      .from("maintenance_tasks")
      .select(
        "title, task_type, description"
      )
      .eq(
        "device_id",
        input.deviceId
      ),
    householdId,
    user.id
  );

  if (existingError) {
    console.error(
      "Unable to load existing maintenance tasks:",
      existingError
    );

    return {
      success: false,
      error:
        "Unable to add these tasks right now. Please try again.",
      code: "UNKNOWN",
    };
  }

  const existingTaskKeys =
    new Set(
      (
        (existingRows ?? []) as
          ExistingMaintenanceTask[]
      ).map(taskKey)
    );

  const dedupedTasks =
    cleanedTasks.filter(
      (task) =>
        !existingTaskKeys.has(
          taskKey(task)
        )
    );

  if (
    dedupedTasks.length === 0
  ) {
    return {
      success: true,
      createdCount: 0,
      skippedCount:
        cleanedTasks.length,
    };
  }

  const payload =
    dedupedTasks.map(
      (task) =>
        withHouseholdInsertFields(
          {
            device_id:
              input.deviceId,
            title:
              task.title,
            description:
              task.description,
            task_type:
              task.taskType,
            due_date:
              task.dueDate,
            completed: false,
            recurring_interval:
              task.recurringInterval,
          },
          householdId,
          user.id
        )
    );

  const {
    data: createdRows,
    error,
  } = await supabase
    .from("maintenance_tasks")
    .insert(payload)
    .select("id, title");

  if (error) {
    console.error(
      "Unable to create maintenance tasks:",
      error
    );

    return {
      success: false,
      error:
        "Unable to add these tasks right now. Please try again.",
      code: "UNKNOWN",
    };
  }

  await Promise.all(
    (createdRows ?? []).map(
      (row, index) =>
        recordActivity({
          activityType:
            "maintenance.scheduled",
          title:
            getDefaultActivityTitle(
              "maintenance.scheduled",
              row.title ??
                dedupedTasks[
                  index
                ]?.title ??
                "Maintenance task"
            ),
          description:
            "Recommended maintenance added to your vault.",
          userId: user.id,
          householdId,
          deviceId:
            input.deviceId,
        })
    )
  );

  revalidatePath(
    `/devices/${input.deviceId}`
  );
  revalidatePath("/maintenance");
  revalidatePath("/dashboard");

  const createdCount =
    createdRows?.length ??
    dedupedTasks.length;

  return {
    success: true,
    createdCount,
    skippedCount:
      cleanedTasks.length -
      createdCount,
  };
}
