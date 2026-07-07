"use client";

import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

export default function DeleteDocumentButton({
  documentId,
}: {
  documentId: string;
}) {
  async function deleteDocument() {
    const confirmed = confirm("Delete this document? This cannot be undone.");

    if (!confirmed) return;

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);

    if (error) {
      alert(error.message);
    } else {
      alert("Document deleted.");
      window.location.href = "/documents";
    }
  }

  return (
    <button
      onClick={deleteDocument}
      className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition"
    >
      <Trash2 size={16} />
      Delete
    </button>
  );
}