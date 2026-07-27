import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildDemoSmartSearchResponse } from "@/lib/demo/demoSmartSearch";
import { emptySearchResults } from "@/lib/search/searchTypes";
import { resolveSmartSearchResponse } from "@/lib/search/smartSearchClient";
import {
  getSmartSearchQueryFromUrl,
  shouldAutoRunDemoSearch,
} from "@/lib/search/smartSearchState";

function createMockFetch(options: {
  ok?: boolean;
  payload: unknown;
}) {
  const calls: Array<{
    input: string;
    init?: RequestInit;
  }> = [];

  const fetcher = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => {
    calls.push({
      input: String(input),
      init,
    });

    return {
      ok: options.ok ?? true,
      json: async () => options.payload,
    } as Response;
  };

  return {
    calls,
    fetcher,
  };
}

describe("smart search client helpers", () => {
  it("does not call /api/search in Demo Mode", async () => {
    const fetch = createMockFetch({
      payload: { success: true },
    });

    const response = await resolveSmartSearchResponse({
      query: "offline devices",
      isDemo: true,
      buildDemoResponse: buildDemoSmartSearchResponse,
      fetcher: fetch.fetcher,
    });

    assert.equal(fetch.calls.length, 0);
    assert.ok(response.success);
    assert.ok(response.total > 0);
  });

  it("still calls /api/search for live authenticated search", async () => {
    const fetch = createMockFetch({
      payload: {
        success: true,
        query: "offline devices",
        intent: {
          raw: "offline devices",
          normalized: "offline devices",
          tokens: ["offline"],
          phrases: [],
          wantsOffline: true,
          wantsOnline: false,
          wantsNetwork: false,
          wantsWarrantySoon: false,
          wantsMaintenance: false,
          wantsDocuments: false,
          wantsSerialNumber: false,
          olderThanYears: null,
          locationHint: null,
        },
        results: emptySearchResults(),
        total: 0,
        suggestions: [],
      },
    });

    const response = await resolveSmartSearchResponse({
      query: "offline devices",
      isDemo: false,
      buildDemoResponse: buildDemoSmartSearchResponse,
      fetcher: fetch.fetcher,
    });

    assert.equal(fetch.calls.length, 1);
    assert.match(fetch.calls[0].input, /\/api\/search\?q=offline%20devices$/);
    assert.ok(response.success);
  });

  it("reads q from the URL and bootstraps demo search on page load", () => {
    const urlQuery = getSmartSearchQueryFromUrl(
      new URLSearchParams("q=offline+devices"),
      ""
    );

    assert.equal(urlQuery, "offline devices");
    assert.equal(
      shouldAutoRunDemoSearch({
        mode: "page",
        isDemo: true,
        activeQuery: urlQuery,
        initialResponse: null,
      }),
      true
    );
  });
});

describe("demo smart search results", () => {
  it("returns the Epson Printer for offline devices", () => {
    const response = buildDemoSmartSearchResponse(
      "offline devices"
    );

    assert.ok(
      response.results.devices.some(
        (item) =>
          item.title === "Epson Printer" &&
          item.status === "Offline"
      )
    );
  });

  it("returns living room devices for a room query", () => {
    const response = buildDemoSmartSearchResponse(
      "Which devices are in the living room?"
    );

    assert.ok(
      response.results.devices.some(
        (item) => item.title === "Living Room Apple TV"
      )
    );
    assert.ok(
      response.results.devices.some(
        (item) => item.title === "Samsung TV"
      )
    );
  });

  it("returns the expiring warranty for the Samsung TV", () => {
    const response = buildDemoSmartSearchResponse(
      "What warranties expire soon?"
    );

    assert.ok(
      response.results.warranties.some(
        (item) => item.title === "Samsung TV"
      )
    );
  });

  it("returns the router receipt document", () => {
    const response = buildDemoSmartSearchResponse(
      "Where is my router receipt?"
    );

    assert.ok(
      response.results.documents.some(
        (item) => item.title === "Wi-Fi Router Receipt"
      )
    );
  });

  it("returns the overdue printer task for maintenance queries", () => {
    const response = buildDemoSmartSearchResponse(
      "Show devices that need maintenance"
    );

    assert.ok(
      response.results.maintenance.some(
        (item) => /epson printer ink/i.test(item.title)
      )
    );
  });

  it("returns the older-than-five-years device", () => {
    const response = buildDemoSmartSearchResponse(
      "What technology is more than five years old?"
    );

    assert.ok(
      response.results.devices.some(
        (item) => item.title === "Samsung TV"
      )
    );
  });

  it("returns the printer when the user asks to find it", () => {
    const response = buildDemoSmartSearchResponse(
      "Find my printer"
    );

    assert.ok(
      response.results.devices.some(
        (item) => item.title === "Epson Printer"
      )
    );
  });

  it("returns Xbox documents for a device document query", () => {
    const response = buildDemoSmartSearchResponse(
      "Show documents for my Xbox"
    );

    assert.ok(
      response.results.documents.some((item) =>
        /xbox/i.test(item.title)
      )
    );
  });

  it("returns connected devices for network queries", () => {
    const response = buildDemoSmartSearchResponse(
      "What is connected to my network?"
    );

    assert.ok(response.results.network.length >= 4);
    assert.ok(
      response.results.network.some(
        (item) => item.title === "Wi-Fi Router"
      )
    );
    assert.ok(
      response.results.network.some(
        (item) => item.title === "Epson Printer"
      )
    );
    assert.ok(
      response.results.network.some(
        (item) => /echo show/i.test(item.title)
      )
    );
  });

  it("returns the same grouped response structure as live search", () => {
    const response = buildDemoSmartSearchResponse(
      "offline devices"
    );

    assert.deepEqual(
      Object.keys(response.results).sort(),
      Object.keys(emptySearchResults()).sort()
    );
    assert.equal(response.success, true);
    assert.equal(typeof response.intent.raw, "string");
    assert.ok(Array.isArray(response.suggestions));
  });

  it("returns suggestions for an empty demo search", () => {
    const response = buildDemoSmartSearchResponse("");

    assert.equal(response.total, 0);
    assert.deepEqual(response.results, emptySearchResults());
    assert.ok(response.suggestions.length > 0);
  });

  it("does not expose local hostnames in demo result titles", () => {
    const response = buildDemoSmartSearchResponse(
      "What is connected to my network?"
    );

    const titles = [
      ...response.results.devices,
      ...response.results.warranties,
      ...response.results.maintenance,
      ...response.results.documents,
      ...response.results.network,
    ].map((item) => item.title);

    assert.ok(
      titles.every(
        (title) => !/\.lan$|\.local$/i.test(title)
      )
    );
  });

  it("keeps demo links read-only", () => {
    const response = buildDemoSmartSearchResponse(
      "offline devices"
    );

    const hrefs = [
      ...response.results.devices,
      ...response.results.warranties,
      ...response.results.maintenance,
      ...response.results.documents,
      ...response.results.network,
    ].map((item) => item.href);

    assert.ok(
      hrefs.every(
        (href) =>
          !/\/(edit|upload|import|accept|create)\b/i.test(href)
      )
    );
  });
});
