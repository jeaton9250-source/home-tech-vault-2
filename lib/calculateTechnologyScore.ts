export type Device = {
  device_name?: string;
  brand?: string;
  category?: string;
  model_number?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_date?: string;
  purchase_price?: number;
  location?: string;
  notes?: string;
};

export function calculateTechnologyScore(devices: Device[]) {
  if (!devices || devices.length === 0) {
    return 40;
  }

  let score = 50;
  const total = devices.length;

  const withSerial = devices.filter((d) => d.serial_number).length;
  const withWarranty = devices.filter((d) => d.warranty_date).length;
  const withPurchaseDate = devices.filter((d) => d.purchase_date).length;
  const withPrice = devices.filter((d) => d.purchase_price).length;
  const withLocation = devices.filter((d) => d.location).length;
  const withNotes = devices.filter((d) => d.notes).length;

  score += Math.round((withSerial / total) * 10);
  score += Math.round((withWarranty / total) * 10);
  score += Math.round((withPurchaseDate / total) * 10);
  score += Math.round((withPrice / total) * 5);
  score += Math.round((withLocation / total) * 5);
  score += Math.round((withNotes / total) * 5);

  return Math.min(score, 100);
}