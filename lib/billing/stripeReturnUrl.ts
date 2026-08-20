const DEFAULT_PRODUCTION_ORIGIN =
  "https://www.hometechvault.com";

const PRODUCTION_HOSTS = new Set([
  "hometechvault.com",
  "www.hometechvault.com",
]);

const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
]);

function allowedOrigin(
  value: string | null | undefined,
  allowLocal: boolean
): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (
      url.protocol === "https:" &&
      PRODUCTION_HOSTS.has(
        url.hostname.toLowerCase()
      )
    ) {
      return url.origin;
    }

    if (
      allowLocal &&
      LOCAL_HOSTS.has(
        url.hostname.toLowerCase()
      ) &&
      (
        url.protocol === "http:" ||
        url.protocol === "https:"
      )
    ) {
      return url.origin;
    }

    return null;
  } catch {
    return null;
  }
}

export function getStripeReturnOrigin(
  request: Request
): string {
  const allowLocal =
    process.env.NODE_ENV !== "production";

  /*
   * Prefer the actual request origin.
   *
   * Production:
   * hometechvault.com -> hometechvault.com
   * www.hometechvault.com -> www...
   *
   * Development:
   * localhost -> localhost
   */
  const requestOrigin =
    allowedOrigin(
      request.url,
      allowLocal
    );

  if (requestOrigin) {
    return requestOrigin;
  }

  /*
   * Environment variables are fallback only.
   * A stale localhost variable is ignored
   * when NODE_ENV is production.
   */
  const configuredOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
  ];

  for (
    const configured
    of configuredOrigins
  ) {
    const origin =
      allowedOrigin(
        configured,
        allowLocal
      );

    if (origin) {
      return origin;
    }
  }

  return DEFAULT_PRODUCTION_ORIGIN;
}
