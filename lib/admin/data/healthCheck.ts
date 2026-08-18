import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type AdminHealthCheckMetrics = {
  totalCompleted: number;
  completedToday: number;
  averageScore: number;
  redditCompleted: number;
};

const EMPTY_METRICS: AdminHealthCheckMetrics = {
  totalCompleted: 0,
  completedToday: 0,
  averageScore: 0,
  redditCompleted: 0,
};

function startOfUtcDay() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  ).toISOString();
}

export async function loadAdminHealthCheckMetrics():
  Promise<AdminHealthCheckMetrics> {
  const admin = createAdminClient();

  const [
    allResult,
    todayResult,
    redditResult,
  ] = await Promise.all([
    admin
      .from("health_check_completions")
      .select("score"),

    admin
      .from("health_check_completions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .gte(
        "completed_at",
        startOfUtcDay()
      ),

    admin
      .from("health_check_completions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .ilike("source", "reddit"),
  ]);

  const firstError =
    allResult.error ||
    todayResult.error ||
    redditResult.error;

  if (firstError) {
    // Keep the founder dashboard usable before or
    // during migration rollout.
    console.warn(
      "[admin-health-check] analytics unavailable:",
      firstError.message
    );

    return EMPTY_METRICS;
  }

  const scores = (allResult.data ?? [])
    .map((row) => Number(row.score))
    .filter(Number.isFinite);

  const totalCompleted = scores.length;

  const averageScore =
    totalCompleted > 0
      ? Math.round(
          scores.reduce(
            (sum, score) => sum + score,
            0
          ) / totalCompleted
        )
      : 0;

  return {
    totalCompleted,
    completedToday:
      todayResult.count ?? 0,
    averageScore,
    redditCompleted:
      redditResult.count ?? 0,
  };
}
