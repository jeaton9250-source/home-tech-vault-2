import type { SmartSearchResponse } from "@/lib/search/searchTypes";

export function getSmartSearchQueryFromUrl(
  searchParams: URLSearchParams | { get(name: string): string | null } | null | undefined,
  initialQuery = ""
): string {
  if (!searchParams) {
    return initialQuery.trim();
  }

  return searchParams.get("q")?.trim() || initialQuery.trim();
}

export function shouldAutoRunDemoSearch(options: {
  mode: "dashboard" | "page";
  isDemo: boolean;
  activeQuery: string;
  initialResponse: SmartSearchResponse | null;
}): boolean {
  return (
    options.mode === "page" &&
    options.isDemo &&
    !options.initialResponse &&
    Boolean(options.activeQuery.trim())
  );
}