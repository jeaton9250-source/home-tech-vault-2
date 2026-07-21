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
import { isSupportCategory } from "@/lib/support/categories";

export const runtime = "nodejs";

function parseTicketFilters(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("q")?.trim() || "";
  const status = url.searchParams.get("status")?.trim() || "";
  const category =
    url.searchParams.get("category")?.trim() || "";
  const priority =
    url.searchParams.get("priority")?.trim() || "";
  const sort =
    url.searchParams.get("sort") === "oldest"
      ? "oldest"
      : "newest";

  return {
    search,
    status,
    category,
    priority,
    sort,
  };
}

export async function GET(request: Request) {
  try {
    await requirePlatformAdminSession();

    const filters = parseTicketFilters(request);
    const supabase = await createClient();

    let query = supabase
      .from("support_tickets")
      .select(
        "id, ticket_number, name, email, subject, category, status, priority, admin_viewed_at, created_at, updated_at, resolved_at, effective_plan, household_role, source_page"
      );

    if (
      filters.status &&
      SUPPORT_TICKET_STATUSES.includes(
        filters.status as SupportTicketStatus
      )
    ) {
      query = query.eq("status", filters.status);
    }

    if (
      filters.priority &&
      SUPPORT_TICKET_PRIORITIES.includes(
        filters.priority as SupportTicketPriority
      )
    ) {
      query = query.eq(
        "priority",
        filters.priority
      );
    }

    if (
      filters.category &&
      isSupportCategory(filters.category)
    ) {
      query = query.eq(
        "category",
        filters.category
      );
    }

    if (filters.search) {
      const sanitized = filters.search
        .replace(/[%_,]/g, " ")
        .trim();

      if (sanitized) {
        const term = `%${sanitized}%`;
        query = query.or(
          `ticket_number.ilike.${term},name.ilike.${term},email.ilike.${term},subject.ilike.${term}`
        );
      }
    }

    query = query.order("created_at", {
      ascending: filters.sort === "oldest",
    });

    const { data, error } = await query.limit(200);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      tickets: data ?? [],
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Support inbox list error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load support tickets." },
      { status: 500 }
    );
  }
}
