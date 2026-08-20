"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  recordActivity,
} from "@/lib/activity";
import {
  applyHouseholdScope,
  fetchHouseholdIdForUser,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";
import {
  sanitizeDocumentStorageFileName,
  validateDocumentMetadata,
  type DocumentMetadataInput,
} from "@/lib/documents/documentInputValidation";
import {
  assertCanAddDocument,
  getServerDocumentCount,
  HouseholdQuotaError,
} from "@/lib/permissions/serverQuota";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  createClient,
} from "@/lib/supabase/server";

type DocumentActionCode =
  | "UNAUTHENTICATED"
  | "VIEWER_READ_ONLY"
  | "HOUSEHOLD_DOCUMENT_LIMIT"
  | "FREE_DOCUMENT_LIMIT"
  | "VALIDATION_ERROR"
  | "NOT_FOUND_OR_FORBIDDEN"
  | "UNKNOWN";

type DocumentActionFailure = {
  success: false;
  error: string;
  code: DocumentActionCode;
};

export type PrepareDocumentUploadResult =
  | {
      success: true;
      storagePath: string;
      contentType: string;
    }
  | DocumentActionFailure;

export type CompleteDocumentUploadResult =
  | {
      success: true;
      documentId: string;
      firstDocument: boolean;
    }
  | DocumentActionFailure;

function mapQuotaError(
  error: unknown
): DocumentActionFailure {
  if (
    error instanceof
    HouseholdQuotaError
  ) {
    if (
      error.code ===
      "viewer_read_only"
    ) {
      return {
        success: false,
        error: error.message,
        code:
          "VIEWER_READ_ONLY",
      };
    }

    if (
      error.code ===
      "household_document_limit"
    ) {
      return {
        success: false,
        error: error.message,
        code:
          "HOUSEHOLD_DOCUMENT_LIMIT",
      };
    }

    if (
      error.code ===
      "free_document_limit"
    ) {
      return {
        success: false,
        error: error.message,
        code:
          "FREE_DOCUMENT_LIMIT",
      };
    }
  }

  console.error(
    "Document quota check failed:",
    error
  );

  return {
    success: false,
    error:
      "Unable to verify document access right now.",
    code: "UNKNOWN",
  };
}

async function verifyDeviceAccess(
  options: {
    deviceId: string;
    householdId: string | null;
    userId: string;
    supabase: Awaited<
      ReturnType<
        typeof createClient
      >
    >;
  }
): Promise<
  | {
      success: true;
    }
  | DocumentActionFailure
> {
  if (!options.deviceId) {
    return {
      success: true,
    };
  }

  const {
    data: device,
    error,
  } =
    await applyHouseholdScope(
      options.supabase
        .from("devices")
        .select("id")
        .eq(
          "id",
          options.deviceId
        ),
      options.householdId,
      options.userId
    ).maybeSingle();

  if (error) {
    console.error(
      "Unable to verify document device:",
      error
    );

    return {
      success: false,
      error:
        "Unable to verify the connected device.",
      code: "UNKNOWN",
    };
  }

  if (!device) {
    return {
      success: false,
      error:
        "This device could not be found or you do not have access to it.",
      code:
        "NOT_FOUND_OR_FORBIDDEN",
    };
  }

  return {
    success: true,
  };
}

async function verifyDocumentQuota(
  userId: string
) {
  const admin =
    createAdminClient();

  try {
    const quota =
      await assertCanAddDocument(
        admin,
        userId
      );

    if (
      !quota.canAddDocument
    ) {
      return {
        result: {
          success: false,
          error:
            "Document uploads are not available for this account.",
          code:
            "VALIDATION_ERROR",
        } as DocumentActionFailure,
        admin,
      };
    }

    return {
      result: null,
      admin,
    };
  } catch (error) {
    return {
      result:
        mapQuotaError(error),
      admin,
    };
  }
}

export async function prepareDocumentUpload(
  input: DocumentMetadataInput
): Promise<PrepareDocumentUploadResult> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error:
        "You must be signed in to upload documents.",
      code: "UNAUTHENTICATED",
    };
  }

  const validation =
    validateDocumentMetadata(
      input
    );

  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error,
      code:
        "VALIDATION_ERROR",
    };
  }

  const quotaCheck =
    await verifyDocumentQuota(
      user.id
    );

  if (quotaCheck.result) {
    return quotaCheck.result;
  }

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const metadata =
    validation.data;

  const deviceAccess =
    await verifyDeviceAccess({
      deviceId:
        metadata.deviceId,
      householdId,
      userId: user.id,
      supabase,
    });

  if (!deviceAccess.success) {
    return deviceAccess;
  }

  const ownerPath =
    householdId || user.id;

  const devicePath =
    metadata.deviceId ||
    "unassigned";

  const safeFileName =
    sanitizeDocumentStorageFileName(
      metadata.fileName
    );

  const storagePath =
    `${ownerPath}/${devicePath}/` +
    `${crypto.randomUUID()}-${safeFileName}`;

  return {
    success: true,
    storagePath,
    contentType:
      metadata.contentType,
  };
}

export async function completeDocumentUpload(
  input:
    DocumentMetadataInput & {
      storagePath: string;
    }
): Promise<CompleteDocumentUploadResult> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error:
        "You must be signed in to upload documents.",
      code: "UNAUTHENTICATED",
    };
  }

  const validation =
    validateDocumentMetadata(
      input
    );

  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error,
      code:
        "VALIDATION_ERROR",
    };
  }

  const quotaCheck =
    await verifyDocumentQuota(
      user.id
    );

  if (quotaCheck.result) {
    return quotaCheck.result;
  }

  const admin =
    quotaCheck.admin;

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const metadata =
    validation.data;

  const deviceAccess =
    await verifyDeviceAccess({
      deviceId:
        metadata.deviceId,
      householdId,
      userId: user.id,
      supabase,
    });

  if (!deviceAccess.success) {
    return deviceAccess;
  }

  const ownerPath =
    householdId || user.id;

  const devicePath =
    metadata.deviceId ||
    "unassigned";

  const expectedPrefix =
    `${ownerPath}/${devicePath}/`;

  const storagePath =
    input.storagePath.trim();

  const objectName =
    storagePath.startsWith(
      expectedPrefix
    )
      ? storagePath.slice(
          expectedPrefix.length
        )
      : "";

  if (
    !objectName ||
    objectName.includes("/") ||
    objectName.includes("\\") ||
    objectName.includes("..")
  ) {
    return {
      success: false,
      error:
        "The uploaded document path is not valid.",
      code:
        "VALIDATION_ERROR",
    };
  }

  const storageFolder =
    `${ownerPath}/${devicePath}`;

  const {
    data: storedObjects,
    error: storageCheckError,
  } = await supabase.storage
    .from("documents")
    .list(storageFolder, {
      limit: 10,
      search: objectName,
    });

  if (storageCheckError) {
    console.error(
      "Unable to verify uploaded document:",
      storageCheckError
    );

    return {
      success: false,
      error:
        "Unable to verify the uploaded file.",
      code: "UNKNOWN",
    };
  }

  const objectExists =
    (storedObjects ?? []).some(
      (item) =>
        item.name === objectName
    );

  if (!objectExists) {
    return {
      success: false,
      error:
        "The uploaded file could not be found.",
      code:
        "VALIDATION_ERROR",
    };
  }

  const {
    data: existing,
    error: existingError,
  } =
    await applyHouseholdScope(
      supabase
        .from("documents")
        .select("id")
        .eq(
          "file_url",
          storagePath
        ),
      householdId,
      user.id
    ).maybeSingle();

  if (existingError) {
    console.error(
      "Unable to check document upload:",
      existingError
    );

    return {
      success: false,
      error:
        "Unable to finish saving this document.",
      code: "UNKNOWN",
    };
  }

  if (existing) {
    return {
      success: true,
      documentId:
        existing.id,
      firstDocument: false,
    };
  }

  const {
    data: created,
    error: dbError,
  } = await supabase
    .from("documents")
    .insert(
      withHouseholdInsertFields(
        {
          device_id:
            metadata.deviceId ||
            null,
          file_name:
            metadata.fileName,
          document_name:
            metadata.documentName,
          file_url:
            storagePath,
          file_type:
            metadata.fileType,
        },
        householdId,
        user.id
      )
    )
    .select("id")
    .single();

  if (dbError || !created) {
    const {
      error: cleanupError,
    } =
      await supabase.storage
        .from("documents")
        .remove([
          storagePath,
        ]);

    if (cleanupError) {
      console.warn(
        "Unable to clean up failed document upload:",
        cleanupError
      );
    }

    console.error(
      "Unable to save document record:",
      dbError
    );

    return {
      success: false,
      error:
        "Unable to save this document. Please try again.",
      code: "UNKNOWN",
    };
  }

  await recordActivity({
    activityType:
      metadata.fileType ===
      "Receipt"
        ? "receipt.uploaded"
        : "document.uploaded",
    title:
      metadata.fileType ===
      "Receipt"
        ? `Receipt uploaded (${metadata.fileName})`
        : `Document uploaded (${metadata.documentName})`,
    description:
      metadata.deviceId
        ? "Document linked to a device in your vault."
        : "Document saved to your household vault.",
    userId: user.id,
    householdId,
    deviceId:
      metadata.deviceId ||
      undefined,
  });

  let firstDocument =
    false;

  try {
    firstDocument =
      (
        await getServerDocumentCount(
          admin,
          householdId,
          user.id
        )
      ) === 1;
  } catch (error) {
    console.warn(
      "Unable to calculate document count after upload:",
      error
    );
  }

  revalidatePath(
    "/documents"
  );
  revalidatePath(
    "/dashboard"
  );

  if (metadata.deviceId) {
    revalidatePath(
      `/devices/${metadata.deviceId}`
    );
  }

  return {
    success: true,
    documentId:
      created.id,
    firstDocument,
  };
}
