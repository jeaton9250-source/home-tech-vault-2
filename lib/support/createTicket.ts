import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { logSupportOperationError } from "@/lib/support/logging";
import { generateSupportTicketNumber } from "@/lib/support/ticketNumber";
import type { SupportSubmissionContext } from "@/lib/support/types";
import type { ValidatedSupportTicketInput } from "@/lib/support/validation";

export type SupportTicketInsertPayload = {
  ticket_number: string;
  user_id: string | null;
  household_id: string | null;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: "new";
  priority: "normal";
  effective_plan: string | null;
  household_role: string | null;
  source_page: string | null;
  idempotency_key: string | null;
  submitter_ip_hash: string | null;
};

export function buildSupportTicketInsertPayload(options: {
  ticketNumber: string;
  normalized: ValidatedSupportTicketInput;
  context: SupportSubmissionContext;
  submitterIpHash: string | null;
}): SupportTicketInsertPayload {
  return {
    ticket_number: options.ticketNumber,
    user_id: options.context.userId,
    household_id: options.context.householdId,
    name: options.normalized.name,
    email: options.normalized.email,
    subject: options.normalized.subject,
    category: options.normalized.category,
    message: options.normalized.message,
    status: "new",
    priority: "normal",
    effective_plan: options.context.effectivePlan,
    household_role: options.context.householdRole,
    source_page: options.normalized.sourcePage,
    idempotency_key:
      options.normalized.idempotencyKey,
    submitter_ip_hash:
      options.submitterIpHash,
  };
}

function isUniqueTicketNumberViolation(
  error: unknown
): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as Record<
    string,
    unknown
  >;

  return (
    record.code === "23505" &&
    typeof record.message === "string" &&
    record.message.includes("ticket_number")
  );
}

export async function insertSupportTicket(
  admin: SupabaseClient,
  payload: SupportTicketInsertPayload
) {
  const attemptInsert = async (
    ticketNumber: string
  ) =>
    admin
      .from("support_tickets")
      .insert({
        ...payload,
        ticket_number: ticketNumber,
      })
      .select("id, ticket_number, email")
      .single();

  let ticketNumber = payload.ticket_number;
  let result = await attemptInsert(
    ticketNumber
  );

  if (
    result.error &&
    isUniqueTicketNumberViolation(
      result.error
    )
  ) {
    ticketNumber =
      await generateSupportTicketNumber(
        admin
      );
    result = await attemptInsert(ticketNumber);
  }

  if (result.error) {
    logSupportOperationError(
      "support_tickets.insert",
      result.error,
      {
        category: payload.category,
        authenticated: Boolean(payload.user_id),
      }
    );
  }

  return result;
}
