import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { buildServerPlanAccessContext } from "@/lib/permissions/serverPlanAccess";
import { loadAdminPendingInvitations } from "@/lib/admin/invitations";

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

export type AdminUserMetrics = {
  totalUsers: number;
  activeToday: number;
  pendingInvitations: number;
  proSubscribers: number;
  freeUsers: number;
  suspendedUsers: number;
  newThisWeek: number;
  newThisMonth: number;
  growthPercent: number;
  neverLoggedIn: number;
  withConnector: number;
  withoutConnector: number;
};

export async function loadAdminUserMetrics(): Promise<AdminUserMetrics> {
  const admin = createAdminClient();
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const weekStart = startOfDay(daysAgo(7)).toISOString();
  const monthStart = startOfDay(daysAgo(30)).toISOString();
  const prevMonthStart = startOfDay(daysAgo(60)).toISOString();

  const [
    profilesCount,
    activeTodayResult,
    weekCount,
    monthCount,
    prevMonthCount,
    suspendedCount,
    neverLoggedInCount,
    subscriptionsResult,
    invitations,
    connectorCount,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true }),

    admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),

    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekStart),

    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart),

    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", prevMonthStart)
      .lt("created_at", monthStart),

    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("account_status", "deactivated"),

    admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),

    admin
      .from("user_subscriptions")
      .select("user_id, plan, status"),

    loadAdminPendingInvitations(admin),

    admin
      .from("connector_installations")
      .select("household_id", { count: "exact", head: true })
      .eq("status", "active")
      .is("revoked_at", null),
  ]);

  const totalUsers = profilesCount.count ?? 0;
  const newThisMonth = monthCount.count ?? 0;
  const previousMonth = prevMonthCount.count ?? 0;

  const growthPercent =
    previousMonth > 0
      ? Math.round(
          ((newThisMonth - previousMonth) /
            previousMonth) *
            100
        )
      : newThisMonth > 0
        ? 100
        : 0;

  /*
   * Admin user metrics represent ACTUAL access,
   * not only Stripe subscriptions.
   *
   * This means complimentary admin grants and
   * inherited household access are reflected in
   * the same way as the User Directory.
   */
  let proSubscribers = 0;
  let freeUsers = 0;

  const metricUsers =
    activeTodayResult.data.users ?? [];

  const effectivePlanEntries =
    await Promise.all(
      metricUsers.map(async (user) => {
        try {
          const planAccess =
            await buildServerPlanAccessContext(
              admin,
              user.id
            );

          return {
            userId: user.id,
            effectivePlan:
              planAccess.result.effectivePlan,
          };
        } catch (error) {
          console.error(
            `Unable to resolve effective plan for user metric ${user.id}:`,
            error
          );

          const subscription =
            (subscriptionsResult.data ?? []).find(
              (row) =>
                row.user_id === user.id
            );

          const plan =
            subscription?.plan
              ?.trim()
              .toLowerCase() || "free";

          const status =
            subscription?.status
              ?.trim()
              .toLowerCase() || "inactive";

          const hasPaidAccess =
            status === "active" ||
            status === "trialing";

          return {
            userId: user.id,
            effectivePlan:
              hasPaidAccess &&
              (plan === "pro" ||
                plan === "family")
                ? plan
                : "free",
          };
        }
      })
    );

  for (const user of effectivePlanEntries) {
    if (user.effectivePlan === "pro") {
      proSubscribers += 1;
    } else if (user.effectivePlan === "free") {
      freeUsers += 1;
    }
  }

  const activeTodayUsers =
    activeTodayResult.data.users.filter((user) => {
      if (!user.last_sign_in_at) {
        return false;
      }

      return (
        new Date(user.last_sign_in_at).getTime() >=
        new Date(todayStart).getTime()
      );
    }).length;

  const neverLoggedIn =
    (neverLoggedInCount.data.users ?? []).filter(
      (user) => !user.last_sign_in_at
    ).length;

  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === "pending"
  ).length;

  const withConnector = connectorCount.count ?? 0;

  return {
    totalUsers,
    activeToday: activeTodayUsers,
    pendingInvitations,
    proSubscribers,
    freeUsers,
    suspendedUsers: suspendedCount.count ?? 0,
    newThisWeek: weekCount.count ?? 0,
    newThisMonth,
    growthPercent,
    neverLoggedIn,
    withConnector,
    withoutConnector: Math.max(
      0,
      totalUsers - withConnector
    ),
  };
}
