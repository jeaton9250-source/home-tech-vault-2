import "server-only";

import { buildAdvisorInsightPayload } from "@/lib/advisor/buildInsights";
import { loadHomeAdvisorContext } from "@/lib/advisor/loadHomeContext";
import {
  logAdvisorStage,
  toAdvisorDbError,
} from "@/lib/advisor/logging";
import { buildDeterministicAdvisorSummary } from "@/lib/advisor/summaryDeterministic";
import { summarizeAdvisorInsights } from "@/lib/advisor/summarize";
import type { HomeAdvisorResult } from "@/lib/advisor/types";

export async function buildHomeAdvisorResult(
  client: Parameters<
    typeof loadHomeAdvisorContext
  >[0],
  userId: string,
  options?: {
    householdId?: string | null;
    householdOwnerId?: string | null;
    dismissedIds?: Set<string>;
    now?: Date;
    skipAiSummary?: boolean;
  }
): Promise<HomeAdvisorResult> {
  logAdvisorStage(
    "context.load.start",
    "context"
  );

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

  logAdvisorStage("rules.generate.start", "rules");

  const { insights, grouped } =
    buildAdvisorInsightPayload(context, {
      dismissedIds: options?.dismissedIds,
    });

  logAdvisorStage("rules.generate.success", "rules");

  logAdvisorStage(
    "summary.generate.start",
    "summary"
  );

  let summaryResult: {
    summary: string;
    summarySource: "deterministic" | "ai";
  };

  if (options?.skipAiSummary) {
    summaryResult = {
      summary:
        buildDeterministicAdvisorSummary(
          insights
        ),
      summarySource: "deterministic",
    };
  } else {
    try {
      summaryResult =
        await summarizeAdvisorInsights(
          insights,
          grouped
        );
    } catch (error) {
      logAdvisorStage(
        "summary.generate.error",
        "summary",
        {
          error: toAdvisorDbError(error),
        }
      );

      summaryResult = {
        summary:
          buildDeterministicAdvisorSummary(
            insights
          ),
        summarySource: "deterministic",
      };
    }
  }

  logAdvisorStage(
    "summary.generate.success",
    "summary"
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
