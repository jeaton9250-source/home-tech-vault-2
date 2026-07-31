import {
  syncDiscoveryResults,
} from "./api";

export type DiscoverySyncDevice = {
  localFingerprint: string;
  ipAddress: string | null;
  macAddress: string | null;
  hostname: string | null;
  manufacturer: string | null;
  model?: string | null;
  friendlyName?: string | null;
  deviceType: string | null;
  discoverySource: string;
  discoverySources?: string[];
  mdnsServices?: string[];
  ssdpDeviceType?: string | null;
  ssdpDescriptionUrl?: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  online: boolean;
};

export type QueuedDiscoverySync = {
  id: string;
  scannedAt: string;
  devices: DiscoverySyncDevice[];
  runMatching: boolean;
  createdAt: string;
  attempts: number;
  lastAttemptAt: string | null;
  lastError: string | null;
};

const STORAGE_KEY =
  "home-tech-vault.discovery-sync-queue.v1";

const MAX_QUEUE_ITEMS = 5;

function canUseStorage() {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !==
      "undefined"
  );
}

function readQueue():
  QueuedDiscoverySync[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const stored =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed:
      unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (
        item
      ): item is QueuedDiscoverySync =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string" &&
        "scannedAt" in item &&
        typeof item.scannedAt ===
          "string" &&
        "devices" in item &&
        Array.isArray(item.devices)
    );
  } catch (error) {
    console.error(
      "Unable to read discovery sync queue:",
      error
    );

    return [];
  }
}

function writeQueue(
  queue: QueuedDiscoverySync[]
) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        queue.slice(
          -MAX_QUEUE_ITEMS
        )
      )
    );
  } catch (error) {
    console.error(
      "Unable to save discovery sync queue:",
      error
    );
  }
}

function createQueueId(
  scannedAt: string
) {
  return [
    scannedAt,
    Math.random()
      .toString(36)
      .slice(2, 10),
  ].join(":");
}

export function getPendingDiscoverySyncCount() {
  return readQueue().length;
}

export function getPendingDiscoverySyncs() {
  return readQueue();
}

export function enqueueDiscoverySync(
  input: {
    scannedAt: string;
    devices: DiscoverySyncDevice[];
    runMatching: boolean;
  }
): QueuedDiscoverySync {
  const queue = readQueue();

  /*
   * Replace an entry with the same scan
   * timestamp instead of creating a
   * duplicate upload.
   */
  const existing =
    queue.find(
      (item) =>
        item.scannedAt ===
        input.scannedAt
    );

  if (existing) {
    return existing;
  }

  const queued:
    QueuedDiscoverySync = {
    id: createQueueId(
      input.scannedAt
    ),
    scannedAt:
      input.scannedAt,
    devices:
      input.devices,
    runMatching:
      input.runMatching,
    createdAt:
      new Date().toISOString(),
    attempts: 0,
    lastAttemptAt: null,
    lastError: null,
  };

  writeQueue([
    ...queue,
    queued,
  ]);

  return queued;
}

export function removeQueuedDiscoverySync(
  id: string
) {
  writeQueue(
    readQueue().filter(
      (item) =>
        item.id !== id
    )
  );
}

function updateQueuedFailure(
  id: string,
  error: unknown
) {
  const message =
    error instanceof Error
      ? error.message
      : "Unable to upload discovery results.";

  const nextQueue =
    readQueue().map(
      (item) =>
        item.id === id
          ? {
              ...item,
              attempts:
                item.attempts + 1,
              lastAttemptAt:
                new Date().toISOString(),
              lastError:
                message,
            }
          : item
    );

  writeQueue(nextQueue);
}

export async function uploadQueuedDiscoverySync(
  options: {
    token: string;
    queued: QueuedDiscoverySync;
  }
) {
  try {
    const response =
      await syncDiscoveryResults({
        token:
          options.token,
        scannedAt:
          options.queued
            .scannedAt,
        devices:
          options.queued
            .devices,
        runMatching:
          options.queued
            .runMatching,
      });

    removeQueuedDiscoverySync(
      options.queued.id
    );

    return response;
  } catch (error) {
    updateQueuedFailure(
      options.queued.id,
      error
    );

    throw error;
  }
}

export async function flushPendingDiscoverySyncs(
  token: string
) {
  const queuedItems =
    readQueue();

  let uploaded = 0;

  for (
    const queued of
    queuedItems
  ) {
    try {
      await uploadQueuedDiscoverySync({
        token,
        queued,
      });

      uploaded += 1;
    } catch {
      /*
       * Stop after the first failure.
       * Continuing would repeatedly hit
       * the same unavailable service.
       */
      break;
    }
  }

  return {
    uploaded,
    pending:
      getPendingDiscoverySyncCount(),
  };
}
