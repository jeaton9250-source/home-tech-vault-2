import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  const { user, error: userError } = await authenticateRequest(request);
  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "The deletion confirmation could not be read." }, { status: 400 });
  }

  if (body.confirmation !== "DELETE") {
    return NextResponse.json({ error: "Type DELETE to confirm permanent account deletion." }, { status: 400 });
  }

  const admin = createAdminClient();
  const email = user.email?.trim().toLowerCase() || "unknown";
  const scheduledFor = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: existing, error: existingError } = await admin
    .from("account_deletion_requests")
    .select("id, scheduled_for")
    .eq("user_id", user.id)
    .in("status", ["pending", "processing"])
    .maybeSingle();

  if (existingError) {
    console.error("[mobile-account-delete] lookup failed", existingError.message);
    return NextResponse.json({ error: "We couldn't start account deletion. Please try again." }, { status: 500 });
  }

  let deletionRequest = existing;
  if (!deletionRequest) {
    const { data, error } = await admin
      .from("account_deletion_requests")
      .insert({ user_id: user.id, user_email: email, source: "ios_app", scheduled_for: scheduledFor })
      .select("id, scheduled_for")
      .single();
    if (error) {
      console.error("[mobile-account-delete] request creation failed", error.message);
      return NextResponse.json({ error: "We couldn't start account deletion. Please try again." }, { status: 500 });
    }
    deletionRequest = data;

    const { error: auditError } = await admin
      .from("platform_admin_audit_events")
      .insert({
        event_type: "deletion_requested",
        actor_id: user.id,
        target_user_id: user.id,
        target_email_snapshot: email,
        reason: "User requested account deletion from the mobile app.",
        metadata: { requestId: data.id, source: "ios_app", scheduledFor: data.scheduled_for },
      });
    if (auditError) {
      console.error("[mobile-account-delete] audit creation failed", auditError.message);
    }
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ account_status: "deactivated" })
    .eq("id", user.id);
  if (profileError) {
    console.error("[mobile-account-delete] profile deactivation failed", profileError.message);
    return NextResponse.json({ error: "We couldn't secure the account for deletion. Please try again." }, { status: 500 });
  }

  await admin
    .from("device_push_tokens")
    .update({ enabled: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
    ban_duration: "720h",
  });
  if (authError) {
    console.error("[mobile-account-delete] auth deactivation failed", authError.message);
    return NextResponse.json({ error: "We couldn't secure the account for deletion. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    requested: true,
    requestId: deletionRequest.id,
    scheduledFor: deletionRequest.scheduled_for,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
