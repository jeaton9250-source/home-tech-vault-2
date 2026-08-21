"use client";

import Link from "next/link";

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  FolderSearch,
  Laptop,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  Wifi,
} from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
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
  demoMode?: boolean;
  showAdvisorCta?: boolean;
  onOpenAdvisor?: () => void;
};

const GROUP_ORDER: SmartSearchGroup[] = [
  "devices",
  "documents",
  "maintenance",
  "warranties",
  "network",
];

function hasAnyResults(
  results: SmartSearchGroupedResults
): boolean {
  return GROUP_ORDER.some(
    (group) => results[group].length > 0
  );
}

function explainMatch(
  field: string,
  value: string
): string {
  const normalizedField =
    field.toLowerCase();

  if (
    normalizedField.includes("warranty")
  ) {
    return `Matched because this warranty includes “${value}”.`;
  }

  if (
    normalizedField.includes(
      "maintenance"
    )
  ) {
    return `Matched because this maintenance task mentions “${value}”.`;
  }

  if (
    normalizedField.includes("document")
  ) {
    return `Matched because this document contains “${value}”.`;
  }

  if (
    normalizedField.includes("network")
  ) {
    return `Matched because this network record includes “${value}”.`;
  }

  return `Matched because this device includes “${value}”.`;
}

function groupIcon(
  group: SmartSearchGroup
) {
  switch (group) {
    case "devices":
      return Laptop;

    case "documents":
      return FileText;

    case "maintenance":
      return Wrench;

    case "warranties":
      return ShieldCheck;

    case "network":
      return Wifi;

    default:
      return FolderSearch;
  }
}

export default function SearchResults({
  response,
  loading,
  error,
  query = "",
  demoMode = false,
  showAdvisorCta = false,
  onOpenAdvisor,
}: SearchResultsProps) {
  if (loading) {
    return <SearchLoadingState />;
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-danger/25 bg-danger-soft p-5 text-danger">
        <p className="text-sm font-semibold">
          Search could not be completed
        </p>

        <p className="mt-2 text-sm leading-6">
          {error}
        </p>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  if (!hasAnyResults(response.results)) {
    return (
      <div className="space-y-6">
        <NoResultsState
          response={response}
          demoMode={demoMode}
        />

        {showAdvisorCta &&
        onOpenAdvisor ? (
          <AdvisorFollowUp
            query={query}
            onOpenAdvisor={
              onOpenAdvisor
            }
          />
        ) : null}
      </div>
    );
  }

  const allResults =
    GROUP_ORDER.flatMap(
      (group) =>
        response.results[group]
    );

  const bestMatch =
    allResults[0] ?? null;

  return (
    <div className="space-y-7">
      {/* Search summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-home-health">
            Search Results
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            {allResults.length} result
            {allResults.length === 1
              ? ""
              : "s"}{" "}
            found
          </h2>

          {(query ||
            response.query) && (
            <p className="mt-2 text-sm text-text-secondary">
              For “
              {query ||
                response.query}
              ”
            </p>
          )}
        </div>

        <div className="rounded-full border border-border-subtle bg-surface-sunken/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          Across your vault
        </div>
      </div>

      {/* Demo notice */}
      {demoMode ? (
        <div className="rounded-[22px] border border-home-health/20 bg-home-health-soft/20 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-home-health">
                Demo results
              </p>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                You are searching the
                sample household only.
                No personal account data
                is being used.
              </p>
            </div>

            <Button
              href="/signup"
              variant="secondary"
              size="sm"
            >
              Create My Vault
            </Button>
          </div>
        </div>
      ) : null}

      {/* Best match */}
      {bestMatch ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-home-health">
                Best Match
              </p>

              <h3 className="mt-1 text-lg font-semibold text-text-primary">
                Most relevant result
              </h3>
            </div>
          </div>

          <Link
            href={bestMatch.href}
            className="group block overflow-hidden rounded-[28px] border border-home-health/20 bg-gradient-to-br from-surface-card via-surface-card to-home-health-soft/20 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-home-health/35 hover:shadow-md sm:p-6"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                  <Search
                    size={20}
                    aria-hidden
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-base font-semibold text-text-primary sm:text-lg">
                    {bestMatch.title}
                  </p>

                  {bestMatch.subtitle ? (
                    <p className="mt-1 text-sm text-text-secondary">
                      {
                        bestMatch.subtitle
                      }
                    </p>
                  ) : null}

                  <p className="mt-3 text-xs leading-5 text-text-muted sm:text-sm">
                    {explainMatch(
                      bestMatch.match
                        .field,
                      bestMatch.match
                        .value
                    )}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {bestMatch.location ? (
                      <StatusPill
                        icon={
                          MapPin
                        }
                        text={
                          bestMatch.location
                        }
                      />
                    ) : null}

                    {bestMatch.status ? (
                      <StatusPill
                        icon={
                          CheckCircle2
                        }
                        text={
                          bestMatch.status
                        }
                        positive
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              <ArrowRight
                size={18}
                className="mt-1 shrink-0 text-text-tertiary transition group-hover:translate-x-1 group-hover:text-home-health"
                aria-hidden
              />
            </div>
          </Link>
        </section>
      ) : null}

      {/* Grouped result sections */}
      {GROUP_ORDER.map(
        (group) => {
          const items =
            response.results[group];

          if (
            items.length === 0
          ) {
            return null;
          }

          const Icon =
            groupIcon(group);

          return (
            <section
              key={group}
              className="rounded-[28px] border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-sunken text-text-secondary">
                    <Icon
                      size={17}
                      aria-hidden
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                      Category
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-text-primary">
                      {
                        SMART_SEARCH_GROUP_LABELS[
                          group
                        ]
                      }
                    </h3>
                  </div>
                </div>

                <span className="rounded-full border border-border-subtle bg-surface-sunken px-2.5 py-1 text-[10px] font-semibold text-text-muted">
                  {items.length}{" "}
                  result
                  {items.length ===
                  1
                    ? ""
                    : "s"}
                </span>
              </div>

              <div className="mt-5 space-y-2.5">
                {items.map(
                  (item) => (
                    <Link
                      key={
                        item.id
                      }
                      href={
                        item.href
                      }
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-sunken/35 p-4 transition hover:border-home-health/25 hover:bg-surface-card hover:shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {
                            item.title
                          }
                        </p>

                        {item.subtitle ? (
                          <p className="mt-1 text-xs text-text-secondary">
                            {
                              item.subtitle
                            }
                          </p>
                        ) : null}

                        <p className="mt-2 text-xs leading-5 text-text-muted">
                          {explainMatch(
                            item.match
                              .field,
                            item.match
                              .value
                          )}
                        </p>

                        {(item.location ||
                          item.status) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.location ? (
                              <StatusPill
                                icon={
                                  MapPin
                                }
                                text={
                                  item.location
                                }
                              />
                            ) : null}

                            {item.status ? (
                              <StatusPill
                                icon={
                                  CheckCircle2
                                }
                                text={
                                  item.status
                                }
                                positive
                              />
                            ) : null}
                          </div>
                        )}
                      </div>

                      <ArrowRight
                        size={16}
                        className="mt-1 shrink-0 text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-home-health"
                        aria-hidden
                      />
                    </Link>
                  )
                )}
              </div>
            </section>
          );
        }
      )}

      {/* Advisor follow-up */}
      {showAdvisorCta &&
      onOpenAdvisor ? (
        <AdvisorFollowUp
          query={
            query ||
            response.query
          }
          onOpenAdvisor={
            onOpenAdvisor
          }
        />
      ) : null}
    </div>
  );
}

function StatusPill({
  icon: Icon,
  text,
  positive = false,
}: {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  text: string;
  positive?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        positive
          ? "border-home-health/15 bg-home-health-soft text-home-health"
          : "border-border-subtle bg-surface-card text-text-secondary"
      }`}
    >
      <Icon
        size={11}
        aria-hidden
      />

      {text}
    </span>
  );
}

function SearchLoadingState() {
  return (
    <div className="rounded-[26px] border border-border-subtle bg-surface-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
          <Search
            size={18}
            aria-hidden
          />

          <span className="absolute inset-0 animate-ping rounded-2xl border border-home-health/20" />
        </div>

        <div>
          <p className="text-sm font-semibold text-text-primary">
            Searching your vault
          </p>

          <p className="mt-1 text-xs text-text-muted">
            Looking across devices,
            documents, warranties,
            maintenance, and network
            records.
          </p>
        </div>
      </div>
    </div>
  );
}

function NoResultsState({
  response,
  demoMode,
}: {
  response: SmartSearchResponse;
  demoMode: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-border-subtle bg-surface-card p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-sunken text-text-secondary">
        <Search
          size={20}
          aria-hidden
        />
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-tight text-text-primary">
        {demoMode
          ? "Nothing in the demo home matched that search."
          : "No matching records found."}
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary">
        Try a simpler phrase,
        search by room or brand,
        or use one of the
        suggestions below.
      </p>

      {response.suggestions
        .length > 0 ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {response.suggestions
            .slice(0, 4)
            .map(
              (suggestion) => (
                <span
                  key={
                    suggestion
                  }
                  className="rounded-full border border-border-subtle bg-surface-sunken px-3 py-1.5 text-xs text-text-secondary"
                >
                  {
                    suggestion
                  }
                </span>
              )
            )}
        </div>
      ) : null}

      {demoMode ? (
        <div className="mt-6">
          <Button
            href="/signup"
            variant="secondary"
            size="sm"
          >
            Create My Vault
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function AdvisorFollowUp({
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
    <section className="relative overflow-hidden rounded-[28px] border border-interaction/20 bg-gradient-to-br from-surface-card via-surface-card to-section-insights-soft/30 p-5 shadow-sm sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-interaction-soft/30 blur-3xl" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-interaction-soft text-interaction">
          <Bot
            size={19}
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-interaction">
              Home Advisor
            </p>

            <span className="rounded-full border border-border-subtle bg-surface-sunken px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-text-muted">
              AI
            </span>
          </div>

          <h3 className="mt-2 text-lg font-semibold tracking-tight text-text-primary">
            Want a direct answer instead?
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Open Home Advisor to
            ask follow-up questions
            about “{query}” and use
            the information in your
            vault as context.
          </p>

          <button
            type="button"
            onClick={() => {
              onOpenAdvisor();
            }}
            className="htv-focus-ring mt-4 inline-flex items-center gap-2 rounded-xl border border-interaction/20 bg-surface-card px-3.5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface-sunken"
          >
            <Sparkles
              size={15}
              className="text-interaction"
              aria-hidden
            />

            Ask Home Advisor
          </button>
        </div>
      </div>
    </section>
  );
}