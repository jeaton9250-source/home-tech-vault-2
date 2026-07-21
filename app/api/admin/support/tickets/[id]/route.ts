import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createClient } from "@/lib/supabase/server";
import {
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUSES,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "@/lib/support/types";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type TicketPatchBody = {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  markViewed?: boolean;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    await requirePlatformAdminSession();

    const { id } = await context.params;
    const supabase = await createClient();

    const [
      ticketResult,
      notesResult,
    ] = await Promise.all([
      supabase
        .from("support_tickets")
        .select("*")
        .eq("id", id)
        .maybeSingle(),

      supabase
        .from("support_ticket_notes")
        .select(
          "id, ticket_id, author_id, body, created_at"
        )
        .eq("ticket_id", id)
        .order("created_at", {
          ascending: true,
        }),
    ]);

    if (ticketResult.error) {
      throw ticketResult.error;
    }

    if (!ticketResult.data) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    if (notesResult.error) {
      throw notesResult.error;
    }

    return NextResponse.json({
      ticket: ticketResult.data,
      notes: notesResult.data ?? [],
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Support ticket detail error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load support ticket." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession();

    const { id } = await context.params;
    const body = (await request.json()) as TicketPatchBody;
    const supabase = await createClient();

    const updates: Record<string, unknown> = {};

    if (body.status) {
      if (
        !SUPPORT_TICKET_STATUSES.includes(
          body.status
        )
      ) {
        return NextResponse.json(
          { error: "Invalid ticket status." },
          { status: 400 }
        );
      }

      updates.status = body.status;
    }

    if (body.priority) {
      if (
        !SUPPORT_TICKET_PRIORITIES.includes(
          body.priority
        )
      ) {
        return NextResponse.json(
          { error: "Invalid ticket priority." },
          { status: 400 }
        );
      }

      updates.priority = body.priority;
    }

    if (body.markViewed === true) {
      updates.admin_viewed_at =
        new Date().toISOString();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("support_tickets")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    console.info(
      "[support] ticket updated",
      {
        ticketId: id,
        adminId: session.userId,
        updates,
      }
    );

    return NextResponse.json({
      ticket: data,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Support ticket update error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to update support ticket." },
      { status: 500 }
    );
  }
}
