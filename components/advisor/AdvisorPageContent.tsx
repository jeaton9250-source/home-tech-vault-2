"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Search,
  Sparkles,
} from "lucide-react";

import AdvisorInsightCard from "@/components/advisor/AdvisorInsightCard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { useHomeAdvisor } from "@/hooks/useHomeAdvisor";
import {
  ADVISOR_GROUP_LABELS,
} from "@/lib/advisor/presentation";
import type {
  AdvisorInsight,
  AdvisorInsightGroup,
} from "@/lib/advisor/types";

const GROUP_ORDER: AdvisorInsightGroup[] = [
  "urgent",
  "attention",
  "suggestion",
  "good",
];

type AdvisorFilter =
  | "all"
  | AdvisorInsightGroup;

function matchesSearch(
  insight: AdvisorInsight,
  query: string
) {
  if (!query.trim()) {
    return true;
  }

  const haystack =
    `${insight.title} ${insight.message}`.toLowerCase();

  return haystack.includes(
    query.trim().toLowerCase()
  );
}

export default function AdvisorPageContent() {
  const {
    advisor,
    dismissedInsights,
    loading,
    error,
    dismissInsight,
    restoreInsight,
  } = useHomeAdvisor();
  const { openWithQuery } = useAIAdvisor();

  const [filter, setFilter] =
    useState<AdvisorFilter>("all");
  const [searchQuery, setSearchQuery] =
    useState("");

  const filteredInsights = useMemo(() => {
    if (!advisor) {
      return [];
    }

    return advisor.insights.filter(
      (insight) => {
        const matchesFilter =
          filter === "all" ||
          insight.group === filter;

        return (
          matchesFilter &&
          matchesSearch(
            insight,
            searchQuery
          )
        );
      }
    );
  }, [advisor, filter, searchQuery]);

  const groupedActive = useMemo(() => {
    const grouped: Record<
      AdvisorInsightGroup,
      AdvisorInsight[]
    > = {
      urgent: [],
      attention: [],
      suggestion: [],
      good: [],
    };

    for (const insight of filteredInsights) {
      grouped[insight.group].push(insight);
    }

    return grouped;
  }, [filteredInsights]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-card)] bg-danger-soft/20 px-5 py-6">
        <p className="text-sm text-danger">
          {error}
        </p>
      </div>
    );
  }

  if (!advisor) {
    return null;
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-medium tracking-[-0.04em] text-text-primary">
          🏡 Home Advisor
        </h1>
        <p className="max-w-2xl text-base leading-7 text-text-secondary">
          Your AI-powered technology assistant.
        </p>

        {advisor.summary ? (
          <p className="max-w-3xl text-sm leading-7 text-text-secondary">
            {advisor.summary}
          </p>
        ) : null}
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              "all",
              ...GROUP_ORDER,
            ] as AdvisorFilter[]
          ).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() =>
                setFilter(entry)
              }
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === entry
                  ? "bg-charcoal text-surface-card"
                  : "bg-surface-sunken text-text-secondary hover:text-text-primary"
              }`}
            >
              {entry === "all"
                ? "All"
                : ADVISOR_GROUP_LABELS[entry]}
            </button>
          ))}
        </div>

        <label className="relative block w-full max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search recommendations"
            className="w-full rounded-[var(--radius-button)] border border-border-subtle bg-surface-card py-2 pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-border-strong"
          />
        </label>
      </div>

      <div className="space-y-8">
        {GROUP_ORDER.map((group) => {
          const insights =
            groupedActive[group];

          if (
            filter !== "all" &&
            filter !== group
          ) {
            return null;
          }

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
              <h2 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
                {
                  ADVISOR_GROUP_LABELS[group]
                }
              </h2>

              <div className="mt-4 space-y-3">
                {insights.map((insight) => (
                  <AdvisorInsightCard
                    key={insight.id}
                    insight={insight}
                    onDismiss={
                      dismissInsight
                    }
                    onAskAi={openWithQuery}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {filteredInsights.length === 0 ? (
          <div className="rounded-[var(--radius-card)] bg-surface-sunken/50 px-5 py-8 text-sm text-text-secondary">
            No recommendations match your search.
          </div>
        ) : null}
      </div>

      {dismissedInsights.length > 0 ? (
        <section aria-label="Dismissed recommendations">
          <h2 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
            Dismissed
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Recommendations you chose to hide from your active list.
          </p>

          <div className="mt-4 space-y-3">
            {dismissedInsights.map(
              (insight) => (
                <AdvisorInsightCard
                  key={insight.id}
                  insight={insight}
                  showDismiss={false}
                  onAskAi={openWithQuery}
                  onRestore={restoreInsight}
                />
              )
            )}
          </div>
        </section>
      ) : null}

      <section aria-label="Recently resolved">
        <h2 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
          Recently Resolved
        </h2>
        <p className="mt-4 rounded-[var(--radius-card)] bg-surface-sunken/50 px-5 py-6 text-sm text-text-secondary">
          Completed fixes and resolved recommendations will appear here as your home technology profile evolves.
        </p>
      </section>

      <section aria-label="Future recommendations">
        <div className="rounded-[var(--radius-card)] bg-gradient-to-br from-surface-sunken/70 to-accent-soft/20 px-5 py-6">
          <div className="flex items-start gap-3">
            <Sparkles
              size={18}
              className="mt-0.5 text-accent"
              aria-hidden
            />
            <div>
              <h2 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
                Future AI Recommendations
              </h2>
              <p className="mt-2 text-sm leading-7 text-text-secondary">
                Home Advisor will continue learning from your devices, documents, and maintenance patterns to surface smarter, more personalized guidance over time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
