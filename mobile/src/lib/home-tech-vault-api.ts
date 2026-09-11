import { File } from 'expo-file-system';

import type { VaultDevice, VaultDocument } from '@/lib/demo-data';
import { supabase } from '@/lib/supabase';

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
  purchaseDate: string;
  warrantyDate: string;
  purchasePrice: string;
};

export async function createDevice(input: CreateDeviceInput, accessToken: string) {
  const response = await authenticatedFetch('/api/mobile/devices', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      ...input,
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

export const DOCUMENT_TYPES = ['Receipt', 'Manual', 'Warranty', 'Invoice', 'Photo', 'Other'] as const;
export type MobileDocumentType = (typeof DOCUMENT_TYPES)[number];

type DocumentUploadMetadata = {
  documentName: string;
  fileName: string;
  fileType: MobileDocumentType;
  deviceId: string;
  fileSize: number;
  browserContentType: string;
};

async function documentUploadStage(
  metadata: DocumentUploadMetadata,
  accessToken: string,
  stage: 'prepare' | 'complete',
  storagePath?: string,
) {
  const response = await authenticatedFetch('/api/mobile/documents', accessToken, {
    method: 'POST',
    body: JSON.stringify({ ...metadata, stage, storagePath }),
  });
  const payload = await response.json() as {
    storagePath?: string;
    contentType?: string;
    householdId?: string | null;
    document?: Omit<VaultDocument, 'deviceName' | 'date'> & { date: string };
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "We couldn't save this document. Please try again.");
  }

  return payload;
}

export async function uploadDocument(input: {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
  documentName: string;
  documentType: MobileDocumentType;
  deviceId: string;
  deviceName: string;
}, accessToken: string) {
  if (!supabase) throw new Error('The secure vault connection is unavailable.');

  const localFile = new File(input.uri);
  const metadata: DocumentUploadMetadata = {
    documentName: input.documentName,
    fileName: input.name,
    fileType: input.documentType,
    deviceId: input.deviceId,
    fileSize: input.size || localFile.size,
    browserContentType: input.mimeType,
  };
  const prepared = await documentUploadStage(metadata, accessToken, 'prepare');

  if (!prepared.storagePath || !prepared.contentType) {
    throw new Error("We couldn't prepare this document for upload.");
  }

  const bytes = await localFile.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(prepared.storagePath, bytes, {
      contentType: prepared.contentType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  try {
    const completed = await documentUploadStage(
      metadata,
      accessToken,
      'complete',
      prepared.storagePath,
    );

    if (!completed.document) throw new Error("We couldn't finish saving this document.");

    return {
      householdId: completed.householdId ?? prepared.householdId ?? null,
      document: {
        ...completed.document,
        deviceName: input.deviceName || 'Whole Home',
        date: new Date(completed.document.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      } satisfies VaultDocument,
    };
  } catch (error) {
    await supabase.storage.from('documents').remove([prepared.storagePath]);
    throw error;
  }
}
