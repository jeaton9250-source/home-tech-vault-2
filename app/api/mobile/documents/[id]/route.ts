import { NextResponse } from "next/server";

import {
  applyHouseholdMutationScope,
  applyHouseholdScope,
  fetchHouseholdIdForUser,
} from "@/lib/data/householdScope";
import { authenticateRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { client, user, error: userError } = await authenticateRequest(request);
  if (userError || !user) {
    return NextResponse.json(
      { error: "Authentication required.", code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json(
      { error: "That document could not be found.", code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  try {
    const householdId = await fetchHouseholdIdForUser(user.id, client);
    const { data: document, error: selectError } = await applyHouseholdScope(
      client
        .from("documents")
        .select("id, file_url, storage_path")
        .eq("id", id),
      householdId,
      user.id,
    ).maybeSingle();

    if (selectError) throw selectError;
    if (!document) {
      return NextResponse.json(
        { error: "That document could not be found.", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    const storagePath = (document.storage_path || document.file_url || "").trim();
    const allowedPrefixes = [householdId, user.id]
      .filter((value): value is string => Boolean(value))
      .map((value) => `${value}/`);
    const isManagedStoragePath = storagePath
      && !storagePath.includes("..")
      && !storagePath.includes("\\")
      && allowedPrefixes.some((prefix) => storagePath.startsWith(prefix));

    if (isManagedStoragePath) {
      const { error: storageError } = await client.storage
        .from("documents")
        .remove([storagePath]);
      if (storageError) throw storageError;
    }

    const { data: deleted, error: deleteError } = await applyHouseholdMutationScope(
      client.from("documents").delete().eq("id", id),
      householdId,
      user.id,
    ).select("id").maybeSingle();

    if (deleteError) throw deleteError;
    if (!deleted) {
      return NextResponse.json(
        { error: "That document could not be deleted.", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { deleted: true, documentId: deleted.id },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error(
      "[mobile-document-delete] failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "We couldn't delete this document. Please try again.", code: "UNKNOWN" },
      { status: 500 },
    );
  }
}
