export type DeviceNetworkPresenceState =
  | "online"
  | "recently_detected"
  | "not_recently_detected"
  | "unknown";

export const DEVICE_PRESENCE_ONLINE_WINDOW_MS =
  30 * 60 * 1000;

export const DEVICE_PRESENCE_STALE_AFTER_MS =
  45 * 60 * 1000;

export type DevicePresenceInput = {
  online?: boolean | null;
  lastSeenAt?: string | null;
  firstSeenAt?: string | null;
  networkUpdatedAt?: string | null;
  now?: number;
};

export type DevicePresencePresentation = {
  state: DeviceNetworkPresenceState;
  label: string;
  listLabel: string;
  listEmoji: string;
  tone: "online" | "recent" | "stale" | "unknown";
};

const PRESENCE_LABELS: Record<
  DeviceNetworkPresenceState,
  Omit<DevicePresencePresentation, "state">
> = {
  online: {
    label: "Online",
    listLabel: "Online",
    listEmoji: "🟢",
    tone: "online",
  },
  recently_detected: {
    label: "Recently Detected",
    listLabel: "Recently Detected",
    listEmoji: "🟡",
    tone: "recent",
  },
  not_recently_detected: {
    label: "Not Recently Detected",
    listLabel: "Not Recently Detected",
    listEmoji: "⚪",
    tone: "stale",
  },
  unknown: {
    label: "Unknown",
    listLabel: "Unknown",
    listEmoji: "❔",
    tone: "unknown",
  },
};

export function deriveDeviceNetworkPresence(
  input: DevicePresenceInput
): DeviceNetworkPresenceState {
  const observationAt =
    input.lastSeenAt?.trim() ||
    input.networkUpdatedAt?.trim() ||
    input.firstSeenAt?.trim() ||
    null;

  if (!observationAt) {
    return "unknown";
  }

  const observationMs = new Date(observationAt).getTime();
  const now = input.now ?? Date.now();

  if (!Number.isFinite(observationMs)) {
    return "unknown";
  }

  const elapsed = now - observationMs;

  /*
   * Honor the online flag only while the latest observation is still fresh.
   * Sticky online=true with a multi-day-old last_seen_at should not keep
   * Devices cards permanently "Online".
   */
  if (
    input.online === true &&
    elapsed <= DEVICE_PRESENCE_ONLINE_WINDOW_MS
  ) {
    return "online";
  }

  if (!input.lastSeenAt?.trim()) {
    if (elapsed <= DEVICE_PRESENCE_ONLINE_WINDOW_MS) {
      return "recently_detected";
    }

    if (elapsed > DEVICE_PRESENCE_STALE_AFTER_MS) {
      return "not_recently_detected";
    }

    return "recently_detected";
  }

  const lastSeenMs = new Date(input.lastSeenAt).getTime();

  if (!Number.isFinite(lastSeenMs)) {
    return "unknown";
  }

  const lastSeenElapsed = now - lastSeenMs;

  if (lastSeenElapsed <= DEVICE_PRESENCE_ONLINE_WINDOW_MS) {
    return input.online === true
      ? "online"
      : "recently_detected";
  }

  if (lastSeenElapsed > DEVICE_PRESENCE_STALE_AFTER_MS) {
    return "not_recently_detected";
  }

  return "recently_detected";
}

export function presentDeviceNetworkPresence(
  input: DevicePresenceInput
): DevicePresencePresentation {
  const state = deriveDeviceNetworkPresence(input);

  return {
    state,
    ...PRESENCE_LABELS[state],
  };
}

export function resolveLatestPresenceTimestamp(input: {
  lastSeenAt?: string | null;
  networkUpdatedAt?: string | null;
}): string | null {
  return (
    [input.lastSeenAt, input.networkUpdatedAt]
      .filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0
      )
      .map((value) => ({
        value,
        ms: new Date(value).getTime(),
      }))
      .filter((entry) => Number.isFinite(entry.ms))
      .sort((left, right) => right.ms - left.ms)[0]?.value ??
    input.lastSeenAt ??
    null
  );
}

export type DevicePresenceBadge = {
  label: string;
  className: string;
  dotClassName: string;
};

export type DevicePresenceView = DevicePresencePresentation & {
  latestTimestamp: string | null;
  lastActiveLabel: string;
  listLine: string;
  badge: DevicePresenceBadge;
};

function getPresenceBadge(
  presentation: DevicePresencePresentation
): DevicePresenceBadge {
  switch (presentation.state) {
    case "online":
      return {
        label: presentation.listLabel,
        className: "bg-home-health-soft text-home-health",
        dotClassName: "bg-home-health",
      };
    case "recently_detected":
      return {
        label: presentation.listLabel,
        className: "bg-warning-soft text-warning",
        dotClassName: "bg-warning",
      };
    case "not_recently_detected":
      return {
        label: presentation.listLabel,
        className: "bg-surface-sunken text-text-secondary",
        dotClassName: "bg-text-tertiary",
      };
    case "unknown":
    default:
      return {
        label: presentation.listLabel,
        className: "bg-surface-sunken text-text-secondary",
        dotClassName: "bg-text-tertiary",
      };
  }
}

export function getDevicePresence(
  input: DevicePresenceInput
): DevicePresenceView {
  const latestTimestamp = resolveLatestPresenceTimestamp({
    lastSeenAt: input.lastSeenAt,
    networkUpdatedAt: input.networkUpdatedAt,
  });
  const presentation = presentDeviceNetworkPresence({
    ...input,
    lastSeenAt: latestTimestamp,
  });
  const lastActiveLabel = formatPresenceLastSeen(
    latestTimestamp,
    input.now
  );
  const listLine =
    presentation.state === "online"
      ? `${presentation.listEmoji} ${presentation.listLabel} · Active now`
      : `${presentation.listEmoji} ${presentation.listLabel} · ${lastActiveLabel}`;

  return {
    ...presentation,
    latestTimestamp,
    lastActiveLabel,
    listLine,
    badge: getPresenceBadge(presentation),
  };
}

export type VaultDevicePresenceRow = {
  online?: boolean | null;
  last_seen_at?: string | null;
  first_seen_at?: string | null;
  network_updated_at?: string | null;
};

export type HomePulseDevicePresenceCounts = {
  online: number;
  recentlyDetected: number;
  notRecentlyDetected: number;
  unknown: number;
};

export function computeHomePulseDevicePresenceCounts(
  devices: VaultDevicePresenceRow[],
  now = Date.now()
): HomePulseDevicePresenceCounts {
  return devices.reduce<HomePulseDevicePresenceCounts>(
    (counts, device) => {
      const state = deriveDeviceNetworkPresence({
        online: device.online,
        lastSeenAt: device.last_seen_at,
        firstSeenAt: device.first_seen_at,
        networkUpdatedAt: device.network_updated_at,
        now,
      });

      if (state === "online") {
        counts.online += 1;
      } else if (state === "recently_detected") {
        counts.recentlyDetected += 1;
      } else if (state === "not_recently_detected") {
        counts.notRecentlyDetected += 1;
      } else {
        counts.unknown += 1;
      }

      return counts;
    },
    {
      online: 0,
      recentlyDetected: 0,
      notRecentlyDetected: 0,
      unknown: 0,
    }
  );
}

export function formatDevicePresenceListLine(input: {
  online?: boolean | null;
  lastSeenAt?: string | null;
  firstSeenAt?: string | null;
  networkUpdatedAt?: string | null;
}): string {
  return getDevicePresence(input).listLine;
}

export function formatPresenceLastSeen(
  value?: string | null,
  now = Date.now()
): string {
  if (!value?.trim()) {
    return "No observations yet";
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Unknown";
  }

  const minutes = Math.floor((now - timestamp) / (1000 * 60));

  if (minutes < 1) {
    return "Seen just now";
  }

  if (minutes < 60) {
    return `Last active ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Last active ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Last active yesterday";
  }

  if (days < 7) {
    return `Last active ${days} days ago`;
  }

  return `Last active ${new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}

export function formatNetworkUpdatedAt(
  value?: string | null,
  now = Date.now()
): string {
  if (!value?.trim()) {
    return "Not updated yet";
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Unknown";
  }

  const minutes = Math.floor((now - timestamp) / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
