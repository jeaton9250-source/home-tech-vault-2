export const HEARTBEAT_INTERVAL_MS =
  5 * 60 * 1000;

const INITIAL_BACKOFF_MS = 30 * 1000;
const MAX_BACKOFF_MS = 15 * 60 * 1000;

export type HeartbeatTickResult =
  | { ok: true }
  | {
      ok: false;
      retryable: boolean;
    };

export type HeartbeatSchedulerOptions = {
  onTick: () => Promise<HeartbeatTickResult>;
};

export function startHeartbeatScheduler(
  options: HeartbeatSchedulerOptions
) {
  let intervalId: ReturnType<
    typeof setInterval
  > | null = null;
  let backoffTimeoutId: ReturnType<
    typeof setTimeout
  > | null = null;
  let backoffMs = 0;
  let stopped = false;

  function clearBackoffTimer() {
    if (backoffTimeoutId !== null) {
      clearTimeout(backoffTimeoutId);
      backoffTimeoutId = null;
    }
  }

  function scheduleBackoffRetry() {
    clearBackoffTimer();

    backoffMs =
      backoffMs === 0
        ? INITIAL_BACKOFF_MS
        : Math.min(
            backoffMs * 2,
            MAX_BACKOFF_MS
          );

    backoffTimeoutId = setTimeout(() => {
      void runTick();
    }, backoffMs);
  }

  async function runTick() {
    if (stopped) {
      return;
    }

    const result = await options.onTick();

    if (result.ok) {
      backoffMs = 0;
      clearBackoffTimer();
      return;
    }

    if (!result.retryable) {
      stop();
      return;
    }

    if (!stopped) {
      scheduleBackoffRetry();
    }
  }

  function start() {
    if (intervalId !== null) {
      return;
    }

    intervalId = setInterval(() => {
      void runTick();
    }, HEARTBEAT_INTERVAL_MS);
  }

  function stop() {
    stopped = true;

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    clearBackoffTimer();
  }

  return {
    start,
    stop,
    runNow: runTick,
  };
}
