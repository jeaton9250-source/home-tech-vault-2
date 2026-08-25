import { sections } from "@/lib/design-system/tokens";
import type {
  HomeHealthCategoryCard,
  HomeHealthRecommendation,
  HomeHealthResult,
  HomeHealthStatusLabel,
} from "@/lib/home-health/types";

export function getHomeHealthDisplayMessage(
  status: HomeHealthStatusLabel
): string {
  switch (status) {
    case "Excellent":
      return "Everything looks well organized.";
    case "Healthy":
      return "Your home technology is in good shape.";
    case "Needs Attention":
      return "A few areas could use your attention.";
    case "Needs Setup":
      return "Your Home Tech Vault is just getting started.";
  }
}

export function getHomeHealthRingColor(
  status: HomeHealthStatusLabel
): string {
  switch (status) {
    case "Excellent":
    case "Healthy":
      return "var(--color-home-health)";
    case "Needs Attention":
      return "var(--color-warning)";
    case "Needs Setup":
      return "var(--color-text-muted)";
  }
}

type RecommendationAccent = {
  accent: string;
  soft: string;
};

export function getRecommendationAccent(
  recommendationId: string
): RecommendationAccent {
  if (
    recommendationId === "network"
  ) {
    return sections.network;
  }

  if (
    recommendationId === "first-device"
  ) {
    return sections.technology;
  }

  if (
    recommendationId === "warranty-expiring"
  ) {
    return sections.warning;
  }

  if (
    recommendationId === "maintenance-overdue"
  ) {
    return sections.homeHealth;
  }

  if (
    recommendationId === "subscriptions"
  ) {
    return sections.insights;
  }

  if (
    recommendationId === "router-receipt" ||
    recommendationId ===
      "missing-documents" ||
    recommendationId === "upload-document"
  ) {
    return sections.digitalVault;
  }

  return sections.technology;
}

export function getRecommendationSupportingValue(
  recommendationId: string
): string {
  if (
    recommendationId === "network"
  ) {
    return "Improves Network Health";
  }

  if (
    recommendationId === "first-device"
  ) {
    return "Improves Device Health";
  }

  if (
    recommendationId === "warranty-expiring"
  ) {
    return "Improves Warranty Health";
  }

  if (
    recommendationId === "maintenance-overdue"
  ) {
    return "Improves Maintenance Health";
  }

  if (
    recommendationId === "subscriptions"
  ) {
    return "Improves Subscription Health";
  }

  if (
    recommendationId === "router-receipt" ||
    recommendationId ===
      "missing-documents" ||
    recommendationId === "upload-document"
  ) {
    return "Improves Document Health";
  }

  if (
    recommendationId === "invite-family"
  ) {
    return "Improves Household Health";
  }

  return "Improves Home Health";
}

export function getRecommendationDisplayDescription(
  recommendation: HomeHealthRecommendation
): string {
  if (recommendation.id === "network") {
    return "Save your router, provider, and Home Wi-Fi details so important information is easy to find later.";
  }

  return recommendation.description;
}

export type VaultCategoryKey =
  | "devices"
  | "documents"
  | "network"
  | "maintenance"
  | "subscriptions";

export type VaultCategoryState = {
  key: VaultCategoryKey;
  label: string;
  complete: boolean;
};

export function getVaultCategoryStates(
  cards: HomeHealthCategoryCard[]
): VaultCategoryState[] {
  const cardMap = new Map(
    cards.map((card) => [card.key, card])
  );

  const devices =
    cardMap.get("devices");
  const documents =
    cardMap.get("documents");
  const network =
    cardMap.get("network");
  const maintenance =
    cardMap.get("maintenance");
  const subscriptions =
    cardMap.get("subscriptions");

  return [
    {
      key: "devices",
      label: "Devices",
      complete:
        devices?.status !== "incomplete",
    },
    {
      key: "documents",
      label: "Documents",
      complete:
        documents?.status !==
        "incomplete",
    },
    {
      key: "network",
      label: "Home Wi-Fi",
      complete:
        network?.status === "healthy",
    },
    {
      key: "maintenance",
      label: "Maintenance",
      complete:
        maintenance?.status !==
        "incomplete",
    },
    {
      key: "subscriptions",
      label: "Subscriptions",
      complete:
        subscriptions?.status ===
        "healthy",
    },
  ];
}

export type HomeSnapshotMetric = {
  id: string;
  label: string;
  value: string;
  accent: string;
  soft: string;
};

function parseLeadingCount(
  message: string
): number | null {
  const match = message.match(/^(\d+)/);

  return match
    ? parseInt(match[1], 10)
    : null;
}

function getWarrantyGapCount(
  cards: HomeHealthCategoryCard[]
): number {
  const devicesCard = cards.find(
    (card) => card.key === "devices"
  );
  const warrantiesCard = cards.find(
    (card) => card.key === "warranties"
  );

  if (
    !devicesCard ||
    devicesCard.status === "incomplete"
  ) {
    return 0;
  }

  if (
    !warrantiesCard ||
    warrantiesCard.status === "healthy"
  ) {
    return 0;
  }

  const deviceMatch =
    devicesCard.summary.match(/^(\d+)/);
  const deviceCount = deviceMatch
    ? parseInt(deviceMatch[1], 10)
    : 0;

  if (deviceCount <= 0) {
    return 0;
  }

  const covered = Math.round(
    (deviceCount *
      warrantiesCard.progress) /
      100
  );

  return Math.max(
    0,
    deviceCount - covered
  );
}

export function buildHomeSnapshot(
  homeHealth: HomeHealthResult
): HomeSnapshotMetric[] {
  const devicesHighlight =
    homeHealth.highlights.find(
      (highlight) =>
        highlight.id ===
        "devices-protected"
    );
  const documentsHighlight =
    homeHealth.highlights.find(
      (highlight) =>
        highlight.id ===
        "documents-secured"
    );

  const devicesCard =
    homeHealth.cards.find(
      (card) => card.key === "devices"
    );

  let devicesProtected = 0;

  if (devicesHighlight) {
    devicesProtected =
      parseLeadingCount(
        devicesHighlight.message
      ) ?? 0;
  }

  let documents = 0;

  if (documentsHighlight) {
    documents =
      parseLeadingCount(
        documentsHighlight.message
      ) ?? 0;
  }

  const warrantyGaps = getWarrantyGapCount(
    homeHealth.cards
  );
  const recommendations =
    homeHealth.recommendation ? 1 : 0;

  const metrics: HomeSnapshotMetric[] = [
    {
      id: "devices-protected",
      label: "Devices Protected",
      value: String(devicesProtected),
      accent: sections.technology.accent,
      soft: sections.technology.soft,
    },
    {
      id: "documents",
      label: "Documents",
      value: String(documents),
      accent: sections.digitalVault.accent,
      soft: sections.digitalVault.soft,
    },
  ];

  if (
    devicesCard &&
    devicesCard.status !== "incomplete"
  ) {
    metrics.push({
      id: "warranty-gaps",
      label: "Warranty Gaps",
      value: String(warrantyGaps),
      accent: sections.warning.accent,
      soft: sections.warning.soft,
    });
  }

  metrics.push({
    id: "recommendations",
    label:
      recommendations === 1
        ? "Recommendation"
        : "Recommendations",
    value: String(recommendations),
    accent: sections.homeHealth.accent,
    soft: sections.homeHealth.soft,
  });

  return metrics;
}
