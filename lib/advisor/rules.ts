import {
  ADVISOR_DEVICE_AGE_YEARS,
  ADVISOR_NETWORK_STABLE_DAYS,
  ADVISOR_OFFLINE_DAYS_THRESHOLD,
  ADVISOR_ROUTER_AGE_YEARS,
  ADVISOR_WARRANTY_URGENT_DAYS,
} from "@/lib/advisor/constants";
import type {
  AdvisorInsight,
  AdvisorInsightAction,
  HomeAdvisorContext,
  HomeAdvisorDevice,
} from "@/lib/advisor/types";
import {
  getDaysRemaining,
  getWarrantyStatus,
} from "@/lib/home-health/warranty";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function deviceLabel(device: HomeAdvisorDevice): string {
  return device.device_name.trim() || "Unnamed Device";
}

function viewDeviceAction(
  device: HomeAdvisorDevice
): AdvisorInsightAction {
  return {
    type: "view_device",
    label: "View Device",
    href: `/devices/${device.id}`,
    deviceId: device.id,
  };
}

function askAiAction(query: string): AdvisorInsightAction {
  return {
    type: "ask_ai",
    label: "Ask AI",
    query,
  };
}

function daysSinceTimestamp(
  value: string | null | undefined,
  now: Date
): number | null {
  if (!value?.trim()) {
    return null;
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return Math.floor(
    (now.getTime() - timestamp) / MS_PER_DAY
  );
}

function deviceAgeYears(
  purchaseDate: string | null,
  now: Date
): number | null {
  const days = daysSinceTimestamp(
    purchaseDate,
    now
  );

  if (days === null || days < 0) {
    return null;
  }

  return days / 365;
}

function isRouterLike(device: HomeAdvisorDevice): boolean {
  const category = (device.category ?? "")
    .trim()
    .toLowerCase();
  const name = device.device_name
    .trim()
    .toLowerCase();

  return (
    category.includes("network") ||
    category.includes("router") ||
    name.includes("router") ||
    name.includes("gateway") ||
    name.includes("modem")
  );
}

function buildOfflineInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const insights: AdvisorInsight[] = [];

  for (const device of context.devices) {
    const observation =
      device.last_seen_at?.trim() ||
      device.network_updated_at?.trim() ||
      null;

    if (!observation) {
      continue;
    }

    const offlineDays = daysSinceTimestamp(
      observation,
      context.now
    );

    if (
      offlineDays === null ||
      offlineDays < ADVISOR_OFFLINE_DAYS_THRESHOLD
    ) {
      continue;
    }

    insights.push({
      id: `offline-${device.id}`,
      group: offlineDays >= 7 ? "urgent" : "attention",
      ruleId: "device_offline",
      title: `${deviceLabel(device)} offline`,
      message: `Your ${deviceLabel(device)} has been offline for ${offlineDays} day${offlineDays === 1 ? "" : "s"}.`,
      priority: 90 - Math.min(offlineDays, 30),
      actions: [
        viewDeviceAction(device),
        askAiAction(
          `Why is my ${deviceLabel(device)} showing offline?`
        ),
      ],
      metadata: {
        deviceId: device.id,
        offlineDays,
      },
    });
  }

  return insights;
}

function buildWarrantyInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const expiring: HomeAdvisorDevice[] = [];
  const missing: HomeAdvisorDevice[] = [];

  for (const device of context.devices) {
    const status = getWarrantyStatus(
      device.warranty_date,
      context.now
    );

    if (status === "missing") {
      missing.push(device);
      continue;
    }

    const daysRemaining = getDaysRemaining(
      device.warranty_date,
      context.now
    );

    if (
      daysRemaining !== null &&
      daysRemaining >= 0 &&
      daysRemaining <= ADVISOR_WARRANTY_URGENT_DAYS
    ) {
      expiring.push(device);
    }
  }

  const insights: AdvisorInsight[] = [];

  if (expiring.length > 0) {
    if (expiring.length === 1) {
      const device = expiring[0];
      const daysRemaining = getDaysRemaining(
        device.warranty_date,
        context.now
      );

      insights.push({
        id: "warranty-expiring-single",
        group:
          daysRemaining !== null &&
          daysRemaining <= 7
            ? "urgent"
            : "attention",
        ruleId: "warranty_expiring",
        title: "Warranty expiring soon",
        message: `${deviceLabel(device)} warranty expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`,
        priority: 88,
        actions: [
          {
            type: "open_warranty",
            label: "Open Warranty",
            href: "/warranties",
            deviceId: device.id,
          },
          viewDeviceAction(device),
        ],
      });
    } else {
      insights.push({
        id: "warranty-expiring-multiple",
        group: "attention",
        ruleId: "warranty_expiring",
        title: "Warranties expiring soon",
        message: `${expiring.length} warranties expire within ${ADVISOR_WARRANTY_URGENT_DAYS} days.`,
        priority: 87,
        actions: [
          {
            type: "open_warranty",
            label: "Open Warranties",
            href: "/warranties",
          },
        ],
      });
    }
  }

  if (missing.length > 0 && missing.length <= 3) {
    for (const device of missing) {
      insights.push({
        id: `warranty-missing-${device.id}`,
        group: "suggestion",
        ruleId: "warranty_missing",
        title: "Warranty date missing",
        message: `${deviceLabel(device)} has no warranty date on file.`,
        priority: 55,
        actions: [
          {
            type: "open_warranty",
            label: "Add Warranty",
            href: `/devices/${device.id}/edit`,
            deviceId: device.id,
          },
          viewDeviceAction(device),
        ],
      });
    }
  } else if (missing.length > 3) {
    insights.push({
      id: "warranty-missing-multiple",
      group: "suggestion",
      ruleId: "warranty_missing",
      title: "Warranty dates missing",
      message: `${missing.length} devices are missing warranty dates.`,
      priority: 54,
      actions: [
        {
          type: "open_warranty",
          label: "Review Warranties",
          href: "/warranties",
        },
      ],
    });
  }

  return insights;
}

function buildReceiptInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const missing = context.devices.filter(
    (device) =>
      !context.deviceIdsWithReceipts.has(device.id)
  );

  if (missing.length === 0) {
    return [];
  }

  if (missing.length === 1) {
    const device = missing[0];

    return [
      {
        id: `receipt-missing-${device.id}`,
        group: "suggestion",
        ruleId: "receipt_missing",
        title: "Receipt missing",
        message: `Your ${deviceLabel(device)} has no receipt attached.`,
        priority: 60,
        actions: [
          {
            type: "upload_receipt",
            label: "Upload Receipt",
            href: `/devices/${device.id}?tab=documents`,
            deviceId: device.id,
          },
          viewDeviceAction(device),
        ],
      },
    ];
  }

  if (missing.length <= 5) {
    return missing.slice(0, 3).map((device) => ({
      id: `receipt-missing-${device.id}`,
      group: "suggestion",
      ruleId: "receipt_missing",
      title: "Receipt missing",
      message: `Your ${deviceLabel(device)} has no receipt attached.`,
      priority: 58,
      actions: [
        {
          type: "upload_receipt",
          label: "Upload Receipt",
          href: `/devices/${device.id}?tab=documents`,
          deviceId: device.id,
        },
        viewDeviceAction(device),
      ],
    }));
  }

  return [
    {
      id: "receipt-missing-multiple",
      group: "suggestion",
      ruleId: "receipt_missing",
      title: "Receipts missing",
      message: `${missing.length} devices are missing receipts.`,
      priority: 57,
      actions: [
        {
          type: "view_documents",
          label: "Review Documents",
          href: "/documents",
        },
      ],
    },
  ];
}

function buildMaintenanceInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const insights: AdvisorInsight[] = [];
  const openTasks = context.maintenanceTasks.filter(
    (task) => !task.completed
  );

  const overdue = openTasks.filter((task) => {
    if (!task.due_date) {
      return false;
    }

    const dueMs = new Date(
      `${task.due_date}T12:00:00`
    ).getTime();

    return (
      Number.isFinite(dueMs) &&
      dueMs < context.now.getTime()
    );
  });

  for (const task of overdue.slice(0, 2)) {
    const device = context.devices.find(
      (entry) => entry.id === task.device_id
    );
    const taskTitle =
      task.title?.trim() || "Maintenance task";

    insights.push({
      id: `maintenance-overdue-${task.id}`,
      group: "urgent",
      ruleId: "maintenance_overdue",
      title: "Maintenance overdue",
      message: device
        ? `${taskTitle} for ${deviceLabel(device)} is overdue.`
        : `${taskTitle} is overdue.`,
      priority: 92,
      actions: [
        {
          type: "schedule_maintenance",
          label: "Schedule Maintenance",
          href: "/maintenance",
          maintenanceTaskId: task.id,
          deviceId: device?.id,
        },
        ...(device ? [viewDeviceAction(device)] : []),
      ],
    });
  }

  const weekAhead = new Date(context.now);
  weekAhead.setDate(weekAhead.getDate() + 7);

  const dueThisWeek = openTasks.filter((task) => {
    if (!task.due_date) {
      return false;
    }

    const dueMs = new Date(
      `${task.due_date}T12:00:00`
    ).getTime();

    return (
      Number.isFinite(dueMs) &&
      dueMs >= context.now.getTime() &&
      dueMs <= weekAhead.getTime()
    );
  });

  if (
    overdue.length === 0 &&
    dueThisWeek.length === 0 &&
    openTasks.length >= 0
  ) {
    insights.push({
      id: "maintenance-clear-week",
      group: "good",
      ruleId: "maintenance_clear",
      title: "Maintenance on track",
      message: "No maintenance is due this week.",
      priority: 20,
      actions: [
        {
          type: "schedule_maintenance",
          label: "View Maintenance",
          href: "/maintenance",
        },
      ],
    });
  }

  return insights;
}

function buildDeviceAgeInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const aged = context.devices.filter(
    (device) => {
      const age = deviceAgeYears(
        device.purchase_date,
        context.now
      );

      return (
        age !== null &&
        age >= ADVISOR_DEVICE_AGE_YEARS
      );
    }
  );

  if (aged.length === 0) {
    return [];
  }

  if (aged.length === 1) {
    const device = aged[0];
    const ageYears = Math.floor(
      deviceAgeYears(
        device.purchase_date,
        context.now
      ) ?? ADVISOR_DEVICE_AGE_YEARS
    );

    return [
      {
        id: `device-age-${device.id}`,
        group: "suggestion",
        ruleId: "device_older_than_recommended",
        title: "Aging device",
        message: `Your ${deviceLabel(device)} is more than ${ageYears} years old.`,
        priority: 45,
        actions: [
          viewDeviceAction(device),
          askAiAction(
            `Should I replace my ${deviceLabel(device)}?`
          ),
        ],
      },
    ];
  }

  return [
    {
      id: "device-age-multiple",
      group: "suggestion",
      ruleId: "device_older_than_recommended",
      title: "Aging devices",
      message: `${aged.length} devices are more than ${ADVISOR_DEVICE_AGE_YEARS} years old.`,
      priority: 44,
      actions: [
        {
          type: "view_device",
          label: "Review Devices",
          href: "/devices",
        },
      ],
    },
  ];
}

function buildDiscoveryInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  if (context.pendingDiscoveries.length === 0) {
    return [];
  }

  const insights: AdvisorInsight[] = [];

  for (const discovery of context.pendingDiscoveries.slice(
    0,
    2
  )) {
    const label = discovery.label;

    insights.push({
      id: `discovery-pending-${discovery.id}`,
      group: "attention",
      ruleId: "discovery_pending",
      title: "Discovery waiting to import",
      message: `Your ${label} was recently discovered but has not been imported.`,
      priority: 75,
      actions: [
        {
          type: "import_device",
          label: "Import Device",
          href: "/network/discovery",
          discoveryId: discovery.id,
        },
        {
          type: "view_network",
          label: "View Discovery",
          href: "/network/discovery",
        },
      ],
    });
  }

  if (context.pendingDiscoveries.length > 2) {
    insights.push({
      id: "discovery-pending-multiple",
      group: "attention",
      ruleId: "discovery_pending",
      title: "Discoveries waiting",
      message: `${context.pendingDiscoveries.length} discovered devices are waiting to be imported.`,
      priority: 74,
      actions: [
        {
          type: "import_device",
          label: "Review Discoveries",
          href: "/network/discovery",
        },
      ],
    });
  }

  return insights;
}

function buildDuplicateInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const groups = new Map<string, HomeAdvisorDevice[]>();

  for (const device of context.devices) {
    const serial = device.serial_number
      ?.trim()
      .toLowerCase();

    if (serial) {
      const key = `serial:${serial}`;
      const bucket = groups.get(key) ?? [];
      bucket.push(device);
      groups.set(key, bucket);
      continue;
    }

    const nameKey = `${device.device_name.trim().toLowerCase()}::${(device.brand ?? "").trim().toLowerCase()}`;

    if (!nameKey.startsWith("unnamed")) {
      const bucket = groups.get(nameKey) ?? [];
      bucket.push(device);
      groups.set(nameKey, bucket);
    }
  }

  const duplicateGroups = Array.from(
    groups.values()
  ).filter((group) => group.length > 1);

  if (duplicateGroups.length === 0) {
    return [];
  }

  const totalDuplicates = duplicateGroups.reduce(
    (count, group) => count + group.length,
    0
  );

  return [
    {
      id: "duplicate-devices",
      group: "suggestion",
      ruleId: "duplicate_devices",
      title: "Possible duplicate devices",
      message: `${totalDuplicates} devices may be duplicates based on matching names or serial numbers.`,
      priority: 40,
      actions: [
        {
          type: "view_device",
          label: "Review Devices",
          href: "/devices",
        },
      ],
    },
  ];
}

function buildLocationInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const missing = context.devices.filter(
    (device) => !device.location?.trim()
  );

  if (missing.length === 0) {
    return [];
  }

  if (missing.length === 1) {
    const device = missing[0];

    return [
      {
        id: `location-missing-${device.id}`,
        group: "suggestion",
        ruleId: "missing_room_assignment",
        title: "Room not assigned",
        message: `${deviceLabel(device)} is missing a room assignment.`,
        priority: 35,
        actions: [
          {
            type: "view_device",
            label: "Assign Room",
            href: `/devices/${device.id}/edit`,
            deviceId: device.id,
          },
        ],
      },
    ];
  }

  return [
    {
      id: "location-missing-multiple",
      group: "suggestion",
      ruleId: "missing_room_assignment",
      title: "Rooms not assigned",
      message: `${missing.length} devices are missing room assignments.`,
      priority: 34,
      actions: [
        {
          type: "view_device",
          label: "Review Devices",
          href: "/devices",
        },
      ],
    },
  ];
}

function buildPurchaseDateInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const missing = context.devices.filter(
    (device) => !device.purchase_date?.trim()
  );

  if (missing.length === 0) {
    return [];
  }

  return [
    {
      id: "purchase-date-missing",
      group: "suggestion",
      ruleId: "missing_purchase_date",
      title: "Purchase dates missing",
      message: `${missing.length} device${missing.length === 1 ? "" : "s"} ${missing.length === 1 ? "is" : "are"} missing purchase dates.`,
      priority: 33,
      actions: [
        {
          type: "view_device",
          label: "Update Devices",
          href: "/devices",
        },
      ],
    },
  ];
}

function buildDocumentationInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const undocumented = context.devices.filter(
    (device) =>
      !context.deviceIdsWithDocuments.has(
        device.id
      ) &&
      !context.deviceIdsWithPhotos.has(device.id)
  );

  if (undocumented.length === 0) {
    return [];
  }

  if (undocumented.length === 1) {
    const device = undocumented[0];

    return [
      {
        id: `documentation-missing-${device.id}`,
        group: "suggestion",
        ruleId: "no_documentation",
        title: "No documentation",
        message: `${deviceLabel(device)} has no photos or documents attached.`,
        priority: 32,
        actions: [
          {
            type: "upload_receipt",
            label: "Add Documentation",
            href: `/devices/${device.id}?tab=documents`,
            deviceId: device.id,
          },
          viewDeviceAction(device),
        ],
      },
    ];
  }

  return [
    {
      id: "documentation-missing-multiple",
      group: "suggestion",
      ruleId: "no_documentation",
      title: "Documentation gaps",
      message: `${undocumented.length} devices have no photos or documents attached.`,
      priority: 31,
      actions: [
        {
          type: "view_documents",
          label: "Review Documents",
          href: "/documents",
        },
      ],
    },
  ];
}

function buildRouterInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const routers = context.devices.filter(isRouterLike);

  for (const router of routers) {
    const age = deviceAgeYears(
      router.purchase_date,
      context.now
    );

    if (
      age !== null &&
      age >= ADVISOR_ROUTER_AGE_YEARS
    ) {
      const ageYears = Math.floor(age);

      return [
        {
          id: `router-age-${router.id}`,
          group: "attention",
          ruleId: "router_older_than_recommended",
          title: "Router may need attention",
          message: `Your ${deviceLabel(router)} is ${ageYears} years old, which is older than the typical recommended refresh cycle.`,
          priority: 70,
          actions: [
            viewDeviceAction(router),
            askAiAction(
              `Is my ${deviceLabel(router)} due for an upgrade?`
            ),
          ],
        },
      ];
    }
  }

  return [];
}

function buildSubscriptionInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const renewingSoon =
    context.subscriptions.filter(
      (subscription) => {
        if (!subscription.renewal_date) {
          return false;
        }

        const days = getDaysRemaining(
          subscription.renewal_date,
          context.now
        );

        return (
          days !== null &&
          days >= 0 &&
          days <= ADVISOR_WARRANTY_URGENT_DAYS
        );
      }
    );

  if (renewingSoon.length === 0) {
    return [];
  }

  return [
    {
      id: "subscriptions-renewing",
      group: "attention",
      ruleId: "subscription_renewal_soon",
      title: "Subscriptions renewing soon",
      message: `${renewingSoon.length} subscription${renewingSoon.length === 1 ? "" : "s"} renew within ${ADVISOR_WARRANTY_URGENT_DAYS} days.`,
      priority: 65,
      actions: [
        {
          type: "view_subscriptions",
          label: "Review Subscriptions",
          href: "/subscriptions",
        },
      ],
    },
  ];
}

function buildNetworkStableInsight(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  const primaryConnector =
    context.connectors[0];

  if (!primaryConnector?.last_seen_at) {
    return [];
  }

  const stableDays = daysSinceTimestamp(
    primaryConnector.last_seen_at,
    context.now
  );

  if (
    stableDays === null ||
    stableDays < ADVISOR_NETWORK_STABLE_DAYS
  ) {
    return [];
  }

  if (primaryConnector.status === "active") {
    return [
      {
        id: "network-stable",
        group: "good",
        ruleId: "network_stable",
        title: "Network monitoring healthy",
        message: `Your network connector has stayed healthy for ${stableDays} day${stableDays === 1 ? "" : "s"}.`,
        priority: 25,
        actions: [
          {
            type: "view_network",
            label: "View Network",
            href: "/network",
          },
        ],
      },
    ];
  }

  return [];
}

function buildHealthyFallbackInsights(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  if (context.devices.length === 0) {
    return [
      {
        id: "get-started",
        group: "suggestion",
        ruleId: "empty_vault",
        title: "Start your home inventory",
        message:
          "Add your first device to unlock personalized home technology insights.",
        priority: 10,
        actions: [
          {
            type: "add_device",
            label: "Add Device",
            href: "/devices/add",
          },
        ],
      },
    ];
  }

  return [
    {
      id: "overall-healthy",
      group: "good",
      ruleId: "overall_healthy",
      title: "Everything looks good",
      message: `Your ${context.devices.length} tracked device${context.devices.length === 1 ? "" : "s"} look healthy based on the data in your vault.`,
      priority: 15,
      actions: [
        {
          type: "view_device",
          label: "View Devices",
          href: "/devices",
        },
      ],
    },
  ];
}

export function runAdvisorRules(
  context: HomeAdvisorContext
): AdvisorInsight[] {
  return [
    ...buildOfflineInsights(context),
    ...buildWarrantyInsights(context),
    ...buildReceiptInsights(context),
    ...buildMaintenanceInsights(context),
    ...buildDeviceAgeInsights(context),
    ...buildDiscoveryInsights(context),
    ...buildDuplicateInsights(context),
    ...buildLocationInsights(context),
    ...buildPurchaseDateInsights(context),
    ...buildDocumentationInsights(context),
    ...buildRouterInsights(context),
    ...buildSubscriptionInsights(context),
    ...buildNetworkStableInsight(context),
  ];
}

export function ensureAdvisorCoverage(
  context: HomeAdvisorContext,
  insights: AdvisorInsight[]
): AdvisorInsight[] {
  const hasGood = insights.some(
    (insight) => insight.group === "good"
  );

  if (hasGood) {
    return insights;
  }

  return [
    ...insights,
    ...buildHealthyFallbackInsights(context),
  ];
}
