export const ONBOARDING_STEPS = [
  "welcome",
  "home",
  "device",
  "document",
  "network",
  "complete",
] as const;

export type OnboardingStep =
  (typeof ONBOARDING_STEPS)[number];

export type OnboardingProfileState = {
  onboarding_completed_at: string | null;
  onboarding_step: OnboardingStep | null;
  onboarding_skipped_at: string | null;
  full_name: string | null;
  household_name: string | null;
};

export type OnboardingDataSnapshot = {
  deviceCount: number;
  documentCount: number;
  networkConfigured: boolean;
  sharedHouseholdName: string | null;
  hasSharedHousehold: boolean;
};

export type OnboardingProgressSummary = {
  devicesAdded: number;
  documentsAdded: number;
  networkAdded: boolean;
  householdNamed: boolean;
};
