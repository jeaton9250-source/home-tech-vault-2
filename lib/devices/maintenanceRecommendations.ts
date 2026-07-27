type MaintenanceTaskLike = {
  title: string | null;
  task_type?: string | null;
  description?: string | null;
};

export type DeviceMaintenanceSource = {
  id: string;
  device_name: string | null;
  category: string | null;
  manufacturer?: string | null;
  brand?: string | null;
  model_number?: string | null;
};

export type DeviceMaintenanceRecommendation = {
  id: string;
  title: string;
  description: string;
  taskType: string;
  recurringInterval: string | null;
  dueInDays: number;
  priority: number;
  reason: string;
};

type RecommendationBlueprint = {
  id: string;
  priority: number;
  taskType: string;
  recurringInterval: string | null;
  dueInDays: number;
  reason: string;
  match: (haystack: string) => boolean;
  title: (deviceLabel: string) => string;
  description: (deviceLabel: string) => string;
};

export const MAINTENANCE_RECOMMENDATIONS_QUERY_PARAM =
  "showMaintenanceRecommendations";

export function buildDeviceMaintenanceRecommendationsUrl(
  deviceId: string
) {
  return (
    "/devices/" +
    encodeURIComponent(deviceId) +
    "?tab=maintenance&" +
    MAINTENANCE_RECOMMENDATIONS_QUERY_PARAM +
    "=1"
  );
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function deviceLabel(device: DeviceMaintenanceSource) {
  return (
    device.device_name?.trim() ||
    device.model_number?.trim() ||
    "this device"
  );
}

function deviceContext(device: DeviceMaintenanceSource) {
  return normalize(
    [
      device.device_name,
      device.category,
      device.manufacturer,
      device.brand,
      device.model_number,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function existingTaskKey(task: MaintenanceTaskLike) {
  return normalize(
    [task.title, task.task_type, task.description]
      .filter(Boolean)
      .join(" ")
  );
}

function includesAny(haystack: string, terms: string[]) {
  return terms.some((term) => haystack.includes(term));
}

function isDuplicateRecommendation(
  recommendation: DeviceMaintenanceRecommendation,
  existingTaskKeys: Set<string>
) {
  const key = normalize(recommendation.title);

  for (const existing of existingTaskKeys) {
    if (!existing) {
      continue;
    }

    if (existing.includes(key) || key.includes(existing)) {
      return true;
    }
  }

  return false;
}

const BLUEPRINTS: RecommendationBlueprint[] = [
  {
    id: "network-firmware",
    priority: 100,
    taskType: "Software Update",
    recurringInterval: "Every 3 Months",
    dueInDays: 7,
    reason: "Network equipment",
    match: (haystack) =>
      includesAny(haystack, [
        "router",
        "modem",
        "gateway",
        "mesh",
        "network equipment",
        "wifi",
        "wireless",
        "ubiquiti",
        "eero",
        "netgear",
        "tp link",
        "tplink",
      ]),
    title: (label) => `Update firmware for ${label}`,
    description: (label) =>
      `Install the latest firmware for ${label} and confirm your home network still looks healthy.`,
  },
  {
    id: "network-backup",
    priority: 95,
    taskType: "Backup",
    recurringInterval: "Every 6 Months",
    dueInDays: 14,
    reason: "Network backup",
    match: (haystack) =>
      includesAny(haystack, [
        "router",
        "modem",
        "gateway",
        "mesh",
        "ubiquiti",
        "eero",
        "netgear",
        "tp link",
        "tplink",
      ]),
    title: (label) => `Back up ${label} settings`,
    description: (label) =>
      `Save the configuration for ${label} so a reset or replacement is easy to recover from.`,
  },
  {
    id: "computer-updates",
    priority: 90,
    taskType: "Software Update",
    recurringInterval: "Monthly",
    dueInDays: 7,
    reason: "Computer updates",
    match: (haystack) =>
      includesAny(haystack, [
        "computer",
        "laptop",
        "desktop",
        "macbook",
        "mac",
        "pc",
        "windows",
        "apple",
        "dell",
        "hp",
        "lenovo",
        "asus",
      ]),
    title: (label) => `Run software updates on ${label}`,
    description: (label) =>
      `Keep ${label} current with operating system and security updates.`,
  },
  {
    id: "computer-cleaning",
    priority: 88,
    taskType: "Cleaning",
    recurringInterval: "Every 6 Months",
    dueInDays: 30,
    reason: "Computer care",
    match: (haystack) =>
      includesAny(haystack, [
        "computer",
        "laptop",
        "macbook",
        "desktop",
        "pc",
        "apple",
      ]),
    title: (label) => `Clean ${label} vents and keyboard`,
    description: (label) =>
      `Remove dust from ${label} so cooling and everyday use stay reliable.`,
  },
  {
    id: "storage-backup",
    priority: 86,
    taskType: "Backup",
    recurringInterval: "Weekly",
    dueInDays: 7,
    reason: "Storage backup",
    match: (haystack) =>
      includesAny(haystack, [
        "nas",
        "storage",
        "synology",
        "qnap",
        "backup",
        "raid",
      ]),
    title: (label) => `Verify backups on ${label}`,
    description: (label) =>
      `Confirm backup jobs are running and the data on ${label} is still protected.`,
  },
  {
    id: "storage-health",
    priority: 84,
    taskType: "Inspection",
    recurringInterval: "Monthly",
    dueInDays: 30,
    reason: "Storage health",
    match: (haystack) =>
      includesAny(haystack, [
        "nas",
        "storage",
        "synology",
        "qnap",
        "raid",
      ]),
    title: (label) => `Check drive health on ${label}`,
    description: (label) =>
      `Review drive health, SMART alerts, and RAID status for ${label}.`,
  },
  {
    id: "printer-cleaning",
    priority: 82,
    taskType: "Cleaning",
    recurringInterval: "Every 3 Months",
    dueInDays: 30,
    reason: "Printer care",
    match: (haystack) =>
      includesAny(haystack, [
        "printer",
        "epson",
        "canon",
        "brother",
        "hp printer",
        "inkjet",
        "laser printer",
      ]),
    title: (label) => `Clean ${label} print heads and rollers`,
    description: (label) =>
      `Prevent streaking and jams by cleaning the print system on ${label}.`,
  },
  {
    id: "printer-supplies",
    priority: 81,
    taskType: "Maintenance",
    recurringInterval: "As needed",
    dueInDays: 14,
    reason: "Printer supplies",
    match: (haystack) =>
      includesAny(haystack, [
        "printer",
        "epson",
        "canon",
        "brother",
        "hp printer",
      ]),
    title: (label) => `Check ink or toner for ${label}`,
    description: (label) =>
      `Confirm replacement supplies are on hand before ${label} runs dry.`,
  },
  {
    id: "entertainment-updates",
    priority: 78,
    taskType: "Software Update",
    recurringInterval: "Every 3 Months",
    dueInDays: 14,
    reason: "Entertainment device",
    match: (haystack) =>
      includesAny(haystack, [
        "tv",
        "television",
        "display",
        "monitor",
        "audio",
        "speaker",
        "soundbar",
        "streaming",
        "sonos",
        "apple tv",
        "playstation",
        "xbox",
        "nintendo",
        "samsung",
        "sony",
        "lg",
      ]),
    title: (label) => `Update ${label} firmware and apps`,
    description: (label) =>
      `Keep ${label} current so streaming, audio, and connected features stay stable.`,
  },
  {
    id: "appliance-care",
    priority: 76,
    taskType: "Cleaning",
    recurringInterval: "Every 3 Months",
    dueInDays: 30,
    reason: "Appliance maintenance",
    match: (haystack) =>
      includesAny(haystack, [
        "appliance",
        "washer",
        "dryer",
        "refrigerator",
        "fridge",
        "dishwasher",
        "oven",
        "hvac",
        "air conditioner",
        "laundry",
        "kitchen",
        "samsung",
        "lg",
      ]),
    title: (label) => `Clean and inspect ${label}`,
    description: (label) =>
      `Check filters, vents, hoses, and seals on ${label} before small issues become repairs.`,
  },
  {
    id: "mobile-battery",
    priority: 74,
    taskType: "Battery Replacement",
    recurringInterval: "Yearly",
    dueInDays: 180,
    reason: "Mobile care",
    match: (haystack) =>
      includesAny(haystack, [
        "phone",
        "mobile",
        "iphone",
        "android",
        "tablet",
        "ipad",
      ]),
    title: (label) => `Review battery health on ${label}`,
    description: (label) =>
      `Track battery health and schedule a replacement for ${label} if performance starts to slip.`,
  },
];

export function buildDeviceMaintenanceRecommendations(
  device: DeviceMaintenanceSource,
  existingTasks: MaintenanceTaskLike[] = []
) {
  const context = deviceContext(device);
  const label = deviceLabel(device);
  const existingTaskKeys = new Set(
    existingTasks.map(existingTaskKey)
  );

  const recommendations: DeviceMaintenanceRecommendation[] = [];

  for (const blueprint of BLUEPRINTS) {
    if (!blueprint.match(context)) {
      continue;
    }

    const recommendation: DeviceMaintenanceRecommendation = {
      id: blueprint.id,
      title: blueprint.title(label),
      description: blueprint.description(label),
      taskType: blueprint.taskType,
      recurringInterval: blueprint.recurringInterval,
      dueInDays: blueprint.dueInDays,
      priority: blueprint.priority,
      reason: blueprint.reason,
    };

    if (isDuplicateRecommendation(recommendation, existingTaskKeys)) {
      continue;
    }

    recommendations.push(recommendation);
  }

  return recommendations
    .sort((first, second) => second.priority - first.priority)
    .slice(0, 3);
}
