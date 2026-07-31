import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import {
  DEVICE_OFFLINE_GRACE_MS,
  formatOfflineDuration,
  shouldMarkDeviceOffline,
} from "./deviceOfflineGrace";

describe(
  "shouldMarkDeviceOffline",
  () => {
    const scannedAt =
      "2026-07-30T22:00:00.000Z";

    it(
      "keeps a device online after one missed scan",
      () => {
        const result =
          shouldMarkDeviceOffline(
            "2026-07-30T21:45:00.000Z",
            scannedAt
          );

        assert.equal(
          result.shouldMarkOffline,
          false
        );

        assert.equal(
          result.reason,
          "within_grace_period"
        );
      }
    );

    it(
      "marks a device offline after the grace period",
      () => {
        const result =
          shouldMarkDeviceOffline(
            "2026-07-30T21:29:59.000Z",
            scannedAt
          );

        assert.equal(
          result.shouldMarkOffline,
          true
        );

        assert.equal(
          result.reason,
          "grace_period_expired"
        );
      }
    );

    it(
      "marks a device offline at exactly the threshold",
      () => {
        const scannedAtMs =
          new Date(
            scannedAt
          ).getTime();

        const result =
          shouldMarkDeviceOffline(
            new Date(
              scannedAtMs -
                DEVICE_OFFLINE_GRACE_MS
            ).toISOString(),
            scannedAt
          );

        assert.equal(
          result.shouldMarkOffline,
          true
        );
      }
    );

    it(
      "does not mark devices offline without a valid last-seen time",
      () => {
        assert.equal(
          shouldMarkDeviceOffline(
            null,
            scannedAt
          ).shouldMarkOffline,
          false
        );

        assert.equal(
          shouldMarkDeviceOffline(
            "not-a-date",
            scannedAt
          ).shouldMarkOffline,
          false
        );
      }
    );
  }
);

describe(
  "formatOfflineDuration",
  () => {
    it(
      "formats minutes and hours",
      () => {
        assert.equal(
          formatOfflineDuration(
            18 * 60 * 1000
          ),
          "18 minutes"
        );

        assert.equal(
          formatOfflineDuration(
            90 * 60 * 1000
          ),
          "1.5 hours"
        );
      }
    );
  }
);
