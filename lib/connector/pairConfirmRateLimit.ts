const PAIR_CONFIRM_WINDOW_MS = 15 * 60 * 1000;
const PAIR_CONFIRM_MAX_ATTEMPTS = 20;

type AttemptWindow = {
  count: number;
  windowStartedAt: number;
};

const attemptsByKey = new Map<
  string,
  AttemptWindow
>();

function getClientKey(request: Request): string {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  if (forwarded) {
    return forwarded;
  }

  return (
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function checkPairConfirmRateLimit(
  request: Request
): boolean {
  const key = getClientKey(request);
  const now = Date.now();
  const existing = attemptsByKey.get(key);

  if (
    !existing ||
    now - existing.windowStartedAt >
      PAIR_CONFIRM_WINDOW_MS
  ) {
    attemptsByKey.set(key, {
      count: 1,
      windowStartedAt: now,
    });

    return true;
  }

  if (
    existing.count >=
    PAIR_CONFIRM_MAX_ATTEMPTS
  ) {
    return false;
  }

  existing.count += 1;
  attemptsByKey.set(key, existing);

  return true;
}

export function resetPairConfirmRateLimitForTests() {
  attemptsByKey.clear();
}
