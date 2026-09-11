export const MAINTENANCE_REMINDER_KINDS = [
  "due_48h",
  "due_24h",
  "overdue",
] as const;

export type MaintenanceReminderKind =
  (typeof MAINTENANCE_REMINDER_KINDS)[number];

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function shiftUtcDateKey(dateKey: string, days: number) {
  if (!DATE_KEY.test(dateKey)) return null;
  const date = new Date(`${dateKey}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return utcDateKey(date);
}

export function maintenanceReminderKind(
  dueDate: string,
  today: string,
): MaintenanceReminderKind | null {
  if (!DATE_KEY.test(dueDate) || !DATE_KEY.test(today)) return null;
  if (dueDate === shiftUtcDateKey(today, 2)) return "due_48h";
  if (dueDate === shiftUtcDateKey(today, 1)) return "due_24h";
  if (dueDate < today) return "overdue";
  return null;
}

export function maintenanceReminderCopy(input: {
  kind: MaintenanceReminderKind;
  taskTitle: string | null;
  deviceName: string | null;
}) {
  const taskTitle = input.taskTitle?.trim() || "Home care task";
  const deviceName = input.deviceName?.trim() || "Whole Home";

  const title = input.kind === "due_48h"
    ? "Home care due in 2 days"
    : input.kind === "due_24h"
      ? "Home care due tomorrow"
      : "Home care is overdue";

  return {
    title,
    body: `${taskTitle} · ${deviceName}`,
  };
}
