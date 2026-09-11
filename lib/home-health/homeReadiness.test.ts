import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateHomeReadiness,
  isHomeSystemDevice,
  type HomeReadinessDevice,
} from "./homeReadiness";

describe("calculateHomeReadiness", () => {
  it("returns zero readiness for an empty vault", () => {
    const result = calculateHomeReadiness({
      devices: [],
    });

    assert.equal(result.score, 0);
    assert.deepEqual(result.actions, []);
  });

  it("counts a fully documented room device as complete", () => {
    const devices: HomeReadinessDevice[] = [
      {
        id: "device-1",
        name: "Television",
        roomId: "room-1",
        location: "Living Room",
        serialNumber: "ABC123",
        purchaseDate: "2026-01-01",
        purchasePrice: 1200,
        warrantyDate: "2028-01-01",
        hasPhoto: true,
        hasDocument: true,
      },
    ];

    const result = calculateHomeReadiness({
      devices,
      rooms: [
        {
          id: "room-1",
          name: "Living Room",
        },
      ],
    });

    assert.equal(result.score, 100);
    assert.equal(result.actions.length, 0);
  });

  it("does not penalize Network devices for having no room", () => {
    const devices: HomeReadinessDevice[] = [
      {
        id: "router",
        name: "Router",
        roomId: null,
        location: "Network",
        serialNumber: "SERIAL",
        purchaseDate: "2026-01-01",
        purchasePrice: 200,
        warrantyDate: "2027-01-01",
        hasPhoto: true,
        hasDocument: true,
      },
    ];

    const result = calculateHomeReadiness({
      devices,
    });

    assert.equal(isHomeSystemDevice(devices[0]), true);
    assert.equal(result.counts.withRoom, 1);
    assert.equal(result.score, 100);
  });

  it("prioritizes photos and records before lower priority metadata", () => {
    const result = calculateHomeReadiness({
      devices: [
        {
          id: "ps5",
          name: "PlayStation 5",
          location: "Unassigned",
          roomId: null,
          hasPhoto: false,
          hasDocument: false,
        },
      ],
    });

    assert.equal(result.actions[0].type, "add-photo");
    assert.equal(result.actions[1].type, "add-record");
  });

  it("limits next actions", () => {
    const result = calculateHomeReadiness({
      devices: [
        {
          id: "1",
          name: "Device",
        },
      ],
      maxActions: 3,
    });

    assert.equal(result.actions.length, 3);
  });
});
