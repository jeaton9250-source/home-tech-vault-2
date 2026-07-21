export {
  getEmailFromAddress,
  getEmailReplyToAddress,
  getSupportEmailTo,
  getResendApiKey,
  isResendConfigured,
  getResendClient,
} from "@/lib/email/resend";

export {
  renderEmail,
  renderEmailHtml,
  renderEmailText,
} from "@/lib/email/renderEmail";

export {
  sendEmail,
  sendReactEmail,
} from "@/lib/email/sendEmail";

export type {
  EmailRecipient,
  EmailTag,
  SendEmailFailure,
  SendEmailInput,
  SendEmailResult,
  SendEmailSuccess,
  SendReactEmailInput,
} from "@/lib/email/types";

export {
  isValidEmailAddress,
  normalizeRecipients,
  validateRecipients,
} from "@/lib/email/types";
