import {
  formatDevicePresenceListLine,
  formatNetworkUpdatedAt,
  formatPresenceLastSeen,
  getDevicePresence,
  presentDeviceNetworkPresence,
} from "@/lib/devices/devicePresence";

export type WarrantyPresentation = {
  label: string;
  shortLabel: string;
  tone: "protected" | "warning" | "expired" | "neutral";
  daysRemaining: number | null;
  className: string;
};

export function getWarrantyPresentation(
  warrantyDate?: string | null
): WarrantyPresentation {
  if (!warrantyDate) {
    return {
      label: "No warranty recorded",
      shortLabel: "Not recorded",
      tone: "neutral",
      daysRemaining: null,
      className: "bg-surface-sunken text-text-secondary",
    };
  }

  const expiration = new Date(`${warrantyDate}T23:59:59`);

  if (Number.isNaN(expiration.getTime())) {
    return {
      label: "Warranty status unknown",
      shortLabel: "Unknown",
      tone: "neutral",
      daysRemaining: null,
      className: "bg-surface-sunken text-text-secondary",
    };
  }

  const daysRemaining = Math.ceil(
    (expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) {
    return {
      label: "Warranty expired",
      shortLabel: "Expired",
      tone: "expired",
      daysRemaining,
      className: "bg-danger-soft text-danger",
    };
  }

  if (daysRemaining === 0) {
    return {
      label: "Warranty expires today",
      shortLabel: "Today",
      tone: "warning",
      daysRemaining,
      className: "bg-warning-soft text-warning",
    };
  }

  if (daysRemaining <= 60) {
    return {
      label: `${daysRemaining} days remaining`,
      shortLabel: `${daysRemaining} days`,
      tone: "warning",
      daysRemaining,
      className: "bg-warning-soft text-warning",
    };
  }

  return {
    label: "Protected",
    shortLabel: `${daysRemaining} days`,
    tone: "protected",
    daysRemaining,
    className: "bg-home-health-soft text-home-health",
  };
}

export function formatProfileDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatProfileCurrency(value?: number | null) {
  if (value == null) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatLastSeen(value?: string | null) {
  return formatPresenceLastSeen(value);
}

export function formatNetworkPresence(input: {
  online?: boolean | null;
  lastSeenAt?: string | null;
  firstSeenAt?: string | null;
  networkUpdatedAt?: string | null;
}): string {
  return getDevicePresence(input).label;
}

export {
  formatDevicePresenceListLine,
  formatNetworkUpdatedAt,
  getDevicePresence,
  presentDeviceNetworkPresence,
};

export function displayValue(value?: string | null, fallback = "Not recorded") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}
