import {
  ADVISOR_MAX_INSIGHTS,
  ADVISOR_MIN_INSIGHTS,
} from "@/lib/advisor/constants";
import {
  ensureAdvisorCoverage,
  runAdvisorRules,
} from "@/lib/advisor/rules";
import type {
  AdvisorInsight,
  AdvisorInsightGroup,
  GroupedAdvisorInsights,
  HomeAdvisorContext,
} from "@/lib/advisor/types";

const GROUP_PRIORITY: Record<
  AdvisorInsightGroup,
  number
> = {
  urgent: 0,
  attention: 1,
  suggestion: 2,
  good: 3,
};

function compareInsights(
  left: AdvisorInsight,
  right: AdvisorInsight
): number {
  const groupDelta =
    GROUP_PRIORITY[left.group] -
    GROUP_PRIORITY[right.group];

  if (groupDelta !== 0) {
    return groupDelta;
  }

  return right.priority - left.priority;
}

export function groupAdvisorInsights(
  insights: AdvisorInsight[]
): GroupedAdvisorInsights {
  const grouped: GroupedAdvisorInsights = {
    urgent: [],
    attention: [],
    suggestion: [],
    good: [],
  };

  for (const insight of insights) {
    grouped[insight.group].push(insight);
  }

  for (const group of Object.keys(
    grouped
  ) as AdvisorInsightGroup[]) {
    grouped[group].sort(compareInsights);
  }

  return grouped;
}

function dedupeInsights(
  insights: AdvisorInsight[]
): AdvisorInsight[] {
  const seen = new Set<string>();
  const deduped: AdvisorInsight[] = [];

  for (const insight of insights.sort(
    compareInsights
  )) {
    if (seen.has(insight.id)) {
      continue;
    }

    seen.add(insight.id);
    deduped.push(insight);
  }

  return deduped;
}

function trimInsights(
  insights: AdvisorInsight[]
): AdvisorInsight[] {
  const sorted = [...insights].sort(
    compareInsights
  );

  if (sorted.length <= ADVISOR_MAX_INSIGHTS) {
    return sorted.length >= ADVISOR_MIN_INSIGHTS
      ? sorted
      : sorted;
  }

  const selected: AdvisorInsight[] = [];
  const counts: Record<
    AdvisorInsightGroup,
    number
  > = {
    urgent: 0,
    attention: 0,
    suggestion: 0,
    good: 0,
  };

  for (const insight of sorted) {
    if (selected.length >= ADVISOR_MAX_INSIGHTS) {
      break;
    }

    selected.push(insight);
    counts[insight.group] += 1;
  }

  const hasGood = counts.good > 0;
  const hasActionable =
    counts.urgent + counts.attention + counts.suggestion > 0;

  if (
    hasActionable &&
    !hasGood &&
    selected.length < ADVISOR_MAX_INSIGHTS
  ) {
    const goodCandidate = sorted.find(
      (insight) =>
        insight.group === "good" &&
        !selected.some(
          (entry) => entry.id === insight.id
        )
    );

    if (goodCandidate) {
      selected.push(goodCandidate);
    }
  }

  while (
    selected.length < ADVISOR_MIN_INSIGHTS &&
    selected.length < sorted.length
  ) {
    const next = sorted.find(
      (insight) =>
        !selected.some(
          (entry) => entry.id === insight.id
        )
    );

    if (!next) {
      break;
    }

    selected.push(next);
  }

  return selected.sort(compareInsights);
}

export function buildAdvisorInsights(
  context: HomeAdvisorContext,
  options?: {
    dismissedIds?: Set<string>;
  }
): AdvisorInsight[] {
  const dismissedIds =
    options?.dismissedIds ?? new Set<string>();

  const generated = ensureAdvisorCoverage(
    context,
    runAdvisorRules(context)
  );

  const filtered = dedupeInsights(generated).filter(
    (insight) => !dismissedIds.has(insight.id)
  );

  return trimInsights(filtered);
}

export function buildAdvisorInsightPayload(
  context: HomeAdvisorContext,
  options?: {
    dismissedIds?: Set<string>;
  }
) {
  const insights = buildAdvisorInsights(
    context,
    options
  );

  return {
    insights,
    grouped: groupAdvisorInsights(insights),
  };
}
