import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type NoteBody = {
  body?: string;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession();

    const { id } = await context.params;
    const payload = (await request.json()) as NoteBody;
    const body = payload.body?.trim() || "";

    if (body.length < 2 || body.length > 5000) {
      return NextResponse.json(
        {
          error:
            "Notes must be between 2 and 5,000 characters.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: ticket,
      error: ticketError,
    } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (ticketError) {
      throw ticketError;
    }

    if (!ticket) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    const {
      data: note,
      error: noteError,
    } = await supabase
      .from("support_ticket_notes")
      .insert({
        ticket_id: id,
        author_id: session.userId,
        body,
      })
      .select(
        "id, ticket_id, author_id, body, created_at"
      )
      .single();

    if (noteError) {
      throw noteError;
    }

    return NextResponse.json({
      note,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Support ticket note error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to save internal note." },
      { status: 500 }
    );
  }
}
