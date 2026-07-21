"use client";

import { trackEvent } from "@/lib/analytics/gtag";

export function trackFoundingMemberEnrolled(options: {
  memberNumber: number;
  grantCreated: boolean;
  grantReused: boolean;
}) {
  trackEvent("founding_member_enrolled", {
    member_number: options.memberNumber,
    grant_created: options.grantCreated,
    grant_reused: options.grantReused,
  });
}

export function trackFoundingMemberRemoved(options: {
  revokeLinkedGrant: boolean;
}) {
  trackEvent("founding_member_removed", {
    revoke_linked_grant:
      options.revokeLinkedGrant,
  });
}

export function trackFoundingProgramFull() {
  trackEvent("founding_program_full");
}

export function trackFoundingProgramCtaClicked(options: {
  source: "homepage" | "other";
  availability: "open" | "paused" | "full";
}) {
  trackEvent("founding_program_cta_clicked", {
    source: options.source,
    availability: options.availability,
  });
}

export function trackFoundingMemberFirstLoginAfterEnrollment() {
  trackEvent(
    "founding_member_first_login_after_enrollment"
  );
}
