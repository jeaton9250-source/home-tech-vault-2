import assert from "node:assert/strict";
import test from "node:test";

import {
  maintenanceReminderCopy,
  maintenanceReminderKind,
  shiftUtcDateKey,
} from "./maintenanceReminderSchedule";

test("classifies the 48-hour, 24-hour, and overdue reminder windows", () => {
  assert.equal(maintenanceReminderKind("2026-09-13", "2026-09-11"), "due_48h");
  assert.equal(maintenanceReminderKind("2026-09-12", "2026-09-11"), "due_24h");
  assert.equal(maintenanceReminderKind("2026-09-10", "2026-09-11"), "overdue");
  assert.equal(maintenanceReminderKind("2026-09-11", "2026-09-11"), null);
  assert.equal(maintenanceReminderKind("2026-09-14", "2026-09-11"), null);
});

test("date shifting stays correct across month and year boundaries", () => {
  assert.equal(shiftUtcDateKey("2026-12-31", 1), "2027-01-01");
  assert.equal(shiftUtcDateKey("2027-03-01", -1), "2027-02-28");
  assert.equal(shiftUtcDateKey("not-a-date", 1), null);
});

test("builds calm, useful homeowner copy", () => {
  assert.deepEqual(
    maintenanceReminderCopy({
      kind: "due_24h",
      taskTitle: "Replace HVAC filter",
      deviceName: "Upstairs HVAC",
    }),
    {
      title: "Home care due tomorrow",
      body: "Replace HVAC filter · Upstairs HVAC",
    },
  );
});
