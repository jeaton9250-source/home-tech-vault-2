import "server-only";

import type {
  AdminVercelAnalyticsSnapshot,
  AdminVercelDailyTraffic,
  AdminVercelTrafficRow,
} from "@/lib/admin/types";

const VERCEL_API_BASE =
  "https://api.vercel.com/v1/query/web-analytics";

type CountResponse = {
  data?: {
    visitors?: number;
    pageviews?: number;
  };
  error?: {
    code?: string;
    message?: string;
  };
};

type AggregateResponse = {
  data?: Array<{
    requestPath?: string;
    referrerHostname?: string;
    timestamp?: string;
    visitors?: number;
    pageviews?: number;
  }>;
  error?: {
    code?: string;
    message?: string;
  };
};

function buildDateRange() {
  const until = new Date();
  const since = new Date(until);

  since.setUTCDate(since.getUTCDate() - 30);

  return {
    since: since.toISOString(),
    until: until.toISOString(),
  };
}

function buildUrl(
  pathname: string,
  parameters: Record<string, string>
) {
  const url = new URL(
    `${VERCEL_API_BASE}/${pathname}`
  );

  for (const [key, value] of Object.entries(
    parameters
  )) {
    url.searchParams.set(key, value);
  }

  return url;
}

async function requestVercel<T>(
  url: URL,
  token: string
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  const payload = (await response.json()) as T & {
    error?: {
      message?: string;
    };
  };

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        `Vercel Analytics returned ${response.status}.`
    );
  }

  return payload;
}

export async function loadAdminVercelAnalytics(): Promise<AdminVercelAnalyticsSnapshot> {
  const token =
    process.env.VERCEL_ANALYTICS_TOKEN;
  const teamId =
    process.env.VERCEL_ANALYTICS_TEAM_ID;
  const projectId =
    process.env.VERCEL_ANALYTICS_PROJECT_ID ??
    process.env.VERCEL_PROJECT_ID;

  const { since, until } = buildDateRange();

  if (!token || !teamId || !projectId) {
    return {
      configured: false,
      available: false,
      error:
        "Vercel Analytics credentials are not configured.",
      since,
      until,
      visitors: 0,
      pageviews: 0,
      topPages: [],
      topReferrers: [],
      dailyTraffic: [],
    };
  }

  const common = {
    teamId,
    projectId,
    since,
    until,
  };

  try {
    const [
      countResponse,
      pagesResponse,
      referrersResponse,
      dailyResponse,
    ] = await Promise.all([
      requestVercel<CountResponse>(
        buildUrl("visits/count", common),
        token
      ),
      requestVercel<AggregateResponse>(
        buildUrl("visits/aggregate", {
          ...common,
          by: "requestPath",
          limit: "10",
        }),
        token
      ),
      requestVercel<AggregateResponse>(
        buildUrl("visits/aggregate", {
          ...common,
          by: "referrerHostname",
          limit: "10",
        }),
        token
      ),
      requestVercel<AggregateResponse>(
        buildUrl("visits/aggregate", {
          ...common,
          limit: "31",
        }),
        token
      ),
    ]);

    const topPages: AdminVercelTrafficRow[] =
      (pagesResponse.data ?? []).map((row) => ({
        label: row.requestPath ?? "Unknown page",
        visitors: row.visitors ?? 0,
        pageviews: row.pageviews ?? 0,
      }));

    const topReferrers: AdminVercelTrafficRow[] =
      (referrersResponse.data ?? []).map(
        (row) => ({
          label:
            row.referrerHostname?.trim() ||
            "Direct / unknown",
          visitors: row.visitors ?? 0,
          pageviews: row.pageviews ?? 0,
        })
      );

    const dailyTraffic: AdminVercelDailyTraffic[] =
      (dailyResponse.data ?? [])
        .filter(
          (row): row is typeof row & {
            timestamp: string;
          } => Boolean(row.timestamp)
        )
        .map((row) => ({
          date: row.timestamp.slice(0, 10),
          visitors: row.visitors ?? 0,
          pageviews: row.pageviews ?? 0,
        }));

    return {
      configured: true,
      available: true,
      error: null,
      since,
      until,
      visitors:
        countResponse.data?.visitors ?? 0,
      pageviews:
        countResponse.data?.pageviews ?? 0,
      topPages,
      topReferrers,
      dailyTraffic,
    };
  } catch (error) {
    return {
      configured: true,
      available: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load Vercel Analytics.",
      since,
      until,
      visitors: 0,
      pageviews: 0,
      topPages: [],
      topReferrers: [],
      dailyTraffic: [],
    };
  }
}
