import { NextResponse } from "next/server";

import { getDefaultActivityTitle } from "@/lib/activity";
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
  HouseholdQuotaError,
} from "@/lib/permissions/serverQuota";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncNotionOnboardingProgress } from "@/lib/notion/syncOnboardingProgress";
import { authenticateRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UploadRequest = DocumentMetadataInput & {
  stage?: unknown;
  storagePath?: unknown;
};

function readBody(value: unknown): UploadRequest | null {
  return value && typeof value === "object"
    ? value as UploadRequest
    : null;
}

function quotaResponse(error: HouseholdQuotaError) {
  const code = error.code === "viewer_read_only"
    ? "VIEWER_READ_ONLY"
    : error.code === "household_document_limit"
      ? "HOUSEHOLD_DOCUMENT_LIMIT"
      : "FREE_DOCUMENT_LIMIT";

  return NextResponse.json({ error: error.message, code }, { status: 403 });
}

export async function POST(request: Request) {
  const { client, user, error: userError } = await authenticateRequest(request);

  if (userError || !user) {
    return NextResponse.json(
      { error: "Authentication required.", code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  let body: UploadRequest | null = null;

  try {
    body = readBody(await request.json());
  } catch {
    // The validation response below is intentionally generic.
  }

  if (!body || (body.stage !== "prepare" && body.stage !== "complete")) {
    return NextResponse.json(
      { error: "The document details could not be read.", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  const validation = validateDocumentMetadata(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  try {
    const metadata = validation.data;
    const householdId = await fetchHouseholdIdForUser(user.id, client);

    await assertCanAddDocument(createAdminClient(), user.id, householdId);

    if (metadata.deviceId) {
      const { data: device, error: deviceError } = await applyHouseholdScope(
        client.from("devices").select("id").eq("id", metadata.deviceId),
        householdId,
        user.id,
      ).maybeSingle();

      if (deviceError) throw deviceError;
      if (!device) {
        return NextResponse.json(
          { error: "This device could not be found in your home.", code: "NOT_FOUND_OR_FORBIDDEN" },
          { status: 404 },
        );
      }
    }

    const ownerPath = householdId || user.id;
    const devicePath = metadata.deviceId || "unassigned";
    const expectedPrefix = `${ownerPath}/${devicePath}/`;

    if (body.stage === "prepare") {
      const safeName = sanitizeDocumentStorageFileName(metadata.fileName);
      const storagePath = `${expectedPrefix}${crypto.randomUUID()}-${safeName}`;

      return NextResponse.json({
        storagePath,
        contentType: metadata.contentType,
        householdId,
      }, { headers: { "Cache-Control": "private, no-store" } });
    }

    const storagePath = typeof body.storagePath === "string"
      ? body.storagePath.trim()
      : "";
    const objectName = storagePath.startsWith(expectedPrefix)
      ? storagePath.slice(expectedPrefix.length)
      : "";

    if (!objectName || objectName.includes("/") || objectName.includes("\\") || objectName.includes("..")) {
      return NextResponse.json(
        { error: "The uploaded document path is not valid.", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { data: storedObjects, error: storageError } = await client.storage
      .from("documents")
      .list(`${ownerPath}/${devicePath}`, { limit: 10, search: objectName });

    if (storageError) throw storageError;
    if (!(storedObjects ?? []).some((item) => item.name === objectName)) {
      return NextResponse.json(
        { error: "The uploaded file could not be found.", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { data: existing, error: existingError } = await applyHouseholdScope(
      client.from("documents").select("id, device_id, file_name, file_type, document_name, document_type, created_at, file_url").eq("file_url", storagePath),
      householdId,
      user.id,
    ).maybeSingle();

    if (existingError) throw existingError;

    let document = existing;
    let createdNewDocument = false;

    if (!document) {
      const { data: created, error: insertError } = await client
        .from("documents")
        .insert(withHouseholdInsertFields({
          device_id: metadata.deviceId || null,
          file_name: metadata.fileName,
          file_type: metadata.fileType,
          document_name: metadata.documentName,
          document_type: metadata.fileType,
          file_url: storagePath,
          storage_path: storagePath,
        }, householdId, user.id))
        .select("id, device_id, file_name, file_type, document_name, document_type, created_at, file_url")
        .single();

      if (insertError || !created) {
        await client.storage.from("documents").remove([storagePath]);
        throw insertError ?? new Error("The document was not returned after saving.");
      }

      document = created;
      createdNewDocument = true;

      // device_events is intentionally device-scoped. Whole-home documents are
      // represented by a null device_id on documents and must not create one.
      if (metadata.deviceId) {
        await client.from("device_events").insert({
          device_id: metadata.deviceId,
          user_id: user.id,
          event_type: metadata.fileType === "Receipt" ? "Receipt Uploaded" : "Document Uploaded",
          title: getDefaultActivityTitle(
            metadata.fileType === "Receipt" ? "receipt.uploaded" : "document.uploaded",
            metadata.documentName,
          ),
          description: "Document linked to a device from the Home Tech Vault app.",
          event_date: new Date().toISOString(),
        });
      }
    }

    if (createdNewDocument) {
      await syncNotionOnboardingProgress(
        user.id
      );
    }

    return NextResponse.json({
      document: {
        id: document.id,
        deviceId: document.device_id,
        name: document.document_name || document.file_name || "Home document",
        type: document.document_type || document.file_type || "Document",
        date: document.created_at,
        fileUrl: document.file_url,
      },
      householdId,
    }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof HouseholdQuotaError) return quotaResponse(error);

    console.error(
      "[mobile-document-upload] failed",
      error instanceof Error ? error.message : "unknown",
    );

    return NextResponse.json(
      { error: "We couldn't save this document. Please try again.", code: "UNKNOWN" },
      { status: 500 },
    );
  }
}
