export const MAINTENANCE_FIELD_LIMITS = {
  title: 160,
  description: 3000,
} as const;

export const MAINTENANCE_TASK_TYPES = [
  "Maintenance",
  "Cleaning",
  "Software Update",
  "Backup",
  "Inspection",
  "Repair",
  "Battery Replacement",
] as const;

export const MAINTENANCE_INTERVALS = [
  "Weekly",
  "Monthly",
  "Every 3 Months",
  "Every 6 Months",
  "Yearly",
  "As needed",
] as const;

export type MaintenanceTaskType =
  (typeof MAINTENANCE_TASK_TYPES)[number];

export type MaintenanceInterval =
  (typeof MAINTENANCE_INTERVALS)[number];

export type MaintenanceInputForValidation = {
  title: string;
  description?: string | null;
  taskType: string;
  dueDate?: string | null;
  recurringInterval?: string | null;
};

export type ValidatedMaintenanceInput = {
  title: string;
  description: string | null;
  taskType: MaintenanceTaskType;
  dueDate: string | null;
  recurringInterval: MaintenanceInterval | null;
};

export type MaintenanceValidationResult =
  | {
      success: true;
      data: ValidatedMaintenanceInput;
    }
  | {
      success: false;
      error: string;
    };

function normalizeDate(
  value?: string | null
):
  | {
      value: string | null;
      error: null;
    }
  | {
      value: null;
      error: string;
    } {
  const trimmed =
    value?.trim() ?? "";

  if (!trimmed) {
    return {
      value: null,
      error: null,
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return {
      value: null,
      error: "Due date is not a valid date.",
    };
  }

  const [year, month, day] =
    trimmed.split("-").map(Number);

  const parsed = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return {
      value: null,
      error: "Due date is not a valid date.",
    };
  }

  return {
    value: trimmed,
    error: null,
  };
}

export function validateMaintenanceTaskInput(
  input: MaintenanceInputForValidation
): MaintenanceValidationResult {
  const title = input.title.trim();

  if (!title) {
    return {
      success: false,
      error: "Please enter a task title.",
    };
  }

  if (
    title.length >
    MAINTENANCE_FIELD_LIMITS.title
  ) {
    return {
      success: false,
      error:
        `Task title must be ${MAINTENANCE_FIELD_LIMITS.title} characters or fewer.`,
    };
  }

  const description =
    input.description?.trim() ?? "";

  if (
    description.length >
    MAINTENANCE_FIELD_LIMITS.description
  ) {
    return {
      success: false,
      error:
        `Description must be ${MAINTENANCE_FIELD_LIMITS.description} characters or fewer.`,
    };
  }

  if (
    !MAINTENANCE_TASK_TYPES.includes(
      input.taskType as MaintenanceTaskType
    )
  ) {
    return {
      success: false,
      error: "Choose a valid task type.",
    };
  }

  const dueDate = normalizeDate(
    input.dueDate
  );

  if (dueDate.error) {
    return {
      success: false,
      error: dueDate.error,
    };
  }

  const rawInterval =
    input.recurringInterval?.trim() ?? "";

  const recurringInterval =
    !rawInterval || rawInterval === "None"
      ? null
      : rawInterval;

  if (
    recurringInterval &&
    !MAINTENANCE_INTERVALS.includes(
      recurringInterval as MaintenanceInterval
    )
  ) {
    return {
      success: false,
      error: "Choose a valid repeat interval.",
    };
  }

  return {
    success: true,
    data: {
      title,
      description:
        description || null,
      taskType:
        input.taskType as MaintenanceTaskType,
      dueDate:
        dueDate.value,
      recurringInterval:
        recurringInterval as
          | MaintenanceInterval
          | null,
    },
  };
}
