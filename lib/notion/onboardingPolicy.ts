export const ONBOARDING_START = "2026-09-20T03:17:33Z";

export function deriveOnboardingStatus(signals: { device: boolean; paperwork: boolean; maintenance: boolean; needsHelp: boolean }) {
  if (signals.needsHelp) return "Needs Attention";
  if (signals.device && signals.paperwork && signals.maintenance) return "Complete";
  if (signals.maintenance) return "Activated";
  if (signals.device && signals.paperwork) return "Core Setup";
  if (signals.device) return "Started";
  return "New";
}

export function eligibleOnboardingAccount(input: {
  createdAt: string; email?: string | null; realtor: boolean; giftRecipient: boolean;
  inactive: boolean; deletionRequested: boolean; bannedUntil?: string | null;
}, now = Date.now()) {
  return Boolean(input.email) && Date.parse(input.createdAt) >= Date.parse(ONBOARDING_START)
    && (!input.realtor || input.giftRecipient) && !input.inactive && !input.deletionRequested
    && !(input.bannedUntil && Date.parse(input.bannedUntil) > now);
}

export function emailStateFromHistory(sentTypes: Set<string>) {
  return {
    "Welcome Sent": sentTypes.has("welcome"),
    "Progress Sent": sentTypes.has("milestone_first_device"),
    "Core Setup Sent": sentTypes.has("milestone_core_setup"),
    "Activation Sent": sentTypes.has("milestone_activated"),
    "Completion Sent": sentTypes.has("milestone_activated") || sentTypes.has("milestone_onboarding_complete"),
    "Reminder Sent": [...sentTypes].some(type => type.startsWith("no_device_") || ["onboarding_reminder", "device_details_missing", "no_documents", "warranty_missing"].includes(type)),
  };
}
