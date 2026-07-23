import { trackEvent } from "@/lib/analytics/gtag";

export const LANDING_ANALYTICS_EVENTS = {
  heroStartFree: "landing_hero_start_free",
  heroExploreDemo: "landing_hero_explore_demo",
  heroSeeHowItWorks: "landing_hero_see_how_it_works",
  estimatorStarted: "landing_estimator_started",
  estimatorCompleted: "landing_estimator_completed",
  finalCta: "landing_final_cta",
  finalCtaExploreDemo: "landing_final_cta_explore_demo",
} as const;

export function trackLandingEvent(
  eventName: string,
  parameters?: Record<
    string,
    string | number | boolean | undefined
  >
): void {
  trackEvent(eventName, parameters);
}
