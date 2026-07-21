const READ_PREFIX =
  "home-tech-vault-read-notifications";

const DISMISSED_PREFIX =
  "home-tech-vault-dismissed-notifications";

/** Shown wherever read/dismiss state is surfaced. */
export const NOTIFICATIONS_LOCAL_STATE_NOTE =
  "Read and dismissed alerts are saved on this device only. They do not sync across browsers or devices.";

export function getReadStorageKey(
  userId?: string
) {
  return `${READ_PREFIX}-${userId || "demo"}`;
}

export function getDismissedStorageKey(
  userId?: string
) {
  return `${DISMISSED_PREFIX}-${userId || "demo"}`;
}

export function loadIdSet(
  storageKey: string
): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey
      );

    if (!raw) {
      return new Set();
    }

    return new Set(
      JSON.parse(raw) as string[]
    );
  } catch {
    return new Set();
  }
}

export function saveIdSet(
  storageKey: string,
  ids: Set<string>
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(Array.from(ids))
  );
}

export function priorityRank(
  priority: string
): number {
  switch (priority) {
    case "critical":
      return 0;

    case "high":
      return 1;

    case "normal":
      return 2;

    default:
      return 3;
  }
}

export function formatCurrency(
  value: number
) {
  return value.toLocaleString(
    undefined,
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  );
}

export function daysUntil(
  dateValue: string,
  now: Date
): number {
  const target = new Date(
    `${dateValue}T23:59:59`
  );

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target.getTime() -
      today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}
