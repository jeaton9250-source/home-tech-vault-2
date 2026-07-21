export type AdminEmailTemplateEntry = {
  id: string;
  name: string;
  category: "auth" | "application" | "support";
  live: boolean;
  previewPath?: string;
  subject?: string;
  notes?: string;
};

export const ADMIN_EMAIL_TEMPLATES: AdminEmailTemplateEntry[] =
  [
    {
      id: "welcome",
      name: "Welcome",
      category: "application",
      live: true,
      previewPath: "/emails/templates/WelcomeEmail.tsx",
      subject: "Welcome to Home Tech Vault",
    },
    {
      id: "confirm-signup",
      name: "Confirm signup",
      category: "auth",
      live: true,
      notes: "Supabase Auth SMTP template",
    },
    {
      id: "reset-password",
      name: "Reset password",
      category: "auth",
      live: true,
      notes: "Supabase Auth SMTP template",
    },
    {
      id: "magic-link",
      name: "Magic link",
      category: "auth",
      live: true,
      notes: "Supabase Auth SMTP template",
    },
    {
      id: "family-invitation",
      name: "Family invitation",
      category: "application",
      live: true,
      previewPath:
        "/emails/templates/FamilyInvitationEmail.tsx",
    },
    {
      id: "family-invitation-accepted",
      name: "Family invitation accepted",
      category: "application",
      live: true,
      previewPath:
        "/emails/templates/FamilyInvitationAcceptedEmail.tsx",
    },
    {
      id: "pro-activated",
      name: "Pro activated",
      category: "application",
      live: true,
      previewPath:
        "/emails/templates/ProPlanActivatedEmail.tsx",
    },
    {
      id: "family-activated",
      name: "Family activated",
      category: "application",
      live: true,
      previewPath:
        "/emails/templates/FamilyPlanActivatedEmail.tsx",
    },
    {
      id: "payment-failed",
      name: "Payment failed",
      category: "application",
      live: true,
      previewPath:
        "/emails/templates/PaymentFailedEmail.tsx",
    },
    {
      id: "subscription-canceled",
      name: "Cancellation",
      category: "application",
      live: true,
      previewPath:
        "/emails/templates/SubscriptionCanceledEmail.tsx",
    },
    {
      id: "warranty-reminder",
      name: "Warranty reminder",
      category: "application",
      live: false,
      previewPath:
        "/emails/templates/WarrantyReminderEmail.tsx",
      notes: "Template exists; event wiring deferred",
    },
    {
      id: "maintenance-reminder",
      name: "Maintenance reminder",
      category: "application",
      live: false,
      previewPath:
        "/emails/templates/MaintenanceReminderEmail.tsx",
      notes: "Template exists; event wiring deferred",
    },
    {
      id: "monthly-vault-report",
      name: "Monthly Vault report",
      category: "application",
      live: false,
      previewPath:
        "/emails/templates/MonthlyVaultReportEmail.tsx",
      notes: "Template exists; scheduled send deferred",
    },
    {
      id: "support-request-received",
      name: "Support request received",
      category: "support",
      live: true,
      previewPath:
        "/emails/templates/SupportRequestReceivedEmail.tsx",
    },
    {
      id: "device-offline",
      name: "Device offline",
      category: "application",
      live: false,
      notes: "Deferred until desktop monitor ships",
    },
    {
      id: "device-recovered",
      name: "Device recovered",
      category: "application",
      live: false,
      notes: "Deferred until desktop monitor ships",
    },
  ];
