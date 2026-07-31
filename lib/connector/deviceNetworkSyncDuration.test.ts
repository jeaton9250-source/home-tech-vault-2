import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import {
  formatOfflineDuration,
} from "./deviceOfflineGrace";

describe(
  "network outage duration formatting",
  () => {
    it(
      "formats a 47-minute outage",
      () => {
        const lastSeenAt =
          new Date(
            "2026-07-30T20:00:00.000Z"
          ).getTime();

        const returnedAt =
          new Date(
            "2026-07-30T20:47:00.000Z"
          ).getTime();

        assert.equal(
          formatOfflineDuration(
            returnedAt -
              lastSeenAt
          ),
          "47 minutes"
        );
      }
    );

    it(
      "formats a multi-hour outage",
      () => {
        assert.equal(
          formatOfflineDuration(
            150 * 60 * 1000
          ),
          "2.5 hours"
        );
      }
    );
  }
);
