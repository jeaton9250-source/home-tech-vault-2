import { invoke } from "@tauri-apps/api/core";

import type {
  HomeAssistantConfig,
  HomeAssistantState,
} from "./types";

type HomeAssistantConnectionResponse = {
  connected: boolean;
};

function normalizeBaseUrl(
  value: string
): string {
  const normalized = value
    .trim()
    .replace(/\/+$/, "");

  if (!normalized) {
    throw new Error(
      "Home Assistant URL is required."
    );
  }

  return normalized;
}

function normalizeAccessToken(
  value: string
): string {
  const token = value.trim();

  if (!token) {
    throw new Error(
      "Home Assistant access token is required."
    );
  }

  return token;
}

function normalizeTauriError(
  error: unknown,
  fallback: string
): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return new Error(error.message);
  }

  return new Error(fallback);
}

export async function testHomeAssistantConnection(
  config: HomeAssistantConfig
): Promise<boolean> {
  const baseUrl = normalizeBaseUrl(
    config.baseUrl
  );

  const accessToken =
    normalizeAccessToken(
      config.accessToken
    );

  try {
    const result =
      await invoke<HomeAssistantConnectionResponse>(
        "test_home_assistant_connection",
        {
          baseUrl,
          accessToken,
        }
      );

    return result.connected;
  } catch (error) {
    throw normalizeTauriError(
      error,
      "Unable to test the Home Assistant connection."
    );
  }
}

export async function getHomeAssistantStates(
  config: HomeAssistantConfig
): Promise<HomeAssistantState[]> {
  const baseUrl = normalizeBaseUrl(
    config.baseUrl
  );

  const accessToken =
    normalizeAccessToken(
      config.accessToken
    );

  try {
    const states =
      await invoke<HomeAssistantState[]>(
        "get_home_assistant_states",
        {
          baseUrl,
          accessToken,
        }
      );

    if (!Array.isArray(states)) {
      throw new Error(
        "Home Assistant returned an invalid states response."
      );
    }

    return states;
  } catch (error) {
    throw normalizeTauriError(
      error,
      "Unable to load Home Assistant devices."
    );
  }
}