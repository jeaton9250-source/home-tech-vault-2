import { trackEvent } from "@/lib/analytics";

export function trackOnboardingStarted(
  restart: boolean
) {
  trackEvent("onboarding_started", {
    restart,
  });
}

export function trackOnboardingStepCompleted(
  step: string
) {
  trackEvent("onboarding_step_completed", {
    step,
  });
}

export function trackOnboardingSkipped(
  step: string
) {
  trackEvent("onboarding_skipped", {
    step,
  });
}

export function trackOnboardingCompleted() {
  trackEvent("onboarding_completed");
}

export function trackFirstDeviceAdded(
  source: "onboarding"
) {
  trackEvent("first_device_added", {
    source,
  });
}

export function trackFirstDocumentUploaded(
  source: "onboarding"
) {
  trackEvent("first_document_uploaded", {
    source,
  });
}

export function trackNetworkSetupCompleted(
  source: "onboarding"
) {
  trackEvent("network_setup_completed", {
    source,
  });
}
