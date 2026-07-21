"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  applyHouseholdScope,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";
import { recordActivity } from "@/lib/activity";
import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import { ViewerBanner } from "@/components/ui/PermissionUI";

type Device = {
  id: string;
  device_name: string;
};

export default function UploadDocumentPage() {
  const router = useRouter();

  const {
    user,
    isDemo,
    canCreate,
    canUpload,
    canAddDocument,
    householdId,
    documentLimit,
    hasUnlimitedDocuments,
    loading: permissionsLoading,
  } = usePermissions();

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [
    documentCount,
    setDocumentCount,
  ] = useState(0);

  const [
    checkingDocumentLimit,
    setCheckingDocumentLimit,
  ] = useState(true);

  const [
    loadingDevices,
    setLoadingDevices,
  ] = useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [deviceId, setDeviceId] =
    useState("");

  const [fileType, setFileType] =
    useState("Receipt");

  const [
    documentName,
    setDocumentName,
  ] = useState("");

  const [file, setFile] =
    useState<File | null>(null);

  useEffect(() => {
    async function loadHouseholdDevices() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingDevices(true);
        setCheckingDocumentLimit(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setDevices([]);
          setDocumentCount(0);
          return;
        }

        const devicesResult =
          await applyHouseholdScope(
            supabase
              .from("devices")
              .select("id, device_name"),
            householdId,
            user.id
          );

        if (devicesResult.error) {
          throw devicesResult.error;
        }

        setDevices(
          (devicesResult.data ||
            []) as Device[]
        );

        const countResult =
          await applyHouseholdScope(
            supabase
              .from("documents")
              .select("*", {
                count: "exact",
                head: true,
              }),
            householdId,
            user.id
          );

        if (countResult.error) {
          throw countResult.error;
        }

        setDocumentCount(countResult.count || 0);
      } catch (error) {
        console.error(
          "Unable to load upload options:",
          error
        );

        setErrorMessage(
          "Unable to load upload options."
        );
      } finally {
        setLoadingDevices(false);
        setCheckingDocumentLimit(false);
      }
    }

    void loadHouseholdDevices();
  }, [
    user,
    isDemo,
    permissionsLoading,
    householdId,
  ]);

  const documentLimitReached =
    !hasUnlimitedDocuments &&
    documentLimit !== null &&
    documentCount >= documentLimit;

  async function uploadDocument() {
    setErrorMessage("");

    if (isDemo) {
      router.push("/signup");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    if (!canCreate || !canUpload) {
      setErrorMessage(
        "Viewer access is read-only. You cannot upload documents."
      );
      return;
    }

    if (
      documentLimitReached ||
      !canAddDocument(documentCount)
    ) {
      router.push(
        "/upgrade?reason=document-limit"
      );
      return;
    }

    if (!file) {
      setErrorMessage(
        "Please choose a file."
      );
      return;
    }

    try {
      setUploading(true);

      const safeFileName =
        file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        );

      const ownerPath =
        householdId || user.id;

      const filePath =
        `${ownerPath}/${deviceId || "unassigned"}/` +
        `${crypto.randomUUID()}-${safeFileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("documents")
        .upload(
          filePath,
          file,
          {
            upsert: false,
            contentType:
              file.type ||
              undefined,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const {
        error: dbError,
      } = await supabase
        .from("documents")
        .insert(
          withHouseholdInsertFields(
            {
              device_id:
                deviceId || null,
              file_name:
                file.name,
              document_name:
                documentName.trim() ||
                file.name,
              file_url:
                publicUrlData.publicUrl,
              file_type:
                fileType,
            },
            householdId,
            user.id
          )
        );

      if (dbError) {
        await supabase.storage
          .from("documents")
          .remove([filePath]);

        throw dbError;
      }

      await recordActivity({
        activityType:
          fileType === "Receipt"
            ? "receipt.uploaded"
            : "document.uploaded",
        title:
          fileType === "Receipt"
            ? `Receipt uploaded (${file.name})`
            : `Document uploaded (${documentName.trim() || file.name})`,
        description: deviceId
          ? "Document linked to a device in your vault."
          : "Document saved to your household vault.",
        userId: user.id,
        householdId,
        deviceId: deviceId || undefined,
      });

      router.push("/documents");
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to upload document:",
        error
      );

      setErrorMessage(
        "Unable to upload this document. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  if (
    permissionsLoading ||
    loadingDevices ||
    checkingDocumentLimit
  ) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Loading upload options...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (isDemo) {
    return (
      <PageShell>
        <PageTitle
          eyebrow="Interactive Demo"
          title="Create your vault to upload files"
          description="Demo Mode lets you explore sample documents, but uploads are not saved."
        />

        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
            <FileText size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-text-primary">
            Ready to protect your files?
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-text-secondary">
            Create an account to upload receipts,
            manuals, warranties, invoices, and more.
          </p>

          <Button
            href="/signup"
            className="mt-6"
          >
            Create Your Vault
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <PageCard className="text-center">
          <h1 className="text-2xl font-semibold text-text-primary">
            Sign in to upload a document
          </h1>

          <Button
            href="/login"
            className="mt-6"
          >
            Sign In
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ViewerBanner />

      <button
        type="button"
        onClick={() =>
          router.push("/documents")
        }
        className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-text-primary hover:underline"
      >
        <ArrowLeft size={17} />
        Back to Documents
      </button>

      <PageTitle
        eyebrow="Document Vault"
        title="Upload Document"
        description={
          householdId
            ? "Upload a file to your shared household vault."
            : "Upload a receipt, manual, warranty, invoice, or other important file."
        }
      />

      {errorMessage && (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      )}

      {documentLimitReached &&
        documentLimit !== null && (
          <PageCard className="border-warning/40 bg-warning-soft text-text-primary">
            <p className="font-semibold">
              Document limit reached
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              You have used all {documentLimit}{" "}
              document slots on your current plan.
            </p>
            <Button
              href="/upgrade?reason=document-limit"
              className="mt-4"
            >
              Upgrade Plan
            </Button>
          </PageCard>
        )}

      <PageCard className="max-w-3xl">
        <div className="space-y-5">
          <FormField label="Document Name">
            <input
              value={documentName}
              onChange={(event) =>
                setDocumentName(
                  event.target.value
                )
              }
              placeholder="MacBook Pro Receipt"
              className={
                inputClassName
              }
            />
          </FormField>

          <FormField label="Connected Device">
            <select
              value={deviceId}
              onChange={(event) =>
                setDeviceId(
                  event.target.value
                )
              }
              className={
                inputClassName
              }
            >
              <option value="">
                No connected device
              </option>

              {devices.map(
                (device) => (
                  <option
                    key={device.id}
                    value={device.id}
                  >
                    {
                      device.device_name
                    }
                  </option>
                )
              )}
            </select>
          </FormField>

          <FormField label="Document Type">
            <select
              value={fileType}
              onChange={(event) =>
                setFileType(
                  event.target.value
                )
              }
              className={
                inputClassName
              }
            >
              <option>
                Receipt
              </option>

              <option>
                Manual
              </option>

              <option>
                Warranty
              </option>

              <option>
                Invoice
              </option>

              <option>
                Photo
              </option>

              <option>
                Other
              </option>
            </select>
          </FormField>

          <FormField
            label="Choose File"
            required
          >
            <input
              type="file"
              onChange={(event) =>
                setFile(
                  event.target
                    .files?.[0] ||
                    null
                )
              }
              className="w-full rounded-2xl border border-dashed border-warning/40 bg-surface-sunken p-4 text-sm text-text-secondary"
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  "/documents"
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={
                uploading ||
                !canUpload ||
                documentLimitReached
              }
              onClick={() =>
                void uploadDocument()
              }
            >
              {uploading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Upload size={18} />
              )}

              {uploading
                ? "Uploading..."
                : "Upload Document"}
            </Button>
          </div>
        </div>
      </PageCard>
    </PageShell>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:ring-2 focus:ring-interaction/15";

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text-primary">
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}