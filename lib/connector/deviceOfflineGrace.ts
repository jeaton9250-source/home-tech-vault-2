export const DEVICE_OFFLINE_GRACE_MS =
  30 * 60 * 1000;

export type DeviceOfflineDecision = {
  shouldMarkOffline: boolean;
  elapsedMs: number | null;
  reason:
    | "within_grace_period"
    | "grace_period_expired"
    | "missing_last_seen"
    | "invalid_timestamp"
    | "future_timestamp";
};

/**
 * A device should not be marked offline
 * after one missed scan. It must remain
 * absent beyond the configured grace
 * period.
 */
export function shouldMarkDeviceOffline(
  lastSeenAt:
    | string
    | null
    | undefined,
  scannedAt: string,
  graceMs =
    DEVICE_OFFLINE_GRACE_MS
): DeviceOfflineDecision {
  if (!lastSeenAt?.trim()) {
    return {
      shouldMarkOffline: false,
      elapsedMs: null,
      reason: "missing_last_seen",
    };
  }

  const lastSeenMs =
    new Date(
      lastSeenAt
    ).getTime();

  const scannedAtMs =
    new Date(
      scannedAt
    ).getTime();

  if (
    !Number.isFinite(lastSeenMs) ||
    !Number.isFinite(scannedAtMs)
  ) {
    return {
      shouldMarkOffline: false,
      elapsedMs: null,
      reason: "invalid_timestamp",
    };
  }

  const elapsedMs =
    scannedAtMs - lastSeenMs;

  if (elapsedMs < 0) {
    return {
      shouldMarkOffline: false,
      elapsedMs,
      reason: "future_timestamp",
    };
  }

  if (elapsedMs < graceMs) {
    return {
      shouldMarkOffline: false,
      elapsedMs,
      reason: "within_grace_period",
    };
  }

  return {
    shouldMarkOffline: true,
    elapsedMs,
    reason: "grace_period_expired",
  };
}

export function formatOfflineDuration(
  elapsedMs:
    | number
    | null
    | undefined
): string | null {
  if (
    typeof elapsedMs !== "number" ||
    !Number.isFinite(elapsedMs) ||
    elapsedMs < 0
  ) {
    return null;
  }

  const minutes =
    Math.max(
      1,
      Math.round(
        elapsedMs /
          (60 * 1000)
      )
    );

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    }`;
  }

  const hours =
    Math.round(
      (minutes / 60) * 10
    ) / 10;

  return `${hours} hour${
    hours === 1 ? "" : "s"
  }`;
}
