import type { NavGroupId } from "@/lib/navigation/types";

export const NAV_GROUP_ROUTE_PREFIXES: Record<
  Exclude<NavGroupId, "overview">,
  string[]
> = {
  technology: [
    "/devices",
    "/home",
    "/warranties",
    "/maintenance",
  ],
  digitalVault: [
    "/documents",
    "/subscriptions",
  ],
  network: ["/network"],
  insights: [
    "/reports",
    "/insights",
    "/audit",
    "/activity",
  ],
  family: [
    "/family",
    "/account",
    "/profile",
  ],
  more: [
    "/notifications",
    "/security",
    "/settings",
    "/contact",
  ],
};

export function resolveActiveNavGroup(
  pathname: string
): NavGroupId | null {
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  ) {
    return "overview";
  }

  for (const [groupId, prefixes] of Object.entries(
    NAV_GROUP_ROUTE_PREFIXES
  ) as [
    Exclude<NavGroupId, "overview">,
    string[],
  ][]) {
    if (
      prefixes.some(
        (prefix) =>
          pathname === prefix ||
          pathname.startsWith(`${prefix}/`)
      )
    ) {
      return groupId;
    }
  }

  return null;
}
