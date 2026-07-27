/**
 * Safe internal redirect helpers for auth entry points.
 * Accepts `next` or `redirect` query params and rejects open redirects.
 */

const DEFAULT_REDIRECT = "/dashboard";

export function isSafeInternalPath(
  path: string | null | undefined
): path is string {
  if (!path) {
    return false;
  }

  if (!path.startsWith("/")) {
    return false;
  }

  if (path.startsWith("//")) {
    return false;
  }

  if (path.includes("://")) {
    return false;
  }

  if (path.includes("\\")) {
    return false;
  }

  // Block protocol-relative and encoded tricks.
  const decoded = (() => {
    try {
      return decodeURIComponent(path);
    } catch {
      return path;
    }
  })();

  if (
    decoded.startsWith("//") ||
    decoded.includes("://") ||
    /^\/\\/.test(decoded)
  ) {
    return false;
  }

  return true;
}

export function resolveSafeAuthRedirect(
  search:
    | string
    | URLSearchParams
    | { get(name: string): string | null }
    | null
    | undefined,
  fallback: string = DEFAULT_REDIRECT
): string {
  const params =
    typeof search === "string"
      ? new URLSearchParams(
          search.startsWith("?")
            ? search.slice(1)
            : search
        )
      : search;

  const requested =
    params?.get("next") ||
    params?.get("redirect") ||
    null;

  if (isSafeInternalPath(requested)) {
    return requested;
  }

  if (isSafeInternalPath(fallback)) {
    return fallback;
  }

  return DEFAULT_REDIRECT;
}
