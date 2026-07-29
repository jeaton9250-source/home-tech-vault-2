import type {
  HomeAssistantConfig,
  HomeAssistantState,
} from "./types";

function normalizeBaseUrl(
  value: string
): string {
  const normalized =
    value.trim().replace(/\/+$/, "");

  if (!normalized) {
    throw new Error(
      "Home Assistant URL is required."
    );
  }

  return normalized;
}

function buildHeaders(
  accessToken: string
): HeadersInit {
  const token = accessToken.trim();

  if (!token) {
    throw new Error(
      "Home Assistant access token is required."
    );
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function requestHomeAssistant<T>(
  config: HomeAssistantConfig,
  path: string
): Promise<T> {
  const baseUrl = normalizeBaseUrl(
    config.baseUrl
  );

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}${path}`,
      {
        method: "GET",
        headers: buildHeaders(
          config.accessToken
        ),
      }
    );
  } catch {
    throw new Error(
      "Unable to reach Home Assistant. Confirm that Home Assistant is running and the local address is correct."
    );
  }

  if (!response.ok) {
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      throw new Error(
        "Home Assistant rejected the access token."
      );
    }

    throw new Error(
      `Home Assistant returned ${response.status} ${response.statusText}.`
    );
  }

  return response.json() as Promise<T>;
}

export async function testHomeAssistantConnection(
  config: HomeAssistantConfig
): Promise<boolean> {
  const result =
    await requestHomeAssistant<{
      message?: string;
    }>(
      config,
      "/api/"
    );

  return result.message === "API running.";
}

export async function getHomeAssistantStates(
  config: HomeAssistantConfig
): Promise<HomeAssistantState[]> {
  const states =
    await requestHomeAssistant<
      HomeAssistantState[]
    >(
      config,
      "/api/states"
    );

  if (!Array.isArray(states)) {
    throw new Error(
      "Home Assistant returned an invalid states response."
    );
  }

  return states;
}