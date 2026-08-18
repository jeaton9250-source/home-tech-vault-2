import type { FamilyInvitationEmailProps } from "@/emails/templates/FamilyInvitationEmail";

/** Sample preview props for local React Email development. */
export const familyInvitationPreviewSamples = {
  admin: {
    inviterName: "Alex Morgan",
    householdName: "The Morgan Household",
    roleLabel: "Admin",
    acceptanceUrl:
      "https://www.hometechvault.com/family/accept/sample-admin-token",
    expirationLabel: "August 20, 2026",
  },
  member: {
    inviterName: "Alex Morgan",
    householdName: "The Morgan Household",
    roleLabel: "Member",
    acceptanceUrl:
      "https://www.hometechvault.com/family/accept/sample-member-token",
    expirationLabel: "August 20, 2026",
  },
  viewer: {
    inviterName: "Alex Morgan",
    householdName: "The Morgan Household",
    roleLabel: "Viewer",
    acceptanceUrl:
      "https://www.hometechvault.com/family/accept/sample-viewer-token",
    expirationLabel: "August 20, 2026",
  },
} satisfies Record<string, FamilyInvitationEmailProps>;

export const warrantyReminderPreviewSample = {
  deviceName: "Living Room Smart TV",
  expirationLabel: "August 20, 2026",
  daysRemaining: 30,
  deviceUrl:
    "https://www.hometechvault.com/devices/sample-device",
};

export const maintenanceReminderPreviewSample = {
  taskName: "Replace air filter",
  deviceName: "Mesh Wi-Fi Router",
  dueLabel: "Overdue by 5 days",
  maintenanceUrl:
    "https://www.hometechvault.com/maintenance",
};

export const monthlyVaultReportPreviewSample = {
  householdName: "The Morgan Household",
  vaultScore: 92,
  deviceCount: 24,
  protectedValue: "$18,400",
  expiringWarranties: 2,
  reportUrl: "https://www.hometechvault.com/reports",
};
