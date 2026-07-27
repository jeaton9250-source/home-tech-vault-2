import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildAdvisorInsightPayload } from "@/lib/advisor/buildInsights";
import { loadHomeAdvisorContext } from "@/lib/advisor/loadHomeContext";
import { buildDeterministicAdvisorSummary } from "@/lib/advisor/summaryDeterministic";
import { summarizeAdvisorInsights } from "@/lib/advisor/summarize";
import type { HomeAdvisorResult } from "@/lib/advisor/types";

export async function buildHomeAdvisorResult(
  client: SupabaseClient,
  userId: string,
  options?: {
    householdId?: string | null;
    householdOwnerId?: string | null;
    dismissedIds?: Set<string>;
    now?: Date;
    skipAiSummary?: boolean;
  }
): Promise<HomeAdvisorResult> {
  const context = await loadHomeAdvisorContext(
    client,
    userId,
    {
      householdId: options?.householdId,
      householdOwnerId:
        options?.householdOwnerId,
      now: options?.now,
    }
  );

  const { insights, grouped } =
    buildAdvisorInsightPayload(context, {
      dismissedIds: options?.dismissedIds,
    });

  const summaryResult = options?.skipAiSummary
    ? {
        summary:
          buildDeterministicAdvisorSummary(
            insights
          ),
        summarySource:
          "deterministic" as const,
      }
    : await summarizeAdvisorInsights(
        insights,
        grouped
      );

  return {
    summary: summaryResult.summary,
    summarySource:
      summaryResult.summarySource,
    insights,
    grouped,
    generatedAt: context.now.toISOString(),
    insightCount: insights.length,
  };
}

export type {
  AdvisorInsight,
  AdvisorInsightAction,
  AdvisorInsightGroup,
  HomeAdvisorResult,
} from "@/lib/advisor/types";

export {
  buildAdvisorInsightPayload,
  buildAdvisorInsights,
  groupAdvisorInsights,
} from "@/lib/advisor/buildInsights";
export { loadHomeAdvisorContext } from "@/lib/advisor/loadHomeContext";
export {
  buildDeterministicAdvisorSummary,
} from "@/lib/advisor/summaryDeterministic";
export {
  summarizeAdvisorInsights,
} from "@/lib/advisor/summarize";
export {
  ensureAdvisorCoverage,
  runAdvisorRules,
} from "@/lib/advisor/rules";
