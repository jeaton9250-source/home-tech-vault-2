import { presentDeviceNetworkPresence } from "@/lib/devices/devicePresence";

/** Fixed "now" for demo relative labels — keeps copy stable across visits. */
export const DEMO_NETWORK_ANCHOR = "2026-07-23T12:00:00.000Z";

export function demoTimestampMinutesAgo(minutes: number): string {
  return new Date(
    new Date(DEMO_NETWORK_ANCHOR).getTime() - minutes * 60 * 1000
  ).toISOString();
}

export function demoTimestampHoursAgo(hours: number): string {
  return demoTimestampMinutesAgo(hours * 60);
}

export function demoTimestampDaysAgo(days: number): string {
  return demoTimestampMinutesAgo(days * 24 * 60);
}

export function formatDemoRelativeTime(
  value?: string | null,
  options?: { prefix?: string }
): string {
  if (!value?.trim()) {
    return "Not recorded";
  }

  const anchorMs = new Date(DEMO_NETWORK_ANCHOR).getTime();
  const timestampMs = new Date(value).getTime();

  if (!Number.isFinite(timestampMs)) {
    return "Unknown";
  }

  const minutes = Math.max(
    0,
    Math.floor((anchorMs - timestampMs) / (1000 * 60))
  );
  const prefix = options?.prefix;

  if (minutes < 1) {
    return prefix ? `${prefix} just now` : "Just now";
  }

  if (minutes < 60) {
    const label = `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    return prefix ? `${prefix} ${label}` : label;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    const label = `${hours} hour${hours === 1 ? "" : "s"} ago`;
    return prefix ? `${prefix} ${label}` : label;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return prefix ? `${prefix} yesterday` : "Yesterday";
  }

  if (days < 7) {
    const label = `${days} days ago`;
    return prefix ? `${prefix} ${label}` : label;
  }

  const formatted = new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return prefix ? `${prefix} ${formatted}` : formatted;
}

export function formatDemoDevicePresenceListLine(input: {
  online?: boolean | null;
  lastSeenAt?: string | null;
  firstSeenAt?: string | null;
  networkUpdatedAt?: string | null;
}): string {
  const presentation = presentDeviceNetworkPresence({
    online: input.online,
    lastSeenAt: input.lastSeenAt,
    firstSeenAt: input.firstSeenAt,
    networkUpdatedAt: input.networkUpdatedAt,
    now: new Date(DEMO_NETWORK_ANCHOR).getTime(),
  });
  const lastSeenLabel = formatDemoRelativeTime(input.lastSeenAt, {
    prefix: "Seen",
  });

  return `${presentation.listEmoji} ${presentation.listLabel} · ${lastSeenLabel}`;
}
