/**
 * Document upload security helpers.
 * Never trust browser-reported MIME alone for authorization decisions.
 */

export const DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;

export const DOCUMENT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "text/plain",
] as const;

const EXTENSION_MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  txt: "text/plain",
};

export function resolveDocumentContentType(
  file: File
): string | null {
  const fromBrowser = file.type.trim().toLowerCase();

  if (
    DOCUMENT_ALLOWED_MIME_TYPES.includes(
      fromBrowser as (typeof DOCUMENT_ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return fromBrowser;
  }

  const extension = file.name
    .split(".")
    .pop()
    ?.trim()
    .toLowerCase();

  if (!extension) {
    return null;
  }

  return EXTENSION_MIME[extension] ?? null;
}

export function validateDocumentUpload(
  file: File
): { ok: true; contentType: string } | { ok: false; error: string } {
  if (file.size <= 0) {
    return { ok: false, error: "The selected file is empty." };
  }

  if (file.size > DOCUMENT_MAX_BYTES) {
    return {
      ok: false,
      error: "Documents must be 15 MB or smaller.",
    };
  }

  const contentType = resolveDocumentContentType(file);

  if (!contentType) {
    return {
      ok: false,
      error:
        "Only PDF, JPEG, PNG, WebP, HEIC, and plain text files are allowed.",
    };
  }

  return { ok: true, contentType };
}

/**
 * Extract a storage object path from either a raw path or a public Supabase URL.
 */
export function extractDocumentsStoragePath(
  fileUrl: string | null | undefined
): string | null {
  if (!fileUrl?.trim()) {
    return null;
  }

  const value = fileUrl.trim();

  if (!value.startsWith("http")) {
    return value.replace(/^\/+/, "");
  }

  const marker = "/storage/v1/object/public/documents/";
  const index = value.indexOf(marker);

  if (index >= 0) {
    return decodeURIComponent(
      value.slice(index + marker.length).split("?")[0] ?? ""
    );
  }

  const signedMarker = "/storage/v1/object/sign/documents/";
  const signedIndex = value.indexOf(signedMarker);

  if (signedIndex >= 0) {
    return decodeURIComponent(
      value
        .slice(signedIndex + signedMarker.length)
        .split("?")[0] ?? ""
    );
  }

  return null;
}
