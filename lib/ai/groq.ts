import "server-only";

import OpenAI from "openai";

const DEFAULT_GROQ_BASE_URL =
  "https://api.groq.com/openai/v1";

const DEFAULT_FAST_MODEL =
  "openai/gpt-oss-20b";

const DEFAULT_ADVISOR_MODEL =
  "openai/gpt-oss-120b";

export function getGroqApiKey():
  | string
  | null {
  const value =
    process.env
      .GROQ_API_KEY
      ?.trim();

  return value || null;
}

export function createGroqClient():
  | OpenAI
  | null {
  const apiKey =
    getGroqApiKey();

  if (!apiKey) {
    return null;
  }

  return new OpenAI({
    apiKey,

    baseURL:
      process.env
        .GROQ_BASE_URL
        ?.trim() ||
      DEFAULT_GROQ_BASE_URL,
  });
}

export function getGroqFastModel() {
  return (
    process.env
      .GROQ_FAST_MODEL
      ?.trim() ||
    DEFAULT_FAST_MODEL
  );
}

export function getGroqAdvisorModel() {
  return (
    process.env
      .GROQ_ADVISOR_MODEL
      ?.trim() ||
    DEFAULT_ADVISOR_MODEL
  );
}
