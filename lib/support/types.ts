export const SUPPORT_TICKET_STATUSES = [
  "new",
  "open",
  "waiting_on_customer",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type SupportTicketStatus =
  (typeof SUPPORT_TICKET_STATUSES)[number];

export const SUPPORT_TICKET_PRIORITIES = [
  "low",
  "normal",
  "high",
  "urgent",
] as const;

export type SupportTicketPriority =
  (typeof SUPPORT_TICKET_PRIORITIES)[number];

export type SupportTicketRecord = {
  id: string;
  ticket_number: string;
  user_id: string | null;
  household_id: string | null;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  assigned_to: string | null;
  effective_plan: string | null;
  household_role: string | null;
  source_page: string | null;
  admin_viewed_at: string | null;
  idempotency_key: string | null;
  email_delivery_status: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type SupportTicketNoteRecord = {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type SupportSubmissionContext = {
  userId: string | null;
  householdId: string | null;
  effectivePlan: string | null;
  householdRole: string | null;
  isSignedIn: boolean;
};

export type CreateSupportTicketResult = {
  ok: true;
  ticketNumber: string;
  ticketId: string;
  customerEmail: string;
  emailWarnings: string[];
};

export type CreateSupportTicketFailure = {
  ok: false;
  code:
    | "validation_error"
    | "rate_limited"
    | "duplicate_submission"
    | "database_error";
  message: string;
};
