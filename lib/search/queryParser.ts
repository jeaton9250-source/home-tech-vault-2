import type { SmartSearchQueryIntent } from "@/lib/search/searchTypes";

const STOP_WORDS = new Set([
  "a",
  "all",
  "an",
  "and",
  "are",
  "device",
  "devices",
  "connected",
  "connect",
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
  "that",
  "technology",
  "the",
  "to",
  "what",
  "where",
  "which",
  "with",
]);

const WRITTEN_NUMBERS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

const STATUS_TERMS = new Set(["online", "offline"]);

const WARRANTY_TERMS = new Set([
  "warranty",
  "warranties",
  "expire",
  "expires",
  "expiring",
  "soon",
]);

const MAINTENANCE_TERMS = new Set([
  "maintenance",
  "need",
  "needs",
  "needing",
  "attention",
  "due",
]);

const DOCUMENT_TERMS = new Set([
  "document",
  "documents",
  "receipt",
  "receipts",
  "manual",
  "manuals",
  "invoice",
  "invoices",
  "file",
  "files",
]);

const SERIAL_TERMS = new Set([
  "serial",
  "number",
  "numbers",
]);

const AGE_QUERY_PATTERN =
  /(?:more than|older than)\s+((?:\d{1,2})|(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty))\s+years?(?:\s+old)?/gi;

const LOCATION_BOUNDARY_PATTERN =
  /\s+(?:that are|which are|with|and|needing|that need|online|offline)\b.*$/i;

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
  const match = normalized.match(AGE_QUERY_PATTERN);

  if (!match) {
    return null;
  }

  const valueMatch = match[0].match(
    /(?:more than|older than)\s+((?:\d{1,2})|(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty))/i
  );

  const rawValue = valueMatch?.[1]?.toLowerCase() ?? "";

  const years = /^\d{1,2}$/.test(rawValue)
    ? Number(rawValue)
    : WRITTEN_NUMBERS[rawValue] ?? Number.NaN;

  if (!Number.isFinite(years) || years <= 0) {
    return null;
  }

  return years;
}

function parseLocationHint(normalized: string): string | null {
  const match = normalized.match(/\bin\s+(?:the\s+)?([a-z0-9\- ]{2,80})/i);

  if (!match?.[1]) {
    return null;
  }

  const locationRaw = match[1]
    .replace(LOCATION_BOUNDARY_PATTERN, "")
    .trim();

  const location = normalizeText(locationRaw);

  return location || null;
}

function stripAgeQuerySyntax(value: string): string {
  return value.replace(AGE_QUERY_PATTERN, " ");
}

export function parseSearchQuery(query: string): SmartSearchQueryIntent {
  const normalized = normalizeText(query);
  const { phrases, queryWithoutPhrases } = parseQuotedPhrases(normalized);

  const wantsOffline = /\boffline\b/.test(normalized);
  const wantsOnline = /\bonline\b/.test(normalized) && !wantsOffline;
  const wantsNetwork =
    /\bnetwork\b/.test(normalized) ||
    /\bwi[- ]?fi\b/.test(normalized) ||
    /\brouter\b/.test(normalized) ||
    /\bconnected\b/.test(normalized);
  const wantsWarrantySoon =
    /warrant/.test(normalized) &&
    /(soon|expire|expiring|this month|next month)/.test(normalized);
  const wantsMaintenance =
    /maintenance/.test(normalized) ||
    /need(s)? attention/.test(normalized) ||
    /maintenance due/.test(normalized);
  const wantsDocuments =
    /\b(document|documents|receipt|manual|invoice|file|files)\b/.test(normalized);
  const wantsSerialNumber =
    /\bserial\b/.test(normalized) ||
    /\bserial\s+number\b/.test(normalized);

  const olderThanYears = parseOlderThanYears(normalized);
  const locationHint = parseLocationHint(normalized);

  const genericQuery = olderThanYears !== null
    ? stripAgeQuerySyntax(queryWithoutPhrases)
    : queryWithoutPhrases;

  const tokens = genericQuery
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .filter((token) => !STOP_WORDS.has(token))
    .filter((token) => {
      if ((wantsOffline || wantsOnline) && STATUS_TERMS.has(token)) {
        return false;
      }

      if (wantsSerialNumber && SERIAL_TERMS.has(token)) {
        return false;
      }

      if (wantsWarrantySoon && WARRANTY_TERMS.has(token)) {
        return false;
      }

      if (wantsMaintenance && MAINTENANCE_TERMS.has(token)) {
        return false;
      }

      if (wantsDocuments && DOCUMENT_TERMS.has(token)) {
        return false;
      }

      if (olderThanYears !== null) {
        if (
          token === "older" ||
          token === "more" ||
          token === "than" ||
          token === "year" ||
          token === "years" ||
          token === "old" ||
          /^\d{1,2}$/.test(token) ||
          token in WRITTEN_NUMBERS
        ) {
          return false;
        }
      }

      // Warranty words are intent-driving even when the query is broad.
      if (/warrant/.test(normalized) && WARRANTY_TERMS.has(token)) {
        return false;
      }

      return true;
    });

  return {
    raw: query,
    normalized,
    tokens,
    phrases,
    wantsOffline,
    wantsOnline,
    wantsNetwork,
    wantsWarrantySoon,
    wantsMaintenance,
    wantsDocuments,
    wantsSerialNumber,
    olderThanYears,
    locationHint,
  };
}
