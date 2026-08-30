import { getHomeHealthStatus } from "@/lib/home-health/status";
import { getNextBestAction } from "@/lib/home-health/recommendations";
import type {
  HomeHealthCardStatus,
  HomeHealthCategoryCard,
  HomeHealthHighlight,
  HomeHealthInput,
  HomeHealthModuleKey,
  HomeHealthResult,
} from "@/lib/home-health/types";
import {
  getDaysRemaining,
  getWarrantyStatus,
} from "@/lib/home-health/warranty";

const MODULE_WEIGHTS: Record<
  Exclude<
    HomeHealthModuleKey,
    "futureMonitoring"
  >,
  number
> = {
  devicesProtected: 0.2,
  documentsStored: 0.15,
  warrantyCoverage: 0.15,
  networkConfigured: 0.15,
  maintenanceTracking: 0.1,
  subscriptionsOrganized: 0.1,
  recentActivity: 0.05,
  householdConfigured: 0.05,
  vaultCompleteness: 0.05,
};

function clampScore(value: number) {
  return Math.max(
    0,
    Math.min(100, Math.round(value))
  );
}

function percentage(
  completed: number,
  total: number
) {
  if (total <= 0) {
    return 0;
  }

  return clampScore((completed / total) * 100);
}

function isDeviceProtected(
  device: HomeHealthInput["devices"][number],
  input: HomeHealthInput
) {
  return (
    Boolean(device.warranty_date) ||
    Boolean(device.serial_number?.trim()) ||
    Boolean(device.purchase_date) ||
    input.deviceIdsWithDocuments.has(
      device.id
    ) ||
    input.deviceIdsWithPhotos.has(device.id)
  );
}

export function calculateVaultCompleteness(
  input: HomeHealthInput
): number {
  const areas = [
    input.devices.length > 0,
    input.documentCount > 0 ||
      input.deviceIdsWithDocuments.size > 0,
    input.networkConfigured,
    input.maintenanceTasks.length > 0,
    input.subscriptionCount > 0,
  ];

  const completed = areas.filter(Boolean).length;

  return clampScore(
    (completed / areas.length) * 100
  );
}

function scoreDevicesProtected(
  input: HomeHealthInput
): number {
  if (input.devices.length === 0) {
    return 0;
  }

  const protectedCount =
    input.devices.filter((device) =>
      isDeviceProtected(device, input)
    ).length;

  return percentage(
    protectedCount,
    input.devices.length
  );
}

function scoreDocumentsStored(
  input: HomeHealthInput
): number {
  if (
    input.documentCount === 0 &&
    input.deviceIdsWithDocuments.size === 0
  ) {
    return 0;
  }

  if (input.devices.length === 0) {
    return input.documentCount > 0 ? 100 : 0;
  }

  return percentage(
    input.deviceIdsWithDocuments.size,
    input.devices.length
  );
}

function scoreWarrantyCoverage(
  input: HomeHealthInput
): number {
  if (input.devices.length === 0) {
    return 0;
  }

  const withWarranty = input.devices.filter(
    (device) =>
      getWarrantyStatus(
        device.warranty_date
      ) !== "missing"
  ).length;

  const activeOrExpiring =
    input.devices.filter((device) => {
      const status = getWarrantyStatus(
        device.warranty_date
      );

      return (
        status === "active" ||
        status === "expiring"
      );
    }).length;

  const recorded = percentage(
    withWarranty,
    input.devices.length
  );
  const active = percentage(
    activeOrExpiring,
    input.devices.length
  );

  return clampScore(
    recorded * 0.55 + active * 0.45
  );
}

function scoreNetworkConfigured(
  input: HomeHealthInput
): number {
  return input.networkConfigured ? 100 : 0;
}

function scoreMaintenanceTracking(
  input: HomeHealthInput
): number {
  if (input.devices.length === 0) {
    return input.maintenanceTasks.length > 0
      ? 100
      : 0;
  }

  return percentage(
    input.deviceIdsWithMaintenance.size,
    input.devices.length
  );
}

function scoreSubscriptionsOrganized(
  input: HomeHealthInput
): number {
  return input.subscriptionCount > 0 ? 100 : 0;
}

function scoreRecentActivity(
  input: HomeHealthInput
): number {
  return input.hasRecentActivity ? 100 : 0;
}

function scoreHouseholdConfigured(
  input: HomeHealthInput
): number {
  const hasHouseholdName = Boolean(
    input.profileHouseholdName?.trim() ||
      input.householdName?.trim()
  );

  if (
    hasHouseholdName &&
    input.familyMemberCount > 1
  ) {
    return 100;
  }

  if (hasHouseholdName) {
    return 75;
  }

  if (input.familyMemberCount > 1) {
    return 60;
  }

  return 0;
}

function buildHighlights(
  input: HomeHealthInput
): HomeHealthHighlight[] {
  const highlights: HomeHealthHighlight[] =
    [];

  if (input.devices.length > 0) {
    const protectedCount =
      input.devices.filter((device) =>
        isDeviceProtected(device, input)
      ).length;

    highlights.push({
      id: "devices-protected",
      tone: "positive",
      message: `${protectedCount} device${
        protectedCount === 1 ? "" : "s"
      } protected`,
    });
  }

  const securedDocuments = Math.max(
    input.documentCount,
    input.deviceIdsWithDocuments.size
  );

  if (securedDocuments > 0) {
    highlights.push({
      id: "documents-secured",
      tone: "positive",
      message: `${securedDocuments} document${
        securedDocuments === 1 ? "" : "s"
      } secured`,
    });
  }

  if (input.networkConfigured) {
    highlights.push({
      id: "network-configured",
      tone: "positive",
      message: "Network configured",
    });
  } else {
    highlights.push({
      id: "network-missing",
      tone: "warning",
      message: "No network configured",
    });
  }

  let soonestExpiring: {
    name: string;
    daysRemaining: number;
  } | null = null;

  for (const device of input.devices) {
    const status = getWarrantyStatus(
      device.warranty_date
    );

    if (status !== "expiring") {
      continue;
    }

    const daysRemaining = getDaysRemaining(
      device.warranty_date
    );

    if (daysRemaining === null) {
      continue;
    }

    if (
      !soonestExpiring ||
      daysRemaining <
        soonestExpiring.daysRemaining
    ) {
      soonestExpiring = {
        name:
          device.device_name.trim() ||
          "Device",
        daysRemaining,
      };
    }
  }

  if (soonestExpiring) {
    highlights.push({
      id: "warranty-expiring",
      tone: "warning",
      message: `${soonestExpiring.name} warranty expires in ${soonestExpiring.daysRemaining} day${
        soonestExpiring.daysRemaining === 1
          ? ""
          : "s"
      }`,
    });
  }

  const missingWarranties =
    input.devices.length > 0 &&
    input.devices.some(
      (device) =>
        getWarrantyStatus(
          device.warranty_date
        ) === "missing"
    );

  if (missingWarranties) {
    highlights.push({
      id: "warranty-missing",
      tone: "warning",
      message: "Some devices are missing warranty dates",
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasOverdue = input.maintenanceTasks.some(
    (task) => {
      if (task.completed || !task.due_date) {
        return false;
      }

      const due = new Date(
        `${task.due_date}T00:00:00`
      );
      due.setHours(0, 0, 0, 0);

      return (
        !Number.isNaN(due.getTime()) &&
        due.getTime() < today.getTime()
      );
    }
  );

  if (hasOverdue) {
    highlights.push({
      id: "maintenance-overdue",
      tone: "warning",
      message: "Maintenance overdue",
    });
  }

  let nextMaintenance: {
    title: string;
    daysRemaining: number;
  } | null = null;

  for (const task of input.maintenanceTasks) {
    if (task.completed || !task.due_date) {
      continue;
    }

    const due = new Date(
      `${task.due_date}T00:00:00`
    );
    due.setHours(0, 0, 0, 0);

    if (Number.isNaN(due.getTime())) {
      continue;
    }

    const daysRemaining = Math.round(
      (due.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (
      daysRemaining < 0 ||
      daysRemaining > 14
    ) {
      continue;
    }

    if (
      !nextMaintenance ||
      daysRemaining <
        nextMaintenance.daysRemaining
    ) {
      nextMaintenance = {
        title:
          task.title?.trim() ||
          "Maintenance task",
        daysRemaining,
      };
    }
  }

  if (nextMaintenance) {
    highlights.push({
      id: "maintenance-upcoming",
      tone: "warning",
      message:
        nextMaintenance.daysRemaining === 0
          ? `${nextMaintenance.title} due today`
          : `${nextMaintenance.title} due in ${nextMaintenance.daysRemaining} day${
              nextMaintenance.daysRemaining === 1
                ? ""
                : "s"
            }`,
    });
  }

  return highlights
    .sort((left, right) => {
      if (left.tone === right.tone) {
        return 0;
      }

      return left.tone === "warning"
        ? -1
        : 1;
    })
    .slice(0, 5);
}

function buildCategoryCards(
  input: HomeHealthInput
): HomeHealthCategoryCard[] {
  const deviceProgress = scoreDevicesProtected(
    input
  );
  const documentProgress =
    scoreDocumentsStored(input);
  const warrantyProgress =
    scoreWarrantyCoverage(input);
  const maintenanceProgress =
    scoreMaintenanceTracking(input);

  const deviceStatus: HomeHealthCardStatus =
    input.devices.length === 0
      ? "incomplete"
      : deviceProgress >= 80
        ? "healthy"
        : "attention";

  const documentStatus: HomeHealthCardStatus =
    input.documentCount === 0 &&
    input.deviceIdsWithDocuments.size === 0
      ? "incomplete"
      : documentProgress >= 80
        ? "healthy"
        : "attention";

  const networkStatus: HomeHealthCardStatus =
    input.networkConfigured
      ? "healthy"
      : "incomplete";

  const warrantyStatus: HomeHealthCardStatus =
    input.devices.length === 0
      ? "incomplete"
      : input.devices.some(
            (device) =>
              getWarrantyStatus(
                device.warranty_date
              ) === "expiring"
          )
        ? "attention"
        : warrantyProgress >= 80
          ? "healthy"
          : "attention";

  const maintenanceStatus: HomeHealthCardStatus =
    input.maintenanceTasks.length === 0
      ? "incomplete"
      : input.maintenanceTasks.some(
            (task) =>
              !task.completed &&
              task.due_date &&
              new Date(
                `${task.due_date}T23:59:59`
              ).getTime() < Date.now()
          )
        ? "attention"
        : maintenanceProgress >= 80
          ? "healthy"
          : "attention";

  const subscriptionStatus: HomeHealthCardStatus =
    input.subscriptionCount > 0
      ? "healthy"
      : "incomplete";

  return [
    {
      key: "devices",
      title: "Devices",
      status: deviceStatus,
      progress: deviceProgress,
      summary:
        input.devices.length === 0
          ? "Add your first device to start protecting your home technology."
          : `${input.devices.length} device${
              input.devices.length === 1
                ? ""
                : "s"
            } in your vault.`,
      href: "/devices",
    },
    {
      key: "documents",
      title: "Documents",
      status: documentStatus,
      progress: documentProgress,
      summary:
        input.documentCount === 0 &&
        input.deviceIdsWithDocuments.size ===
          0
          ? "Upload receipts and manuals so nothing gets lost."
          : "Important documents are linked to your home record.",
      href: "/documents",
    },
    {
      key: "network",
      title: "Home Wi-Fi",
      status: networkStatus,
      progress: input.networkConfigured
        ? 100
        : 0,
      summary: input.networkConfigured
        ? "Router and Wi-Fi details are saved."
        : "Add ISP, router, and Wi-Fi details.",
      href: input.networkConfigured
        ? "/network"
        : "/network/edit",
    },
    {
      key: "warranties",
      title: "Warranties",
      status: warrantyStatus,
      progress: warrantyProgress,
      summary:
        input.devices.length === 0
          ? "Warranty coverage will appear once devices are added."
          : warrantyProgress >= 80
            ? "Warranty coverage looks strong."
            : "Review devices missing warranty dates.",
      href: "/warranties",
    },
    {
      key: "maintenance",
      title: "Maintenance",
      status: maintenanceStatus,
      progress: maintenanceProgress,
      summary:
        input.maintenanceTasks.length === 0
          ? "Track upkeep tasks for the devices you rely on."
          : `${input.maintenanceTasks.length} maintenance task${
              input.maintenanceTasks.length ===
              1
                ? ""
                : "s"
            } on record.`,
      href: "/maintenance",
    },
    {
      key: "subscriptions",
      title: "Subscriptions",
      status: subscriptionStatus,
      progress:
        input.subscriptionCount > 0 ? 100 : 0,
      summary:
        input.subscriptionCount === 0
          ? "Track renewals before they surprise you."
          : `${input.subscriptionCount} subscription${
              input.subscriptionCount === 1
                ? ""
                : "s"
            } organized.`,
      href: "/subscriptions",
    },
  ];
}

export function isHomeHealthEmpty(
  input: HomeHealthInput
): boolean {
  return (
    input.devices.length === 0 &&
    input.documentCount === 0 &&
    !input.networkConfigured &&
    input.subscriptionCount === 0 &&
    input.maintenanceTasks.length === 0
  );
}

export function calculateHomeHealth(
  input: HomeHealthInput
): HomeHealthResult {
  const vaultCompleteness =
    calculateVaultCompleteness(input);

  if (isHomeHealthEmpty(input)) {
    return {
      isEmpty: true,
      score: null,
      monthlySubscriptionSpend:
        input.monthlySubscriptionSpend,
      status: null,
      statusMessage: null,
      moduleScores: {
        devicesProtected: null,
        documentsStored: null,
        warrantyCoverage: null,
        networkConfigured: null,
        maintenanceTracking: null,
        subscriptionsOrganized: null,
        recentActivity: null,
        householdConfigured: null,
        vaultCompleteness: null,
        futureMonitoring: null,
      },
      highlights: [],
      recommendation: getNextBestAction(input),
      cards: buildCategoryCards(input),
      vaultCompleteness: 0,
    };
  }

  const moduleScores = {
    devicesProtected:
      scoreDevicesProtected(input),
    documentsStored:
      scoreDocumentsStored(input),
    warrantyCoverage:
      scoreWarrantyCoverage(input),
    networkConfigured:
      scoreNetworkConfigured(input),
    maintenanceTracking:
      scoreMaintenanceTracking(input),
    subscriptionsOrganized:
      scoreSubscriptionsOrganized(input),
    recentActivity:
      scoreRecentActivity(input),
    householdConfigured:
      scoreHouseholdConfigured(input),
    vaultCompleteness,
    futureMonitoring: null,
  } satisfies HomeHealthResult["moduleScores"];

  const score = clampScore(
    Object.entries(MODULE_WEIGHTS).reduce(
      (total, [key, weight]) => {
        const value =
          moduleScores[
            key as keyof typeof moduleScores
          ];

        return (
          total +
          (typeof value === "number"
            ? value * weight
            : 0)
        );
      },
      0
    )
  );

  const status = getHomeHealthStatus(score);

  return {
    isEmpty: false,
    score,
    monthlySubscriptionSpend:
      input.monthlySubscriptionSpend,
    status: status.label,
    statusMessage: status.message,
    moduleScores,
    highlights: buildHighlights(input),
    recommendation: getNextBestAction(input),
    cards: buildCategoryCards(input),
    vaultCompleteness,
  };
}
