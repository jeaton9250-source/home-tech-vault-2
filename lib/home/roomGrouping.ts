/** Group already household-scoped website data without changing stored assignments. */
export function groupHomeRooms<
  R extends { id: string; name: string },
  D extends { roomId?: string | null; location?: string | null },
>(roomRecords: readonly R[], devices: readonly D[]) {
  const roomRecordById = new Map(roomRecords.map((record) => [record.id, record]));
  const groupedRooms = new Map<
    string,
    {
      record?: R;
      name: string;
      devices: D[];
    }
  >();

  /*
   * Every real Room gets a stable UUID-backed group.
   * This means renaming a room can never disconnect
   * its devices.
   */
  for (const record of roomRecords) {
    if (record.name.trim().toLowerCase() === "network") {
      continue;
    }

    groupedRooms.set(`room:${record.id}`, {
      record,
      name: record.name,
      devices: [],
    });
  }

  const recordsByName = new Map<string, R[]>();
  for (const record of roomRecords) {
    const key = record.name.trim().toLowerCase();
    recordsByName.set(key, [...(recordsByName.get(key) || []), record]);
  }

  for (const device of devices) {
    if (device.roomId) {
      const record = roomRecordById.get(device.roomId);

      if (record && record.name.trim().toLowerCase() !== "network") {
        const existing = groupedRooms.get(`room:${record.id}`);

        if (existing) {
          existing.devices.push(device);
        }

        continue;
      }
    }

    /*
     * Legacy Home Systems stay outside Rooms.
     */
    const legacyLocation = device.location?.trim() || "";

    if (legacyLocation.toLowerCase() === "network") {
      continue;
    }

    // Resolve only unambiguous legacy names. Explicit IDs always win,
    // and an unresolved ID must never silently move to another room.
    const matches = recordsByName.get(legacyLocation.toLowerCase()) || [];
    if (!device.roomId && matches.length === 1) {
      const existing = groupedRooms.get(`room:${matches[0].id}`);
      if (existing) {
        existing.devices.push(device);
        continue;
      }
    }

    /*
     * Old devices without a room_id remain visible
     * until the homeowner assigns them.
     */
    const fallbackName =
      legacyLocation && legacyLocation.toLowerCase() !== "unassigned"
        ? legacyLocation
        : "Needs a Room";

    const fallbackKey = `legacy:${fallbackName.toLowerCase()}`;

    const existing = groupedRooms.get(fallbackKey);

    if (existing) {
      existing.devices.push(device);
    } else {
      groupedRooms.set(fallbackKey, {
        name: fallbackName,
        devices: [device],
      });
    }
  }

  return Array.from(groupedRooms.values());
}
