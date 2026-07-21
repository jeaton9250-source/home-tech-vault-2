import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { resolveSupportSubmissionContext } from "@/lib/support/context";
import {
  getSubmitterIpHash,
  checkSupportSubmissionRateLimit,
} from "@/lib/support/rateLimit";
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
  emailWarnings?: string[];
};

function fakeSuccessResponse(email: string) {
  return NextResponse.json({
    ticketNumber: "HTV-RECEIVED",
    customerEmail: email,
  } satisfies SupportTicketResponse);
}

export async function POST(request: Request) {
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

    const supabase = await createClient();
    const admin = createAdminClient();

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
        throw existingTicketError;
      }

      if (existingTicket) {
        return NextResponse.json({
          ticketNumber: existingTicket.ticket_number,
          customerEmail: existingTicket.email,
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

    const {
      data: ticketNumber,
      error: ticketNumberError,
    } = await admin.rpc(
      "generate_support_ticket_number"
    );

    if (ticketNumberError) {
      throw ticketNumberError;
    }

    if (
      typeof ticketNumber !== "string" ||
      !ticketNumber
    ) {
      throw new Error(
        "Unable to generate support ticket number."
      );
    }

    const submittedAt = new Date().toISOString();

    const {
      data: insertedTicket,
      error: insertError,
    } = await admin
      .from("support_tickets")
      .insert({
        ticket_number: ticketNumber,
        user_id: context.userId,
        household_id: context.householdId,
        name: normalized.name,
        email: normalized.email,
        subject: normalized.subject,
        category: normalized.category,
        message: normalized.message,
        status: "new",
        priority: "normal",
        effective_plan: context.effectivePlan,
        household_role: context.householdRole,
        source_page: normalized.sourcePage,
        idempotency_key: normalized.idempotencyKey,
        submitter_ip_hash: submitterIpHash,
      })
      .select("id, ticket_number, email")
      .single();

    if (insertError) {
      console.error(
        "Support ticket insert failed:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't save your support request right now. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    const emailResult = await sendSupportTicketEmails({
      ticketId: insertedTicket.id,
      ticketNumber: insertedTicket.ticket_number,
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

    await admin
      .from("support_tickets")
      .update({
        email_delivery_status:
          emailResult.deliveryStatus,
      })
      .eq("id", insertedTicket.id);

    return NextResponse.json({
      ticketNumber: insertedTicket.ticket_number,
      customerEmail: insertedTicket.email,
      emailWarnings: emailResult.warnings,
    } satisfies SupportTicketResponse);
  } catch (error) {
    console.error(
      "Support ticket submission error:",
      error
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
