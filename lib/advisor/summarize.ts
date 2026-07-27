import "server-only";

import { buildDeterministicAdvisorSummary } from "@/lib/advisor/summaryDeterministic";
import type {
  AdvisorInsight,
  GroupedAdvisorInsights,
} from "@/lib/advisor/types";

export { buildDeterministicAdvisorSummary } from "@/lib/advisor/summaryDeterministic";

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
    return {
      summary: deterministic,
      summarySource: "deterministic",
    };
  }

  try {
    const { default: OpenAI } = await import(
      "openai"
    );
    const client = new OpenAI({ apiKey });

    const insightLines = insights.map(
      (insight) =>
        `- [${insight.group}] ${insight.message}`
    );

    const response =
      await client.chat.completions.create({
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
      });

    const aiSummary =
      response.choices[0]?.message?.content?.trim();

    if (aiSummary) {
      return {
        summary: aiSummary,
        summarySource: "ai",
      };
    }
  } catch (error) {
    console.error(
      "[home-advisor] AI summary failed:",
      error
    );
  }

  return {
    summary: deterministic,
    summarySource: "deterministic",
  };
}
