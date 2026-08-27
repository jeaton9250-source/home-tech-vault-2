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

export type AiMaintenanceRecommendation = {
  id: string;
  title: string;
  description: string;
  taskType: string;
  recurringInterval: string | null;
  dueInDays: number;
  priority: number;
  reason: string;
};

export type GenerateMaintenanceRecommendationsResult =
  | {
      success: true;
      recommendations: AiMaintenanceRecommendation[];
    }
  | {
      success: false;
      error: string;
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

export async function generateDeviceMaintenanceRecommendations(
  deviceId: string
): Promise<GenerateMaintenanceRecommendationsResult> {
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
        "You must be signed in to generate maintenance recommendations.",
    };
  }

  const apiKey =
    process.env.OPENAI_API_KEY
      ?.trim();

  if (!apiKey) {
    return {
      success: false,
      error:
        "Smart maintenance recommendations are temporarily unavailable.",
    };
  }

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const access =
    await verifyDeviceAccess({
      supabase,
      deviceId,
      householdId,
      userId: user.id,
    });

  if (!access.success) {
    return {
      success: false,
      error: access.error,
    };
  }

  const {
    data: device,
    error: deviceError,
  } = await applyHouseholdScope(
    supabase
      .from("devices")
      .select(
        "id, device_name, category, manufacturer, brand, model_number, purchase_date, manual_url"
      )
      .eq(
        "id",
        deviceId
      ),
    householdId,
    user.id
  ).maybeSingle();

  if (
    deviceError ||
    !device
  ) {
    console.error(
      "Unable to load device for smart maintenance:",
      deviceError
    );

    return {
      success: false,
      error:
        "Unable to load this device right now.",
    };
  }

  const {
    data: existingTasks,
    error: taskError,
  } = await applyHouseholdScope(
    supabase
      .from("maintenance_tasks")
      .select(
        "title, description, task_type, recurring_interval, completed"
      )
      .eq(
        "device_id",
        deviceId
      ),
    householdId,
    user.id
  );

  if (taskError) {
    console.warn(
      "Unable to load existing tasks for smart maintenance:",
      taskError
    );
  }

  const existingSummary =
    (existingTasks ?? [])
      .slice(
        0,
        20
      )
      .map(
        (task: {
          title: string | null;
          task_type: string | null;
          recurring_interval: string | null;
        }) =>
          [
            task.title,
            task.task_type,
            task.recurring_interval,
          ]
            .filter(Boolean)
            .join(" | ")
      );

  const prompt = [
    "You create conservative, practical maintenance recommendations for Home Tech Vault.",
    "",
    "DEVICE",
    `Name: ${device.device_name ?? "Unknown"}`,
    `Category: ${device.category ?? "Unknown"}`,
    `Manufacturer: ${device.manufacturer ?? device.brand ?? "Unknown"}`,
    `Brand: ${device.brand ?? device.manufacturer ?? "Unknown"}`,
    `Model: ${device.model_number ?? "Unknown"}`,
    `Purchase date: ${device.purchase_date ?? "Unknown"}`,
    `Official manual available: ${device.manual_url ? "Yes" : "No"}`,
    "",
    "EXISTING TASKS",
    existingSummary.length > 0
      ? existingSummary.join("\n")
      : "None",
    "",
    "Generate 3 to 6 useful routine maintenance recommendations specifically appropriate for this device.",
    "",
    "RULES",
    "- Recommendations must make sense for this exact type of product.",
    "- Use the manufacturer and model as context, but do not invent model-specific features.",
    "- Do not infer maintenance from brand alone.",
    "- Samsung does not automatically mean appliance or television.",
    "- LG does not automatically mean appliance or television.",
    "- Apple does not automatically mean computer.",
    "- Avoid tasks already represented in EXISTING TASKS.",
    "- Prefer routine homeowner-safe care.",
    "- Do not recommend opening or disassembling the device.",
    "- Do not recommend electrical repair, refrigerant work, internal battery service, high-voltage work, or other hazardous service.",
    "- Do not invent replaceable filters, fluids, belts, batteries, cartridges, serviceable parts, or cleaning procedures unless they are normally applicable to this product type.",
    "- For electronics, reasonable tasks can include software updates, safe exterior cleaning, ventilation inspection, connection checks, backup checks, battery-health review, and built-in diagnostics when appropriate.",
    "- For appliances, only recommend filters, hoses, seals, coils, cleaning cycles, vents, or similar maintenance when appropriate to that appliance type.",
    "- Keep descriptions concise and actionable.",
    "- dueInDays must be between 1 and 365.",
    "- priority must be between 1 and 100.",
    "",
    "Allowed taskType values:",
    "Maintenance",
    "Cleaning",
    "Inspection",
    "Software Update",
    "Backup",
    "Battery Replacement",
    "",
    "Allowed recurringInterval examples:",
    "Weekly",
    "Monthly",
    "Every 3 Months",
    "Every 6 Months",
    "Yearly",
    "As needed",
    "",
    "Return ONLY valid JSON with this shape:",
    '{',
    '  "recommendations": [',
    '    {',
    '      "id": "short-stable-slug",',
    '      "title": "string",',
    '      "description": "string",',
    '      "taskType": "string",',
    '      "recurringInterval": "string or null",',
    '      "dueInDays": 30,',
    '      "priority": 80,',
    '      "reason": "short explanation"',
    '    }',
    '  ]',
    '}',
  ].join("\n");

  try {
    const response =
      await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${apiKey}`,
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify({
              model:
                process.env
                  .OPENAI_MAINTENANCE_MODEL
                  ?.trim() ||
                "gpt-5-mini",
              input: prompt,
            }),
        }
      );

    if (!response.ok) {
      console.error(
        "OpenAI maintenance request failed:",
        response.status,
        await response
          .text()
          .catch(() => "")
      );

      return {
        success: false,
        error:
          "Unable to generate smart maintenance recommendations right now.",
      };
    }

    const payload =
      (await response.json()) as {
        output_text?: string;
        output?: Array<{
          content?: Array<{
            type?: string;
            text?: string;
          }>;
        }>;
      };

    const responseText =
      payload.output_text ??
      payload.output
        ?.flatMap(
          (item) =>
            item.content ?? []
        )
        .map(
          (item) =>
            item.text ?? ""
        )
        .join("\n")
        .trim() ??
      "";

    const cleanedJson =
      responseText
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/,
          ""
        )
        .trim();

    let parsed: unknown;

    try {
      parsed =
        JSON.parse(
          cleanedJson
        );
    } catch (error) {
      console.error(
        "Unable to parse smart maintenance JSON:",
        error
      );

      return {
        success: false,
        error:
          "The smart maintenance response could not be verified.",
      };
    }

    if (
      !parsed ||
      typeof parsed !==
        "object"
    ) {
      return {
        success: false,
        error:
          "The smart maintenance response was invalid.",
      };
    }

    const rawRecommendations =
      (
        parsed as {
          recommendations?: unknown;
        }
      ).recommendations;

    if (
      !Array.isArray(
        rawRecommendations
      )
    ) {
      return {
        success: false,
        error:
          "No verified maintenance recommendations were returned.",
      };
    }

    const allowedTaskTypes =
      new Set([
        "Maintenance",
        "Cleaning",
        "Inspection",
        "Software Update",
        "Backup",
        "Battery Replacement",
      ]);

    const recommendations:
      AiMaintenanceRecommendation[] =
      rawRecommendations
        .slice(
          0,
          6
        )
        .flatMap(
          (
            item,
            index
          ) => {
            if (
              !item ||
              typeof item !==
                "object"
            ) {
              return [];
            }

            const value =
              item as Record<
                string,
                unknown
              >;

            const title =
              typeof value.title ===
              "string"
                ? value.title.trim()
                : "";

            const description =
              typeof value.description ===
              "string"
                ? value.description.trim()
                : "";

            const taskType =
              typeof value.taskType ===
                "string" &&
              allowedTaskTypes.has(
                value.taskType
              )
                ? value.taskType
                : "Maintenance";

            const recurringInterval =
              typeof value.recurringInterval ===
              "string"
                ? value.recurringInterval.trim()
                : null;

            const dueInDays =
              typeof value.dueInDays ===
                "number" &&
              Number.isFinite(
                value.dueInDays
              )
                ? Math.min(
                    365,
                    Math.max(
                      1,
                      Math.round(
                        value.dueInDays
                      )
                    )
                  )
                : 30;

            const priority =
              typeof value.priority ===
                "number" &&
              Number.isFinite(
                value.priority
              )
                ? Math.min(
                    100,
                    Math.max(
                      1,
                      Math.round(
                        value.priority
                      )
                    )
                  )
                : 50;

            const reason =
              typeof value.reason ===
              "string"
                ? value.reason.trim()
                : "Smart recommendation";

            if (
              !title ||
              !description
            ) {
              return [];
            }

            const providedId =
              typeof value.id ===
              "string"
                ? value.id
                    .trim()
                    .toLowerCase()
                    .replace(
                      /[^a-z0-9]+/g,
                      "-"
                    )
                    .replace(
                      /^-+|-+$/g,
                      ""
                    )
                : "";

            return [
              {
                id:
                  providedId ||
                  `ai-maintenance-${index + 1}`,
                title:
                  title.slice(
                    0,
                    140
                  ),
                description:
                  description.slice(
                    0,
                    500
                  ),
                taskType,
                recurringInterval:
                  recurringInterval
                    ? recurringInterval.slice(
                        0,
                        80
                      )
                    : null,
                dueInDays,
                priority,
                reason:
                  reason.slice(
                    0,
                    120
                  ),
              },
            ];
          }
        );

    if (
      recommendations.length ===
      0
    ) {
      return {
        success: false,
        error:
          "No verified maintenance recommendations were returned.",
      };
    }

    return {
      success: true,
      recommendations:
        recommendations.sort(
          (
            first,
            second
          ) =>
            second.priority -
            first.priority
        ),
    };
  } catch (error) {
    console.error(
      "Unable to generate smart maintenance recommendations:",
      error
    );

    return {
      success: false,
      error:
        "Unable to generate smart maintenance recommendations right now.",
    };
  }
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
