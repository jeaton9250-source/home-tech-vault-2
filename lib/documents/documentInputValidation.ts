import {
  DOCUMENT_MAX_BYTES,
} from "@/lib/documents/uploadSecurity";

export const DOCUMENT_FIELD_LIMITS = {
  documentName: 160,
  fileName: 255,
} as const;

export const DOCUMENT_TYPES = [
  "Receipt",
  "Manual",
  "Warranty",
  "Invoice",
  "Photo",
  "Other",
] as const;

export type DocumentType =
  (typeof DOCUMENT_TYPES)[number];

export type DocumentMetadataInput = {
  documentName: string;
  fileName: string;
  fileType: string;
  deviceId: string;
  fileSize: number;
  browserContentType: string;
};

export type ValidatedDocumentMetadata = {
  documentName: string;
  fileName: string;
  fileType: DocumentType;
  deviceId: string;
  fileSize: number;
  contentType: string;
};

export type DocumentMetadataValidationResult =
  | {
      success: true;
      data: ValidatedDocumentMetadata;
    }
  | {
      success: false;
      error: string;
    };

const EXTENSION_CONTENT_TYPES: Record<
  string,
  string
> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  txt: "text/plain",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function resolveExpectedContentType(
  fileName: string
) {
  const extension = fileName
    .split(".")
    .pop()
    ?.trim()
    .toLowerCase();

  if (!extension) {
    return null;
  }

  return (
    EXTENSION_CONTENT_TYPES[
      extension
    ] ?? null
  );
}

function contentTypesAreCompatible(
  expected: string,
  browser: string
) {
  if (!browser) {
    return true;
  }

  if (
    browser ===
    "application/octet-stream"
  ) {
    return true;
  }

  if (browser === expected) {
    return true;
  }

  const heicTypes = new Set([
    "image/heic",
    "image/heif",
  ]);

  return (
    heicTypes.has(expected) &&
    heicTypes.has(browser)
  );
}

export function validateDocumentMetadata(
  input: DocumentMetadataInput
): DocumentMetadataValidationResult {
  const fileName =
    input.fileName.trim();

  if (!fileName) {
    return {
      success: false,
      error:
        "The selected file needs a valid name.",
    };
  }

  if (
    fileName.length >
    DOCUMENT_FIELD_LIMITS.fileName
  ) {
    return {
      success: false,
      error:
        `File name must be ${DOCUMENT_FIELD_LIMITS.fileName} characters or fewer.`,
    };
  }

  if (
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName.includes("\0")
  ) {
    return {
      success: false,
      error:
        "The selected file name is not valid.",
    };
  }

  if (
    !Number.isFinite(
      input.fileSize
    ) ||
    input.fileSize <= 0
  ) {
    return {
      success: false,
      error:
        "The selected file is empty.",
    };
  }

  if (
    input.fileSize >
    DOCUMENT_MAX_BYTES
  ) {
    return {
      success: false,
      error:
        "Documents must be 15 MB or smaller.",
    };
  }

  const expectedContentType =
    resolveExpectedContentType(
      fileName
    );

  if (!expectedContentType) {
    return {
      success: false,
      error:
        "Only PDF, JPEG, PNG, WebP, HEIC, and plain text files are allowed.",
    };
  }

  const browserContentType =
    input.browserContentType
      .trim()
      .toLowerCase();

  if (
    !contentTypesAreCompatible(
      expectedContentType,
      browserContentType
    )
  ) {
    return {
      success: false,
      error:
        "The file extension does not match the selected file type.",
    };
  }

  if (
    !DOCUMENT_TYPES.includes(
      input.fileType as DocumentType
    )
  ) {
    return {
      success: false,
      error:
        "Choose a valid document type.",
    };
  }

  const documentName =
    input.documentName.trim();

  if (
    documentName.length >
    DOCUMENT_FIELD_LIMITS.documentName
  ) {
    return {
      success: false,
      error:
        `Document name must be ${DOCUMENT_FIELD_LIMITS.documentName} characters or fewer.`,
    };
  }

  const deviceId =
    input.deviceId.trim();

  if (
    deviceId &&
    !UUID_PATTERN.test(deviceId)
  ) {
    return {
      success: false,
      error:
        "Choose a valid connected device.",
    };
  }

  return {
    success: true,
    data: {
      documentName:
        documentName || fileName,
      fileName,
      fileType:
        input.fileType as DocumentType,
      deviceId,
      fileSize:
        input.fileSize,
      contentType:
        expectedContentType,
    },
  };
}

export function sanitizeDocumentStorageFileName(
  fileName: string
) {
  const dotIndex =
    fileName.lastIndexOf(".");

  const extension =
    dotIndex >= 0
      ? fileName
          .slice(dotIndex + 1)
          .toLowerCase()
      : "";

  const rawBase =
    dotIndex >= 0
      ? fileName.slice(0, dotIndex)
      : fileName;

  const safeBase =
    rawBase
      .normalize("NFKD")
      .replace(
        /[^a-zA-Z0-9_-]+/g,
        "-"
      )
      .replace(/-+/g, "-")
      .replace(/^[-_.]+/, "")
      .replace(/[-_.]+$/, "")
      .slice(0, 160) ||
    "document";

  return extension
    ? `${safeBase}.${extension}`
    : safeBase;
}
