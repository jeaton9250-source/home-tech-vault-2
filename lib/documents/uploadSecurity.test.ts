import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractDocumentsStoragePath,
  validateDocumentUpload,
} from "./uploadSecurity";

describe("validateDocumentUpload", () => {
  it("rejects oversized files", () => {
    const file = new File(
      [new Uint8Array(16 * 1024 * 1024)],
      "big.pdf",
      { type: "application/pdf" }
    );

    const result = validateDocumentUpload(file);
    assert.equal(result.ok, false);
  });

  it("accepts pdf by extension when type is empty", () => {
    const file = new File(
      [new Uint8Array([1, 2, 3])],
      "receipt.pdf",
      { type: "" }
    );

    const result = validateDocumentUpload(file);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.contentType, "application/pdf");
    }
  });

  it("rejects executable types", () => {
    const file = new File(
      [new Uint8Array([1])],
      "payload.exe",
      { type: "application/octet-stream" }
    );

    const result = validateDocumentUpload(file);
    assert.equal(result.ok, false);
  });
});

describe("extractDocumentsStoragePath", () => {
  it("returns raw paths unchanged", () => {
    assert.equal(
      extractDocumentsStoragePath(
        "household/device/file.pdf"
      ),
      "household/device/file.pdf"
    );
  });

  it("extracts path from public URL", () => {
    assert.equal(
      extractDocumentsStoragePath(
        "https://xyz.supabase.co/storage/v1/object/public/documents/a/b/c.pdf"
      ),
      "a/b/c.pdf"
    );
  });
});
