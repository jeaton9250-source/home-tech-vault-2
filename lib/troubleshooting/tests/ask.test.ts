import { test } from "node:test";
import assert from "node:assert/strict";
import { askHome } from "../ask";
import type { SupabaseClient } from "@supabase/supabase-js";

function fakeClient(devices: unknown[] = []) {
  const queries: { table: string; owner?: string; device?: string }[] = [];
  const client = {
    from(table: string) {
      const query = { table } as (typeof queries)[number];
      queries.push(query);
      const builder = {
        select() {
          return builder;
        },
        eq(column: string, value: string) {
          if (column === "user_id") query.owner = value;
          if (column === "id") query.device = value;
          return builder;
        },
        in() {
          return builder;
        },
        not() {
          return builder;
        },
        order() {
          return builder;
        },
        limit() {
          return builder;
        },
        is() {
          return builder;
        },
        neq() {
          return builder;
        },
        maybeSingle: async () => ({ data: null, error: null }),
        then(resolve: (r: unknown) => unknown) {
          return Promise.resolve(
            resolve({ data: table === "devices" ? devices : [], error: null }),
          );
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient;
  return { client, queries };
}
test("missing AI consent prevents any context or provider call", async () => {
  const mock = fakeClient();
  const response = await askHome(mock.client, "owner", {
    question: "Wi-Fi drops",
  });
  assert.equal(response.status, 400);
  assert.equal(mock.queries.length, 0);
});
test("hazards are handled without AI credentials or database reads", async () => {
  const mock = fakeClient();
  const response = await askHome(mock.client, "owner", {
    question: "I smell gas",
    aiConsent: false,
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.source, "safety");
  assert.deepEqual(body.troubleshooting.steps, []);
  assert.equal(mock.queries.length, 0);
});
test("model output and irrelevant context never replace authoritative ownership", async () => {
  const mock = fakeClient();
  const response = await askHome(mock.client, "owner", {
    question: "Wi-Fi drops",
    aiConsent: true,
    deviceId: "10000000-0000-4000-8000-000000000002",
  });
  assert.equal(response.status, 404);
  const deviceQuery = mock.queries.find(
    (q) => q.table === "devices" && q.device,
  );
  assert.equal(deviceQuery?.owner, "owner");
  assert.equal(deviceQuery?.device, "10000000-0000-4000-8000-000000000002");
});
test("invalid device ids and overly long input reject before database access", async () => {
  const mock = fakeClient();
  assert.equal(
    (
      await askHome(mock.client, "owner", {
        question: "x".repeat(1201),
        aiConsent: true,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await askHome(mock.client, "owner", {
        question: "test",
        aiConsent: true,
        deviceId: "spoof",
      })
    ).status,
    400,
  );
  assert.equal(mock.queries.length, 0);
});
test("assistant hazard boilerplate does not classify a routine follow-up as emergency", async () => {
  const mock = fakeClient();
  const response = await askHome(mock.client, "owner", {
    question: "Still not working",
    aiConsent: false,
    history: [
      { role: "assistant", content: "If you smell gas or see smoke, leave." },
    ],
  });
  assert.equal(response.status, 400);
});

test("successful AI request includes bounded owner context and authoritative warranty", async () => {
  const id = "10000000-0000-4000-8000-000000000001";
  const mock = fakeClient([
    {
      id,
      device_name: "Washer",
      brand: "Example",
      model_number: "AB12",
      category: "Appliance",
      purchase_date: null,
      purchase_price: null,
      warranty_date: null,
      manual_url: "https://example.com/manual",
      serial_number: "NEVER_SEND_SERIAL",
    },
  ]);
  const originalFetch = globalThis.fetch;
  const oldKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = "test";
  let sent: { input?: string; store?: boolean; instructions?: string } = {};
  globalThis.fetch = async (input, init) => {
    assert.match(String(input), /api.groq.com/);
    sent = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        id: "resp_test",
        object: "response",
        status: "completed",
        output: [
          {
            type: "message",
            id: "msg_test",
            role: "assistant",
            status: "completed",
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  summary: "Check the selected user control.",
                  urgency: "routine",
                  steps: ["Check the displayed error code."],
                  safety: "Follow the manual.",
                  nextQuestion: "Which error code is showing?",
                  warranty: { state: "appears_active" },
                }),
                annotations: [],
              },
            ],
          },
        ],
      }),
      { headers: { "content-type": "application/json" } },
    );
  };
  try {
    const response = await askHome(mock.client, "owner", {
      question: "Washer does not start",
      deviceId: id,
      aiConsent: true,
      mode: "troubleshooting",
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.troubleshooting.warranty.state, "unknown");
    assert.equal(body.troubleshooting.steps.length, 1);
    assert.equal(sent.store, false);
    assert.match(sent.input ?? "", /AB12/);
    assert.doesNotMatch(
      sent.input ?? "",
      /NEVER_SEND_SERIAL|https:\/\/example.com\/manual/,
    );
    assert.match(sent.instructions ?? "", /untrusted data/);
    for (const table of [
      "documents",
      "device_documents",
      "maintenance_tasks",
      "subscriptions",
      "network_info",
      "troubleshooting_issues",
    ])
      assert.ok(
        mock.queries.some((q) => q.table === table && q.owner === "owner"),
        table,
      );
  } finally {
    globalThis.fetch = originalFetch;
    if (oldKey) process.env.GROQ_API_KEY = oldKey;
    else delete process.env.GROQ_API_KEY;
  }
});

test("hazard history prevents a later routine-looking repair request", async () => {
  const mock = fakeClient();
  const response = await askHome(mock.client, "owner", {
    question: "Can I restart it?",
    aiConsent: true,
    history: [{ role: "user", content: "I smell gas" }],
  });
  const body = await response.json();
  assert.equal(body.source, "safety");
  assert.deepEqual(body.troubleshooting.steps, []);
  assert.equal(mock.queries.length, 0);
});
