// Pure contract shared with the website API; no native dependencies.
export const ISSUE_CATEGORIES = [
  "Appliance",
  "Wi-Fi / internet",
  "TV / entertainment",
  "Smart home",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Other",
] as const;
export type HelpResult = {
  summary: string;
  urgency: "routine" | "professional" | "emergency";
  steps: string[];
  nextQuestion: string;
  safety: string;
  warranty?: {
    state: "appears_active" | "date_passed" | "unknown";
    message: string;
  };
};
export type SavedIssue = {
  id: string;
  user_id: string;
  device_id: string | null;
  category: string;
  description: string;
  ai_summary: string;
  status: "open" | "resolved";
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
};
export function urgentHelp(text: string): HelpResult | null {
  const normalized = text.replace(/\bfire\s*(tv|stick|tablet|cube)\b/gi, "streaming device");
  // Deliberately conservative: a possible hazard must never enter a DIY flow.
  if (
    /gas\s*(smell|leak)|smell.{0,25}gas|rotten eggs|carbon monoxide|\bCO\s*(alarm|detector)|smoke|\bfire\b|burning\s*(smell|odor)|sparks?|arcing|electri(c|cal).{0,25}(shock|water|leak)|water.{0,25}(outlet|electric|breaker)|exposed\s*wir|live\s*wir|major\s*leak|flood|hissing.{0,20}gas/i.test(
      normalized,
    )
  ) {
    return {
      summary: "This may be dangerous. Stop troubleshooting.",
      urgency: "emergency",
      steps: [],
      nextQuestion: "",
      safety:
        "Move people and pets to a safe place. For gas smells, carbon monoxide, fire or smoke, leave the building and call local emergency services from outside. Do not operate switches, plugs, flames or appliances. Stay away from water near electricity and exposed wiring. Contact emergency services or a qualified professional; do not attempt a repair. HTV cannot assess whether your home is safe.",
    };
  }
  return null;
}
export function warrantyInfo(
  date: string | null | undefined,
  now = new Date(),
): NonNullable<HelpResult["warranty"]> {
  if (
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date.slice(0, 10)) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date.slice(0, 10)
  )
    return {
      state: "unknown",
      message:
        "No valid warranty end date is saved. Coverage is unknown; check your documents or contact the manufacturer.",
    };
  const end = date.slice(0, 10);
  return end >= now.toISOString().slice(0, 10)
    ? {
        state: "appears_active",
        message: `Your saved warranty end date is ${end}. The device appears to be within that period; confirm eligibility and exclusions with the manufacturer.`,
      }
    : {
        state: "date_passed",
        message: `Your saved warranty end date (${end}) has passed. Other coverage may exist; confirm with the manufacturer.`,
      };
}
