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
  const hasObservation = Boolean(
    input.lastSeenAt?.trim() ||
      input.firstSeenAt?.trim() ||
      input.networkUpdatedAt?.trim()
  );

  if (!hasObservation) {
    return "unknown";
  }

  if (input.online === true) {
    return "online";
  }

  if (!input.lastSeenAt?.trim()) {
    return "unknown";
  }

  const lastSeenMs = new Date(input.lastSeenAt).getTime();

  if (!Number.isFinite(lastSeenMs)) {
    return "unknown";
  }

  const elapsed = (input.now ?? Date.now()) - lastSeenMs;

  if (elapsed <= DEVICE_PRESENCE_ONLINE_WINDOW_MS) {
    return "recently_detected";
  }

  if (elapsed > DEVICE_PRESENCE_STALE_AFTER_MS) {
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
  const presentation = presentDeviceNetworkPresence(input);
  const lastSeenLabel = formatPresenceLastSeen(input.lastSeenAt);

  return `${presentation.listEmoji} ${presentation.listLabel} · ${lastSeenLabel}`;
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
    return `Seen ${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Seen ${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `Seen ${days} days ago`;
  }

  return `Seen ${new Date(value).toLocaleDateString(undefined, {
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
