export const APP_VERSION = "0.1.0";

export const PRODUCTION_API_BASE_URL =
  "https://www.hometechvault.com";

const LEGACY_PRODUCTION_API_BASE_URL =
  "https://hometechvault.com";

export const DEVELOPMENT_API_BASE_URL =
  "http://localhost:3003";

export type ApiBaseUrlEnv = {
  isProduction: boolean;
  configured?: string;
};

export function validateAndNormalizeApiBaseUrl(
  value: string,
  isProduction: boolean
): string {
  const trimmed = value
    .trim()
    .replace(/\/+$/, "");

  if (!trimmed) {
    throw new Error(
      "API base URL is required."
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `Invalid API base URL: "${trimmed}".`
    );
  }

  if (
    parsed.protocol !== "http:" &&
    parsed.protocol !== "https:"
  ) {
    throw new Error(
      "API base URL must use http:// or https://."
    );
  }

  if (
    parsed.pathname !== "/" &&
    parsed.pathname !== ""
  ) {
    throw new Error(
      "API base URL must not include a path."
    );
  }

  if (parsed.search || parsed.hash) {
    throw new Error(
      "API base URL must not include query parameters or fragments."
    );
  }

  if (
    isProduction &&
    parsed.protocol !== "https:"
  ) {
    throw new Error(
      "Production builds must use HTTPS for the API base URL."
    );
  }

  if (
    isProduction &&
    parsed.origin ===
      LEGACY_PRODUCTION_API_BASE_URL
  ) {
    return PRODUCTION_API_BASE_URL;
  }

  return parsed.origin;
}

export function resolveApiBaseUrl(
  env: ApiBaseUrlEnv
): string {
  const configured =
    env.configured?.trim();

  if (configured) {
    return validateAndNormalizeApiBaseUrl(
      configured,
      env.isProduction
    );
  }

  return env.isProduction
    ? PRODUCTION_API_BASE_URL
    : DEVELOPMENT_API_BASE_URL;
}

export function getApiBaseUrl() {
  return resolveApiBaseUrl({
    isProduction: import.meta.env.PROD,
    configured:
      import.meta.env.VITE_HTV_API_BASE_URL,
  });
}

/** @deprecated Validation is handled by getApiBaseUrl(). */
export function assertHttpsInProduction(
  baseUrl: string
) {
  validateAndNormalizeApiBaseUrl(
    baseUrl,
    import.meta.env.PROD
  );
}
