/** Supabase Go template variables — preserved verbatim in generated HTML. */
export const supabaseVars = {
  confirmationUrl: "{{ .ConfirmationURL }}",
  token: "{{ .Token }}",
  email: "{{ .Email }}",
  newEmail: "{{ .NewEmail }}",
  siteUrl: "{{ .SiteURL }}",
} as const;

export type AuthEmailTemplateDefinition = {
  id:
    | "confirmation"
    | "recovery"
    | "magic_link"
    | "invite"
    | "email_change"
    | "reauthentication";
  filename: string;
  subject: string;
  preheader: string;
  headline: string;
  subheading?: string;
  paragraphs: string[];
  buttonLabel: string;
  securityNote: string;
  includeOtp?: boolean;
};

export const authEmailTemplates: AuthEmailTemplateDefinition[] =
  [
    {
      id: "confirmation",
      filename: "confirmation.html",
      subject:
        "Confirm your Home Tech Vault account",
      preheader:
        "Confirm your email to finish creating your Home Tech Vault account.",
      headline: "Confirm your account.",
      subheading:
        "One quick step before your vault is ready.",
      paragraphs: [
        "Tap the button below to confirm your email address and start organizing your home technology.",
        "If you did not create an account, you can safely ignore this email.",
      ],
      buttonLabel: "Confirm Account",
      securityNote:
        "This link is personal to you. Do not forward it.",
    },
    {
      id: "recovery",
      filename: "recovery.html",
      subject:
        "Reset your Home Tech Vault password",
      preheader:
        "Reset your Home Tech Vault password securely.",
      headline: "Reset your password.",
      subheading:
        "We received a request to update your sign-in.",
      paragraphs: [
        "Use the button below to choose a new password for your account.",
        "If you did not request this, you can ignore this email and your password will stay the same.",
      ],
      buttonLabel: "Reset Password",
      securityNote:
        "Never share this link. Home Tech Vault will never ask for your password by email.",
    },
    {
      id: "magic_link",
      filename: "magic_link.html",
      subject: "Sign in to Home Tech Vault",
      preheader:
        "Your secure sign-in link for Home Tech Vault.",
      headline: "Sign in securely.",
      subheading:
        "No password needed — just one tap.",
      paragraphs: [
        "Use the button below to sign in to your Home Tech Vault account.",
        "This link expires soon and works once. If you did not request it, you can ignore this email.",
      ],
      buttonLabel: "Sign In",
      securityNote:
        "If this was not you, do not use this link.",
    },
    {
      id: "invite",
      filename: "invite.html",
      subject: "You're invited to Home Tech Vault",
      preheader:
        "Accept your invitation to join Home Tech Vault.",
      headline: "You're invited.",
      subheading:
        "Join Home Tech Vault and start organizing with your household.",
      paragraphs: [
        "Accept the invitation below to create your account and access your shared home technology vault.",
        "If you were not expecting this invitation, you can safely ignore this email.",
      ],
      buttonLabel: "Accept Invitation",
      securityNote:
        "This invitation link is personal to you.",
    },
    {
      id: "email_change",
      filename: "email_change.html",
      subject: "Confirm your new email address",
      preheader:
        "Confirm your new email address for Home Tech Vault.",
      headline: "Confirm your new email.",
      subheading:
        "We received a request to update the email on your account.",
      paragraphs: [
        `Confirm this change for ${supabaseVars.newEmail}.`,
        "If you did not request this update, contact support immediately.",
      ],
      buttonLabel: "Confirm Email",
      securityNote:
        "Your current sign-in stays active until this change is confirmed.",
    },
    {
      id: "reauthentication",
      filename: "reauthentication.html",
      subject: "Confirm it's really you",
      preheader:
        "Confirm your identity to continue in Home Tech Vault.",
      headline: "Confirm it's you.",
      subheading:
        "For your security, we need to verify this action.",
      paragraphs: [
        "Use the button below to confirm your identity and continue.",
        "If you did not start this request, secure your account right away.",
      ],
      buttonLabel: "Confirm Identity",
      securityNote:
        "You can also use your verification code if prompted.",
      includeOtp: true,
    },
  ];

export function getAuthEmailTemplate(
  id: AuthEmailTemplateDefinition["id"]
) {
  const template = authEmailTemplates.find(
    (item) => item.id === id
  );

  if (!template) {
    throw new Error(
      `Unknown auth email template: ${id}`
    );
  }

  return template;
}
