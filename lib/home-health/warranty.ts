export type WarrantyStatus =
  | "active"
  | "expiring"
  | "expired"
  | "missing";

const EXPIRING_WINDOW_DAYS = 90;

export function getWarrantyStatus(
  warrantyDate: string | null,
  now = new Date()
): WarrantyStatus {
  if (!warrantyDate) {
    return "missing";
  }

  const expirationDate = new Date(
    `${warrantyDate}T12:00:00`
  );

  if (Number.isNaN(expirationDate.getTime())) {
    return "missing";
  }

  const daysRemaining = getDaysRemaining(
    warrantyDate,
    now
  );

  if (daysRemaining === null) {
    return "missing";
  }

  if (daysRemaining < 0) {
    return "expired";
  }

  if (daysRemaining <= EXPIRING_WINDOW_DAYS) {
    return "expiring";
  }

  return "active";
}

export function getDaysRemaining(
  warrantyDate: string | null,
  now = new Date()
): number | null {
  if (!warrantyDate) {
    return null;
  }

  const expirationDate = new Date(
    `${warrantyDate}T12:00:00`
  );

  if (Number.isNaN(expirationDate.getTime())) {
    return null;
  }

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return Math.ceil(
    (expirationDate.getTime() - now.getTime()) /
      millisecondsPerDay
  );
}
