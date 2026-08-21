import "server-only";

import {
  createGroqClient,
  getGroqFastModel,
} from "@/lib/ai/groq";

import {
  buildDeterministicAdvisorSummary,
} from "@/lib/advisor/summaryDeterministic";

import {
  logAdvisorStage,
  toAdvisorDbError,
} from "@/lib/advisor/logging";

import type {
  AdvisorInsight,
  GroupedAdvisorInsights,
} from "@/lib/advisor/types";

export {
  buildDeterministicAdvisorSummary,
} from "@/lib/advisor/summaryDeterministic";

const ADVISOR_SUMMARY_TIMEOUT_MS =
  10_000;

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise(
    (resolve, reject) => {
      const timer =
        setTimeout(() => {
          reject(
            new Error(
              "Vault Intelligence timed out."
            )
          );
        }, timeoutMs);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    }
  );
}

export async function summarizeAdvisorInsights(
  insights: AdvisorInsight[],
  grouped: GroupedAdvisorInsights
): Promise<{
  summary: string;
  summarySource:
    | "deterministic"
    | "ai";
}> {
  const deterministic =
    buildDeterministicAdvisorSummary(
      insights
    );

  if (insights.length === 0) {
    return {
      summary: deterministic,
      summarySource:
        "deterministic",
    };
  }

  const client =
    createGroqClient();

  /*
   * AI improves the experience but is never
   * required for the Vault to function.
   */
  if (!client) {
    logAdvisorStage(
      "summary.deterministic",
      "summary"
    );

    return {
      summary: deterministic,
      summarySource:
        "deterministic",
    };
  }

  try {
    logAdvisorStage(
      "summary.ai.start",
      "summary"
    );

    const insightLines =
      insights.map(
        (insight) =>
          [
            `[${insight.group}]`,
            insight.title,
            "—",
            insight.message,
          ].join(" ")
      );

    const response =
      await withTimeout(
        client.responses.create({
          model:
            getGroqFastModel(),

          store: false,

          reasoning: {
            effort: "low",
          },

          instructions: [
            "You are Home Tech Vault Intelligence.",
            "",
            "Your job is to summarize authorized signals from a homeowner's technology vault.",
            "",
            "Use ONLY the supplied signals for claims about this homeowner.",
            "Never invent devices, warranties, receipts, dates, prices, counts, failures, or household facts.",
            "Do not claim something is broken unless the supplied signals explicitly support that.",
            "",
            "Prioritize urgent items first, then attention items.",
            "Tell the homeowner what matters most and what they should handle first.",
            "",
            "Write 1 to 3 short sentences.",
            "Use natural, calm language.",
            "Do not use markdown headings.",
            "Stay under 400 characters.",
          ].join("\n"),

          input: [
            "Authorized Vault signals:",
            "",
            insightLines.join("\n"),
            "",
            "Counts:",
            `urgent=${grouped.urgent.length}`,
            `attention=${grouped.attention.length}`,
            `suggestion=${grouped.suggestion.length}`,
            `good=${grouped.good.length}`,
          ].join("\n"),

          max_output_tokens: 220,
        }),

        ADVISOR_SUMMARY_TIMEOUT_MS
      );

    const aiSummary =
      response.output_text?.trim();

    if (aiSummary) {
      logAdvisorStage(
        "summary.ai.success",
        "summary"
      );

      return {
        summary: aiSummary,
        summarySource: "ai",
      };
    }

    logAdvisorStage(
      "summary.ai.empty",
      "summary"
    );
  } catch (error) {
    logAdvisorStage(
      "summary.ai.error",
      "summary",
      {
        error:
          toAdvisorDbError(
            error
          ),
      }
    );
  }

  logAdvisorStage(
    "summary.deterministic.fallback",
    "summary"
  );

  return {
    summary: deterministic,
    summarySource:
      "deterministic",
  };
}
