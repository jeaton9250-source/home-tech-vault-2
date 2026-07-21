export {
  trackFirstDeviceAdded,
  trackFirstDocumentUploaded,
  trackNetworkSetupCompleted,
  trackOnboardingCompleted,
  trackOnboardingSkipped,
  trackOnboardingStarted,
  trackOnboardingStepCompleted,
} from "@/lib/onboarding/analytics";

export {
  completeOnboarding,
  restartOnboardingProfile,
  saveHomeName,
  saveOnboardingStep,
  skipOnboarding,
} from "@/lib/onboarding/profile";

export {
  buildProgressSummary,
  loadOnboardingDataSnapshot,
  resolveResumeStep,
} from "@/lib/onboarding/progress";

export {
  isOnboardingFinished,
  loadOnboardingProfile,
  resolvePostAuthRedirect,
  shouldBypassOnboardingRedirect,
  shouldShowOnboarding,
} from "@/lib/onboarding/redirect";

export {
  isOnboardingStep,
  nextStep,
  ONBOARDING_STEP_COUNT,
  previousStep,
  stepIndex,
} from "@/lib/onboarding/steps";

export type {
  OnboardingDataSnapshot,
  OnboardingProfileState,
  OnboardingProgressSummary,
  OnboardingStep,
} from "@/lib/onboarding/types";
