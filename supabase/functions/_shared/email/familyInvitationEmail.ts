/**
 * Portable email theme for Supabase Edge Functions.
 * Keep in sync with emails/styles/emailTheme.ts
 */
export const emailTheme = {
  colors: {
    background: "#FAF9F7",
    card: "#FDFCFA",
    border: "#E7E2DA",
    textPrimary: "#1C1917",
    textSecondary: "#44403C",
    textMuted: "#78716C",
    button: "#1C1917",
    buttonText: "#FDFCFA",
    warning: "#9A6B2F",
  },
  radius: "16px",
  maxWidth: "600px",
  fontFamily:
    "'Geist Sans', Arial, Helvetica, sans-serif",
  brand: {
    name: "Home Tech Vault",
    overline: "HOME TECH VAULT",
    tagline: "Organize. Protect. Simplify.",
    siteUrl: "https://www.hometechvault.com",
    logoUrl:
      "https://www.hometechvault.com/brand/logo.svg",
    supportEmail: "support@hometechvault.com",
  },
} as const;

export type FamilyInvitationEmailProps = {
  inviterName: string;
  householdName: string;
  roleLabel: string;
  acceptanceUrl: string;
  expirationLabel?: string | null;
};

export const familyInvitationSubject =
  "You've been invited to join a Home Tech Vault";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatHouseholdRole(role: string) {
  return role
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );
}

export function renderFamilyInvitationPlainText(
  props: FamilyInvitationEmailProps
) {
  const expiration = props.expirationLabel
    ? `\nThis invitation expires on ${props.expirationLabel}.\n`
    : "";

  return `${familyInvitationSubject}

${props.inviterName} invited you to join ${props.householdName} in ${emailTheme.brand.name}.

Your role: ${props.roleLabel}

Accept this invitation to access your household's shared technology records based on your assigned role.

Accept invitation:
${props.acceptanceUrl}
${expiration}
Security note: This link is personal to you. Do not forward it. If you were not expecting this invitation, you can safely ignore this email.

${emailTheme.brand.name}
${emailTheme.brand.tagline}
${emailTheme.brand.supportEmail}
${emailTheme.brand.siteUrl}`;
}

export function renderFamilyInvitationHtml(
  props: FamilyInvitationEmailProps
) {
  const {
    colors,
    radius,
    maxWidth,
    fontFamily,
    brand,
  } = emailTheme;

  const safeInviter = escapeHtml(props.inviterName);
  const safeHousehold = escapeHtml(props.householdName);
  const safeRole = escapeHtml(props.roleLabel);
  const safeUrl = escapeHtml(props.acceptanceUrl);

  const expirationBlock = props.expirationLabel
    ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.75;color:${colors.textSecondary};">
        This invitation expires on ${escapeHtml(props.expirationLabel)}.
      </p>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${escapeHtml(familyInvitationSubject)}</title>
  </head>
  <body style="margin:0;padding:32px 16px;background:${colors.background};font-family:${fontFamily};color:${colors.textPrimary};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:${maxWidth};">
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <img src="${brand.logoUrl}" width="180" height="40" alt="${brand.name} logo" style="display:block;margin:0 auto 18px;border:0;" />
                <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${colors.textMuted};">${brand.overline}</p>
                <h1 style="margin:14px 0 0;font-size:32px;line-height:1.12;font-weight:600;letter-spacing:-0.03em;color:${colors.textPrimary};">You've been invited.</h1>
                <p style="margin:14px 0 0;font-size:16px;line-height:1.7;color:${colors.textSecondary};">${safeInviter} invited you to join ${safeHousehold}.</p>
              </td>
            </tr>
            <tr>
              <td style="background:${colors.card};border:1px solid ${colors.border};border-radius:${radius};padding:36px 32px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:${colors.textSecondary};">
                  Accept this invitation to access your household's shared technology records — devices, documents, warranties, maintenance, and network details — based on your assigned role.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:${colors.background};border-radius:${radius};">
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${colors.warning};">Household</p>
                      <p style="margin:8px 0 0;font-size:16px;font-weight:600;color:${colors.textPrimary};">${safeHousehold}</p>
                      <p style="margin:16px 0 0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${colors.warning};">Your role</p>
                      <p style="margin:8px 0 0;font-size:16px;font-weight:600;color:${colors.textPrimary};">${safeRole}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto 0;">
                  <tr>
                    <td align="center" style="background:${colors.button};border-radius:${radius};">
                      <a href="${safeUrl}" style="display:inline-block;min-width:220px;padding:16px 28px;color:${colors.buttonText};font-size:15px;font-weight:600;text-decoration:none;border-radius:${radius};">Accept Invitation</a>
                    </td>
                  </tr>
                </table>
                ${expirationBlock}
                <p style="margin:28px 0 0;padding:16px 18px;background:${colors.background};border:1px solid ${colors.border};border-radius:${radius};font-size:13px;line-height:1.7;color:${colors.textMuted};">
                  <strong style="color:${colors.textPrimary};">Security note:</strong> This link is personal to you. Do not forward it. If you were not expecting this invitation, you can safely ignore this email.
                </p>
                <p style="margin:18px 0 0;font-size:12px;line-height:1.7;word-break:break-all;color:${colors.textMuted};">
                  Button not working? Copy and paste this link:<br />
                  <a href="${safeUrl}" style="color:${colors.textSecondary};">${safeUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding-top:28px;border-top:1px solid ${colors.border};margin-top:28px;">
                <p style="margin:0;font-size:14px;line-height:1.8;font-weight:500;color:${colors.textPrimary};">Organize.<br />Protect.<br />Simplify.</p>
                <p style="margin:18px 0 0;font-size:13px;line-height:1.8;color:${colors.textMuted};">
                  ${brand.name}<br />
                  <a href="${brand.siteUrl}" style="color:${colors.textMuted};text-decoration:none;">${brand.siteUrl}</a><br />
                  <a href="mailto:${brand.supportEmail}" style="color:${colors.textMuted};text-decoration:none;">${brand.supportEmail}</a>
                </p>
                <p style="margin:16px 0 0;font-size:13px;line-height:1.8;">
                  <a href="${brand.siteUrl}/privacy" style="color:${colors.textMuted};text-decoration:none;margin-right:16px;">Privacy</a>
                  <a href="${brand.siteUrl}/terms" style="color:${colors.textMuted};text-decoration:none;">Terms</a>
                </p>
                <p style="margin:18px 0 0;font-size:12px;color:${colors.textMuted};">© ${new Date().getFullYear()} ${brand.name}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderFamilyInvitationEmail(
  props: FamilyInvitationEmailProps
) {
  return {
    subject: familyInvitationSubject,
    html: renderFamilyInvitationHtml(props),
    text: renderFamilyInvitationPlainText(props),
  };
}
