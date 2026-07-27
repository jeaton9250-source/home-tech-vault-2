import type { AdvisorInsight } from "@/lib/advisor/types";

function joinWithAnd(items: string[]): string {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function lowercaseFirst(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function buildDeterministicAdvisorSummary(
  insights: AdvisorInsight[]
): string {
  if (insights.length === 0) {
    return "Add devices and documents to your vault to receive personalized home technology insights.";
  }

  const urgent = insights.filter(
    (insight) => insight.group === "urgent"
  );
  const attention = insights.filter(
    (insight) => insight.group === "attention"
  );
  const suggestion = insights.filter(
    (insight) => insight.group === "suggestion"
  );
  const good = insights.filter(
    (insight) => insight.group === "good"
  );

  const parts: string[] = [];

  if (
    urgent.length === 0 &&
    attention.length === 0 &&
    suggestion.length === 0 &&
    good.length > 0
  ) {
    return joinWithAnd(
      good.slice(0, 2).map((insight) => insight.message)
    );
  }

  if (
    urgent.length === 0 &&
    attention.length === 0
  ) {
    parts.push(
      "Overall your home technology is in good shape"
    );
  } else if (urgent.length > 0) {
    parts.push(
      "Your home technology needs immediate attention"
    );
  } else {
    parts.push(
      "Your home technology is mostly healthy, with a few items to review"
    );
  }

  const detailCandidates = [
    ...urgent,
    ...attention,
    ...suggestion,
  ]
    .slice(0, 3)
    .map((insight) => lowercaseFirst(insight.message));

  if (
    detailCandidates.length < 3 &&
    good.length > 0
  ) {
    detailCandidates.push(
      lowercaseFirst(good[0].message)
    );
  }

  if (detailCandidates.length > 0) {
    parts.push(joinWithAnd(detailCandidates));
  } else if (good.length > 0) {
    parts.push(
      lowercaseFirst(good[0].message)
    );
  }

  return `${parts.join(". ")}.`;
}
