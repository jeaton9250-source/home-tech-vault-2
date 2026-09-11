import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateDocumentMetadata } from "./documentInputValidation";

describe("validateDocumentMetadata", () => {
  it("accepts an empty device id for a whole-home document", () => {
    const result = validateDocumentMetadata({
      documentName: "Home insurance inventory",
      fileName: "inventory.pdf",
      fileType: "Other",
      deviceId: "",
      fileSize: 1024,
      browserContentType: "application/pdf",
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.deviceId, "");
    }
  });
});
