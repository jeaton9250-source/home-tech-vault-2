export const HOME_ASSISTANT_COMMAND_INTERVAL_MS =
  5_000;

export type HomeAssistantCommandTickResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      retryable: boolean;
    };

type SchedulerOptions = {
  onTick: () => Promise<HomeAssistantCommandTickResult>;
};

export function startHomeAssistantCommandScheduler(
  options: SchedulerOptions
) {
  let intervalId: ReturnType<
    typeof setInterval
  > | null = null;

  let running = false;
  let stopped = false;

  async function runTick() {
    if (stopped || running) {
      return;
    }

    running = true;

    try {
      await options.onTick();
    } finally {
      running = false;
    }
  }

  function start() {
    if (
      stopped ||
      intervalId !== null
    ) {
      return;
    }

    void runTick();

    intervalId = setInterval(
      () => {
        void runTick();
      },
      HOME_ASSISTANT_COMMAND_INTERVAL_MS
    );
  }

  function stop() {
    stopped = true;

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return {
    start,
    stop,
    runNow: runTick,
  };
}
