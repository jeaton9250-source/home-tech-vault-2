import { NextResponse } from "next/server";

import {
  createGroqClient,
  getGroqAdvisorModel,
  getGroqFastModel,
} from "@/lib/ai/groq";

import {
  loadHomeAdvisorContext,
} from "@/lib/advisor/loadHomeContext";

import {
  resolveHouseholdAccess,
} from "@/lib/data/householdScope";

import {
  featureAccessResponse,
  requireServerFeatureAccess,
} from "@/lib/permissions/requireServerFeatureAccess";

import {
  createClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";

const MAX_QUESTION_LENGTH =
  1_200;

const MAX_HISTORY_ITEMS = 8;

const ASK_TIMEOUT_MS =
  15_000;

type HistoryItem = {
  role: "user" | "assistant";
  content: string;
};

function privateJson(
  body: unknown,
  init?: ResponseInit
) {
  const headers =
    new Headers(
      init?.headers
    );

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  return NextResponse.json(
    body,
    {
      ...init,
      headers,
    }
  );
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise(
    (resolve, reject) => {
      const timer =
        setTimeout(() => {
          reject(
            new Error(
              "Ask Your Vault timed out."
            )
          );
        }, timeoutMs);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    }
  );
}

function normalizeHistory(
  value: unknown
): HistoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const history: HistoryItem[] =
    [];

  for (
    const item
    of value.slice(
      -MAX_HISTORY_ITEMS
    )
  ) {
    if (
      !item ||
      typeof item !== "object"
    ) {
      continue;
    }

    const row =
      item as Record<
        string,
        unknown
      >;

    const role =
      row.role;

    const content =
      typeof row.content ===
      "string"
        ? row.content.trim()
        : "";

    if (
      (
        role !== "user" &&
        role !== "assistant"
      ) ||
      !content
    ) {
      continue;
    }

    history.push({
      role,
      content:
        content.slice(
          0,
          MAX_QUESTION_LENGTH
        ),
    });
  }

  return history;
}


function simplifyAiAnswer(
  value: string
) {
  const cleanedLines: string[] =
    [];

  for (
    const rawLine
    of value.split(/\r?\n/)
  ) {
    let line =
      rawLine.trim();

    if (!line) {
      cleanedLines.push("");
      continue;
    }

    /*
     * Drop Markdown table separator rows.
     */
    if (
      /^\|?[\s:|-]+\|[\s:|-]*$/.test(
        line
      )
    ) {
      continue;
    }

    /*
     * Home Tech Vault renders plain text.
     * Remove Markdown decoration even if
     * the model ignores our instructions.
     */
    line = line
      .replace(/```/g, "")
      .replace(/\*\*/g, "")
      .replace(/__/g, "")
      .replace(
        /^#{1,6}\s*/,
        ""
      );

    /*
     * If the model still sends a table row,
     * turn the cells into readable text.
     */
    if (line.includes("|")) {
      const cells =
        line
          .split("|")
          .map(
            (cell) =>
              cell.trim()
          )
          .filter(Boolean);

      if (cells.length > 0) {
        line =
          cells.join(" — ");
      }
    }

    line = line.replace(
      /^[-*]\s+/,
      "• "
    );

    cleanedLines.push(line);
  }

  return cleanedLines
    .join("\n")
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}

export async function POST(
  request: Request
) {
  try {
    /*
     * Server-side Pro / Family entitlement.
     * Client gating is not trusted.
     */
    const access =
      await requireServerFeatureAccess(
        "aiAdvisor"
      );

    const body =
      (await request.json()) as {
        question?: unknown;
        history?: unknown;
        mode?: unknown;
      };

    const question =
      typeof body.question ===
      "string"
        ? body.question.trim()
        : "";

    const mode =
      body.mode === "search"
        ? "search"
        : "chat";

    if (!question) {
      return privateJson(
        {
          error:
            "Enter a question.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      question.length >
      MAX_QUESTION_LENGTH
    ) {
      return privateJson(
        {
          error:
            "That question is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const client =
      createGroqClient();

    if (!client) {
      return privateJson(
        {
          error:
            "Vault Intelligence is temporarily unavailable.",
        },
        {
          status: 503,
        }
      );
    }

    /*
     * Load the authoritative Vault context
     * on the server using the signed-in user's
     * existing household scope.
     */
    const supabase =
      await createClient();

    const {
      householdId,
      householdOwnerId,
    } =
      await resolveHouseholdAccess(
        access.userId,
        supabase
      );

    const context =
      await loadHomeAdvisorContext(
        supabase,
        access.userId,
        {
          householdId,
          householdOwnerId,
        }
      );

    const deviceNameById =
      new Map(
        context.devices.map(
          (device) => [
            device.id,
            device.device_name,
          ]
        )
      );

    /*
     * Build a deliberately limited snapshot.
     *
     * Passwords and authentication secrets
     * are never included.
     *
     * Raw serial numbers are also excluded;
     * the AI only needs to know whether one
     * has been recorded.
     */
    const snapshot = {
      generatedAt:
        context.now.toISOString(),

      totals: {
        devices:
          context.devices.length,

        documents:
          context.documents.length,

        maintenanceTasks:
          context
            .maintenanceTasks
            .length,

        subscriptions:
          context
            .subscriptions
            .length,

        pendingDiscoveries:
          context
            .pendingDiscoveries
            .filter(
              (item) =>
                !item.ignored_at &&
                !item
                  .imported_device_id
            )
            .length,

        networkConfigured:
          context
            .networkConfigured,
      },

      devices:
        context.devices
          .slice(0, 80)
          .map(
            (device) => ({
              name:
                device.device_name,

              brand:
                device.brand,

              category:
                device.category,

              location:
                device.location,

              purchasePrice:
                device
                  .purchase_price,

              purchaseDate:
                device
                  .purchase_date,

              warrantyExpiration:
                device
                  .warranty_date,

              online:
                device.online,

              lastSeenAt:
                device
                  .last_seen_at,

              hasSerialNumber:
                Boolean(
                  device
                    .serial_number
                    ?.trim()
                ),

              hasPhoto:
                context
                  .deviceIdsWithPhotos
                  .has(
                    device.id
                  ),

              hasDocument:
                context
                  .deviceIdsWithDocuments
                  .has(
                    device.id
                  ),

              hasReceipt:
                context
                  .deviceIdsWithReceipts
                  .has(
                    device.id
                  ),
            })
          ),

      documents:
        context.documents
          .slice(0, 120)
          .map(
            (document) => ({
              type:
                document
                  .document_type,

              device:
                document.device_id
                  ? deviceNameById.get(
                      document
                        .device_id
                    ) ?? null
                  : null,
            })
          ),

      maintenance:
        context
          .maintenanceTasks
          .slice(0, 80)
          .map(
            (task) => ({
              title:
                task.title,

              device:
                task.device_id
                  ? deviceNameById.get(
                      task.device_id
                    ) ?? null
                  : null,

              dueDate:
                task.due_date,

              completed:
                task.completed,
            })
          ),

      subscriptions:
        context
          .subscriptions
          .slice(0, 60)
          .map(
            (
              subscription
            ) => ({
              service:
                subscription
                  .service_name,

              monthlyCost:
                subscription
                  .monthly_cost,

              renewalDate:
                subscription
                  .renewal_date,
            })
          ),

      network: {
        configured:
          context
            .networkConfigured,

        connectors:
          context.connectors
            .slice(0, 10)
            .map(
              (connector) => ({
                status:
                  connector.status,

                lastSeenAt:
                  connector
                    .last_seen_at,

                lastScanAt:
                  connector
                    .last_scan_at,
              })
            ),

        pendingDevices:
          context
            .pendingDiscoveries
            .filter(
              (item) =>
                !item.ignored_at &&
                !item
                  .imported_device_id
            )
            .slice(0, 30)
            .map(
              (item) => ({
                label:
                  item.label,

                manufacturer:
                  item.manufacturer,
              })
            ),
      },
    };

    const history =
      normalizeHistory(
        body.history
      );

    const conversation =
      history.length > 0
        ? history
            .map(
              (item) =>
                `${
                  item.role ===
                  "user"
                    ? "HOMEOWNER"
                    : "VAULT INTELLIGENCE"
                }: ${item.content}`
            )
            .join("\n")
        : "No previous conversation.";

    const response =
      await withTimeout(
        client.responses.create({
          model:
            mode === "search"
              ? getGroqFastModel()
              : getGroqAdvisorModel(),

          store: false,

          reasoning: {
            effort: "low",
          },

          instructions: [
            "You are Vault Intelligence inside Home Tech Vault.",
            "",
            "You help homeowners understand, organize, protect, and troubleshoot the technology in their home.",
            "",
            "PERSONAL VAULT RULES:",
            "- The supplied Vault snapshot is authoritative for claims about this homeowner.",
            "- Never invent a device, brand, room, price, warranty, subscription, document, maintenance task, date, status, or household fact.",
            "- If information is not present, say it is not currently saved in the Vault.",
            "- Never expose or guess passwords, MFA codes, API keys, Wi-Fi passwords, authentication tokens, or other secrets.",
            "- Never claim you changed, controlled, restarted, updated, or contacted a device unless the application explicitly performed that action.",
            "",
            "GENERAL HELP RULES:",
            "- You may provide general technology troubleshooting guidance when the question asks for it.",
            "- Clearly avoid presenting general advice as a fact about the homeowner's specific setup.",
            "- Prefer safe, reversible troubleshooting steps first.",
            "",
            "STYLE:",
            "- Write for a homeowner with no technical background.",
            "- Use plain everyday words.",
            "- Be warm, direct, and very easy to understand.",
            "- Do not sound like an IT technician unless the homeowner asks for technical detail.",
            "- Never use a Markdown table.",
            "- Never use pipe characters for formatting.",
            "- Never use bold markers, heading markers, or code blocks.",
            "- Do not repeat the homeowner's question.",
            "- Refer to specific Vault devices by their saved names when useful.",
            "- Explain WHY something matters in one short sentence.",
            "- Put the most important action first.",
            mode === "search"
              ? "- SEARCH FORMAT: Keep the entire answer under 100 words. Give no more than 3 important actions. Use short numbered lines. End with one line beginning: Do first:"
              : "- FOLLOW-UP FORMAT: Keep the answer under 150 words. Answer the question directly before adding explanation.",
          ].join("\n"),

          input: [
            "CURRENT HOME TECH VAULT SNAPSHOT:",
            JSON.stringify(
              snapshot
            ),
            "",
            "RECENT CONVERSATION:",
            conversation,
            "",
            "CURRENT HOMEOWNER QUESTION:",
            question,
          ].join("\n"),

          max_output_tokens:
            mode === "search"
              ? 260
              : 500,
        }),

        ASK_TIMEOUT_MS
      );

    const rawAnswer =
      response.output_text
        ?.trim();

    const answer =
      rawAnswer
        ? simplifyAiAnswer(
            rawAnswer
          )
        : "";

    if (!answer) {
      return privateJson(
        {
          error:
            "Vault Intelligence did not return an answer.",
        },
        {
          status: 502,
        }
      );
    }

    return privateJson({
      success: true,
      answer,
      source: "ai",
    });
  } catch (error) {
    const accessResponse =
      featureAccessResponse(
        error
      );

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "[ask-your-vault] request failed:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return privateJson(
      {
        error:
          "Vault Intelligence is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}
