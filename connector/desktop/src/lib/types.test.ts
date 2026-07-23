import { describe, expect, it } from "vitest";

import { ConnectorApiError } from "./types";

describe("ConnectorApiError", () => {
  it("preserves error kind for revoked responses", () => {
    const error = new ConnectorApiError(
      "unauthorized",
      "Connector access revoked or invalid."
    );

    expect(error.kind).toBe("unauthorized");
    expect(error.message).toContain("revoked");
  });
});
