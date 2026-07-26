import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseNotificationPreferences } from "./preferences";

describe("notification preferences", () => {
  it("validates quiet hours", () => {
    const preferences = parseNotificationPreferences({
      quiet_hours_start: "22:00",
      quiet_hours_end: "07:00",
      timezone: "America/New_York",
    });

    assert.equal(preferences.quiet_hours_start, "22:00");
    assert.equal(preferences.quiet_hours_end, "07:00");
  });

  it("rejects invalid quiet hours", () => {
    assert.throws(() =>
      parseNotificationPreferences({ quiet_hours_start: "25:00" })
    );
  });

  it("rejects invalid timezones", () => {
    assert.throws(() =>
      parseNotificationPreferences({ timezone: "Not/AZone" })
    );
  });
});
