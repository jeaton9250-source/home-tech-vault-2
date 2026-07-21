"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { applyHouseholdMutationScope } from "@/lib/data/householdScope";
import { usePermissions } from "@/hooks/usePermissions";
import { Trash2 } from "lucide-react";

export default function DeleteDocumentButton({
  documentId,
}: {
  documentId: string;
}) {
  const {
    user,
    householdId,
    canDelete,
    isDemo,
  } = usePermissions();

  const [deleting, setDeleting] = useState(false);

  async function deleteDocument() {
    if (!canDelete || isDemo || !user) {
      return;
    }

    const confirmed = confirm(
      "Delete this document? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const { error } =
        await applyHouseholdMutationScope(
          supabase
            .from("documents")
            .delete()
            .eq("id", documentId),
          householdId,
          user.id
        );

      if (error) {
        throw error;
      }

      window.location.href = "/documents";
    } catch (error) {
      console.error(
        "Unable to delete document:",
        error
      );

      alert(
        "Unable to delete this document. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (!canDelete) {
    return null;
  }

  return (
    <button
      onClick={deleteDocument}
      disabled={deleting}
      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={16} />
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
