type Device = {
  photo_url?: string;
  serial_number?: string;
  warranty_date?: string;
  purchase_date?: string;
  purchase_price?: number;
  location?: string;
  notes?: string;
};

export function calculateDeviceHealth(device: Device) {
  let score = 40;

  if (device.photo_url) score += 10;
  if (device.serial_number) score += 10;
  if (device.warranty_date) score += 15;
  if (device.purchase_date) score += 10;
  if (device.purchase_price) score += 10;
  if (device.location) score += 5;
  if (device.notes) score += 10;

  return Math.min(score, 100);
}

export function getDeviceHealthLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Needs Attention";
  return "Incomplete";
}