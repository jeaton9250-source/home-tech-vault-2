import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminDashboardMetrics,
  AdminRecentSignup,
  AdminRecentSupportActivity,
  AdminRecentUpgrade,
} from "@/lib/admin/types";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export async function loadAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const admin = createAdminClient();
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const weekStart = startOfDay(
    daysAgo(7)
  ).toISOString();

  const [
    profilesCount,
    householdsCount,
    subscriptionsResult,
    supportOpenResult,
    supportNewResult,
    recentTicketsResult,
    recentProfilesResult,
    recentSubscriptionsResult,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    admin
      .from("households")
      .select("id", {
        count: "exact",
        head: true,
      }),

    admin
      .from("user_subscriptions")
      .select("user_id, plan, status, updated_at"),

    admin
      .from("support_tickets")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("status", [
        "new",
        "open",
        "in_progress",
        "waiting_on_customer",
      ]),

    admin
      .from("support_tickets")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte(
        "created_at",
        todayStart
      ),

    admin
      .from("support_tickets")
      .select(
        "id, ticket_number, subject, status, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(8),

    admin
      .from("profiles")
      .select("id, full_name, created_at")
      .order("created_at", {
        ascending: false,
      })
      .limit(8),

    admin
      .from("user_subscriptions")
      .select(
        "user_id, plan, status, current_period_end"
      )
      .in("plan", ["pro", "family"])
      .order("current_period_end", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(8),
  ]);

  const subscriptions =
    subscriptionsResult.data ?? [];

  const activeStatuses = new Set([
    "active",
    "trialing",
  ]);

  let freeUsers = 0;
  let proUsers = 0;
  let familyUsers = 0;
  let activeSubscriptions = 0;

  for (const row of subscriptions) {
    const plan =
      row.plan?.trim().toLowerCase() ||
      "free";
    const status =
      row.status?.trim().toLowerCase() ||
      "inactive";

    if (activeStatuses.has(status)) {
      activeSubscriptions += 1;
    }

    if (plan === "family") {
      familyUsers += 1;
    } else if (plan === "pro") {
      proUsers += 1;
    } else {
      freeUsers += 1;
    }
  }

  const profileIds =
    recentProfilesResult.data?.map(
      (profile) => profile.id
    ) ?? [];

  const authUsers = await Promise.all(
    profileIds.map(async (id) => {
      const { data, error } =
        await admin.auth.admin.getUserById(id);

      if (error) {
        return null;
      }

      return data.user;
    })
  );

  const emailById = new Map(
    authUsers
      .filter(Boolean)
      .map((user) => [
        user!.id,
        user!.email ?? null,
      ])
  );

  const recentSignups: AdminRecentSignup[] =
    (recentProfilesResult.data ?? []).map(
      (profile) => ({
        id: profile.id,
        email:
          emailById.get(profile.id) ?? null,
        fullName:
          profile.full_name?.trim() || null,
        createdAt: profile.created_at,
      })
    );

  const upgradeUserIds =
    recentSubscriptionsResult.data?.map(
      (row) => row.user_id
    ) ?? [];

  const upgradeEmails = await Promise.all(
    upgradeUserIds.map(async (id) => {
      const { data } =
        await admin.auth.admin.getUserById(id);
      return {
        id,
        email: data.user?.email ?? null,
      };
    })
  );

  const upgradeEmailMap = new Map(
    upgradeEmails.map((entry) => [
      entry.id,
      entry.email,
    ])
  );

  const recentUpgrades: AdminRecentUpgrade[] =
    (recentSubscriptionsResult.data ?? []).map(
      (row) => ({
        userId: row.user_id,
        email:
          upgradeEmailMap.get(row.user_id) ??
          null,
        plan: row.plan,
        status: row.status,
        updatedAt:
          row.current_period_end ?? null,
      })
    );

  const recentSupportActivity: AdminRecentSupportActivity[] =
    (recentTicketsResult.data ?? []).map(
      (ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.created_at,
      })
    );

  const systemWarnings: string[] = [];

  if (!process.env.RESEND_API_KEY) {
    systemWarnings.push(
      "Resend API key is not configured."
    );
  }

  if (!process.env.SUPPORT_EMAIL_TO) {
    systemWarnings.push(
      "Support destination email is not configured."
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    systemWarnings.push(
      "Stripe webhook secret is not configured."
    );
  }

  let newUsersToday = 0;
  let newUsersThisWeek = 0;

  for (const signup of recentSignups) {
    const createdAt = new Date(
      signup.createdAt
    );

    if (createdAt >= startOfDay(now)) {
      newUsersToday += 1;
    }

    if (createdAt >= startOfDay(daysAgo(7))) {
      newUsersThisWeek += 1;
    }
  }

  if (recentSignups.length >= 8) {
    const { count: weekCount } = await admin
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte("created_at", weekStart);

    const { count: todayCount } = await admin
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte("created_at", todayStart);

    newUsersToday = todayCount ?? newUsersToday;
    newUsersThisWeek =
      weekCount ?? newUsersThisWeek;
  }

  return {
    totalUsers: profilesCount.count ?? 0,
    newUsersToday,
    newUsersThisWeek,
    activeSubscriptions,
    freeUsers,
    proUsers,
    familyUsers,
    totalHouseholds:
      householdsCount.count ?? 0,
    openSupportTickets:
      supportOpenResult.count ?? 0,
    newSupportTickets:
      supportNewResult.count ?? 0,
    recentSignups,
    recentUpgrades,
    recentSupportActivity,
    systemWarnings,
  };
}
