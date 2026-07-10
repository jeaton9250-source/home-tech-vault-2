"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  Download,
  File,
  FileText,
  Loader2,
  Plus,
  Receipt,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type DeviceDocumentRow = {
  id: string;
  device_id: string;
  user_id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};

type DeviceDocument = DeviceDocumentRow & {
  signedUrl: string;
};

type DeviceDocumentsProps = {
  deviceId: string;
};

const documentTypes = [
  "Manual",
  "Receipt",
  "Warranty",
  "Installation Guide",
  "Other",
];

export default function DeviceDocuments({
  deviceId,
}: DeviceDocumentsProps) {
  const [documents, setDocuments] = useState<DeviceDocument[]>([]);
  const [selectedType, setSelectedType] = useState("Manual");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDocuments();
  }, [deviceId]);

  async function loadDocuments() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Please sign in to view documents.");
      }

      const { data, error } = await supabase
        .from("device_documents")
        .select("*")
        .eq("device_id", deviceId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const rows = (data || []) as DeviceDocumentRow[];

      const documentsWithUrls = await Promise.all(
        rows.map(async (document) => {
          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("device-documents")
              .createSignedUrl(document.file_path, 3600);

          if (signedError) {
            console.error("Signed URL error:", signedError);
          }

          return {
            ...document,
            signedUrl: signedData?.signedUrl || "",
          };
        })
      );

      setDocuments(
        documentsWithUrls.filter((document) => document.signedUrl)
      );
    } catch (error) {
      console.error("Document loading error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load documents."
      );
    } finally {
      setLoading(false);
    }
  }

  async function uploadDocuments(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    try {
      setUploading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Please sign in before uploading documents.");
      }

      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(
            `${file.name} must be smaller than 10 MB.`
          );
        }

        const extension =
          file.name.split(".").pop()?.toLowerCase() || "file";

        const filePath =
          `${user.id}/${deviceId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("device-documents")
          .upload(filePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { error: recordError } = await supabase
          .from("device_documents")
          .insert({
            device_id: deviceId,
            user_id: user.id,
            document_name: file.name,
            document_type: selectedType,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type || null,
          });

        if (recordError) {
          await supabase.storage
            .from("device-documents")
            .remove([filePath]);

          throw recordError;
        }
      }

      event.target.value = "";
      await loadDocuments();
    } catch (error) {
      console.error("Document upload error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to upload the document."
      );
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(document: DeviceDocument) {
    const confirmed = window.confirm(
      `Delete "${document.document_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(document.id);

      const { error: storageError } = await supabase.storage
        .from("device-documents")
        .remove([document.file_path]);

      if (storageError) {
        throw storageError;
      }

      const { error: databaseError } = await supabase
        .from("device_documents")
        .delete()
        .eq("id", document.id);

      if (databaseError) {
        throw databaseError;
      }

      setDocuments((current) =>
        current.filter((item) => item.id !== document.id)
      );
    } catch (error) {
      console.error("Document deletion error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete the document."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatFileSize(bytes: number | null) {
    if (!bytes) {
      return "Unknown size";
    }

    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function getDocumentIcon(type: string) {
    switch (type) {
      case "Manual":
        return FileText;

      case "Receipt":
        return Receipt;

      case "Warranty":
        return ShieldCheck;

      default:
        return File;
    }
  }

  return (
    <section className="mt-10 border-t border-[#E8E2D6] pt-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
            Digital Binder
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#111827]">
            Documents
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Store manuals, receipts, warranties, and important files.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedType}
            onChange={(event) =>
              setSelectedType(event.target.value)
            }
            className="rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#C8A96A]"
          >
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#111827] px-5 py-3 font-semibold text-white transition hover:opacity-90">
            {uploading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}

            {uploading ? "Uploading..." : "Add Document"}

            <input
              type="file"
              multiple
              disabled={uploading}
              onChange={uploadDocuments}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              className="hidden"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#F7F5EF] p-6 text-neutral-500">
          <Loader2 className="animate-spin" size={20} />
          Loading documents...
        </div>
      ) : errorMessage ? (
        <div className="mt-6 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-[#D8D1C3] bg-[#FBFAF7] p-10 text-center">
          <FileText
            size={36}
            className="mx-auto text-[#C8A96A]"
          />

          <h3 className="mt-4 font-semibold text-[#111827]">
            Your digital binder is empty
          </h3>

          <p className="mt-2 text-sm text-neutral-500">
            Upload a manual, receipt, warranty, or installation guide.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {documents.map((document) => {
            const Icon = getDocumentIcon(document.document_type);

            return (
              <div
                key={document.id}
                className="flex flex-col gap-4 rounded-2xl border border-[#E8E2D6] bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111827]">
                      {document.document_name}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {document.document_type} ·{" "}
                      {formatFileSize(document.file_size)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={document.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#F7F5EF] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#EFECE5]"
                  >
                    <Download size={16} />
                    Open
                  </a>

                  <button
                    type="button"
                    onClick={() => deleteDocument(document)}
                    disabled={deletingId === document.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    {deletingId === document.id ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}

                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}