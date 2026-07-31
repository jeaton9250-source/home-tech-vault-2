export const MONITORING_INTERVAL_MS =
  15 * 60 * 1000;

const INITIAL_RETRY_MS =
  30 * 1000;

const MAX_RETRY_MS =
  15 * 60 * 1000;

const WAKE_GAP_MS =
  2 * 60 * 1000;

const RECOVERY_DEBOUNCE_MS =
  10 * 1000;

export type MonitoringTrigger =
  | "startup"
  | "interval"
  | "retry"
  | "wake"
  | "online";

export type MonitoringTickContext = {
  trigger: MonitoringTrigger;
  startedAt: string;
};

export type MonitoringTick =
  (
    context?: MonitoringTickContext
  ) => Promise<void>;

export type MonitoringSchedulerStatus = {
  running: boolean;
  scanning: boolean;
  consecutiveFailures: number;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastFailureMessage: string | null;
  nextScheduledAt: string | null;
  nextRetryAt: string | null;
  lastTrigger: MonitoringTrigger | null;
};

export type MonitoringScheduler = {
  start: () => void;
  stop: () => void;
  runNow: (
    trigger?: MonitoringTrigger
  ) => Promise<void>;
  isRunning: () => boolean;
  isScanning: () => boolean;
  getStatus:
    () => MonitoringSchedulerStatus;
};

export function startMonitoringScheduler(
  options: {
    onTick: MonitoringTick;
    intervalMs?: number;
    isPaused?: () => boolean;
    runOnStart?: boolean;
    onStatusChange?: (
      status: MonitoringSchedulerStatus
    ) => void;
  }
): MonitoringScheduler {
  const intervalMs =
    options.intervalMs ??
    MONITORING_INTERVAL_MS;

  let intervalId:
    ReturnType<typeof setInterval> |
    null = null;

  let retryTimeoutId:
    ReturnType<typeof setTimeout> |
    null = null;

  let recoveryTimeoutId:
    ReturnType<typeof setTimeout> |
    null = null;

  let running = false;
  let scanning = false;
  let stopped = false;

  let retryMs = 0;
  let consecutiveFailures = 0;

  let lastAttemptAt:
    string | null = null;

  let lastSuccessAt:
    string | null = null;

  let lastFailureAt:
    string | null = null;

  let lastFailureMessage:
    string | null = null;

  let nextScheduledAt:
    string | null = null;

  let nextRetryAt:
    string | null = null;

  let lastTrigger:
    MonitoringTrigger | null = null;

  let lastClockCheck =
    Date.now();

  function status():
    MonitoringSchedulerStatus {
    return {
      running,
      scanning,
      consecutiveFailures,
      lastAttemptAt,
      lastSuccessAt,
      lastFailureAt,
      lastFailureMessage,
      nextScheduledAt,
      nextRetryAt,
      lastTrigger,
    };
  }

  function publishStatus() {
    options.onStatusChange?.(
      status()
    );
  }

  function clearRetryTimer() {
    if (retryTimeoutId !== null) {
      clearTimeout(
        retryTimeoutId
      );

      retryTimeoutId = null;
    }

    nextRetryAt = null;
  }

  function clearRecoveryTimer() {
    if (
      recoveryTimeoutId !== null
    ) {
      clearTimeout(
        recoveryTimeoutId
      );

      recoveryTimeoutId = null;
    }
  }

  function scheduleRetry() {
    if (
      stopped ||
      options.isPaused?.()
    ) {
      return;
    }

    clearRetryTimer();

    retryMs =
      retryMs === 0
        ? INITIAL_RETRY_MS
        : Math.min(
            retryMs * 2,
            MAX_RETRY_MS
          );

    nextRetryAt =
      new Date(
        Date.now() + retryMs
      ).toISOString();

    publishStatus();

    retryTimeoutId =
      setTimeout(() => {
        retryTimeoutId = null;
        nextRetryAt = null;

        void runTick("retry");
      }, retryMs);
  }

  function scheduleRecovery(
    trigger:
      | "wake"
      | "online"
  ) {
    if (
      stopped ||
      !running ||
      options.isPaused?.()
    ) {
      return;
    }

    clearRecoveryTimer();

    recoveryTimeoutId =
      setTimeout(() => {
        recoveryTimeoutId = null;

        void runTick(trigger);
      }, RECOVERY_DEBOUNCE_MS);
  }

  async function runTick(
    trigger:
      MonitoringTrigger =
        "interval"
  ) {
    if (
      stopped ||
      !running ||
      options.isPaused?.()
    ) {
      return;
    }

    /*
     * Prevent two scans from running at
     * the same time. A slow network scan
     * must finish before another begins.
     */
    if (scanning) {
      return;
    }

    scanning = true;
    lastTrigger = trigger;
    lastAttemptAt =
      new Date().toISOString();

    publishStatus();

    try {
      await options.onTick({
        trigger,
        startedAt:
          lastAttemptAt,
      });

      lastSuccessAt =
        new Date().toISOString();

      lastFailureAt = null;
      lastFailureMessage = null;
      consecutiveFailures = 0;
      retryMs = 0;

      clearRetryTimer();
    } catch (error) {
      consecutiveFailures += 1;

      lastFailureAt =
        new Date().toISOString();

      lastFailureMessage =
        error instanceof Error
          ? error.message
          : "Background scan failed.";

      scheduleRetry();
    } finally {
      scanning = false;
      publishStatus();
    }
  }

  function handleVisibilityChange() {
    if (
      document.visibilityState !==
      "visible"
    ) {
      return;
    }

    const now = Date.now();
    const elapsed =
      now - lastClockCheck;

    lastClockCheck = now;

    /*
     * A large clock gap usually means
     * the computer was asleep.
     */
    if (elapsed >= WAKE_GAP_MS) {
      scheduleRecovery("wake");
    }
  }

  function handleOnline() {
    scheduleRecovery("online");
  }

  function start() {
    if (running) {
      return;
    }

    stopped = false;
    running = true;
    lastClockCheck = Date.now();

    nextScheduledAt =
      new Date(
        Date.now() + intervalMs
      ).toISOString();

    intervalId =
      setInterval(() => {
        nextScheduledAt =
          new Date(
            Date.now() + intervalMs
          ).toISOString();

        void runTick("interval");
      }, intervalMs);

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "online",
      handleOnline
    );

    publishStatus();

    if (
      options.runOnStart !== false
    ) {
      void runTick("startup");
    }
  }

  function stop() {
    stopped = true;
    running = false;
    scanning = false;

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    clearRetryTimer();
    clearRecoveryTimer();

    nextScheduledAt = null;
    nextRetryAt = null;

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.removeEventListener(
      "online",
      handleOnline
    );

    publishStatus();
  }

  return {
    start,
    stop,

    runNow(
      trigger:
        MonitoringTrigger =
          "interval"
    ) {
      return runTick(trigger);
    },

    isRunning() {
      return running;
    },

    isScanning() {
      return scanning;
    },

    getStatus() {
      return status();
    },
  };
}
