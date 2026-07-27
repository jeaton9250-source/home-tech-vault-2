"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Clock3, Loader2, Search, Sparkles } from "lucide-react";

import SearchResults from "@/components/search/SearchResults";
import PageCard from "@/components/ui/PageCard";
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
  "Which devices are offline?",
  "What warranties expire soon?",
  "Where is my router receipt?",
  "Show devices that need maintenance",
  "Router password",
  "Devices in Living Room",
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

  const urlQuery = getSmartSearchQueryFromUrl(searchParams, initialQuery);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<SmartSearchResponse | null>(
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

  const rememberSearch = useCallback((value: string) => {
    saveRecentSearch(value);

    if (mode === "page") {
      setRecentSearches(loadRecentSearches());
    }
  }, [mode]);

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setResponse(null);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = await resolveSmartSearchResponse({
        query: trimmed,
        isDemo,
        buildDemoResponse: buildDemoSmartSearchResponse,
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
  }, [isDemo, rememberSearch]);

  useEffect(() => {
    if (
      !shouldAutoRunDemoSearch({
        mode,
        isDemo,
        activeQuery,
        initialResponse: response,
      }) || demoBootstrapRef.current
    ) {
      return;
    }

    demoBootstrapRef.current = true;
    void runSearch(activeQuery);
  }, [activeQuery, isDemo, mode, response, runSearch]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = activeQuery.trim();

    if (!trimmed) {
      setResponse(null);
      setError("");
      return;
    }

    if (mode === "dashboard") {
      router.push(`/smart-search?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    router.replace(`${pathname}?q=${encodeURIComponent(trimmed)}`);
    void runSearch(trimmed);
  }

  function handleExampleClick(example: string) {
    setQuery(example);

    if (mode === "dashboard") {
      router.push(`/smart-search?q=${encodeURIComponent(example)}`);
      return;
    }

    router.replace(`${pathname}?q=${encodeURIComponent(example)}`);
    void runSearch(example);
  }

  const isHero = variant === "hero" && mode === "dashboard";
  const isWorkspace = mode === "page";
  const trimmedQuery = activeQuery.trim();
  const showWorkspaceEmptyState =
    isWorkspace && !trimmedQuery && !loading;

  return (
    <div className="space-y-4">
      <PageCard
        className={cn(
          isHero && "border-border-subtle/80 bg-surface-card p-6 md:p-8",
          isWorkspace && "border-border-subtle/80 bg-surface-card p-5 md:p-6"
        )}
      >
        <div className={cn(isHero || isWorkspace ? "space-y-5" : "flex items-start gap-3")}>
          {!isHero && !isWorkspace ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken text-charcoal">
              <Search size={18} />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            {isHero ? (
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-sunken text-charcoal">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary md:text-xl">
                    {heading || "Search your home"}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Ask naturally — like talking to a home technology assistant.
                  </p>
                </div>
              </div>
            ) : isWorkspace ? (
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  {heading || "Search workspace"}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Search devices, documents, warranties, maintenance, and network records.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-text-primary">
                  {heading || "Search"}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Find devices, documents, warranties, maintenance, and network details.
                </p>
              </>
            )}

            <form
              onSubmit={handleSubmit}
              className={cn(
                "flex flex-col gap-3",
                isHero || isWorkspace ? "mt-6" : "mt-4 sm:flex-row sm:gap-2"
              )}
            >
              <div className="relative min-w-0 flex-1">
                <Search
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  type="search"
                  value={activeQuery}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search anything in your home..."
                  className={cn(
                    "htv-focus-ring w-full rounded-[var(--radius-input)] border border-border-subtle bg-surface-sunken text-text-primary outline-none focus:border-interaction",
                    isHero
                      ? "py-3.5 pl-12 pr-4 text-[0.9375rem] shadow-[var(--shadow-sm)]"
                      : "px-4 py-2.5 pl-10 text-sm"
                  )}
                  aria-label="Search your home"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={cn((isHero || isWorkspace) && "sm:self-stretch sm:px-6")}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                Search
              </Button>
            </form>

            {isHero ? (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
                  Try asking
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTED_SEARCHES.slice(0, 6).map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="rounded-full border border-border-subtle bg-surface-sunken px-3.5 py-1.5 text-sm text-text-secondary transition hover:border-border-strong hover:bg-surface-card hover:text-text-primary"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </PageCard>

      {showWorkspaceEmptyState ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {recentSearches.length > 0 ? (
            <PageCard className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock3 size={16} className="text-text-muted" aria-hidden />
                <h3 className="text-sm font-semibold text-text-primary">
                  Recent searches
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => handleExampleClick(entry)}
                    className="rounded-full border border-border-subtle bg-surface-sunken px-3.5 py-1.5 text-sm text-text-secondary transition hover:border-border-strong hover:bg-surface-card hover:text-text-primary"
                  >
                    {entry}
                  </button>
                ))}
              </div>
            </PageCard>
          ) : null}

          <PageCard className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">
              Suggested searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SEARCHES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="rounded-full border border-border-subtle bg-surface-sunken px-3.5 py-1.5 text-sm text-text-secondary transition hover:border-border-strong hover:bg-surface-card hover:text-text-primary"
                >
                  {example}
                </button>
              ))}
            </div>
          </PageCard>
        </div>
      ) : null}

      {mode === "page" ? (
        isDemo ? (
          <SearchResults
            response={trimmedQuery ? response : null}
            loading={loading}
            error={error}
            query={trimmedQuery}
            demoMode
          />
        ) : (
          <AuthenticatedSearchResults
            response={trimmedQuery ? response : null}
            loading={loading}
            error={error}
            query={trimmedQuery}
          />
        )
      ) : null}
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
  const { open: openAdvisor } = useAIAdvisor();
  const { canViewFeature } = usePermissions();

  return (
    <SearchResults
      response={response}
      loading={loading}
      error={error}
      query={query}
      showAdvisorCta={canViewFeature("aiAdvisor")}
      onOpenAdvisor={openAdvisor}
    />
  );
}
