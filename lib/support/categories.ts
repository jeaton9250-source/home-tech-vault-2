export const SUPPORT_CATEGORIES = [
  "Account Access",
  "Billing",
  "Family Sharing",
  "Devices",
  "Documents",
  "Network",
  "Technical Issue",
  "Feature Request",
  "Privacy or Security",
  "Other",
] as const;

export type SupportCategory =
  (typeof SUPPORT_CATEGORIES)[number];

const CATEGORY_SET = new Set<string>(
  SUPPORT_CATEGORIES
);

export function isSupportCategory(
  value: string
): value is SupportCategory {
  return CATEGORY_SET.has(value);
}
