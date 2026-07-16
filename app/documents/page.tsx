"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import Link from "next/link";

import {
  ExternalLink,
  File,
  FileText,
  FolderOpen,
  ImageIcon,
  Loader2,
  ReceiptText,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  demoDevices,
  demoDocuments,
} from "@/lib/demoData";

import { usePermissions } from "@/hooks/usePermissions";

import DeleteDocumentButton from "@/components/DeleteDocumentButton";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import {
  PageAction,
  PermissionEmptyState,
  ViewerBanner,
} from "@/components/ui/PermissionUI";

type DocumentRecord = {
  id: string;
  user_id?: string | null;
  household_id?: string | null;
  device_id?: string | null;
  file_type: string;
  file_url?: string | null;
  file_name: string;
  document_name?: string | null;
  created_at?: string | null;
};

type DeviceRecord = {
  id: string;
  device_name: string | null;
};

type DocumentIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

export default function DocumentsPage() {
  const {
    user,
    isDemo,
    isViewer,
    canUpload,
    canDelete,
    loading: permissionsLoading,
  } = usePermissions();

  const [documents, setDocuments] =
    useState<DocumentRecord[]>([]);

  const [devices, setDevices] =
    useState<DeviceRecord[]>([]);

  const [
    loadingDocuments,
    setLoadingDocuments,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedType,
    setSelectedType,
  ] = useState("All");

  const [
    previewDocument,
    setPreviewDocument,
  ] = useState<DocumentRecord | null>(
    null
  );

  useEffect(() => {
    let mounted = true;

    async function loadDocuments() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingDocuments(true);
        setErrorMessage("");

        /*
         * Signed-out visitors see sample data.
         * Signed-in viewers see their real
         * shared household documents.
         */
        if (isDemo || !user) {
          const sampleDocuments:
            DocumentRecord[] =
            demoDocuments.map(
              (document) => ({
                id: document.id,
                device_id:
                  document.device_id,
                file_type:
                  document.document_type ||
                  "Document",
                file_name:
                  document.file_name,
                document_name:
                  document.document_name,
                file_url: null,
                created_at:
                  document.created_at,
              })
            );

          const sampleDevices:
            DeviceRecord[] =
            demoDevices.map(
              (device) => ({
                id: device.id,
                device_name:
                  device.device_name,
              })
            );

          if (!mounted) {
            return;
          }

          setDocuments(
            sampleDocuments
          );

          setDevices(
            sampleDevices
          );

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
          membership?.household_id ??
          null;

        let documentQuery =
          supabase
            .from("documents")
            .select("*");

        let deviceQuery =
          supabase
            .from("devices")
            .select(
              "id, device_name"
            );

        if (currentHouseholdId) {
          documentQuery =
            documentQuery.eq(
              "household_id",
              currentHouseholdId
            );

          deviceQuery =
            deviceQuery.eq(
              "household_id",
              currentHouseholdId
            );
        } else {
          documentQuery =
            documentQuery.eq(
              "user_id",
              user.id
            );

          deviceQuery =
            deviceQuery.eq(
              "user_id",
              user.id
            );
        }

        const [
          documentResult,
          deviceResult,
        ] = await Promise.all([
          documentQuery.order(
            "created_at",
            {
              ascending: false,
            }
          ),

          deviceQuery.order(
            "device_name",
            {
              ascending: true,
            }
          ),
        ]);

        if (documentResult.error) {
          throw documentResult.error;
        }

        if (deviceResult.error) {
          console.error(
            "Unable to load devices for documents:",
            deviceResult.error
          );
        }

        if (!mounted) {
          return;
        }

        setDocuments(
          (documentResult.data ??
            []) as DocumentRecord[]
        );

        setDevices(
          (deviceResult.data ??
            []) as DeviceRecord[]
        );
      } catch (error: unknown) {
        console.error(
          "Unable to load documents:",
          error
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your documents."
        );
      } finally {
        if (mounted) {
          setLoadingDocuments(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      mounted = false;
    };
  }, [
    user,
    isDemo,
    permissionsLoading,
  ]);

  const documentTypes =
    useMemo(() => {
      const types = documents
        .map((document) =>
          document.file_type?.trim()
        )
        .filter(
          (
            value
          ): value is string =>
            Boolean(value)
        );

      return [
        "All",
        ...Array.from(
          new Set(types)
        ).sort(),
      ];
    }, [documents]);

  const filteredDocuments =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return documents.filter(
        (document) => {
          const deviceName =
            getDeviceName(
              document,
              devices
            ).toLowerCase();

          const matchesSearch =
            search === "" ||
            [
              document.file_name,
              document.document_name,
              document.file_type,
              deviceName,
            ].some((value) =>
              String(value ?? "")
                .toLowerCase()
                .includes(search)
            );

          const matchesType =
            selectedType === "All" ||
            document.file_type ===
              selectedType;

          return (
            matchesSearch &&
            matchesType
          );
        }
      );
    }, [
      documents,
      devices,
      searchTerm,
      selectedType,
    ]);

  const connectedDocumentCount =
    documents.filter(
      (document) =>
        Boolean(
          document.device_id
        )
    ).length;

  const uniqueTypeCount =
    new Set(
      documents
        .map((document) =>
          document.file_type?.trim()
        )
        .filter(Boolean)
    ).size;

  const recentDocumentCount =
    documents.filter(
      (document) =>
        isRecentDate(
          document.created_at
        )
    ).length;

  const loading =
    permissionsLoading ||
    loadingDocuments;

  const filtersActive =
    searchTerm.trim() !== "" ||
    selectedType !== "All";

  function clearFilters() {
    setSearchTerm("");
    setSelectedType("All");
  }

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Loading your documents...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <PageCard className="border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-semibold">
            Unable to load documents
          </h1>

          <p className="mt-2 text-sm">
            {errorMessage}
          </p>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="rounded-[32px] bg-[#111827] px-6 py-9 text-white shadow-sm md:px-10 md:py-11">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
              Document Vault
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Your documents.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
              Keep receipts, manuals,
              warranties, invoices, and
              important device files
              together.
            </p>
          </div>

          <PageAction
            canCreate={canUpload}
            href="/documents/upload"
            label="Upload Document"
            variant="light"
          />
        </div>
      </section>

      <ViewerBanner
        show={isViewer}
        description={
          user
            ? "You can view and open shared documents. Viewer access cannot upload, replace, edit, or delete files."
            : "Explore sample receipts, manuals, warranties, and device files. Create an account to upload and manage your own documents."
        }
      />

      {documents.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={FolderOpen}
            label="Documents"
            value={documents.length.toLocaleString()}
          />

          <SummaryCard
            icon={FileText}
            label="Connected"
            value={connectedDocumentCount.toLocaleString()}
          />

          <SummaryCard
            icon={ShieldCheck}
            label="File Types"
            value={uniqueTypeCount.toLocaleString()}
          />

          <SummaryCard
            icon={Upload}
            label="Added Recently"
            value={recentDocumentCount.toLocaleString()}
          />
        </section>
      )}

      {documents.length > 0 && (
        <PageCard className="p-5 md:p-6">
          <div className="flex flex-col gap-5">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search documents or devices..."
                className="w-full rounded-2xl border border-[#E8E2D6] bg-[#FAFAF8] py-3.5 pl-11 pr-11 text-sm text-[#111827] outline-none transition placeholder:text-neutral-400 focus:border-[#C8A96A] focus:bg-white focus:ring-4 focus:ring-[#C8A96A]/10"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white hover:text-[#111827]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {documentTypes.map(
                (type) => {
                  const active =
                    selectedType ===
                    type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setSelectedType(
                          type
                        )
                      }
                      className={
                        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition " +
                        (active
                          ? "bg-[#111827] text-white"
                          : "border border-[#E8E2D6] bg-white text-neutral-500 hover:border-[#C8A96A] hover:text-[#111827]")
                      }
                    >
                      {type === "All"
                        ? "All Documents"
                        : type}
                    </button>
                  );
                }
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E2D6] pt-4">
              <p className="text-sm text-neutral-500">
                {filteredDocuments.length}{" "}
                {filteredDocuments.length ===
                1
                  ? "document"
                  : "documents"}
              </p>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] transition hover:text-[#8A6A2F]"
                >
                  <X size={15} />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </PageCard>
      )}

      {filteredDocuments.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map(
            (document) => (
              <DocumentCard
                key={document.id}
                document={document}
                deviceName={getDeviceName(
                  document,
                  devices
                )}
                isDemo={
                  isDemo || !user
                }
                canDelete={canDelete}
                onDemoPreview={() =>
                  setPreviewDocument(
                    document
                  )
                }
              />
            )
          )}
        </section>
      ) : documents.length > 0 ? (
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Search size={28} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            No matching documents
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Try a different search
            term or document type.
          </p>

          <Button
            variant="secondary"
            className="mt-6"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </PageCard>
      ) : (
        <PermissionEmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload receipts, manuals, warranties, invoices, and other important files so they are ready when needed."
          canCreate={canUpload}
          href="/documents/upload"
          buttonLabel="Upload Your First Document"
        />
      )}

      {previewDocument && (
        <DemoPreviewModal
          document={
            previewDocument
          }
          deviceName={getDeviceName(
            previewDocument,
            devices
          )}
          onClose={() =>
            setPreviewDocument(
              null
            )
          }
        />
      )}
    </PageShell>
  );
}

function DocumentCard({
  document,
  deviceName,
  isDemo,
  canDelete,
  onDemoPreview,
}: {
  document: DocumentRecord;
  deviceName: string;
  isDemo: boolean;
  canDelete: boolean;
  onDemoPreview: () => void;
}) {
  const title =
    getDocumentTitle(document);

  const visual =
    getDocumentVisual(
      document.file_type
    );

  const VisualIcon =
    visual.icon;

  const isImage =
    isImageDocument(
      document.file_type,
      document.file_name
    );

  const deviceHref =
    document.device_id
      ? "/devices/" +
        document.device_id
      : "/devices";

  return (
    <article className="group overflow-hidden rounded-[28px] border border-[#E8E2D6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D8C69D] hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F5EF]">
        {isImage &&
        document.file_url &&
        !isDemo ? (
          <img
            src={document.file_url}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div
              className={
                "flex h-20 w-20 items-center justify-center rounded-[28px] bg-white shadow-sm " +
                visual.iconClassName
              }
            >
              <VisualIcon size={32} />
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {visual.label}
            </p>
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#111827] shadow-sm backdrop-blur">
          {document.file_type ||
            "Document"}
        </span>

        {isDemo && (
          <span className="absolute right-4 top-4 rounded-full bg-[#111827]/90 px-3 py-1.5 text-xs font-semibold text-[#C8A96A] shadow-sm backdrop-blur">
            Demo
          </span>
        )}
      </div>

      <div className="p-5">
        <h2 className="line-clamp-2 text-xl font-semibold tracking-[-0.03em] text-[#111827]">
          {title}
        </h2>

        <p className="mt-2 truncate text-sm text-neutral-400">
          {document.file_name}
        </p>

        <div className="mt-5 rounded-[20px] bg-[#F7F5EF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Connected Device
          </p>

          {document.device_id ? (
            <Link
              href={
                isDemo
                  ? "/devices"
                  : deviceHref
              }
              className="mt-2 inline-flex max-w-full items-center gap-2 font-semibold text-[#111827] transition hover:text-[#8A6A2F]"
            >
              <span className="truncate">
                {deviceName}
              </span>

              <ExternalLink
                size={14}
                className="shrink-0"
              />
            </Link>
          ) : (
            <p className="mt-2 font-semibold text-neutral-500">
              Unassigned
            </p>
          )}
        </div>

        {document.created_at && (
          <p className="mt-4 text-xs text-neutral-400">
            Added{" "}
            {formatDate(
              document.created_at
            )}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3 border-t border-[#E8E2D6] pt-5">
          {isDemo ? (
            <button
              type="button"
              onClick={onDemoPreview}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#263044]"
            >
              <ExternalLink
                size={16}
              />
              Preview
            </button>
          ) : (
            <>
              {document.file_url ? (
                <a
                  href={
                    document.file_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#263044]"
                >
                  <ExternalLink
                    size={16}
                  />
                  Open
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 flex-1 cursor-not-allowed items-center justify-center rounded-2xl bg-neutral-100 px-4 text-sm font-semibold text-neutral-400"
                >
                  File unavailable
                </button>
              )}

              {canDelete && (
                <DeleteDocumentButton
                  documentId={
                    document.id
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function DemoPreviewModal({
  document,
  deviceName,
  onClose,
}: {
  document: DocumentRecord;
  deviceName: string;
  onClose: () => void;
}) {
  const visual =
    getDocumentVisual(
      document.file_type
    );

  const VisualIcon =
    visual.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Sample document preview"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[30px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8E2D6] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
              Sample Preview
            </p>

            <h2 className="mt-1 font-semibold text-[#111827]">
              {getDocumentTitle(
                document
              )}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F5EF] text-neutral-500 transition hover:text-[#111827]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex min-h-52 flex-col items-center justify-center rounded-[24px] bg-[#F7F5EF] p-6 text-center">
            <div
              className={
                "flex h-20 w-20 items-center justify-center rounded-[28px] bg-white shadow-sm " +
                visual.iconClassName
              }
            >
              <VisualIcon size={32} />
            </div>

            <p className="mt-5 text-sm font-semibold text-[#111827]">
              {document.file_name}
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              {document.file_type}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PreviewDetail
              label="Connected Device"
              value={deviceName}
            />

            <PreviewDetail
              label="Date Added"
              value={
                document.created_at
                  ? formatDate(
                      document.created_at
                    )
                  : "Not provided"
              }
            />
          </div>

          <div className="mt-6 rounded-2xl border border-[#D8C69D] bg-[#FFF8E8] p-4">
            <p className="text-sm leading-6 text-neutral-600">
              This is a sample
              document preview. Create
              an account to upload and
              manage your own files.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              href="/signup"
              className="flex-1"
            >
              Create Your Vault
            </Button>

            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Continue Exploring
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-semibold text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: DocumentIcon;
  label: string;
  value: string;
}) {
  return (
    <PageCard className="p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-neutral-500">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-[#111827] md:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={20} />
        </div>
      </div>
    </PageCard>
  );
}

function getDocumentVisual(
  type?: string | null
): {
  icon: DocumentIcon;
  label: string;
  iconClassName: string;
} {
  const normalized =
    type
      ?.trim()
      .toLowerCase() || "";

  if (
    normalized.includes(
      "warranty"
    )
  ) {
    return {
      icon: ShieldCheck,
      label: "Warranty",
      iconClassName:
        "text-[#C8A96A]",
    };
  }

  if (
    normalized.includes(
      "receipt"
    ) ||
    normalized.includes(
      "invoice"
    )
  ) {
    return {
      icon: ReceiptText,
      label: "Purchase Record",
      iconClassName:
        "text-[#C8A96A]",
    };
  }

  if (
    normalized.includes(
      "photo"
    ) ||
    normalized.includes(
      "image"
    )
  ) {
    return {
      icon: ImageIcon,
      label: "Image",
      iconClassName:
        "text-[#C8A96A]",
    };
  }

  if (
    normalized.includes(
      "manual"
    ) ||
    normalized.includes(
      "guide"
    )
  ) {
    return {
      icon: FileText,
      label: "Manual",
      iconClassName:
        "text-[#C8A96A]",
    };
  }

  return {
    icon: File,
    label: "Document",
    iconClassName:
      "text-[#C8A96A]",
  };
}

function getDocumentTitle(
  document: DocumentRecord
) {
  return (
    document.document_name?.trim() ||
    document.file_name ||
    "Untitled Document"
  );
}

function getDeviceName(
  document: DocumentRecord,
  devices: DeviceRecord[]
) {
  const device =
    devices.find(
      (item) =>
        item.id ===
        document.device_id
    );

  return (
    device?.device_name ||
    "Unassigned Device"
  );
}

function isImageDocument(
  type?: string | null,
  fileName?: string | null
) {
  const normalizedType =
    type
      ?.trim()
      .toLowerCase() || "";

  if (
    normalizedType.includes(
      "photo"
    ) ||
    normalizedType.includes(
      "image"
    )
  ) {
    return true;
  }

  const extension =
    fileName
      ?.split(".")
      .pop()
      ?.toLowerCase();

  return [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
  ].includes(extension || "");
}

function isRecentDate(
  value?: string | null
) {
  if (!value) {
    return false;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return false;
  }

  const thirtyDaysAgo =
    Date.now() -
    30 *
      24 *
      60 *
      60 *
      1000;

  return (
    date.getTime() >=
    thirtyDaysAgo
  );
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}