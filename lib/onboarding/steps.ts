import type { OnboardingStep } from "@/lib/onboarding/types";

export const ONBOARDING_STEP_COUNT = 6;

export function stepIndex(
  step: OnboardingStep
): number {
  switch (step) {
    case "welcome":
      return 1;
    case "home":
      return 2;
    case "device":
      return 3;
    case "document":
      return 4;
    case "network":
      return 5;
    case "complete":
      return 6;
  }
}

export function nextStep(
  step: OnboardingStep
): OnboardingStep {
  switch (step) {
    case "welcome":
      return "home";
    case "home":
      return "device";
    case "device":
      return "document";
    case "document":
      return "network";
    case "network":
      return "complete";
    case "complete":
      return "complete";
  }
}

export function previousStep(
  step: OnboardingStep
): OnboardingStep {
  switch (step) {
    case "welcome":
      return "welcome";
    case "home":
      return "welcome";
    case "device":
      return "home";
    case "document":
      return "device";
    case "network":
      return "document";
    case "complete":
      return "network";
  }
}

export function isOnboardingStep(
  value: string | null | undefined
): value is OnboardingStep {
  return (
    value === "welcome" ||
    value === "home" ||
    value === "device" ||
    value === "document" ||
    value === "network" ||
    value === "complete"
  );
}
