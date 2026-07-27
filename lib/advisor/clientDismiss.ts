const DISMISSED_PREFIX =
  "home-tech-vault-advisor-dismissed";

export function getAdvisorDismissStorageKey(
  userId?: string
) {
  return `${DISMISSED_PREFIX}-${userId || "demo"}`;
}

export function loadDismissedAdvisorInsightIds(
  storageKey: string
): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw =
      window.localStorage.getItem(storageKey);

    if (!raw) {
      return new Set();
    }

    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function saveDismissedAdvisorInsightIds(
  storageKey: string,
  ids: Set<string>
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(Array.from(ids))
  );
}

export function dismissAdvisorInsight(
  storageKey: string,
  insightId: string
): Set<string> {
  const dismissed =
    loadDismissedAdvisorInsightIds(storageKey);
  dismissed.add(insightId);
  saveDismissedAdvisorInsightIds(
    storageKey,
    dismissed
  );
  return dismissed;
}
