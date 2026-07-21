export { emailBrand } from "@/lib/emails/brand";
export {
  authEmailTemplates,
  getAuthEmailTemplate,
  supabaseVars,
  type AuthEmailTemplateDefinition,
} from "@/lib/emails/auth-templates";
export { renderEmailButton } from "@/lib/emails/components/button";
export {
  renderEmailCard,
  renderEmailParagraphs,
  renderFallbackLink,
  renderOtpBlock,
  renderSecurityNote,
} from "@/lib/emails/components/card";
export { renderEmailFooter } from "@/lib/emails/components/footer";
export { renderEmailHeader } from "@/lib/emails/components/header";
export { renderAuthEmailLayout } from "@/lib/emails/components/layout";
export {
  renderAuthEmailHtml,
  renderAuthEmailText,
} from "@/lib/emails/render-auth-email";
export { emailStyles, escapeHtml } from "@/lib/emails/utils";
