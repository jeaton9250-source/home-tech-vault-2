"use client";

import Link from "next/link";

import { ArrowRight, Bot, Search, Sparkles } from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { usePermissions } from "@/hooks/usePermissions";
import {
  SMART_SEARCH_GROUP_LABELS,
  type SmartSearchGroupedResults,
  type SmartSearchGroup,
  type SmartSearchResponse,
} from "@/lib/search/searchTypes";

type SearchResultsProps = {
  response: SmartSearchResponse | null;
  loading: boolean;
  error: string;
  query?: string;
};

const GROUP_ORDER: SmartSearchGroup[] = [
  "devices",
  "documents",
  "maintenance",
  "warranties",
  "network",
];

function hasAnyResults(results: SmartSearchGroupedResults): boolean {
  return GROUP_ORDER.some((group) => results[group].length > 0);
}

function explainMatch(field: string, value: string): string {
  const normalizedField = field.toLowerCase();

  if (normalizedField.includes("warranty")) {
    return `Matched because this warranty includes “${value}”.`;
  }

  if (normalizedField.includes("maintenance")) {
    return `Matched because this maintenance task mentions “${value}”.`;
  }

  if (normalizedField.includes("document")) {
    return `Matched because this document contains “${value}”.`;
  }

  if (normalizedField.includes("network")) {
    return `Matched because this network record includes “${value}”.`;
  }

  return `Matched because this device includes “${value}”.`;
}

export default function SearchResults({
  response,
  loading,
  error,
  query = "",
}: SearchResultsProps) {
  const { open: openAdvisor } = useAIAdvisor();
  const { canViewFeature } = usePermissions();

  if (loading) {
    return (
      <PageCard>
        <p className="text-sm text-text-secondary">
          Searching your home...
        </p>
      </PageCard>
    );
  }

  if (error) {
    return (
      <PageCard className="border-danger/30 bg-danger-soft text-danger">
        <p className="text-sm font-medium">{error}</p>
      </PageCard>
    );
  }

  if (!response) {
    return (
      <PageCard className="border-border-subtle/80 bg-surface-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken text-text-secondary">
            <Search size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Search all of your home technology
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Find devices, documents, maintenance, warranties, and network records —
              or ask a question in plain English.
            </p>
          </div>
        </div>
      </PageCard>
    );
  }

  if (!hasAnyResults(response.results)) {
    return (
      <div className="space-y-5">
        <PageCard>
          <h2 className="text-base font-semibold text-text-primary">
            No matching records
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Try a simpler search, a room name, a brand, or a phrase like
            &quot;offline&quot; or &quot;warranty expiring&quot;.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {response.suggestions.slice(0, 4).map((suggestion) => (
              <span
                key={suggestion}
                className="rounded-full border border-border-subtle bg-surface-sunken px-3 py-1 text-xs text-text-secondary"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </PageCard>

        <FutureAiAnswers query={query} onOpenAdvisor={openAdvisor} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {GROUP_ORDER.map((group) => {
        const items = response.results[group];

        if (items.length === 0) {
          return null;
        }

        return (
          <PageCard key={group} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {SMART_SEARCH_GROUP_LABELS[group]}
              </h2>
              <span className="text-xs text-text-tertiary">
                {items.length} result{items.length === 1 ? "" : "s"}
              </span>
            </div>

            <ul className="space-y-2.5">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="block rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken/70 px-4 py-4 transition hover:border-border-subtle hover:bg-surface-sunken"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {item.title}
                        </p>
                        {item.subtitle ? (
                          <p className="mt-0.5 text-xs text-text-secondary">
                            {item.subtitle}
                          </p>
                        ) : null}

                        <p className="mt-2 text-xs leading-5 text-text-secondary">
                          {explainMatch(item.match.field, item.match.value)}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                          {item.location ? (
                            <span className="rounded-full border border-border-subtle bg-white px-2 py-0.5">
                              {item.location}
                            </span>
                          ) : null}
                          {item.status ? (
                            <span className="rounded-full border border-border-subtle bg-white px-2 py-0.5">
                              {item.status}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <ArrowRight
                        size={16}
                        className="mt-0.5 shrink-0 text-text-tertiary"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </PageCard>
        );
      })}

      {canViewFeature("aiAdvisor") ? (
        <FutureAiAnswers query={query || response.query} onOpenAdvisor={openAdvisor} />
      ) : null}
    </div>
  );
}

function FutureAiAnswers({
  query,
  onOpenAdvisor,
}: {
  query: string;
  onOpenAdvisor: () => void;
}) {
  if (!query.trim()) {
    return null;
  }

  return (
    <PageCard className="border-interaction/20 bg-gradient-to-br from-surface-card to-section-insights-soft/30">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card text-interaction">
          <Bot size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">
              Future AI Answers
            </h2>
            <span className="rounded-full border border-border-subtle bg-surface-sunken px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
              Coming soon
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Soon you&apos;ll be able to ask follow-up questions like
            &quot;{query}&quot; and get a direct answer about your home.
          </p>

          <button
            type="button"
            onClick={onOpenAdvisor}
            className="htv-focus-ring mt-4 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-3.5 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-sunken"
          >
            <Sparkles size={16} className="text-interaction" />
            Ask AI Advisor instead
          </button>
        </div>
      </div>
    </PageCard>
  );
}
