import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSupportAdminClient } from "@/lib/support/adminClient";
import {
  buildSupportTicketInsertPayload,
  insertSupportTicket,
} from "@/lib/support/createTicket";
import { resolveSupportSubmissionContext } from "@/lib/support/context";
import { logSupportOperationError } from "@/lib/support/logging";
import {
  getSubmitterIpHash,
  checkSupportSubmissionRateLimit,
} from "@/lib/support/rateLimit";
import { generateSupportTicketNumber } from "@/lib/support/ticketNumber";
import { sendSupportTicketEmails } from "@/lib/support/sendSupportEmails";
import {
  normalizeSupportInput,
  validateSupportTicketInput,
  type SupportTicketInput,
} from "@/lib/support/validation";

export const runtime = "nodejs";

type SupportTicketResponse = {
  ticketNumber: string;
  customerEmail: string;
  emailConfirmationSent: boolean;
  emailWarnings?: string[];
};

function fakeSuccessResponse(email: string) {
  return NextResponse.json({
    ticketNumber: "HTV-RECEIVED",
    customerEmail: email,
    emailConfirmationSent: true,
  } satisfies SupportTicketResponse);
}

function configurationErrorResponse(
  code: "missing_supabase_url" | "missing_service_role_key"
) {
  logSupportOperationError(
    "support_tickets.configuration",
    new Error(code),
    { code }
  );

  return NextResponse.json(
    {
      error:
        "We couldn't save your support request right now. Please try again in a moment.",
    },
    { status: 500 }
  );
}

export async function POST(request: Request) {
  const submittedAt = new Date().toISOString();

  try {
    const body = (await request.json()) as SupportTicketInput;
    const normalized = normalizeSupportInput(body);

    if (normalized.honeypot) {
      return fakeSuccessResponse(normalized.email);
    }

    const validation =
      validateSupportTicketInput(normalized);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    const adminResult = getSupportAdminClient();

    if (!adminResult.ok) {
      return configurationErrorResponse(
        adminResult.code
      );
    }

    const admin = adminResult.admin;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const submitterIpHash =
      getSubmitterIpHash(request);

    if (normalized.idempotencyKey) {
      const {
        data: existingTicket,
        error: existingTicketError,
      } = await admin
        .from("support_tickets")
        .select(
          "ticket_number, email, email_delivery_status"
        )
        .eq(
          "idempotency_key",
          normalized.idempotencyKey
        )
        .maybeSingle();

      if (existingTicketError) {
        logSupportOperationError(
          "support_tickets.idempotency_lookup",
          existingTicketError,
          {
            authenticated: Boolean(user),
            category: normalized.category,
          }
        );
        throw existingTicketError;
      }

      if (existingTicket) {
        const deliveryStatus =
          existingTicket.email_delivery_status as
            | {
                confirmation?: string;
              }
            | null
            | undefined;

        return NextResponse.json({
          ticketNumber: existingTicket.ticket_number,
          customerEmail: existingTicket.email,
          emailConfirmationSent:
            deliveryStatus?.confirmation ===
            "sent",
          emailWarnings: [],
        } satisfies SupportTicketResponse);
      }
    }

    const rateLimit =
      await checkSupportSubmissionRateLimit(
        admin,
        normalized.email,
        submitterIpHash
      );

    if (!rateLimit.allowed) {
      if (
        rateLimit.reason ===
          "duplicate_submission" &&
        rateLimit.existingTicketNumber
      ) {
        return NextResponse.json({
          ticketNumber:
            rateLimit.existingTicketNumber,
          customerEmail: normalized.email,
          emailConfirmationSent: true,
          emailWarnings: [],
        } satisfies SupportTicketResponse);
      }

      return NextResponse.json(
        {
          error:
            "Too many support requests were submitted recently. Please wait a few minutes and try again.",
        },
        { status: 429 }
      );
    }

    const context =
      await resolveSupportSubmissionContext(
        admin,
        {
          userId: user?.id ?? null,
          isDemo: normalized.isDemo,
        }
      );

    const ticketNumber =
      await generateSupportTicketNumber(
        admin
      );

    const insertPayload =
      buildSupportTicketInsertPayload({
        ticketNumber,
        normalized,
        context,
        submitterIpHash,
      });

    const {
      data: insertedTicket,
      error: insertError,
    } = await insertSupportTicket(
      admin,
      insertPayload
    );

    if (insertError || !insertedTicket) {
      return NextResponse.json(
        {
          error:
            "We couldn't save your support request right now. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    let emailWarnings: string[] = [];
    let emailConfirmationSent = false;
    let deliveryStatus: Record<string, string> =
      {
        internal: "not_attempted",
        confirmation: "not_attempted",
      };

    try {
      const emailResult =
        await sendSupportTicketEmails({
          ticketId: insertedTicket.id,
          ticketNumber:
            insertedTicket.ticket_number,
          customerName: normalized.name,
          customerEmail: normalized.email,
          subject: normalized.subject,
          category: normalized.category,
          message: normalized.message,
          isSignedIn: context.isSignedIn,
          effectivePlan: context.effectivePlan,
          householdRole: context.householdRole,
          sourcePage: normalized.sourcePage,
          submittedAt,
        });

      emailWarnings = emailResult.warnings;
      deliveryStatus =
        emailResult.deliveryStatus;
      emailConfirmationSent =
        emailResult.deliveryStatus
          .confirmation === "sent";
    } catch (emailError) {
      logSupportOperationError(
        "support_tickets.email_delivery",
        emailError,
        {
          ticketId: insertedTicket.id,
          ticketNumber:
            insertedTicket.ticket_number,
          authenticated: context.isSignedIn,
          category: normalized.category,
        }
      );

      emailWarnings = [
        "Email delivery failed after the ticket was saved.",
      ];
      deliveryStatus = {
        internal: "failed",
        confirmation: "failed",
      };
    }

    const { error: deliveryUpdateError } =
      await admin
        .from("support_tickets")
        .update({
          email_delivery_status:
            deliveryStatus,
        })
        .eq("id", insertedTicket.id);

    if (deliveryUpdateError) {
      logSupportOperationError(
        "support_tickets.email_delivery_status_update",
        deliveryUpdateError,
        {
          ticketId: insertedTicket.id,
          ticketNumber:
            insertedTicket.ticket_number,
        }
      );
    }

    return NextResponse.json({
      ticketNumber: insertedTicket.ticket_number,
      customerEmail: insertedTicket.email,
      emailConfirmationSent,
      emailWarnings,
    } satisfies SupportTicketResponse);
  } catch (error) {
    logSupportOperationError(
      "support_tickets.submit",
      error,
      {
        timestamp: submittedAt,
      }
    );

    return NextResponse.json(
      {
        error:
          "We couldn't save your support request right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
