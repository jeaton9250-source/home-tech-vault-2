import "server-only";

import { buildDeterministicAdvisorSummary } from "@/lib/advisor/summaryDeterministic";
import {
  logAdvisorStage,
  toAdvisorDbError,
} from "@/lib/advisor/logging";
import type {
  AdvisorInsight,
  GroupedAdvisorInsights,
} from "@/lib/advisor/types";

export { buildDeterministicAdvisorSummary } from "@/lib/advisor/summaryDeterministic";

const ADVISOR_SUMMARY_TIMEOUT_MS = 8_000;

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          "Advisor summary timed out."
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
  });
}

export async function summarizeAdvisorInsights(
  insights: AdvisorInsight[],
  grouped: GroupedAdvisorInsights
): Promise<{
  summary: string;
  summarySource: "deterministic" | "ai";
}> {
  const deterministic =
    buildDeterministicAdvisorSummary(insights);

  const apiKey =
    process.env.OPENAI_API_KEY?.trim();

  if (!apiKey || insights.length === 0) {
    logAdvisorStage(
      "summary.deterministic",
      "summary"
    );

    return {
      summary: deterministic,
      summarySource: "deterministic",
    };
  }

  try {
    logAdvisorStage("summary.ai.start", "summary");

    const { default: OpenAI } = await import(
      "openai"
    );
    const client = new OpenAI({ apiKey });

    const insightLines = insights.map(
      (insight) =>
        `- [${insight.group}] ${insight.message}`
    );

    const response = await withTimeout(
      client.chat.completions.create({
        model:
          process.env.OPENAI_ADVISOR_MODEL?.trim() ||
          "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content:
              "You summarize home technology insights for a homeowner dashboard. Use only the provided insight lines. Do not invent devices, dates, counts, or recommendations. Write one concise paragraph under 280 characters.",
          },
          {
            role: "user",
            content: [
              "Summarize these authorized Home Tech Vault insights:",
              insightLines.join("\n"),
              "",
              `Counts: urgent=${grouped.urgent.length}, attention=${grouped.attention.length}, suggestion=${grouped.suggestion.length}, good=${grouped.good.length}`,
            ].join("\n"),
          },
        ],
      }),
      ADVISOR_SUMMARY_TIMEOUT_MS
    );

    const aiSummary =
      response.choices[0]?.message?.content?.trim();

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
    logAdvisorStage("summary.ai.error", "summary", {
      error: toAdvisorDbError(error),
    });
  }

  logAdvisorStage(
    "summary.deterministic.fallback",
    "summary"
  );

  return {
    summary: deterministic,
    summarySource: "deterministic",
  };
}
