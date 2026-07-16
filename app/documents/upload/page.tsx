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
import { useDemoMode } from "@/hooks/useDemoMode";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type Device = {
  id: string;
  device_name: string;
};

export default function UploadDocumentPage() {
  const router = useRouter();

  const {
    user,
    isDemo,
    loading: demoModeLoading,
  } = useDemoMode();

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [
    householdId,
    setHouseholdId,
  ] = useState<string | null>(null);

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
      if (demoModeLoading) {
        return;
      }

      try {
        setLoadingDevices(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setDevices([]);
          setHouseholdId(null);
          return;
        }

        const {
          data: membership,
          error: membershipError,
        } = await supabase
          .from("household_members")
          .select("household_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (membershipError) {
          throw membershipError;
        }

        const currentHouseholdId =
          membership?.household_id || null;

        setHouseholdId(
          currentHouseholdId
        );

        let deviceQuery =
          supabase
            .from("devices")
            .select(
              "id, device_name"
            );

        if (currentHouseholdId) {
          deviceQuery =
            deviceQuery.eq(
              "household_id",
              currentHouseholdId
            );
        } else {
          deviceQuery =
            deviceQuery.eq(
              "user_id",
              user.id
            );
        }

        const {
          data,
          error,
        } = await deviceQuery;

        if (error) {
          throw error;
        }

        setDevices(
          (data || []) as Device[]
        );
      } catch (error) {
        console.error(
          "Unable to load devices:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load devices."
        );
      } finally {
        setLoadingDevices(false);
      }
    }

    void loadHouseholdDevices();
  }, [
    user,
    isDemo,
    demoModeLoading,
  ]);

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
        .insert({
          user_id: user.id,
          household_id:
            householdId,
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
        });

      if (dbError) {
        await supabase.storage
          .from("documents")
          .remove([filePath]);

        throw dbError;
      }

      router.push("/documents");
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to upload document:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload this document."
      );
    } finally {
      setUploading(false);
    }
  }

  if (
    demoModeLoading ||
    loadingDevices
  ) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <FileText size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-[#111827]">
            Ready to protect your files?
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-neutral-500">
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
          <h1 className="text-2xl font-semibold text-[#111827]">
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
      <button
        type="button"
        onClick={() =>
          router.push("/documents")
        }
        className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[#111827] hover:underline"
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
              className="w-full rounded-2xl border border-dashed border-[#D8C69D] bg-[#FAFAF8] p-4 text-sm text-neutral-600"
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 border-t border-[#E8E2D6] pt-6 sm:flex-row sm:justify-end">
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
              disabled={uploading}
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
  "w-full rounded-2xl border border-[#E8E2D6] bg-white px-4 py-3.5 text-[#111827] outline-none transition placeholder:text-neutral-400 focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20";

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
      <span className="mb-2 block text-sm font-semibold text-[#111827]">
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