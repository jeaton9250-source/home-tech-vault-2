import { NextResponse } from "next/server";

import { getDefaultActivityTitle } from "@/lib/activity";
import {
  applyHouseholdMutationScope,
  fetchHouseholdIdForUser,
} from "@/lib/data/householdScope";
import { authenticateRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { client, user, error: userError } = await authenticateRequest(request);
  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "That care item could not be found." }, { status: 404 });
  }

  try {
    const body = await request.json() as { completed?: unknown };
    if (body.completed !== true) {
      return NextResponse.json({ error: "The care item update is not valid." }, { status: 400 });
    }

    const householdId = await fetchHouseholdIdForUser(user.id, client);
    const query = client
      .from("maintenance_tasks")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", id);
    const { data: task, error } = await applyHouseholdMutationScope(
      query,
      householdId,
      user.id,
    )
      .select("id, title, description, device_id, completed")
      .maybeSingle();

    if (error) throw error;
    if (!task) {
      return NextResponse.json({ error: "That care item could not be found." }, { status: 404 });
    }

    if (task.device_id) {
      await client.from("device_events").insert({
        device_id: task.device_id,
        user_id: user.id,
        event_type: "Maintenance",
        title: getDefaultActivityTitle("maintenance.completed", task.title),
        description: task.description ?? "Care item completed from the Home Tech Vault app.",
        event_date: new Date().toISOString(),
      });
    }

    return NextResponse.json({ id: task.id, completed: task.completed }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error(
      "[mobile-maintenance-complete] failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "We couldn't complete this care item. Please try again." }, { status: 500 });
  }
}
