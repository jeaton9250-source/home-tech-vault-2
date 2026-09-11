export type HomeReadinessDevice = {
  id: string;
  name: string;

  /*
   * UUID-backed room relationship.
   * Network/Home Systems should normally remain null.
   */
  roomId?: string | null;

  /*
   * Legacy/display location remains useful for identifying
   * Home Network devices without treating Network as a room.
   */
  location?: string | null;

  serialNumber?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  warrantyDate?: string | null;

  hasPhoto?: boolean;
  hasDocument?: boolean;
};

export type HomeReadinessRoom = {
  id: string;
  name: string;
};

export type HomeReadinessCategoryId =
  | "photos"
  | "records"
  | "serialNumbers"
  | "purchaseDates"
  | "recordedValues"
  | "rooms"
  | "warranties";

export type HomeReadinessCategory = {
  id: HomeReadinessCategoryId;
  label: string;
  completed: number;
  total: number;
  percentage: number;
};

export type HomeReadinessActionType =
  | "add-photo"
  | "add-record"
  | "add-serial"
  | "add-purchase-date"
  | "add-value"
  | "assign-room"
  | "add-warranty";

export type HomeReadinessAction = {
  id: string;
  type: HomeReadinessActionType;
  priority: number;
  deviceId: string;
  deviceName: string;
  title: string;
  description: string;
  href: string;
};

export type HomeReadinessResult = {
  score: number;
  rememberedLabel: string;

  deviceCount: number;
  roomCount: number;

  completedItems: number;
  possibleItems: number;

  categories: HomeReadinessCategory[];
  actions: HomeReadinessAction[];

  counts: {
    withPhoto: number;
    withDocument: number;
    withSerialNumber: number;
    withPurchaseDate: number;
    withRecordedValue: number;
    withRoom: number;
    withWarranty: number;
  };
};

function percentage(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function hasValue(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function isHomeSystemDevice(device: HomeReadinessDevice) {
  const location = device.location?.trim().toLowerCase() || "";

  return location === "network" || location === "home network";
}

function deviceHasRoom(device: HomeReadinessDevice) {
  /*
   * Home Network devices deliberately do not lose points
   * for not belonging to a Room.
   */
  if (isHomeSystemDevice(device)) {
    return true;
  }

  return Boolean(device.roomId);
}

function rememberedLabelForScore(score: number) {
  if (score >= 90) {
    return "Your home is exceptionally well remembered.";
  }

  if (score >= 75) {
    return "Your home is well remembered.";
  }

  if (score >= 50) {
    return "Your home is taking shape.";
  }

  if (score >= 25) {
    return "Your Vault has a good start.";
  }

  return "There is more of your home to remember.";
}

function actionForMissingField(
  device: HomeReadinessDevice,
  type: HomeReadinessActionType,
): HomeReadinessAction {
  const editHref = `/devices/${device.id}/edit`;

  const detailHref = `/devices/${device.id}`;

  switch (type) {
    case "add-photo":
      return {
        id: `${device.id}:photo`,
        type,
        priority: 100,
        deviceId: device.id,
        deviceName: device.name,
        title: `Add a photo of ${device.name}`,
        description:
          "A current photo strengthens your home record and insurance documentation.",
        href: detailHref,
      };

    case "add-record":
      return {
        id: `${device.id}:record`,
        type,
        priority: 95,
        deviceId: device.id,
        deviceName: device.name,
        title: `Add a record for ${device.name}`,
        description:
          "Attach a receipt, invoice, manual, or other supporting record.",
        href: `${detailHref}?tab=documents`,
      };

    case "add-serial":
      return {
        id: `${device.id}:serial`,
        type,
        priority: 90,
        deviceId: device.id,
        deviceName: device.name,
        title: `Add ${device.name}'s serial number`,
        description:
          "Serial numbers can help identify property during warranty or insurance claims.",
        href: editHref,
      };

    case "add-value":
      return {
        id: `${device.id}:value`,
        type,
        priority: 85,
        deviceId: device.id,
        deviceName: device.name,
        title: `Record the value of ${device.name}`,
        description:
          "A purchase value makes household totals and insurance reports more useful.",
        href: editHref,
      };

    case "assign-room":
      return {
        id: `${device.id}:room`,
        type,
        priority: 80,
        deviceId: device.id,
        deviceName: device.name,
        title: `Give ${device.name} a room`,
        description:
          "Assigning a room makes your home easier to browse and document.",
        href: editHref,
      };

    case "add-purchase-date":
      return {
        id: `${device.id}:purchase-date`,
        type,
        priority: 70,
        deviceId: device.id,
        deviceName: device.name,
        title: `Add when you bought ${device.name}`,
        description: "Purchase dates improve warranty and ownership context.",
        href: editHref,
      };

    case "add-warranty":
      return {
        id: `${device.id}:warranty`,
        type,
        priority: 55,
        deviceId: device.id,
        deviceName: device.name,
        title: `Add warranty details for ${device.name}`,
        description:
          "Warranty dates help Home Tech Vault surface coverage before it expires.",
        href: editHref,
      };
  }
}

export function calculateHomeReadiness({
  devices,
  rooms = [],
  maxActions = 8,
}: {
  devices: HomeReadinessDevice[];
  rooms?: HomeReadinessRoom[];
  maxActions?: number;
}): HomeReadinessResult {
  const total = devices.length;

  if (total === 0) {
    return {
      score: 0,
      rememberedLabel: "Add your first device to start remembering your home.",
      deviceCount: 0,
      roomCount: rooms.length,
      completedItems: 0,
      possibleItems: 0,
      categories: [
        {
          id: "photos",
          label: "Photos",
          completed: 0,
          total: 0,
          percentage: 0,
        },
        {
          id: "records",
          label: "Supporting records",
          completed: 0,
          total: 0,
          percentage: 0,
        },
        {
          id: "serialNumbers",
          label: "Serial numbers",
          completed: 0,
          total: 0,
          percentage: 0,
        },
        {
          id: "purchaseDates",
          label: "Purchase dates",
          completed: 0,
          total: 0,
          percentage: 0,
        },
        {
          id: "recordedValues",
          label: "Recorded values",
          completed: 0,
          total: 0,
          percentage: 0,
        },
        {
          id: "rooms",
          label: "Room assignments",
          completed: 0,
          total: 0,
          percentage: 0,
        },
        {
          id: "warranties",
          label: "Warranty details",
          completed: 0,
          total: 0,
          percentage: 0,
        },
      ],
      actions: [],
      counts: {
        withPhoto: 0,
        withDocument: 0,
        withSerialNumber: 0,
        withPurchaseDate: 0,
        withRecordedValue: 0,
        withRoom: 0,
        withWarranty: 0,
      },
    };
  }

  const withPhoto = devices.filter((device) => Boolean(device.hasPhoto)).length;

  const withDocument = devices.filter((device) =>
    Boolean(device.hasDocument),
  ).length;

  const withSerialNumber = devices.filter((device) =>
    hasText(device.serialNumber),
  ).length;

  const withPurchaseDate = devices.filter((device) =>
    hasText(device.purchaseDate),
  ).length;

  const withRecordedValue = devices.filter((device) =>
    hasValue(device.purchasePrice),
  ).length;

  const withRoom = devices.filter(deviceHasRoom).length;

  const withWarranty = devices.filter((device) =>
    hasText(device.warrantyDate),
  ).length;

  /*
   * Seven fields describe how completely HTV remembers
   * each item.
   *
   * This intentionally differs from Home Pulse health,
   * which can include operational/network signals.
   */
  const completedItems =
    withPhoto +
    withDocument +
    withSerialNumber +
    withPurchaseDate +
    withRecordedValue +
    withRoom +
    withWarranty;

  const possibleItems = total * 7;

  const score = percentage(completedItems, possibleItems);

  const categories: HomeReadinessCategory[] = [
    {
      id: "photos",
      label: "Photos",
      completed: withPhoto,
      total,
      percentage: percentage(withPhoto, total),
    },
    {
      id: "records",
      label: "Supporting records",
      completed: withDocument,
      total,
      percentage: percentage(withDocument, total),
    },
    {
      id: "serialNumbers",
      label: "Serial numbers",
      completed: withSerialNumber,
      total,
      percentage: percentage(withSerialNumber, total),
    },
    {
      id: "purchaseDates",
      label: "Purchase dates",
      completed: withPurchaseDate,
      total,
      percentage: percentage(withPurchaseDate, total),
    },
    {
      id: "recordedValues",
      label: "Recorded values",
      completed: withRecordedValue,
      total,
      percentage: percentage(withRecordedValue, total),
    },
    {
      id: "rooms",
      label: "Room assignments",
      completed: withRoom,
      total,
      percentage: percentage(withRoom, total),
    },
    {
      id: "warranties",
      label: "Warranty details",
      completed: withWarranty,
      total,
      percentage: percentage(withWarranty, total),
    },
  ];

  const actions: HomeReadinessAction[] = [];

  for (const device of devices) {
    if (!device.hasPhoto) {
      actions.push(actionForMissingField(device, "add-photo"));
    }

    if (!device.hasDocument) {
      actions.push(actionForMissingField(device, "add-record"));
    }

    if (!hasText(device.serialNumber)) {
      actions.push(actionForMissingField(device, "add-serial"));
    }

    if (!hasValue(device.purchasePrice)) {
      actions.push(actionForMissingField(device, "add-value"));
    }

    if (!deviceHasRoom(device)) {
      actions.push(actionForMissingField(device, "assign-room"));
    }

    if (!hasText(device.purchaseDate)) {
      actions.push(actionForMissingField(device, "add-purchase-date"));
    }

    if (!hasText(device.warrantyDate)) {
      actions.push(actionForMissingField(device, "add-warranty"));
    }
  }

  actions.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }

    return a.deviceName.localeCompare(b.deviceName);
  });

  return {
    score,
    rememberedLabel: rememberedLabelForScore(score),
    deviceCount: total,
    roomCount: rooms.length,
    completedItems,
    possibleItems,
    categories,
    actions: actions.slice(0, Math.max(0, maxActions)),
    counts: {
      withPhoto,
      withDocument,
      withSerialNumber,
      withPurchaseDate,
      withRecordedValue,
      withRoom,
      withWarranty,
    },
  };
}
