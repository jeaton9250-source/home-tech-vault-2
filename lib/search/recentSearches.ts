const RECENT_SEARCHES_KEY =
  "home-tech-vault-recent-searches";

const MAX_RECENT_SEARCHES = 8;

export function loadRecentSearches(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        RECENT_SEARCHES_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(
      raw
    ) as string[];

    return parsed.filter(
      (entry) =>
        typeof entry === "string" &&
        entry.trim().length > 0
    );
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string) {
  const trimmed = query.trim();

  if (!trimmed || typeof window === "undefined") {
    return;
  }

  const existing = loadRecentSearches().filter(
    (entry) =>
      entry.toLowerCase() !==
      trimmed.toLowerCase()
  );

  const next = [trimmed, ...existing].slice(
    0,
    MAX_RECENT_SEARCHES
  );

  window.localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(next)
  );
}
