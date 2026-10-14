// React Native's AbortSignal polyfill does not implement AbortSignal.timeout.
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut)
      throw new Error(
        "The request timed out. Check your connection and try again.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
