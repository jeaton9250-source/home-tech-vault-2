import type { SmartSearchQueryIntent } from "@/lib/search/searchTypes";

const STOP_WORDS = new Set([
  "a",
  "all",
  "an",
  "and",
  "are",
  "device",
  "devices",
  "every",
  "find",
  "for",
  "from",
  "in",
  "is",
  "me",
  "my",
  "of",
  "on",
  "or",
  "show",
  "technology",
  "the",
  "to",
  "what",
  "which",
  "with",
]);

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function parseQuotedPhrases(query: string): {
  phrases: string[];
  queryWithoutPhrases: string;
} {
  const phrases: string[] = [];

  const queryWithoutPhrases = query.replace(/"([^"]+)"/g, (_, phrase: string) => {
    const normalized = normalizeText(phrase);

    if (normalized) {
      phrases.push(normalized);
    }

    return " ";
  });

  return {
    phrases,
    queryWithoutPhrases,
  };
}

function parseOlderThanYears(normalized: string): number | null {
  const match = normalized.match(
    /(?:more than|older than)\s+(\d{1,2})\s+years?/
  );

  if (!match) {
    return null;
  }

  const years = Number(match[1]);

  if (!Number.isFinite(years) || years <= 0) {
    return null;
  }

  return years;
}

function parseLocationHint(normalized: string): string | null {
  const match = normalized.match(/\bin\s+(?:the\s+)?([a-z0-9\- ]{2,40})/i);

  if (!match?.[1]) {
    return null;
  }

  const location = normalizeText(match[1]);

  return location || null;
}

export function parseSearchQuery(query: string): SmartSearchQueryIntent {
  const normalized = normalizeText(query);
  const { phrases, queryWithoutPhrases } = parseQuotedPhrases(normalized);

  const tokens = queryWithoutPhrases
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));

  return {
    raw: query,
    normalized,
    tokens,
    phrases,
    wantsOffline: /\boffline\b/.test(normalized),
    wantsOnline:
      /\bonline\b/.test(normalized) && !/\boffline\b/.test(normalized),
    wantsWarrantySoon:
      /warrant/.test(normalized) &&
      /(soon|expire|expiring|this month|next month)/.test(normalized),
    wantsMaintenance:
      /maintenance/.test(normalized) ||
      /need(s)? attention/.test(normalized) ||
      /maintenance due/.test(normalized),
    wantsDocuments:
      /\b(document|documents|receipt|manual|invoice|file|files)\b/.test(normalized),
    wantsSerialNumber:
      /\bserial\b/.test(normalized),
    olderThanYears: parseOlderThanYears(normalized),
    locationHint: parseLocationHint(normalized),
  };
}
