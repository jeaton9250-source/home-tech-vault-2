/**
 * Helpers for synchronizing vault-device and discovery presence timestamps.
 * Prefer ISO strings from Supabase; format only for display.
 */

export function getLatestTimestamp(
  deviceLastSeen: string | null | undefined,
  networkLastSeen: string | null | undefined
): string | null {
  const values = [deviceLastSeen, networkLastSeen]
    .filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0
    )
    .map((value) => ({
      value,
      ms: new Date(value).getTime(),
    }))
    .filter((entry) => Number.isFinite(entry.ms));

  if (values.length === 0) {
    return null;
  }

  values.sort((a, b) => b.ms - a.ms);

  return values[0]!.value;
}

export type PresenceSyncFields = {
  online?: boolean | null;
  last_seen_at?: string | null;
  first_seen_at?: string | null;
  network_updated_at?: string | null;
};

export type DiscoveryPresenceFields = {
  online?: boolean | null;
  last_seen_at?: string | null;
};

/**
 * Prefer the freshest linked discovery observation when it is newer than the
 * vault device row. Keeps Devices cards and detail pages in sync with Network.
 */
export function mergePresenceFromDiscovery(
  device: PresenceSyncFields,
  discovery: DiscoveryPresenceFields | null | undefined
): PresenceSyncFields {
  if (!discovery) {
    return device;
  }

  const latestLastSeen = getLatestTimestamp(
    device.last_seen_at,
    discovery.last_seen_at
  );

  const discoveryIsNewest =
    Boolean(discovery.last_seen_at?.trim()) &&
    latestLastSeen === discovery.last_seen_at;

  return {
    ...device,
    online: discoveryIsNewest
      ? (discovery.online ?? device.online ?? null)
      : device.online ?? null,
    last_seen_at: latestLastSeen,
    network_updated_at: getLatestTimestamp(
      device.network_updated_at,
      discovery.last_seen_at
    ),
  };
}

/**
 * Pick the single freshest discovery row when a vault device has multiple
 * linked observations (e.g. multi-connector households).
 */
export function pickFreshestDiscoveryPresence(
  rows: DiscoveryPresenceFields[]
): DiscoveryPresenceFields | null {
  if (rows.length === 0) {
    return null;
  }

  let best: DiscoveryPresenceFields | null = null;
  let bestMs = Number.NEGATIVE_INFINITY;

  for (const row of rows) {
    if (!row.last_seen_at?.trim()) {
      if (!best) {
        best = row;
      }
      continue;
    }

    const ms = new Date(row.last_seen_at).getTime();

    if (!Number.isFinite(ms)) {
      continue;
    }

    if (ms > bestMs) {
      best = row;
      bestMs = ms;
    }
  }

  return best;
}
