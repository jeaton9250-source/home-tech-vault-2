import { File } from 'expo-file-system';

import type { MaintenanceItem, VaultDevice, VaultDocument } from '@/lib/demo-data';
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

async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const body = await response.text();
  if (!body) throw new Error(fallbackMessage);
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(response.ok
      ? fallbackMessage
      : `Home Tech Vault is temporarily unavailable (${response.status}). Please try again.`);
  }
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
  notes?: string;
};

export async function createDevice(input: CreateDeviceInput, accessToken: string) {
  const response = await authenticatedFetch('/api/mobile/devices', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      notes: input.notes ?? '',
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

export async function updateDevice(
  deviceId: string,
  input: CreateDeviceInput,
  accessToken: string,
) {
  let response: Response;
  let payload: { householdId?: string | null; device?: VaultDevice; error?: string };

  try {
    response = await authenticatedFetch(`/api/mobile/devices/${encodeURIComponent(deviceId)}`, accessToken, {
      method: 'PATCH',
      body: JSON.stringify({ ...input, notes: input.notes ?? '' }),
    });
    payload = await readJsonResponse(response, "We couldn't update this device. Please try again.");
  } catch (error) {
    if (!supabase) throw error;
    const { data: device, error: updateError } = await supabase
      .from('devices')
      .update({
        device_name: input.deviceName.trim(),
        category: input.category.trim() || null,
        brand: input.brand.trim() || null,
        manufacturer: input.manufacturer.trim() || null,
        model_number: input.modelNumber.trim() || null,
        serial_number: input.serialNumber.trim() || null,
        purchase_date: input.purchaseDate.trim() || null,
        warranty_date: input.warrantyDate.trim() || null,
        purchase_price: input.purchasePrice.trim() ? Number(input.purchasePrice) : null,
        location: input.location.trim() || null,
        notes: input.notes?.trim() || null,
      })
      .eq('id', deviceId)
      .select('id, device_name, brand, manufacturer, category, location, model_number, serial_number, purchase_date, purchase_price, warranty_date, online, notes')
      .maybeSingle();
    if (updateError || !device) throw updateError ?? error;
    return {
      householdId: null,
      device: {
        id: device.id,
        name: device.device_name || 'Unnamed device',
        brand: device.brand || 'Unknown brand',
        category: device.category || 'Other',
        location: device.location || 'Room not set',
        model: device.model_number || 'Model not recorded',
        manufacturer: device.manufacturer || device.brand || 'Unknown manufacturer',
        serialNumber: device.serial_number,
        purchaseDate: device.purchase_date,
        value: Number(device.purchase_price) || 0,
        warrantyDate: device.warranty_date,
        online: device.online,
        notes: device.notes || '',
      },
    };
  }

  if (!response.ok || !payload.device) {
    throw new Error(payload.error || "We couldn't update this device. Please try again.");
  }

  return { device: payload.device, householdId: payload.householdId ?? null };
}

export async function completeMaintenanceTask(taskId: string, accessToken: string) {
  try {
    const response = await authenticatedFetch(`/api/mobile/maintenance/${encodeURIComponent(taskId)}`, accessToken, {
      method: 'PATCH',
      body: JSON.stringify({ completed: true }),
    });
    const payload = await readJsonResponse<{ completed?: boolean; error?: string }>(
      response,
      "We couldn't complete this care item. Please try again.",
    );
    if (!response.ok || payload.completed !== true) {
      throw new Error(payload.error || "We couldn't complete this care item. Please try again.");
    }
  } catch (error) {
    if (!supabase) throw error;
    const { data, error: updateError } = await supabase
      .from('maintenance_tasks')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', taskId)
      .select('id, completed')
      .maybeSingle();
    if (updateError || !data?.completed) throw updateError ?? error;
  }
}

export const MAINTENANCE_TASK_TYPES = [
  'Maintenance',
  'Cleaning',
  'Software Update',
  'Backup',
  'Inspection',
  'Repair',
  'Battery Replacement',
] as const;

export const MAINTENANCE_INTERVALS = [
  'None',
  'Weekly',
  'Monthly',
  'Every 3 Months',
  'Every 6 Months',
  'Yearly',
  'As needed',
] as const;

export type MobileMaintenanceTaskType = (typeof MAINTENANCE_TASK_TYPES)[number];
export type MobileMaintenanceInterval = (typeof MAINTENANCE_INTERVALS)[number];

export type CreateMaintenanceTaskInput = {
  title: string;
  deviceId: string;
  taskType: MobileMaintenanceTaskType;
  dueDate: string;
  recurringInterval: MobileMaintenanceInterval;
  description: string;
};

function formatMaintenanceDate(value: string | null) {
  if (!value) return 'No due date';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function createMaintenanceTask(input: CreateMaintenanceTaskInput, accessToken: string) {
  const response = await authenticatedFetch('/api/mobile/maintenance', accessToken, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const payload = await readJsonResponse<{
    householdId?: string | null;
    task?: {
      id: string;
      title: string;
      deviceId: string | null;
      deviceName: string;
      dueDate: string | null;
    };
    error?: string;
  }>(response, "We couldn't schedule this care task. Please try again.");

  if (!response.ok || !payload.task?.id) {
    throw new Error(payload.error || "We couldn't schedule this care task. Please try again.");
  }

  const task: MaintenanceItem = {
    id: payload.task.id,
    title: payload.task.title,
    deviceId: payload.task.deviceId,
    deviceName: payload.task.deviceName || 'Whole Home',
    dueDate: formatMaintenanceDate(payload.task.dueDate),
    dueDateIso: payload.task.dueDate,
    status: payload.task.dueDate && payload.task.dueDate < new Date().toISOString().slice(0, 10)
      ? 'Overdue'
      : 'Upcoming',
  };

  return { task, householdId: payload.householdId ?? null };
}

export async function deleteVaultDocument(documentId: string, accessToken: string) {
  const response = await authenticatedFetch(`/api/mobile/documents/${encodeURIComponent(documentId)}`, accessToken, {
    method: 'DELETE',
  });
  const payload = await readJsonResponse<{ deleted?: boolean; error?: string }>(
    response,
    "We couldn't delete this document. Please try again.",
  );
  if (!response.ok || payload.deleted !== true) {
    throw new Error(payload.error || "We couldn't delete this document. Please try again.");
  }
}

function extractDocumentStoragePath(fileUrl: string) {
  const value = fileUrl.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) return value.replace(/^\/+/, '');

  const markers = [
    '/storage/v1/object/sign/documents/',
    '/storage/v1/object/public/documents/',
    '/storage/v1/object/authenticated/documents/',
  ];
  const marker = markers.find((candidate) => value.includes(candidate));
  if (!marker) return null;

  try {
    return decodeURIComponent(value.slice(value.indexOf(marker) + marker.length).split('?')[0] || '');
  } catch {
    return null;
  }
}

export async function createVaultDocumentViewUrl(document: VaultDocument) {
  if (!supabase) throw new Error('The secure vault connection is unavailable.');

  if (document.source === 'official_manual') {
    const manualUrl = document.fileUrl?.trim();

    if (!manualUrl || !/^https?:\/\//i.test(manualUrl)) {
      throw new Error('This manual does not have a valid web address.');
    }

    return manualUrl;
  }

  if (document.source === 'device_documents') {
    const storagePath = document.storagePath?.trim();

    if (
      !storagePath ||
      storagePath.includes('..') ||
      storagePath.includes('\\')
    ) {
      throw new Error('This document does not have a valid file location.');
    }

    const { data, error } = await supabase.storage
      .from('device-documents')
      .createSignedUrl(storagePath, 5 * 60);

    if (error || !data?.signedUrl) {
      throw error ?? new Error("This document couldn't be opened.");
    }

    return data.signedUrl;
  }

  if (!document.fileUrl) {
    throw new Error('This document does not have a viewable file yet.');
  }

  const storagePath = extractDocumentStoragePath(document.fileUrl);

  if (
    !storagePath ||
    storagePath.includes('..') ||
    storagePath.includes('\\')
  ) {
    throw new Error('This document does not have a valid file location.');
  }

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 5 * 60);

  if (error || !data?.signedUrl) {
    throw error ?? new Error("This document couldn't be opened.");
  }

  return data.signedUrl;
}

const DEVICE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const MAX_DEVICE_IMAGE_BYTES = 6 * 1024 * 1024;

export async function uploadDeviceImage(input: {
  uri: string;
  mimeType?: string | null;
  fileSize?: number | null;
  fileName?: string | null;
  deviceId: string;
  userId: string;
  householdId: string | null;
}) {
  if (!supabase) throw new Error('The secure vault connection is unavailable.');

  const localFile = new File(input.uri);
  const mimeType = (input.mimeType || localFile.type || 'image/jpeg').toLowerCase();
  const fileSize = input.fileSize || localFile.size;
  if (!DEVICE_IMAGE_TYPES.has(mimeType)) throw new Error('Choose a JPG, PNG, WebP, HEIC, or HEIF image.');
  if (fileSize > MAX_DEVICE_IMAGE_BYTES) throw new Error('Choose an image smaller than 6 MB.');

  const extensionByType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  const extension = input.fileName?.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase()
    || extensionByType[mimeType]
    || 'jpg';
  const storagePath = `${input.userId}/${input.deviceId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const bytes = await localFile.arrayBuffer();
  const { error: uploadError } = await supabase.storage.from('device-images').upload(storagePath, bytes, {
    contentType: mimeType,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { error: rowError } = await supabase.from('device_images').insert({
    device_id: input.deviceId,
    user_id: input.userId,
    household_id: input.householdId,
    image_url: storagePath,
  });
  if (rowError) {
    await supabase.storage.from('device-images').remove([storagePath]);
    throw rowError;
  }

  const { data, error: signedError } = await supabase.storage.from('device-images').createSignedUrl(storagePath, 3600);
  if (signedError || !data?.signedUrl) throw signedError ?? new Error("The device photo couldn't be opened.");
  return { uri: data.signedUrl };
}

export async function registerPushToken(input: {
  token: string;
  platform: 'ios' | 'android';
  deviceId?: string | null;
}, accessToken: string) {
  const response = await authenticatedFetch('/api/mobile/push/register', accessToken, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const payload = await response.json() as { registered?: boolean; error?: string };
  if (!response.ok || !payload.registered) {
    throw new Error(payload.error || "Notifications couldn't be connected.");
  }
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
