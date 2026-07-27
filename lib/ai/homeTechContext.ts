import "server-only";

import type { SmartSearchItem } from "@/lib/search/searchTypes";

export type HomeTechFact = {
  title: string;
  detail: string;
  href?: string;
};

export type HomeTechAssistantContext = {
  question: string;
  facts: HomeTechFact[];
  recommendations: string[];
  missingInformation: string[];
};

export function buildHomeTechAssistantContext(options: {
  question: string;
  authorizedResults: SmartSearchItem[];
}): HomeTechAssistantContext {
  const facts: HomeTechFact[] = options.authorizedResults.map((item) => ({
    title: item.title,
    detail: [item.subtitle, item.status, item.location].filter(Boolean).join(" • "),
    href: item.href,
  }));

  const missingInformation: string[] = [];

  if (facts.length === 0) {
    missingInformation.push("No matching records were found in Home Tech Vault.");
  }

  const recommendations = [
    "Review missing serial numbers, warranty dates, and locations to improve future answers.",
  ];

  return {
    question: options.question,
    facts,
    recommendations,
    missingInformation,
  };
}
