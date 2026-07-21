export const GA_MEASUREMENT_ID =
  process.env
    .NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ??
  "";

/** Set to "true" to load GA during local development. */
const GA_ENABLE_IN_DEV =
  process.env
    .NEXT_PUBLIC_GA_ENABLE_IN_DEV === "true";

export type GaEventParams = Record<
  string,
  string | number | boolean | undefined
>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    __HTV_GA_INITIALIZED__?: boolean;
  }
}

/** Whether GA scripts and tracking should run in this environment. */
export function isGaEnabled(): boolean {
  if (!GA_MEASUREMENT_ID) {
    return false;
  }

  if (
    process.env.NODE_ENV === "production"
  ) {
    return true;
  }

  return GA_ENABLE_IN_DEV;
}

export function trackPageView(
  url: string
): void {
  if (
    !isGaEnabled() ||
    typeof window === "undefined" ||
    typeof window.gtag !== "function"
  ) {
    return;
  }

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

/** Send a custom GA4 event. Safe to call before gtag loads — no-ops when disabled. */
export function trackEvent(
  name: string,
  parameters?: GaEventParams
): void {
  if (
    !isGaEnabled() ||
    typeof window === "undefined" ||
    typeof window.gtag !== "function"
  ) {
    return;
  }

  window.gtag("event", name, parameters ?? {});
}
