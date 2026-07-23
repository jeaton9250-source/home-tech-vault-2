export const APP_VERSION = "0.1.0";

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const configured =
    import.meta.env.VITE_HTV_API_BASE_URL?.trim();

  if (configured) {
    return normalizeBaseUrl(configured);
  }

  if (import.meta.env.PROD) {
    return "https://hometechvault.com";
  }

  return "http://localhost:3003";
}

export function assertHttpsInProduction(baseUrl: string) {
  if (
    import.meta.env.PROD &&
    !baseUrl.startsWith("https://")
  ) {
    throw new Error(
      "Production builds must use HTTPS for the API base URL."
    );
  }
}
