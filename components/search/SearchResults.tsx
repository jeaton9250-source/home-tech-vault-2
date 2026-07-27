"use client";

import Link from "next/link";

import { ArrowRight, Search } from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import {
  SMART_SEARCH_GROUP_LABELS,
  type SmartSearchGroupedResults,
  type SmartSearchResponse,
} from "@/lib/search/searchTypes";

type SearchResultsProps = {
  response: SmartSearchResponse | null;
  loading: boolean;
  error: string;
};

const GROUP_ORDER = [
  "devices",
  "warranties",
  "maintenance",
  "documents",
  "network",
] as const;

function hasAnyResults(results: SmartSearchGroupedResults): boolean {
  return GROUP_ORDER.some((group) => results[group].length > 0);
}

export default function SearchResults({
  response,
  loading,
  error,
}: SearchResultsProps) {
  if (loading) {
    return (
      <PageCard>
        <p className="text-sm text-text-secondary">Searching your household records...</p>
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
            <h2 className="text-base font-semibold text-text-primary">Search all of your home technology</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Find devices, warranties, maintenance tasks, documents, and network records in one place.
            </p>
          </div>
        </div>
      </PageCard>
    );
  }

  if (!hasAnyResults(response.results)) {
    return (
      <PageCard>
        <h2 className="text-base font-semibold text-text-primary">No matching records</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Try a simpler search, a location name, a brand, or a specific phrase like &quot;offline&quot; or &quot;warranty soon&quot;.
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
              <h2 className="text-lg font-semibold text-text-primary">{SMART_SEARCH_GROUP_LABELS[group]}</h2>
              <span className="text-xs text-text-tertiary">{items.length} result{items.length === 1 ? "" : "s"}</span>
            </div>

            <ul className="space-y-2.5">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="block rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken/70 px-4 py-3 transition hover:border-border-subtle hover:bg-surface-sunken"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">{item.title}</p>
                        {item.subtitle ? (
                          <p className="mt-0.5 text-xs text-text-secondary">{item.subtitle}</p>
                        ) : null}

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                          <span className="rounded-full border border-border-subtle bg-white px-2 py-0.5">
                            {item.match.field}: {item.match.value}
                          </span>
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

                      <ArrowRight size={16} className="mt-0.5 shrink-0 text-text-tertiary" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </PageCard>
        );
      })}
    </div>
  );
}
