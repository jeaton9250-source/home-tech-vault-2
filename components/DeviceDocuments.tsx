"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  Download,
  Eye,
  File,
  FileText,
  Loader2,
  Plus,
  Receipt,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  recordActivity,
} from "@/lib/activity";
import { validateDocumentUpload } from "@/lib/documents/uploadSecurity";

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
  source?: "device_documents" | "documents";
};

type DeviceDocumentsProps = {
  deviceId: string;

  /*
   * Verified official manufacturer guide.
   * This is separate from uploaded/stored documents.
   */
  manualUrl?: string | null;

  embedded?: boolean;

  onManualStatusChange?: (
    status: "found" | null
  ) => void;
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
  manualUrl = null,
  embedded = false,
  onManualStatusChange,
}: DeviceDocumentsProps) {
  const [documents, setDocuments] = useState<DeviceDocument[]>([]);
  const [selectedType, setSelectedType] =
    useState("Manual");

  const filteredDocuments =
    documents.filter(
      (document) =>
        document.document_type ===
        selectedType
    );
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

      const [
        deviceDocumentsResult,
        vaultDocumentsResult,
      ] = await Promise.all([
        supabase
          .from("device_documents")
          .select("*")
          .eq(
            "device_id",
            deviceId
          )
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),

        supabase
          .from("documents")
          .select(
            "id, device_id, user_id, document_name, file_name, file_type, file_url, created_at"
          )
          .eq(
            "device_id",
            deviceId
          )
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),
      ]);

      if (
        deviceDocumentsResult.error
      ) {
        throw deviceDocumentsResult.error;
      }

      if (
        vaultDocumentsResult.error
      ) {
        console.warn(
          "Vault document loading error:",
          vaultDocumentsResult.error
        );
      }

      const deviceRows =
        (
          deviceDocumentsResult.data ||
          []
        ) as DeviceDocumentRow[];

      const deviceDocumentsWithUrls =
        await Promise.all(
          deviceRows.map(
            async (document) => {
              const {
                data: signedData,
                error: signedError,
              } =
                await supabase.storage
                  .from(
                    "device-documents"
                  )
                  .createSignedUrl(
                    document.file_path,
                    3600
                  );

              if (signedError) {
                console.error(
                  "Device document signed URL error:",
                  signedError
                );
              }

              return {
                ...document,

                signedUrl:
                  signedData?.signedUrl ||
                  "",

                source:
                  "device_documents" as const,
              };
            }
          )
        );

      const vaultRows =
        vaultDocumentsResult.data ||
        [];

      const vaultDocumentsWithUrls =
        await Promise.all(
          vaultRows.map(
            async (document) => {
              const {
                data: signedData,
                error: signedError,
              } =
                await supabase.storage
                  .from(
                    "documents"
                  )
                  .createSignedUrl(
                    document.file_url,
                    3600
                  );

              if (signedError) {
                console.error(
                  "Vault document signed URL error:",
                  signedError
                );
              }

              return {
                id:
                  document.id,

                device_id:
                  document.device_id,

                user_id:
                  document.user_id,

                document_name:
                  document.document_name ||
                  document.file_name ||
                  "Document",

                document_type:
                  document.file_type ||
                  "Other",

                file_path:
                  document.file_url,

                file_size:
                  null,

                mime_type:
                  null,

                created_at:
                  document.created_at,

                signedUrl:
                  signedData?.signedUrl ||
                  "",

                source:
                  "documents" as const,
              };
            }
          )
        );

      const mergedDocuments = [
        ...deviceDocumentsWithUrls,
        ...vaultDocumentsWithUrls,
      ]
        .filter(
          (document) =>
            Boolean(
              document.signedUrl
            )
        )
        .sort(
          (a, b) =>
            new Date(
              b.created_at
            ).getTime() -
            new Date(
              a.created_at
            ).getTime()
        );

      setDocuments(
        mergedDocuments
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
        const validation = validateDocumentUpload(file);

        if (!validation.ok) {
          throw new Error(
            `${file.name}: ${validation.error}`
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
            contentType: validation.contentType,
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
            mime_type: validation.contentType,
          });

        if (recordError) {
          await supabase.storage
            .from("device-documents")
            .remove([filePath]);

          throw recordError;
        }

        await recordActivity({
          activityType:
            selectedType === "Receipt"
              ? "receipt.uploaded"
              : "document.uploaded",
          title:
            selectedType === "Receipt"
              ? `Receipt uploaded (${file.name})`
              : `Document uploaded (${file.name})`,
          description:
            selectedType === "Warranty"
              ? "Warranty document attached to the device."
              : `${selectedType} saved to the device record.`,
          userId: user.id,
          deviceId,
        });
      }

      if (
        selectedType === "Manual"
      ) {
        const {
          error:
            manualStatusError,
        } = await supabase
          .from("devices")
          .update({
            manual_status:
              "found",

            manual_checked_at:
              new Date()
                .toISOString(),
          })
          .eq(
            "id",
            deviceId
          );

        if (
          manualStatusError
        ) {
          console.warn(
            "Unable to update manual status after upload:",
            manualStatusError
          );
        }
      }

      event.target.value = "";
      await loadDocuments();

      if (
        selectedType === "Manual"
      ) {
        onManualStatusChange?.(
          "found"
        );
      }
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

      if (
        document.document_type ===
        "Manual"
      ) {
        const {
          count:
            remainingManualCount,
          error:
            remainingManualError,
        } = await supabase
          .from(
            "device_documents"
          )
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          )
          .eq(
            "device_id",
            deviceId
          )
          .eq(
            "document_type",
            "Manual"
          );

        if (
          remainingManualError
        ) {
          console.warn(
            "Unable to check remaining manuals:",
            remainingManualError
          );
        } else if (
          (
            remainingManualCount ??
            0
          ) === 0
        ) {
          const {
            error:
              clearStatusError,
          } = await supabase
            .from("devices")
            .update({
              manual_status:
                null,

              manual_checked_at:
                null,
            })
            .eq(
              "id",
              deviceId
            );

          if (
            clearStatusError
          ) {
            console.warn(
              "Unable to clear manual status:",
              clearStatusError
            );
          } else {
            onManualStatusChange?.(
              null
            );
          }
        }
      }
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

  const content = (
    <>
      {!embedded ? (
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-overline text-charcoal-soft">
              Digital Binder
            </p>

            <h2 className="mt-2 text-2xl font-bold text-text-primary">
              Documents
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              Store manuals, receipts, warranties, and important files.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedType}
              onChange={(event) =>
                setSelectedType(event.target.value)
              }
              className="rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm outline-none focus:border-interaction"
            >
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-charcoal px-5 py-3 font-semibold text-surface-card transition hover:opacity-90">
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
                accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/jpeg,image/png,image/webp,text/plain"
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <div
          id="device-manual-upload"
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-overline text-section-technology">Documents</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
              Files & records
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              id="device-document-type-select"
              value={selectedType}
              onChange={(event) =>
                setSelectedType(event.target.value)
              }
              className="rounded-xl border border-border-subtle bg-surface-card px-4 py-3 text-sm outline-none focus:border-interaction"
            >
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-card px-5 py-2.5 text-sm font-semibold text-text-primary shadow-[var(--shadow-sm)] transition hover:bg-surface-hover">
              {uploading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}

              {uploading ? "Uploading..." : "Add Document"}

              <input
                id="device-manual-file-input"
                type="file"
                multiple
                disabled={uploading}
                onChange={uploadDocuments}
                accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/jpeg,image/png,image/webp,text/plain"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface-sunken p-6 text-text-secondary">
          <Loader2 className="animate-spin" size={20} />
          Loading documents...
        </div>
      ) : errorMessage ? (
        <div className="mt-6 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          {errorMessage}
        </div>
      ) :
        documents.length === 0 &&
        !manualUrl ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-border-subtle bg-surface-base p-10 text-center">
          <FileText
            size={36}
            className="mx-auto text-charcoal-soft"
          />

          <h3 className="mt-4 font-semibold text-text-primary">
            No {selectedType.toLowerCase()} files have been added yet.
          </h3>

          <p className="mt-2 text-sm text-text-secondary">
            {selectedType === "Receipt"
              ? "Receipts linked to this device will appear here."
              : selectedType === "Warranty"
                ? "Warranty documents linked to this device will appear here."
                : selectedType === "Manual"
                  ? "Manuals linked to this device will appear here."
                  : `${selectedType} files linked to this device will appear here.`}
          </p>
        </div>
      ) : (
        <div
          className={
            embedded
              ? "mt-6 grid gap-4 md:grid-cols-2"
              : "mt-6 grid gap-4"
          }
        >
          {manualUrl ? (
            <article
              className={
                embedded
                  ? "rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]"
                  : "flex flex-col gap-4 rounded-2xl border border-border-subtle bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              }
            >
              <div
                className={
                  embedded
                    ? "flex items-start gap-4"
                    : "flex min-w-0 items-center gap-4"
                }
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
                  <FileText
                    size={18}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text-primary">
                    Official User Guide
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                    <span>
                      Manual
                    </span>

                    <span
                      className="inline-flex rounded-full border border-border-subtle bg-surface-sunken px-2 py-0.5 text-[11px] font-semibold text-text-secondary"
                    >
                      Web guide
                    </span>
                  </div>

                  {embedded ? (
                    <p className="mt-1 text-xs text-text-tertiary">
                      Official manufacturer documentation
                    </p>
                  ) : null}
                </div>
              </div>

              <div
                className={
                  embedded
                    ? "mt-4 flex flex-wrap gap-2"
                    : "flex gap-2"
                }
              >
                <a
                  href={
                    manualUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  data-device-manual-preview="true"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-card px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                >
                  <Eye
                    size={16}
                  />

                  View manual
                </a>
              </div>
            </article>
          ) : null}

          {filteredDocuments.map((document) => {
            const Icon = getDocumentIcon(document.document_type);

            return (
              <article
                key={document.id}
                className={
                  embedded
                    ? "rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]"
                    : "flex flex-col gap-4 rounded-2xl border border-border-subtle bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                }
              >
                <div
                  className={
                    embedded
                      ? "flex items-start gap-4"
                      : "flex min-w-0 items-center gap-4"
                  }
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text-primary">
                      {document.document_name}
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                      {document.document_type}
                      {!embedded ? ` · ${formatFileSize(document.file_size)}` : null}
                    </p>

                    {embedded ? (
                      <p className="mt-1 text-xs text-text-tertiary">
                        Added{" "}
                        {new Date(document.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div
                  className={
                    embedded
                      ? "mt-4 flex flex-wrap gap-2"
                      : "flex gap-2"
                  }
                >
                  <a
                    href={document.signedUrl}
                    data-device-manual-preview={
                      document.document_type === "Manual"
                        ? "true"
                        : undefined
                    }
                    target="_blank"
                    rel="noreferrer"
                    className={
                      embedded
                        ? "htv-focus-ring inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                        : "inline-flex items-center gap-2 rounded-xl bg-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-[#EFECE5]"
                    }
                  >
                    {embedded ? <Eye size={15} /> : <Download size={16} />}
                    {embedded ? "Preview" : "Open"}
                  </a>

                  <a
                    href={document.signedUrl}
                    download
                    className={
                      embedded
                        ? "htv-focus-ring inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                        : "inline-flex items-center gap-2 rounded-xl bg-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-[#EFECE5]"
                    }
                  >
                    <Download size={embedded ? 15 : 16} />
                    Download
                  </a>

                  {!embedded ? (
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
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="mt-10 border-t border-border-subtle pt-10">
      {content}
    </section>
  );
}