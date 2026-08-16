"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowUpRight,
  Clock3,
  FileSearch,
  FileText,
  Lightbulb,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import SearchResults from "@/components/search/SearchResults";
import Button from "@/components/ui/Button";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { usePermissions } from "@/hooks/usePermissions";
import { buildDemoSmartSearchResponse } from "@/lib/demo/demoSmartSearch";
import {
  loadRecentSearches,
  saveRecentSearch,
} from "@/lib/search/recentSearches";
import { resolveSmartSearchResponse } from "@/lib/search/smartSearchClient";
import {
  getSmartSearchQueryFromUrl,
  shouldAutoRunDemoSearch,
} from "@/lib/search/smartSearchState";
import type { SmartSearchResponse } from "@/lib/search/searchTypes";
import { cn } from "@/lib/design-system/cn";

type SmartSearchMode = "dashboard" | "page";
type SmartSearchVariant = "default" | "hero";

type SmartSearchProps = {
  mode?: SmartSearchMode;
  variant?: SmartSearchVariant;
  heading?: string;
  initialQuery?: string;
  initialResponse?: SmartSearchResponse | null;
};

const SUGGESTED_SEARCHES = [
  {
    label: "Expiring warranties",
    query: "What warranties expire soon?",
    icon: ShieldCheck,
  },
  {
    label: "Find a receipt",
    query: "Where is my router receipt?",
    icon: FileText,
  },
  {
    label: "Offline devices",
    query: "Which devices are offline?",
    icon: Search,
  },
  {
    label: "Maintenance",
    query: "Show devices that need maintenance",
    icon: Wrench,
  },
  {
    label: "Living room devices",
    query: "Devices in Living Room",
    icon: FileSearch,
  },
  {
    label: "Router information",
    query: "Router password",
    icon: ShieldCheck,
  },
];

const QUESTION_EXAMPLES = [
  "What is the serial number for my living room TV?",
  "Which warranties expire in the next 60 days?",
  "Find the receipt for my refrigerator.",
  "What devices need maintenance?",
];

export default function SmartSearch({
  mode = "page",
  variant = "default",
  heading,
  initialQuery = "",
  initialResponse = null,
}: SmartSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isDemo } = useDemoMode();

  const urlQuery = getSmartSearchQueryFromUrl(
    searchParams,
    initialQuery
  );

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] =
    useState<SmartSearchResponse | null>(
      initialResponse
    );

  const [recentSearches, setRecentSearches] =
    useState<string[]>(() =>
      mode === "page"
        ? loadRecentSearches()
        : []
    );

  const demoBootstrapRef = useRef(false);

  const activeQuery =
    mode === "page"
      ? query || urlQuery || initialQuery
      : query;

  const rememberSearch = useCallback(
    (value: string) => {
      saveRecentSearch(value);

      if (mode === "page") {
        setRecentSearches(
          loadRecentSearches()
        );
      }
    },
    [mode]
  );

  const runSearch = useCallback(
    async (value: string) => {
      const trimmed = value.trim();

      if (!trimmed) {
        setResponse(null);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const payload =
          await resolveSmartSearchResponse({
            query: trimmed,
            isDemo,
            buildDemoResponse:
              buildDemoSmartSearchResponse,
          });

        setResponse(payload);
        rememberSearch(trimmed);
      } catch (searchError) {
        setResponse(null);

        setError(
          searchError instanceof Error
            ? searchError.message
            : "Unable to search your home technology."
        );
      } finally {
        setLoading(false);
      }
    },
    [isDemo, rememberSearch]
  );

  useEffect(() => {
    if (
      !shouldAutoRunDemoSearch({
        mode,
        isDemo,
        activeQuery,
        initialResponse: response,
      }) ||
      demoBootstrapRef.current
    ) {
      return;
    }

    demoBootstrapRef.current = true;
    void runSearch(activeQuery);
  }, [
    activeQuery,
    isDemo,
    mode,
    response,
    runSearch,
  ]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmed = activeQuery.trim();

    if (!trimmed) {
      setResponse(null);
      setError("");
      return;
    }

    if (mode === "dashboard") {
      router.push(
        `/smart-search?q=${encodeURIComponent(
          trimmed
        )}`
      );

      return;
    }

    router.replace(
      `${pathname}?q=${encodeURIComponent(
        trimmed
      )}`
    );

    void runSearch(trimmed);
  }

  function handleExampleClick(
    example: string
  ) {
    setQuery(example);

    if (mode === "dashboard") {
      router.push(
        `/smart-search?q=${encodeURIComponent(
          example
        )}`
      );

      return;
    }

    router.replace(
      `${pathname}?q=${encodeURIComponent(
        example
      )}`
    );

    void runSearch(example);
  }

  const isHero =
    variant === "hero" &&
    mode === "dashboard";

  const isWorkspace = mode === "page";

  const trimmedQuery =
    activeQuery.trim();

  const showWorkspaceEmptyState =
    isWorkspace &&
    !trimmedQuery &&
    !loading;

  if (isHero) {
    return (
      <DashboardSearch
        query={activeQuery}
        setQuery={setQuery}
        loading={loading}
        onSubmit={handleSubmit}
        onExampleClick={
          handleExampleClick
        }
        heading={heading}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Search workspace hero */}
      <section className="relative overflow-hidden rounded-[32px] border border-border-subtle/70 bg-surface-card px-5 py-8 shadow-lift sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        {/* Ambient gradients */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-home-health-soft/40 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-[420px] rounded-full bg-premium-soft/25 blur-3xl" />

        <div className="relative">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle/70 bg-surface-sunken/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            <Sparkles
              size={12}
              className="text-home-health"
              aria-hidden
            />

            Search your vault
          </div>

          {/* Heading */}
          <div className="mt-6 max-w-3xl">
            <h1 className="text-3xl font-medium tracking-[-0.045em] text-text-primary sm:text-4xl lg:text-5xl">
              {heading ||
                "Ask your home anything."}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base lg:text-lg">
              Search across your devices,
              receipts, warranties, manuals,
              maintenance records, and home
              information from one place.
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            <div className="relative rounded-[22px] border border-border-subtle bg-surface-base p-2 shadow-sm transition focus-within:border-home-health/40 focus-within:shadow-md">
              <Search
                size={21}
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary"
                aria-hidden
              />

              <input
                type="search"
                value={activeQuery}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Ask something about your home..."
                className="htv-focus-ring w-full rounded-[18px] border-0 bg-transparent py-4 pl-12 pr-32 text-base text-text-primary outline-none placeholder:text-text-tertiary sm:pr-36"
                aria-label="Search your home"
              />

              <Button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 sm:px-5"
              >
                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <>
                    <Search
                      size={15}
                      aria-hidden
                    />

                    <span className="hidden sm:inline">
                      Search
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Natural-language examples */}
          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Try asking naturally
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {QUESTION_EXAMPLES.map(
                (example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() =>
                      handleExampleClick(
                        example
                      )
                    }
                    className="rounded-full border border-border-subtle bg-surface-sunken/45 px-3.5 py-2 text-xs font-medium text-text-secondary transition hover:border-home-health/30 hover:bg-surface-card hover:text-text-primary"
                  >
                    {example}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Empty state / discovery workspace */}
      {showWorkspaceEmptyState ? (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Suggested categories */}
          <section className="rounded-[28px] border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-home-health">
                  Explore your home
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                  What are you looking for?
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Start with one of these common
                  searches or ask your own
                  question above.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                <Lightbulb
                  size={19}
                  aria-hidden
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {SUGGESTED_SEARCHES.map(
                (item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.query}
                      type="button"
                      onClick={() =>
                        handleExampleClick(
                          item.query
                        )
                      }
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-sunken/35 p-4 text-left transition hover:-translate-y-0.5 hover:border-home-health/30 hover:bg-surface-card hover:shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
                          <Icon
                            size={17}
                            aria-hidden
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary">
                            {item.label}
                          </p>

                          <p className="mt-1 truncate text-[11px] text-text-muted">
                            {item.query}
                          </p>
                        </div>
                      </div>

                      <ArrowUpRight
                        size={15}
                        className="shrink-0 text-text-tertiary transition group-hover:text-home-health"
                        aria-hidden
                      />
                    </button>
                  );
                }
              )}
            </div>
          </section>

          {/* Recent searches */}
          <section className="rounded-[28px] border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-sunken text-text-secondary">
                <Clock3
                  size={17}
                  aria-hidden
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  Search history
                </p>

                <h2 className="mt-1 text-lg font-semibold tracking-tight text-text-primary">
                  Recent searches
                </h2>
              </div>
            </div>

            {recentSearches.length >
            0 ? (
              <div className="mt-5 space-y-2">
                {recentSearches
                  .slice(0, 8)
                  .map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      onClick={() =>
                        handleExampleClick(
                          entry
                        )
                      }
                      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-sunken/35 px-4 py-3 text-left transition hover:border-home-health/25 hover:bg-surface-card"
                    >
                      <span className="min-w-0 truncate text-sm text-text-secondary group-hover:text-text-primary">
                        {entry}
                      </span>

                      <ArrowUpRight
                        size={14}
                        className="shrink-0 text-text-tertiary group-hover:text-home-health"
                        aria-hidden
                      />
                    </button>
                  ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border-subtle bg-surface-sunken/25 p-6 text-center">
                <Clock3
                  size={22}
                  className="mx-auto text-text-tertiary"
                  aria-hidden
                />

                <p className="mt-3 text-sm font-semibold text-text-primary">
                  No searches yet
                </p>

                <p className="mt-1 text-xs leading-5 text-text-muted">
                  Your recent questions
                  will appear here as you
                  use Home Tech Vault.
                </p>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {/* Search results */}
      {mode === "page" ? (
        <section
          className={cn(
            trimmedQuery &&
              "rounded-[28px] border border-border-subtle bg-surface-card p-4 shadow-sm sm:p-6"
          )}
        >
          {isDemo ? (
            <SearchResults
              response={
                trimmedQuery
                  ? response
                  : null
              }
              loading={loading}
              error={error}
              query={trimmedQuery}
              demoMode
            />
          ) : (
            <AuthenticatedSearchResults
              response={
                trimmedQuery
                  ? response
                  : null
              }
              loading={loading}
              error={error}
              query={trimmedQuery}
            />
          )}
        </section>
      ) : null}
    </div>
  );
}

function DashboardSearch({
  query,
  setQuery,
  loading,
  onSubmit,
  onExampleClick,
  heading,
}: {
  query: string;
  setQuery: (
    value: string
  ) => void;
  loading: boolean;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  onExampleClick: (
    example: string
  ) => void;
  heading?: string;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
          <Sparkles
            size={18}
            aria-hidden
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-primary md:text-xl">
            {heading ||
              "Ask your home"}
          </h2>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Search naturally across your
            devices, documents, warranties,
            and home records.
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-5"
      >
        <div className="relative rounded-[18px] border border-border-subtle bg-surface-sunken/40 p-1.5 transition focus-within:border-home-health/35 focus-within:bg-surface-card">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
            aria-hidden
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Ask something about your home..."
            className="htv-focus-ring w-full rounded-[14px] border-0 bg-transparent py-3 pl-10 pr-12 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
            aria-label="Search your home"
          />

          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-home-health text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <ArrowUpRight
                size={15}
                aria-hidden
              />
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED_SEARCHES.slice(
          0,
          3
        ).map((item) => (
          <button
            key={item.query}
            type="button"
            onClick={() =>
              onExampleClick(
                item.query
              )
            }
            className="rounded-full border border-border-subtle bg-surface-sunken/35 px-3 py-1.5 text-[11px] font-medium text-text-secondary transition hover:border-home-health/30 hover:text-text-primary"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AuthenticatedSearchResults({
  response,
  loading,
  error,
  query,
}: {
  response: SmartSearchResponse | null;
  loading: boolean;
  error: string;
  query: string;
}) {
  const {
    open: openAdvisor,
  } = useAIAdvisor();

  const {
    canViewFeature,
  } = usePermissions();

  return (
    <SearchResults
      response={response}
      loading={loading}
      error={error}
      query={query}
      showAdvisorCta={canViewFeature(
        "aiAdvisor"
      )}
      onOpenAdvisor={
        openAdvisor
      }
    />
  );
}