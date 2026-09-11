import type { VaultDevice } from '@/lib/demo-data';

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://www.hometechvault.com';

export type DeviceLookupMatch = {
  id: string;
  deviceName: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  category: string;
  description: string;
  upc?: string;
};

export type VisionExtraction = {
  brand: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  productName: string;
  category: string;
  barcode: string;
  identificationBasis: 'model_label' | 'barcode' | 'product' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
};

type LookupResponse = {
  matches?: DeviceLookupMatch[];
};

type VisionResponse = {
  extraction?: VisionExtraction | null;
  searchQuery?: string;
  error?: string;
};

async function authenticatedFetch(path: string, accessToken: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${accessToken}`);

  if (init?.body) headers.set('Content-Type', 'application/json');

  return fetch(`${WEB_URL.replace(/\/+$/, '')}${path}`, {
    ...init,
    headers,
  });
}

async function readLookup(path: string, accessToken: string) {
  const response = await authenticatedFetch(path, accessToken, { method: 'GET' });

  if (response.status === 401) throw new Error('Please sign in again to use device scanning.');
  if (!response.ok) return [];

  const payload = await response.json() as LookupResponse;
  return Array.isArray(payload.matches) ? payload.matches : [];
}

export async function lookupDevice(query: string, accessToken: string) {
  const cleaned = query.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, 160);
  if (cleaned.length < 3) return [];

  const encoded = encodeURIComponent(cleaned);
  const databaseMatches = await readLookup(`/api/devices/lookup?q=${encoded}`, accessToken);
  if (databaseMatches.length > 0) return databaseMatches;

  return readLookup(`/api/devices/ai-lookup?q=${encoded}`, accessToken);
}

export async function identifyDevicePhoto(imageDataUrl: string, accessToken: string) {
  const response = await authenticatedFetch('/api/devices/vision', accessToken, {
    method: 'POST',
    body: JSON.stringify({ imageDataUrl }),
  });
  const payload = await response.json() as VisionResponse;

  if (!response.ok || !payload.extraction) {
    throw new Error(payload.error || "We couldn't read that label. Try a clearer photo.");
  }

  return payload;
}

export type CreateDeviceInput = {
  deviceName: string;
  category: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  location: string;
  productUpc: string;
};

export async function createDevice(input: CreateDeviceInput, accessToken: string) {
  const response = await authenticatedFetch('/api/mobile/devices', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      purchaseDate: '',
      warrantyDate: '',
      purchasePrice: '',
      notes: '',
    }),
  });
  const payload = await response.json() as {
    deviceId?: string;
    householdId?: string | null;
    device?: VaultDevice;
    error?: string;
    code?: string;
  };

  if (!response.ok || !payload.deviceId || !payload.device) {
    throw new Error(payload.error || "We couldn't save this device. Please try again.");
  }

  return {
    device: payload.device,
    householdId: payload.householdId ?? null,
  };
}
