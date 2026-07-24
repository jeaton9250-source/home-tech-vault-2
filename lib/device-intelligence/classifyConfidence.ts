import type {
  ConfidenceLevel,
  DiscoveryEvidence,
} from "@/lib/device-intelligence/types";

/**
 * Honest confidence classification.
 * Exact requires authoritative evidence with no conflicts.
 * Do not inflate confidence from MAC vendor alone.
 */
export function classifyConfidence(
  score: number,
  evidence: DiscoveryEvidence[],
  conflicts: DiscoveryEvidence[]
): ConfidenceLevel {
  const hasAuthoritative = evidence.some(
    (item) =>
      item.matched &&
      item.reliability === "authoritative"
  );

  if (hasAuthoritative && conflicts.length === 0) {
    return "exact";
  }

  if (score >= 80 && conflicts.length === 0) {
    return "high";
  }

  if (score >= 55) {
    return "medium";
  }

  if (score >= 25) {
    return "low";
  }

  return "unknown";
}

export function confidenceLabel(
  confidence: ConfidenceLevel
): string {
  switch (confidence) {
    case "exact":
      return "Exact identity";
    case "high":
      return "High confidence";
    case "medium":
      return "Possible match";
    case "low":
      return "Low-confidence suggestion";
    default:
      return "Unknown device";
  }
}

export function normalizeScoreTo100(
  rawScore: number,
  maxPossible = 100
): number {
  if (rawScore <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((rawScore / maxPossible) * 100)
  );
}
