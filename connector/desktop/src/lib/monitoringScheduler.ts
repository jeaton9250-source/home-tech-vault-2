const MONITORING_INTERVAL_MS = 15 * 60 * 1000;

export type MonitoringTick = () => Promise<void>;

export type MonitoringScheduler = {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
};

export function startMonitoringScheduler(options: {
  onTick: MonitoringTick;
  intervalMs?: number;
  isPaused?: () => boolean;
}): MonitoringScheduler {
  let timerId: number | null = null;
  let running = false;

  async function tick() {
    if (options.isPaused?.()) {
      return;
    }

    await options.onTick();
  }

  return {
    start() {
      if (running) {
        return;
      }

      running = true;
      timerId = window.setInterval(() => {
        void tick();
      }, options.intervalMs ?? MONITORING_INTERVAL_MS);
    },
    stop() {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }

      running = false;
    },
    isRunning() {
      return running;
    },
  };
}
