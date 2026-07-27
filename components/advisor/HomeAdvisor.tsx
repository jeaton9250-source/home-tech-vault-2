"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdvisorInsightCard from "@/components/advisor/AdvisorInsightCard";
import { ADVISOR_GROUP_LABELS } from "@/lib/advisor/presentation";
import PageCard from "@/components/ui/PageCard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { usePermissions } from "@/hooks/usePermissions";
import { buildDemoHomeAdvisorResult } from "@/lib/advisor/demo";
import { groupAdvisorInsights } from "@/lib/advisor/buildInsights";
import {
  dismissAdvisorInsight,
  getAdvisorDismissStorageKey,
  loadDismissedAdvisorInsightIds,
} from "@/lib/advisor/clientDismiss";
import type {
  AdvisorInsightGroup,
  HomeAdvisorResult,
} from "@/lib/advisor/types";

const GROUP_ORDER: AdvisorInsightGroup[] = [
  "urgent",
  "attention",
  "suggestion",
  "good",
];

export default function HomeAdvisor() {
  const {
    user,
    isDemo,
    permissionsReady,
  } = usePermissions();
  const { openWithQuery } = useAIAdvisor();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [advisor, setAdvisor] =
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
      setAdvisor(
        buildDemoHomeAdvisorResult({
          dismissedIds: dismissed,
        })
      );
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

      const nextAdvisor = payload.advisor ?? null;

      if (nextAdvisor) {
        nextAdvisor.insights =
          nextAdvisor.insights.filter(
            (insight) =>
              !dismissed.has(insight.id)
          );
        nextAdvisor.grouped =
          groupAdvisorInsights(
            nextAdvisor.insights
          );
        nextAdvisor.insightCount =
          nextAdvisor.insights.length;
      }

      setAdvisor(nextAdvisor);
    } catch (loadError) {
      console.error(
        "Unable to load Home Advisor:",
        loadError
      );
      setAdvisor(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load Home Advisor."
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
    // Data fetch on mount — standard client dashboard pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch updates loading state after await
    void loadAdvisor();
  }, [loadAdvisor]);

  const handleDismiss = useCallback(
    (insightId: string) => {
      const nextDismissed =
        dismissAdvisorInsight(
          storageKey,
          insightId
        );
      setDismissedIds(nextDismissed);
      setAdvisor((current) => {
        if (!current) {
          return current;
        }

        const insights =
          current.insights.filter(
            (insight) =>
              insight.id !== insightId
          );

        return {
          ...current,
          insights,
          grouped: groupAdvisorInsights(
            insights
          ),
          insightCount: insights.length,
        };
      });
    },
    [storageKey]
  );

  if (loading) {
    return (
      <PageCard inset>
        <DashboardSkeleton />
      </PageCard>
    );
  }

  if (error) {
    return (
      <PageCard className="border-danger/20 bg-danger-soft/20">
        <p className="text-sm text-danger">
          {error}
        </p>
      </PageCard>
    );
  }

  if (!advisor) {
    return null;
  }

  return (
    <PageCard
      className="border-section-home-health/20 bg-gradient-to-br from-surface-card via-surface-card to-section-home-health-soft/20"
      data-tour="home-advisor"
    >
      <div className="space-y-2">
        <p className="text-overline text-home-health">
          Home Advisor
        </p>
        <h2 className="text-section-title text-text-primary">
          🏡 Home Advisor
        </h2>
        <p className="text-sm text-text-secondary">
          Your AI-powered technology assistant.
        </p>
      </div>

      {advisor.summary ? (
        <p className="mt-5 rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken/70 px-4 py-3 text-sm leading-7 text-text-secondary">
          {advisor.summary}
        </p>
      ) : null}

      <div className="mt-6 space-y-6">
        {GROUP_ORDER.map((group) => {
          const insights =
            advisor.grouped[group];

          if (insights.length === 0) {
            return null;
          }

          return (
            <section
              key={group}
              aria-label={
                ADVISOR_GROUP_LABELS[group]
              }
            >
              <h3 className="text-sm font-medium text-text-primary">
                {
                  ADVISOR_GROUP_LABELS[group]
                }
              </h3>

              <div className="mt-3 space-y-3">
                {insights.map((insight) => (
                  <AdvisorInsightCard
                    key={insight.id}
                    insight={insight}
                    onDismiss={handleDismiss}
                    onAskAi={openWithQuery}
                    showDismiss={
                      !dismissedIds.has(
                        insight.id
                      )
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </PageCard>
  );
}
