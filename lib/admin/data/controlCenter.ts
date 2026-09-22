import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdminPage } from "@/lib/auth/platformAdmin";
import { loadAdminSystemHealth } from "@/lib/admin/data/loaders";
import { loadAdminVercelAnalytics } from "@/lib/admin/data/vercelAnalytics";

/** Failed queries stay unknown: a missing table must never become a healthy zero. */
async function count(
  query: PromiseLike<{ count: number | null; error: unknown }>,
) {
  try {
    const result = await query;
    return result.error ? null : result.count;
  } catch {
    return null;
  }
}

async function rows<T>(
  query: PromiseLike<{ data: T[] | null; error: unknown }>,
) {
  try {
    const result = await query;
    return result.error ? null : result.data;
  } catch {
    return null;
  }
}

export async function loadAdminControlCenter() {
  // Check access before starting any service-role queries (layouts render in parallel).
  const session = await requirePlatformAdminPage();
  const admin = createAdminClient();
  const now = new Date();
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const since = new Date(now.getTime() - 7 * 86400000).toISOString();
  const hourAgo = new Date(now.getTime() - 3600000).toISOString();
  const exact = (table: string) =>
    admin.from(table).select("*", { count: "exact", head: true });

  const [
    users,
    devices,
    households,
    documents,
    newUsers,
    paid,
    support,
    completed,
    skipped,
    incomplete,
    emailSent,
    emailFailed,
    imports,
    connectors,
    staleConnectors,
    checks,
    checksToday,
    redditChecks,
    signups,
    tickets,
    health,
    traffic,
    profile,
  ] = await Promise.all([
    count(exact("profiles")),
    count(exact("devices")),
    count(exact("households")),
    count(exact("documents")),
    count(exact("profiles").gte("created_at", today.toISOString())),
    count(
      exact("user_subscriptions")
        .in("plan", ["pro", "family"])
        .in("status", ["active", "trialing"]),
    ),
    count(
      exact("support_tickets").in("status", [
        "new",
        "open",
        "in_progress",
        "waiting_on_customer",
      ]),
    ),
    count(exact("profiles").not("onboarding_completed_at", "is", null)),
    count(
      exact("profiles")
        .is("onboarding_completed_at", null)
        .not("onboarding_skipped_at", "is", null),
    ),
    count(
      exact("profiles")
        .is("onboarding_completed_at", null)
        .is("onboarding_skipped_at", null),
    ),
    count(
      exact("lifecycle_email_log")
        .eq("status", "sent")
        .gte("attempted_at", since),
    ),
    count(
      exact("lifecycle_email_log")
        .eq("status", "failed")
        .gte("attempted_at", since),
    ),
    count(exact("device_imports").eq("status", "pending")),
    count(
      exact("connector_installations")
        .eq("status", "active")
        .is("revoked_at", null),
    ),
    count(
      exact("connector_installations")
        .eq("status", "active")
        .is("revoked_at", null)
        .or(`last_seen_at.is.null,last_seen_at.lt.${hourAgo}`),
    ),
    count(exact("health_check_completions")),
    count(
      exact("health_check_completions").gte(
        "completed_at",
        today.toISOString(),
      ),
    ),
    count(exact("health_check_completions").ilike("source", "reddit")),
    rows(
      admin
        .from("profiles")
        .select(
          "id, full_name, created_at, onboarding_completed_at, onboarding_skipped_at",
        )
        .order("created_at", { ascending: false })
        .limit(6),
    ),
    rows(
      admin
        .from("support_tickets")
        .select("id, subject, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ),
    loadAdminSystemHealth().catch(() => null),
    loadAdminVercelAnalytics(),
    admin
      .from("profiles")
      .select("full_name")
      .eq("id", session.userId)
      .maybeSingle(),
  ]);
  return {
    capturedAt: now.toISOString(),
    firstName: profile.data?.full_name?.trim().split(/\s+/)[0] || "Jason",
    users,
    devices,
    households,
    documents,
    newUsers,
    paid,
    support,
    completed,
    skipped,
    incomplete,
    emailSent,
    emailFailed,
    imports,
    connectors,
    staleConnectors,
    checks,
    checksToday,
    redditChecks,
    signups,
    tickets,
    health,
    traffic,
    notionConfigured: Boolean(
      process.env.NOTION_TOKEN && process.env.NOTION_ONBOARDING_DATA_SOURCE_ID,
    ),
    inboundConfigured: Boolean(
      process.env.RESEND_API_KEY && process.env.RESEND_WEBHOOK_SECRET,
    ),
  };
}
