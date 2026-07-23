export const NETWORK_TABS = [
  { id: "overview", label: "Overview" },
  { id: "discovery", label: "Discovery" },
  { id: "monitoring", label: "Monitoring" },
  { id: "connector", label: "Connector" },
] as const;

export type NetworkTabId =
  (typeof NETWORK_TABS)[number]["id"];

export function resolveNetworkTab(
  value: string | null | undefined
): NetworkTabId {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "discovery" ||
    normalized === "monitoring" ||
    normalized === "connector"
  ) {
    return normalized;
  }

  return "overview";
}

export function networkTabHref(tab: NetworkTabId): string {
  if (tab === "overview") {
    return "/network";
  }

  return `/network?tab=${tab}`;
}
