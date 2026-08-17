export type ParsedOrder = {
  retailer: string | null;
  orderNumber: string | null;
  deviceName: string | null;
  category: string | null;
  brand: string | null;
  manufacturer: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  confidence: number;
};
