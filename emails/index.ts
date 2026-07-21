export * from "@/emails/components/EmailButton";
export * from "@/emails/components/EmailCard";
export * from "@/emails/components/EmailFooter";
export * from "@/emails/components/EmailHeader";
export * from "@/emails/components/EmailLayout";
export * from "@/emails/styles/emailTheme";

export {
  default as FamilyInvitationEmail,
  familyInvitationSubject,
  formatHouseholdRole,
  renderFamilyInvitationPlainText,
  type FamilyInvitationEmailProps,
} from "@/emails/templates/FamilyInvitationEmail";

export {
  default as WelcomeEmail,
  welcomeSubject,
  renderWelcomePlainText,
  type WelcomeEmailProps,
} from "@/emails/templates/WelcomeEmail";

export {
  default as FamilyInvitationAcceptedEmail,
  familyInvitationAcceptedSubject,
  type FamilyInvitationAcceptedEmailProps,
} from "@/emails/templates/FamilyInvitationAcceptedEmail";

export {
  default as ProPlanActivatedEmail,
  proPlanActivatedSubject,
  type ProPlanActivatedEmailProps,
} from "@/emails/templates/ProPlanActivatedEmail";

export {
  default as FamilyPlanActivatedEmail,
  familyPlanActivatedSubject,
  type FamilyPlanActivatedEmailProps,
} from "@/emails/templates/FamilyPlanActivatedEmail";

export {
  default as PaymentFailedEmail,
  paymentFailedSubject,
  type PaymentFailedEmailProps,
} from "@/emails/templates/PaymentFailedEmail";

export {
  default as SubscriptionCanceledEmail,
  subscriptionCanceledSubject,
  type SubscriptionCanceledEmailProps,
} from "@/emails/templates/SubscriptionCanceledEmail";

export {
  default as WarrantyReminderEmail,
  warrantyReminderSubject,
  type WarrantyReminderEmailProps,
} from "@/emails/templates/WarrantyReminderEmail";

export {
  default as MaintenanceReminderEmail,
  maintenanceReminderSubject,
  type MaintenanceReminderEmailProps,
} from "@/emails/templates/MaintenanceReminderEmail";

export {
  default as MonthlyVaultReportEmail,
  monthlyVaultReportSubject,
  type MonthlyVaultReportEmailProps,
} from "@/emails/templates/MonthlyVaultReportEmail";
