import type { NetworkSummary } from "@/lib/network/summary";

export type NetworkHeaderAction = {
  primary: {
    label: string;
    href: string;
    badgeCount?: number;
  };
  secondary: {
    label: string;
    href: string;
    badgeCount?: number;
  };
};

export function resolveNetworkHeaderActions(
  summary: NetworkSummary
): NetworkHeaderAction {
  const reviewBadge =
    summary.reviewCount > 0
      ? summary.reviewCount
      : undefined;

  if (!summary.hasConnector) {
    return {
      primary: {
        label: "Connect Your Home Network",
        href: "/network/connect",
      },
      secondary: {
        label: "Open Discovery Review",
        href: "/network/discovery",
        badgeCount: reviewBadge,
      },
    };
  }

  if (summary.reviewCount > 0) {
    return {
      primary: {
        label: "Open Discovery Review",
        href: "/network/discovery",
        badgeCount: reviewBadge,
      },
      secondary: {
        label: "Manage Connector",
        href: "/network/connect",
      },
    };
  }

  return {
    primary: {
      label: "Manage Connector",
      href: "/network/connect",
    },
    secondary: {
      label: "Open Discovery Review",
      href: "/network/discovery",
    },
  };
}
