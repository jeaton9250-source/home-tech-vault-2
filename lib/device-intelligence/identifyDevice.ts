import {
  classifyConfidence,
  confidenceLabel,
} from "@/lib/device-intelligence/classifyConfidence";
import { analyzeHostname } from "@/lib/device-intelligence/hostnameRules";
import { normalizeObservation } from "@/lib/device-intelligence/normalizeObservation";
import { classifyNetworkArtifact } from "@/lib/device-intelligence/rejectArtifacts";
import { scoreCandidates } from "@/lib/device-intelligence/scoreCandidates";
import {
  ANALYSIS_VERSION,
  CATALOG_VERSION,
  EVIDENCE_WEIGHTS,
  RULE_SET_VERSION,
  VENDOR_DATASET_VERSION,
  type DeviceCandidate,
  type DeviceIntelligenceResult,
  type DiscoveryEvidence,
  type RawDiscoveryObservation,
} from "@/lib/device-intelligence/types";

export type IdentifyDeviceInput = RawDiscoveryObservation & {
  previousConfirmation?: boolean | null;
  matchedVaultDeviceId?: string | null;
  connectorHostIdentity?: {
    modelName?: string | null;
    modelFamily?: string | null;
    computerName?: string | null;
  } | null;
};

function pickAlternatives(
  candidates: DeviceCandidate[]
): DeviceCandidate[] {
  if (candidates.length <= 1) {
    return [];
  }

  const best = candidates[0]!;
  return candidates
    .slice(1)
    .filter(
      (candidate) =>
        candidate.score >= Math.max(25, best.score - 25) &&
        candidate.catalogId !== best.catalogId
    )
    .slice(0, 2);
}

function shouldAutoMatch(
  best: DeviceCandidate | null,
  alternatives: DeviceCandidate[]
): boolean {
  if (!best) {
    return false;
  }

  if (best.confidence === "exact") {
    return true;
  }

  if (
    best.confidence === "high" &&
    best.conflictingEvidence.length === 0 &&
    (alternatives.length === 0 ||
      best.score - alternatives[0]!.score >= 15)
  ) {
    return true;
  }

  return false;
}

/**
 * Produce a ranked Device Intelligence result for one observation.
 * Does not claim exact product identity from MAC prefix alone.
 */
export function identifyDevice(
  input: IdentifyDeviceInput
): DeviceIntelligenceResult {
  const analyzedAt = new Date().toISOString();
  const artifact = classifyNetworkArtifact(input);

  if (artifact) {
    return {
      observationId:
        input.observationId?.trim() ||
        input.localFingerprint?.trim() ||
        "artifact",
      bestCandidate: null,
      alternatives: [],
      confidence: "unknown",
      confidenceScore: 0,
      shouldAutoMatch: false,
      shouldAskForConfirmation: false,
      matchedVaultDeviceId: null,
      identificationSource: `artifact:${artifact.reason}`,
      analyzedAt,
      ruleSetVersion: RULE_SET_VERSION,
      catalogVersion: CATALOG_VERSION,
      vendorDatasetVersion: VENDOR_DATASET_VERSION,
    };
  }

  const observation = normalizeObservation(input);
  const hostname = analyzeHostname(observation.hostnameOriginal);

  // Authoritative: previous household confirmation
  if (input.previousConfirmation) {
    return {
      observationId: observation.observationId,
      bestCandidate: {
        catalogId: "previous-confirmation",
        manufacturer: observation.manufacturer,
        family: observation.model,
        suggestedName:
          observation.friendlyName ||
          observation.hostnameOriginal ||
          "Confirmed device",
        category: hostname.suggestedCategory ?? "unknown",
        score: 100,
        confidence: "exact",
        evidence: [
          {
            type: "previous_confirmation",
            label: "Previously confirmed in this household",
            weight: EVIDENCE_WEIGHTS.previousConfirmation,
            matched: true,
            reliability: "authoritative",
          },
        ],
        conflictingEvidence: [],
      },
      alternatives: [],
      confidence: "exact",
      confidenceScore: 100,
      shouldAutoMatch: true,
      shouldAskForConfirmation: false,
      matchedVaultDeviceId:
        input.matchedVaultDeviceId ?? null,
      identificationSource: "previous_confirmation",
      analyzedAt,
      ruleSetVersion: RULE_SET_VERSION,
      catalogVersion: CATALOG_VERSION,
      vendorDatasetVersion: VENDOR_DATASET_VERSION,
    };
  }

  // Authoritative: connector host self-identification
  if (
    input.connectorHostIdentity?.modelName ||
    input.connectorHostIdentity?.computerName
  ) {
    const modelName =
      input.connectorHostIdentity.modelName?.trim() ||
      input.connectorHostIdentity.computerName?.trim() ||
      "This computer";

    return {
      observationId: observation.observationId,
      bestCandidate: {
        catalogId: "connector-host",
        manufacturer: "Apple",
        family:
          input.connectorHostIdentity.modelFamily?.trim() ||
          "Mac",
        suggestedName: modelName,
        category: "computer",
        score: 100,
        confidence: "exact",
        evidence: [
          {
            type: "connector_identity",
            label:
              "Connected through Home Tech Vault Connector — host identity",
            value: modelName,
            weight: EVIDENCE_WEIGHTS.connectorIdentity,
            matched: true,
            reliability: "authoritative",
          },
        ],
        conflictingEvidence: [],
      },
      alternatives: [],
      confidence: "exact",
      confidenceScore: 100,
      shouldAutoMatch: true,
      shouldAskForConfirmation: false,
      matchedVaultDeviceId:
        input.matchedVaultDeviceId ?? null,
      identificationSource: "connector_identity",
      analyzedAt,
      ruleSetVersion: RULE_SET_VERSION,
      catalogVersion: CATALOG_VERSION,
      vendorDatasetVersion: VENDOR_DATASET_VERSION,
    };
  }

  const candidates = scoreCandidates(observation);

  // Hostname-only soft candidate when catalog missed
  if (
    candidates.length === 0 &&
    hostname.suggestedName &&
    hostname.specificity !== "none"
  ) {
    const evidence: DiscoveryEvidence[] = [
      {
        type: "hostname",
        label:
          hostname.evidenceLabel ??
          "Hostname pattern suggestion",
        value: observation.hostnameOriginal,
        weight:
          hostname.specificity === "generic" ? 15 : 40,
        matched: true,
        reliability:
          hostname.specificity === "generic"
            ? "weak"
            : "moderate",
      },
    ];

    if (observation.isPrivateMac) {
      evidence.push({
        type: "private_mac",
        label:
          "This device is using a private network address, so its manufacturer cannot be confirmed from the MAC address.",
        weight: 0,
        matched: true,
        reliability: "weak",
      });
    }

    const score =
      hostname.specificity === "generic" ? 20 : 40;
    const confidence = classifyConfidence(score, evidence, []);

    candidates.push({
      catalogId: `hostname:${hostname.suggestedFamily ?? "generic"}`,
      manufacturer: hostname.suggestedManufacturer,
      family: hostname.suggestedFamily,
      suggestedName: hostname.suggestedName,
      category: hostname.suggestedCategory ?? "unknown",
      score,
      confidence,
      evidence,
      conflictingEvidence: [],
    });
  }

  const bestCandidate = candidates[0] ?? null;
  const alternatives = pickAlternatives(candidates);
  const confidence = bestCandidate?.confidence ?? "unknown";
  const confidenceScore = bestCandidate?.score ?? 0;
  const auto = shouldAutoMatch(bestCandidate, alternatives);

  return {
    observationId: observation.observationId,
    bestCandidate,
    alternatives,
    confidence,
    confidenceScore,
    shouldAutoMatch: auto,
    shouldAskForConfirmation:
      !auto &&
      confidence !== "unknown" &&
      confidence !== "exact",
    matchedVaultDeviceId:
      input.matchedVaultDeviceId ?? null,
    identificationSource: bestCandidate
      ? `catalog:${bestCandidate.catalogId}`
      : "unknown",
    analyzedAt,
    ruleSetVersion: RULE_SET_VERSION,
    catalogVersion: CATALOG_VERSION,
    vendorDatasetVersion: VENDOR_DATASET_VERSION,
  };
}

export function explainIntelligenceResult(
  result: DeviceIntelligenceResult
): {
  headline: string;
  strongEvidence: string[];
  additionalInfo: string[];
  confidenceLabel: string;
} {
  const best = result.bestCandidate;

  if (!best) {
    return {
      headline: "Why this is unknown",
      strongEvidence: [
        "No product-specific network services were found",
        "Evidence was too weak to recommend a device",
      ],
      additionalInfo: [
        `Analysis version ${ANALYSIS_VERSION}`,
      ],
      confidenceLabel: confidenceLabel("unknown"),
    };
  }

  const strongEvidence = best.evidence
    .filter(
      (item) =>
        item.matched &&
        (item.reliability === "authoritative" ||
          item.reliability === "strong" ||
          item.reliability === "moderate")
    )
    .map((item) => item.label);

  const additionalInfo = best.evidence
    .filter(
      (item) =>
        item.matched && item.reliability === "weak"
    )
    .map((item) => item.label);

  if (best.conflictingEvidence.length > 0) {
    additionalInfo.push(
      ...best.conflictingEvidence.map(
        (item) => `Conflict: ${item.label}`
      )
    );
  }

  const weakOnly =
    result.confidence === "low" ||
    result.confidence === "unknown";

  return {
    headline: weakOnly
      ? "Why this is only a suggestion"
      : `Why Home Tech Vault thinks this is ${best.suggestedName}`,
    strongEvidence:
      strongEvidence.length > 0
        ? strongEvidence
        : ["Limited supporting evidence"],
    additionalInfo,
    confidenceLabel: confidenceLabel(result.confidence),
  };
}
