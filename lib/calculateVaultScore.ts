export type VaultDevice = {
  id: string;
  serial_number?: string | null;
  purchase_date?: string | null;
  warranty_date?: string | null;
  purchase_price?: number | null;
  location?: string | null;
  category?: string | null;
};

export type VaultScoreInput = {
  devices: VaultDevice[];
  deviceIdsWithPhotos: Set<string>;
  deviceIdsWithDocuments: Set<string>;
  deviceIdsWithMaintenance: Set<string>;
};

export type VaultScoreResult = {
  total: number;
  protection: number;
  organization: number;
  documentation: number;
  maintenance: number;
  label: string;
  recommendations: string[];
};

function percentage(completed: number, possible: number) {
  if (possible === 0) {
    return 100;
  }

  return Math.round((completed / possible) * 100);
}

function isWarrantyActive(value?: string | null) {
  if (!value) {
    return false;
  }

  const expiration = new Date(`${value}T23:59:59`);
  return expiration.getTime() >= Date.now();
}

export function calculateVaultScore({
  devices,
  deviceIdsWithPhotos,
  deviceIdsWithDocuments,
  deviceIdsWithMaintenance,
}: VaultScoreInput): VaultScoreResult {
  if (devices.length === 0) {
    return {
      total: 0,
      protection: 0,
      organization: 0,
      documentation: 0,
      maintenance: 0,
      label: "Get Started",
      recommendations: [
        "Add your first device to begin calculating your score.",
      ],
    };
  }

  const deviceCount = devices.length;

  const activeWarrantyCount = devices.filter((device) =>
    isWarrantyActive(device.warranty_date)
  ).length;

  const warrantyInformationCount = devices.filter(
    (device) => Boolean(device.warranty_date)
  ).length;

  const locationCount = devices.filter((device) =>
    Boolean(device.location?.trim())
  ).length;

  const categoryCount = devices.filter((device) =>
    Boolean(device.category?.trim())
  ).length;

  const serialNumberCount = devices.filter((device) =>
    Boolean(device.serial_number?.trim())
  ).length;

  const purchaseDateCount = devices.filter(
    (device) => Boolean(device.purchase_date)
  ).length;

  const purchasePriceCount = devices.filter(
    (device) =>
      device.purchase_price !== null &&
      device.purchase_price !== undefined
  ).length;

  const photoCount = devices.filter((device) =>
    deviceIdsWithPhotos.has(device.id)
  ).length;

  const documentCount = devices.filter((device) =>
    deviceIdsWithDocuments.has(device.id)
  ).length;

  const maintenanceCount = devices.filter((device) =>
    deviceIdsWithMaintenance.has(device.id)
  ).length;

  const protection = Math.round(
    percentage(
      warrantyInformationCount + activeWarrantyCount,
      deviceCount * 2
    )
  );

  const organization = Math.round(
    percentage(
      locationCount + categoryCount,
      deviceCount * 2
    )
  );

  const documentation = Math.round(
    percentage(
      serialNumberCount +
        purchaseDateCount +
        purchasePriceCount +
        photoCount +
        documentCount,
      deviceCount * 5
    )
  );

  const maintenance = percentage(
    maintenanceCount,
    deviceCount
  );

  const total = Math.round(
    protection * 0.3 +
      organization * 0.2 +
      documentation * 0.35 +
      maintenance * 0.15
  );

  const label =
    total >= 90
      ? "Excellent"
      : total >= 75
        ? "Good"
        : total >= 60
          ? "Needs Attention"
          : total >= 40
            ? "Incomplete"
            : "Getting Started";

  const recommendations: string[] = [];

  if (photoCount < deviceCount) {
    const missing = deviceCount - photoCount;

    recommendations.push(
      `Add photos to ${missing} device${missing === 1 ? "" : "s"}.`
    );
  }

  if (documentCount < deviceCount) {
    const missing = deviceCount - documentCount;

    recommendations.push(
      `Upload a receipt or manual for ${missing} device${
        missing === 1 ? "" : "s"
      }.`
    );
  }

  if (warrantyInformationCount < deviceCount) {
    const missing = deviceCount - warrantyInformationCount;

    recommendations.push(
      `Add warranty information to ${missing} device${
        missing === 1 ? "" : "s"
      }.`
    );
  }

  if (serialNumberCount < deviceCount) {
    const missing = deviceCount - serialNumberCount;

    recommendations.push(
      `Add serial numbers to ${missing} device${
        missing === 1 ? "" : "s"
      }.`
    );
  }

  if (locationCount < deviceCount) {
    const missing = deviceCount - locationCount;

    recommendations.push(
      `Assign a room to ${missing} device${
        missing === 1 ? "" : "s"
      }.`
    );
  }

  if (maintenanceCount < deviceCount) {
    const missing = deviceCount - maintenanceCount;

    recommendations.push(
      `Add maintenance history for ${missing} device${
        missing === 1 ? "" : "s"
      }.`
    );
  }

  return {
    total,
    protection,
    organization,
    documentation,
    maintenance,
    label,
    recommendations: recommendations.slice(0, 4),
  };
}