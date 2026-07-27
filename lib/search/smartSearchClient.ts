import type { SmartSearchResponse } from "@/lib/search/searchTypes";

export async function resolveSmartSearchResponse(options: {
  query: string;
  isDemo: boolean;
  buildDemoResponse: (query: string) => SmartSearchResponse;
  fetcher?: typeof fetch;
}): Promise<SmartSearchResponse> {
  const trimmed = options.query.trim();

  if (options.isDemo) {
    return options.buildDemoResponse(trimmed);
  }

  const fetcher = options.fetcher ?? fetch;

  const routeResponse = await fetcher(
    `/api/search?q=${encodeURIComponent(trimmed)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const payload = (await routeResponse.json()) as SmartSearchResponse & {
    error?: string;
  };

  if (!routeResponse.ok || payload.success === false) {
    throw new Error(
      payload.error || "Unable to search your home technology."
    );
  }

  return payload;
}