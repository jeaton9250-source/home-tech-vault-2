import { z } from "zod";
export const helpSchema = z.object({
  summary: z.string().min(1).max(800),
  urgency: z.enum(["routine", "professional", "emergency"]),
  steps: z.array(z.string().min(1).max(400)).max(5),
  nextQuestion: z.string().max(400),
  safety: z.string().max(800),
});
export const helpResponseFormat = {
  type: "json_schema" as const,
  name: "home_troubleshooting",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      urgency: {
        type: "string",
        enum: ["routine", "professional", "emergency"],
      },
      steps: { type: "array", items: { type: "string" } },
      nextQuestion: { type: "string" },
      safety: { type: "string" },
    },
    required: ["summary", "urgency", "steps", "nextQuestion", "safety"],
  },
};
export function parseHelp(value: string) {
  const source = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const result = helpSchema.parse(JSON.parse(source));
  // Never render DIY steps in elevated-risk recommendations.
  if (result.urgency !== "routine") result.steps = [];
  if (
    /bypass|disable.{0,20}(alarm|safety)|open.{0,20}(panel|housing)|live wir|gas valve|capacitor|breaker panel|replace.{0,20}breaker|remove.{0,20}(cover|panel)|test.{0,20}voltage|short.{0,20}terminal/i.test(
      [result.summary, ...result.steps, result.nextQuestion].join(" "),
    )
  ) {
    result.summary = "A qualified professional should handle this issue.";
    result.nextQuestion = "";
    result.urgency = "professional";
    result.steps = [];
    result.safety =
      "Stop here and contact a qualified professional. Do not open equipment, bypass safety features, or work on gas or electrical parts.";
  }
  if (result.urgency === "professional" && !result.safety)
    result.safety =
      "Stop troubleshooting and contact a qualified professional. Do not open equipment or work on gas, refrigerant, pressure or electrical parts.";
  return result;
}
