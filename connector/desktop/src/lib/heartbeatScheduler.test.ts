import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  HEARTBEAT_INTERVAL_MS,
  startHeartbeatScheduler,
} from "./heartbeatScheduler";

describe("startHeartbeatScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs periodic ticks every five minutes", async () => {
    const onTick = vi
      .fn()
      .mockResolvedValue({ ok: true });

    const scheduler =
      startHeartbeatScheduler({
        onTick,
      });

    scheduler.start();

    await vi.advanceTimersByTimeAsync(
      HEARTBEAT_INTERVAL_MS
    );

    expect(onTick).toHaveBeenCalledTimes(1);

    scheduler.stop();
  });

  it("retries retryable failures with backoff", async () => {
    const onTick = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        retryable: true,
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    const scheduler =
      startHeartbeatScheduler({
        onTick,
      });

    scheduler.start();

    await vi.advanceTimersByTimeAsync(
      HEARTBEAT_INTERVAL_MS
    );
    await vi.advanceTimersByTimeAsync(
      30_000
    );

    expect(onTick).toHaveBeenCalledTimes(2);

    scheduler.stop();
  });

  it("stops after non-retryable failures", async () => {
    const onTick = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        retryable: false,
      });

    const scheduler =
      startHeartbeatScheduler({
        onTick,
      });

    scheduler.start();

    await vi.advanceTimersByTimeAsync(
      HEARTBEAT_INTERVAL_MS
    );
    await vi.advanceTimersByTimeAsync(
      HEARTBEAT_INTERVAL_MS
    );

    expect(onTick).toHaveBeenCalledTimes(1);

    scheduler.stop();
  });
});
