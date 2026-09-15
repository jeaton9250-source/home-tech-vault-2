import assert from "node:assert/strict";
import test from "node:test";
import { groupHomeRooms } from "./roomGrouping";

const den = { id: "den-id", name: "Den" };
const monitor = { id: "monitor", deviceName: "Monitor", roomId: den.id, location: "Den", purchasePrice: 300, hasPhoto: false, hasDocument: false };
const ps5 = { id: "ps5", deviceName: "Sony PlayStation 5", roomId: null, location: "Den", purchasePrice: 0, hasPhoto: true, hasDocument: true };

test("Monitor and legacy PlayStation render in one Den without changing either device", () => {
  const devices = [monitor, ps5];
  const before = structuredClone(devices);
  const groups = groupHomeRooms([den], devices);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].record?.id, den.id);
  assert.deepEqual(groups[0].devices, devices);
  assert.equal(groups[0].devices.reduce((sum, d) => sum + d.purchasePrice, 0), 300);
  assert.equal(groups[0].devices.reduce((sum, d) => sum + Number(d.hasPhoto) + Number(d.hasDocument), 0) / (devices.length * 2), 0.5);
  assert.deepEqual(devices, before);
});

test("legacy name matches ignore case and surrounding whitespace", () => {
  assert.equal(groupHomeRooms([den], [{ ...ps5, location: " DEN " }])[0].devices.length, 1);
});

test("room IDs take precedence over stale names after rename", () => {
  const groups = groupHomeRooms([{ ...den, name: "Office" }, { id: "other", name: "Den" }], [monitor]);
  assert.deepEqual(groups.find(g => g.name === "Office")?.devices, [monitor]);
  assert.equal(groups.find(g => g.name === "Den")?.devices.length, 0);
});

test("ambiguous saved names never receive an inferred assignment", () => {
  const groups = groupHomeRooms([den, { id: "other", name: " den " }], [monitor, ps5]);
  assert.equal(groups.length, 3);
  assert.deepEqual(groups.find(g => !g.record)?.devices, [ps5]);
  assert.equal(groups.flatMap(g => g.devices).length, 2);
});

test("unknown IDs remain visible without being reassigned by name", () => {
  const groups = groupHomeRooms([den], [{ ...ps5, roomId: "unknown" }]);
  assert.equal(groups[0].devices.length, 0);
  assert.equal(groups[1].devices.length, 1);
});

test("unmatched and unassigned legacy devices remain visible; Network stays excluded", () => {
  const groups = groupHomeRooms([den], [
    { location: "Attic" }, { location: " attic " }, { location: "Unassigned" },
    { location: "" }, { location: "Network" },
  ]);
  assert.equal(groups.find(g => g.name === "Attic")?.devices.length, 2);
  assert.equal(groups.find(g => g.name === "Needs a Room")?.devices.length, 2);
  assert.equal(groups.flatMap(g => g.devices).length, 4);
});
