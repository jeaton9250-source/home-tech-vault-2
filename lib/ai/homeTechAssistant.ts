import "server-only";

import { buildHomeTechAssistantContext } from "@/lib/ai/homeTechContext";
import type { SmartSearchItem } from "@/lib/search/searchTypes";

export type HomeTechAssistantDraft = {
  factsFromVault: string[];
  recommendations: string[];
  missingInformation: string[];
};

export function buildHomeTechAssistantDraft(options: {
  question: string;
  authorizedResults: SmartSearchItem[];
}): HomeTechAssistantDraft {
  const context = buildHomeTechAssistantContext({
    question: options.question,
    authorizedResults: options.authorizedResults,
  });

  return {
    factsFromVault: context.facts.map((fact) =>
      fact.detail ? `${fact.title}: ${fact.detail}` : fact.title
    ),
    recommendations: context.recommendations,
    missingInformation: context.missingInformation,
  };
}
