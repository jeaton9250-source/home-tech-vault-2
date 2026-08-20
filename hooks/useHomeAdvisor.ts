import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { usePermissions } from "@/hooks/usePermissions";
import { buildDemoHomeAdvisorResult } from "@/lib/advisor/demo";
import { groupAdvisorInsights } from "@/lib/advisor/buildInsights";
import {
  humanizeAdvisorInsight,
  humanizeAdvisorText,
} from "@/lib/advisor/presentation";
import {
  dismissAdvisorInsight,
  getAdvisorDismissStorageKey,
  loadDismissedAdvisorInsightIds,
  restoreAdvisorInsight,
} from "@/lib/advisor/clientDismiss";
import type { HomeAdvisorResult } from "@/lib/advisor/types";

function applyDismissals(
  advisor: HomeAdvisorResult,
  dismissedIds: Set<string>
): HomeAdvisorResult {
  const insights = advisor.insights.filter(
    (insight) =>
      !dismissedIds.has(insight.id)
  );

  return {
    ...advisor,
    insights,
    grouped: groupAdvisorInsights(insights),
    insightCount: insights.length,
  };
}


function compactAdvisorDashboardSummary(
  advisor: HomeAdvisorResult
): string {
  const original =
    humanizeAdvisorText(
      advisor.summary
    )
      .replace(
        /^(the most urgent tasks are|the most important tasks are)\s*:\s*/i,
        ""
      )
      .replace(
        /\s*once those are handled[^.]*\.?/gi,
        ""
      )
      .replace(
        /\s*this will restore full functionality[^.]*\.?/gi,
        ""
      )
      .replace(
        /\s*this will keep the home running smoothly[^.]*\.?/gi,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();

  const urgentCount =
    advisor.grouped.urgent.length;

  const attentionCount =
    advisor.grouped.attention.length;

  const suggestionCount =
    advisor.grouped.suggestion.length;

  /*
   * Keep genuinely concise AI copy.
   * Anything paragraph-like is replaced with
   * a short, actionable dashboard summary.
   */
  if (
    original.length > 0 &&
    original.length <= 150 &&
    !/once those are handled|restore full functionality|running smoothly/i.test(
      original
    )
  ) {
    return original;
  }

  if (urgentCount > 0) {
    if (attentionCount > 0) {
      return `Start with ${urgentCount} critical ${
        urgentCount === 1
          ? "issue"
          : "issues"
      }, then review ${attentionCount} more ${
        attentionCount === 1
          ? "item"
          : "items"
      } needing attention.`;
    }

    return `Start with the ${urgentCount} critical ${
      urgentCount === 1
        ? "issue"
        : "issues"
    } shown below.`;
  }

  if (attentionCount > 0) {
    return `Review ${attentionCount} ${
      attentionCount === 1
        ? "item"
        : "items"
    } needing attention, starting with the highest priority.`;
  }

  if (suggestionCount > 0) {
    return `Your home looks stable. Review ${suggestionCount} suggested ${
      suggestionCount === 1
        ? "improvement"
        : "improvements"
    } when convenient.`;
  }

  return "Everything looks good. No urgent action is needed.";
}

function humanizeAdvisorResult(
  advisor: HomeAdvisorResult
): HomeAdvisorResult {
  const insights = advisor.insights.map(
    humanizeAdvisorInsight
  );

  return {
    ...advisor,
    summary:
      compactAdvisorDashboardSummary(
        advisor
      ),
    insights,
    grouped: groupAdvisorInsights(insights),
    insightCount: insights.length,
  };
}

export function useHomeAdvisor() {
  const {
    user,
    isDemo,
    permissionsReady,
  } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rawAdvisor, setRawAdvisor] =
    useState<HomeAdvisorResult | null>(null);
  const [dismissedIds, setDismissedIds] =
    useState<Set<string>>(new Set());

  const storageKey = useMemo(
    () =>
      getAdvisorDismissStorageKey(
        user?.id
      ),
    [user?.id]
  );

  const loadAdvisor = useCallback(async () => {
    if (!permissionsReady) {
      return;
    }

    const dismissed =
      loadDismissedAdvisorInsightIds(
        storageKey
      );
    setDismissedIds(dismissed);

    if (isDemo || !user) {
      const fullDemo = humanizeAdvisorResult(
        buildDemoHomeAdvisorResult()
      );

      setRawAdvisor(fullDemo);
      setError("");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/advisor/insights"
      );
      const payload =
        (await response.json()) as {
          success?: boolean;
          advisor?: HomeAdvisorResult;
          error?: string;
        };

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.error ||
            "Unable to load Home Advisor."
        );
      }

      const nextAdvisor = payload.advisor
        ? humanizeAdvisorResult(
            payload.advisor
          )
        : null;

      setRawAdvisor(nextAdvisor);
    } catch (loadError) {
      console.error(
        "Unable to load Home Advisor:",
        loadError
      );
      setRawAdvisor(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load Home Advisor insights right now."
      );
    } finally {
      setLoading(false);
    }
  }, [
    isDemo,
    permissionsReady,
    storageKey,
    user,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch updates loading state after await
    void loadAdvisor();
  }, [loadAdvisor]);

  const advisor = useMemo(() => {
    if (!rawAdvisor) {
      return null;
    }

    return applyDismissals(
      rawAdvisor,
      dismissedIds
    );
  }, [rawAdvisor, dismissedIds]);

  const dismissedInsights = useMemo(() => {
    if (!rawAdvisor) {
      return [];
    }

    return rawAdvisor.insights.filter(
      (insight) =>
        dismissedIds.has(insight.id)
    );
  }, [rawAdvisor, dismissedIds]);

  const totalInsightCount =
    rawAdvisor?.insights.length ?? 0;

  const handleDismiss = useCallback(
    (insightId: string) => {
      const nextDismissed =
        dismissAdvisorInsight(
          storageKey,
          insightId
        );
      setDismissedIds(nextDismissed);
    },
    [storageKey]
  );

  const handleRestore = useCallback(
    (insightId: string) => {
      const nextDismissed =
        restoreAdvisorInsight(
          storageKey,
          insightId
        );
      setDismissedIds(nextDismissed);
    },
    [storageKey]
  );

  return {
    advisor,
    rawAdvisor,
    dismissedInsights,
    dismissedIds,
    totalInsightCount,
    loading,
    error,
    reload: loadAdvisor,
    dismissInsight: handleDismiss,
    restoreInsight: handleRestore,
  };
}
