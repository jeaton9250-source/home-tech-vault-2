export type NotificationPreferencePatch = {
  connector_offline?: boolean;
  connector_restored?: boolean;
  device_offline?: boolean;
  device_restored?: boolean;
  new_device_discovered?: boolean;
  warranty_reminders?: boolean;
  maintenance_reminders?: boolean;
  push_enabled?: boolean;
  in_app_enabled?: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  timezone?: string | null;
};

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  connector_offline: true,
  connector_restored: true,
  device_offline: true,
  device_restored: true,
  new_device_discovered: true,
  warranty_reminders: true,
  maintenance_reminders: true,
  push_enabled: false,
  in_app_enabled: true,
  quiet_hours_start: null,
  quiet_hours_end: null,
  timezone: "America/New_York",
};

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateQuietTime(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string" || !TIME_PATTERN.test(value.trim())) {
    throw new Error(`${fieldName} must be HH:mm.`);
  }

  return value.trim();
}

export function validateTimezone(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_NOTIFICATION_PREFERENCES.timezone;
  }

  if (typeof value !== "string") {
    throw new Error("timezone must be a valid IANA time zone.");
  }

  const timezone = value.trim();

  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    throw new Error("timezone must be a valid IANA time zone.");
  }

  return timezone;
}

export function parseNotificationPreferences(body: NotificationPreferencePatch) {
  return {
    connector_offline:
      typeof body.connector_offline === "boolean"
        ? body.connector_offline
        : DEFAULT_NOTIFICATION_PREFERENCES.connector_offline,
    connector_restored:
      typeof body.connector_restored === "boolean"
        ? body.connector_restored
        : DEFAULT_NOTIFICATION_PREFERENCES.connector_restored,
    device_offline:
      typeof body.device_offline === "boolean"
        ? body.device_offline
        : DEFAULT_NOTIFICATION_PREFERENCES.device_offline,
    device_restored:
      typeof body.device_restored === "boolean"
        ? body.device_restored
        : DEFAULT_NOTIFICATION_PREFERENCES.device_restored,
    new_device_discovered:
      typeof body.new_device_discovered === "boolean"
        ? body.new_device_discovered
        : DEFAULT_NOTIFICATION_PREFERENCES.new_device_discovered,
    warranty_reminders:
      typeof body.warranty_reminders === "boolean"
        ? body.warranty_reminders
        : DEFAULT_NOTIFICATION_PREFERENCES.warranty_reminders,
    maintenance_reminders:
      typeof body.maintenance_reminders === "boolean"
        ? body.maintenance_reminders
        : DEFAULT_NOTIFICATION_PREFERENCES.maintenance_reminders,
    push_enabled:
      typeof body.push_enabled === "boolean"
        ? body.push_enabled
        : DEFAULT_NOTIFICATION_PREFERENCES.push_enabled,
    in_app_enabled:
      typeof body.in_app_enabled === "boolean"
        ? body.in_app_enabled
        : DEFAULT_NOTIFICATION_PREFERENCES.in_app_enabled,
    quiet_hours_start: validateQuietTime(body.quiet_hours_start, "quiet_hours_start"),
    quiet_hours_end: validateQuietTime(body.quiet_hours_end, "quiet_hours_end"),
    timezone: validateTimezone(body.timezone),
  };
}
