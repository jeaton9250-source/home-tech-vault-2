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
  completeDocumentUpload,
  prepareDocumentUpload,
} from "@/app/documents/actions";
import {
  DOCUMENT_FIELD_LIMITS,
  DOCUMENT_TYPES,
  validateDocumentMetadata,
} from "@/lib/documents/documentInputValidation";
import {
  applyHouseholdScope,
} from "@/lib/data/householdScope";
import {
  trackFirstDocumentAdded,
} from "@/lib/analytics/activation";
import {
  getHouseholdLimitMessage,
  useHouseholdLimits,
} from "@/hooks/useHouseholdLimits";
import { usePermissions } from "@/hooks/usePermissions";
import DemoWriteGate from "@/components/demo/DemoWriteGate";
import { validateDocumentUpload } from "@/lib/documents/uploadSecurity";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import { ViewerBanner } from "@/components/ui/PermissionUI";

type Device = {
  id: string;
  device_name: string;
};

function getRequestedHouseholdId() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    new URLSearchParams(
      window.location.search
    )
      .get("householdId")
      ?.trim() || null
  );
}

export default function UploadDocumentPage() {
  const router = useRouter();

  const [
    returnTo,
    setReturnTo,
  ] = useState("/documents");

  const {
    user,
    isDemo,
    canCreate,
    canUpload,
    householdId,
    isViewer,
  } = usePermissions();

  const quota = useHouseholdLimits();

  const [devices, setDevices] =
    useState<Device[]>([]);

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
    const query =
      new URLSearchParams(
        window.location.search
      );

    const requestedDevice =
      query.get("deviceId")
        ?.trim();

    const requestedType =
      query.get("type")
        ?.trim();

    const requestedReturn =
      query.get("returnTo")
        ?.trim();

    if (requestedDevice) {
      setDeviceId(
        requestedDevice
      );
    }

    if (
      requestedType &&
      DOCUMENT_TYPES.includes(
        requestedType as
          (typeof DOCUMENT_TYPES)[number]
      )
    ) {
      setFileType(
        requestedType
      );
    }

    if (
      requestedReturn &&
      requestedReturn.startsWith("/") &&
      !requestedReturn.startsWith("//")
    ) {
      setReturnTo(
        requestedReturn
      );
    }
  }, []);

  useEffect(() => {
    async function loadHouseholdDevices() {
      if (quota.loading) {
        return;
      }

      try {
        setLoadingDevices(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setDevices([]);
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
      }
    }

    void loadHouseholdDevices();
  }, [
    user,
    isDemo,
    quota.loading,
    householdId,
  ]);

  const loading =
    quota.loading || loadingDevices;

  const documentLimitReached =
    quota.documentLimitReached;

  const limitMessage = getHouseholdLimitMessage(
    quota.limitReason === "allowed"
      ? documentLimitReached
        ? quota.canUseProFeatures
          ? "household_document_limit"
          : "free_document_limit"
        : "allowed"
      : quota.limitReason,
    {
      canManageBilling:
        quota.canManageBilling,
    }
  );

  function handleDocumentActionFailure(
    result: {
      error: string;
      code?: string;
    }
  ) {
    if (
      result.code ===
      "UNAUTHENTICATED"
    ) {
      router.push("/login");
      return;
    }

    if (
      result.code ===
      "HOUSEHOLD_DOCUMENT_LIMIT"
    ) {
      router.push("/family");
      return;
    }

    if (
      result.code ===
      "FREE_DOCUMENT_LIMIT"
    ) {
      router.push(
        "/upgrade?reason=document-limit"
      );
      return;
    }

    setErrorMessage(
      result.error ||
        "Unable to upload this document."
    );
  }

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

    if (loading) {
      return;
    }

    if (
      !canCreate ||
      !canUpload ||
      isViewer
    ) {
      setErrorMessage(
        "Viewer access is read-only. You cannot upload documents."
      );
      return;
    }

    if (
      documentLimitReached ||
      !quota.canAddDocument
    ) {
      if (
        quota.canUseProFeatures ||
        quota.billingManagedByHousehold
      ) {
        router.push("/family");
        return;
      }

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

    const fileValidation =
      validateDocumentUpload(
        file
      );

    if (!fileValidation.ok) {
      setErrorMessage(
        fileValidation.error
      );
      return;
    }

    const metadataValidation =
      validateDocumentMetadata({
        documentName,
        fileName:
          file.name,
        fileType,
        deviceId,
        fileSize:
          file.size,
        browserContentType:
          file.type,
      });

    if (
      !metadataValidation.success
    ) {
      setErrorMessage(
        metadataValidation.error
      );
      return;
    }

    try {
      setUploading(true);

      const prepared =
        await prepareDocumentUpload({
          documentName,
          fileName:
            file.name,
          fileType,
          deviceId,
          fileSize:
            file.size,
          browserContentType:
            file.type,
        }, getRequestedHouseholdId());

      if (!prepared.success) {
        handleDocumentActionFailure(
          prepared
        );
        return;
      }

      const {
        error: uploadError,
      } = await supabase.storage
        .from("documents")
        .upload(
          prepared.storagePath,
          file,
          {
            upsert: false,
            contentType:
              prepared.contentType,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const completed =
        await completeDocumentUpload({
          documentName,
          fileName:
            file.name,
          fileType,
          deviceId,
          fileSize:
            file.size,
          browserContentType:
            file.type,
          storagePath:
            prepared.storagePath,
        }, getRequestedHouseholdId());

      if (!completed.success) {
        await supabase.storage
          .from("documents")
          .remove([
            prepared.storagePath,
          ]);

        handleDocumentActionFailure(
          completed
        );
        return;
      }

      if (
        completed.firstDocument
      ) {
        trackFirstDocumentAdded({
          fileType:
            fileType ||
            "document",
        });
      }

      router.push(returnTo);
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

  if (loading) {
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
      <DemoWriteGate
        backHref="/documents"
        backLabel="Back to Documents"
      />
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

      {documentLimitReached && (
          <PageCard className="border-warning/40 bg-warning-soft text-text-primary">
            <p className="font-semibold">
              {limitMessage.title}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {limitMessage.description}
            </p>
            {limitMessage.actionHref &&
              limitMessage.actionLabel && (
                <Button
                  href={limitMessage.actionHref}
                  className="mt-4"
                >
                  {limitMessage.actionLabel}
                </Button>
              )}
          </PageCard>
        )}

      <PageCard className="max-w-3xl">
        <div className="space-y-5">
          <FormField label="Document Name">
            <input
              value={documentName}
              maxLength={DOCUMENT_FIELD_LIMITS.documentName}
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
              accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.txt,application/pdf,image/jpeg,image/png,image/webp,text/plain"
              onChange={(event) =>
                setFile(
                  event.target
                    .files?.[0] ||
                    null
                )
              }
              className="w-full rounded-2xl border border-dashed border-warning/40 bg-surface-sunken p-4 text-sm text-text-secondary"
            />
            <p className="mt-2 text-xs text-text-tertiary">
              PDF, JPEG, PNG, WebP, HEIC, or text · max 15 MB
            </p>
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
                loading ||
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