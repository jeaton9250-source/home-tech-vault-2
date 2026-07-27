import type {
  AdvisorInsight,
  AdvisorInsightGroup,
  AdvisorInsightAction,
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

export const ADVISOR_GROUP_LABELS: Record<
  AdvisorInsightGroup,
  string
> = {
  urgent: "Critical",
  attention: "Needs Attention",
  suggestion: "Suggestions",
  good: "Everything Looks Good",
};

const HOSTNAME_SUFFIX_PATTERN =
  /\b[a-z0-9][a-z0-9-]*\.(local|lan)\b/gi;

const MAC_ADDRESS_PATTERN =
  /\b(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}\b/gi;

const GENERIC_HOSTNAME_PATTERN =
  /\b[a-z0-9][a-z0-9-]*\.[a-z]{2,}\b/gi;

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1).toLowerCase()
    )
    .join(" ");
}

function humanizeHostnameToken(token: string) {
  const cleaned = token
    .replace(/\.(local|lan)$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

  if (!cleaned) {
    return "device";
  }

  if (/^\d+$/.test(cleaned)) {
    return "device";
  }

  return titleCase(cleaned);
}

export function humanizeAdvisorText(
  text: string
): string {
  if (!text.trim()) {
    return text;
  }

  let result = text.replace(
    MAC_ADDRESS_PATTERN,
    "this device"
  );

  result = result.replace(
    HOSTNAME_SUFFIX_PATTERN,
    (match) => {
      const token = match.split(".")[0] ?? match;
      return `a ${humanizeHostnameToken(token)} device`;
    }
  );

  result = result.replace(
    GENERIC_HOSTNAME_PATTERN,
    (match) => {
      if (
        match.endsWith(".com") ||
        match.endsWith(".org") ||
        match.endsWith(".net")
      ) {
        return match;
      }

      const token = match.split(".")[0] ?? match;
      return `a ${humanizeHostnameToken(token)} device`;
    }
  );

  result = result.replace(
    /\bhostname\b/gi,
    "device name"
  );

  result = result.replace(
    /\bmac address\b/gi,
    "network identity"
  );

  return result
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function humanizeAdvisorInsight(
  insight: AdvisorInsight
): AdvisorInsight {
  return {
    ...insight,
    title: humanizeAdvisorText(insight.title),
    message: humanizeAdvisorText(
      insight.message
    ),
    actions: insight.actions.map(
      (action) =>
        humanizeAdvisorAction(action)
    ),
  };
}

function humanizeAdvisorAction(
  action: AdvisorInsightAction
): AdvisorInsightAction {
  return {
    ...action,
    label: humanizeAdvisorText(action.label),
    query: action.query
      ? humanizeAdvisorText(action.query)
      : action.query,
  };
}

export function compareAdvisorInsights(
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

export function getTopAdvisorInsights(
  insights: AdvisorInsight[],
  limit = 5
): AdvisorInsight[] {
  return [...insights]
    .sort(compareAdvisorInsights)
    .slice(0, limit);
}

export function getPrimaryAdvisorAction(
  insight: AdvisorInsight
): AdvisorInsightAction | null {
  const primary = insight.actions.find(
    (action) =>
      action.type !== "dismiss" &&
      action.type !== "ask_ai"
  );

  return primary ?? insight.actions[0] ?? null;
}

export function getAdvisorGroupIcon(
  group: AdvisorInsightGroup
): "critical" | "attention" | "suggestion" | "good" {
  return group === "urgent"
    ? "critical"
    : group;
}
