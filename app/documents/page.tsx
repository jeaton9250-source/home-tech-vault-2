"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  File,
  FileText,
  Filter,
  ImageIcon,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";
import {
  demoDevices,
  demoDocuments,
} from "@/lib/demoData";

import DeleteDocumentButton from "@/components/DeleteDocumentButton";
import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type DocumentRecord = {
  id: string;
  user_id?: string | null;
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

export default function DocumentsPage() {
  const {
    user,
    isDemo,
    loading: demoModeLoading,
  } = useDemoMode();

  const [documents, setDocuments] = useState<
    DocumentRecord[]
  >([]);

  const [devices, setDevices] = useState<
    DeviceRecord[]
  >([]);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedType, setSelectedType] =
    useState("All");

  useEffect(() => {
    async function loadDocuments() {
      if (demoModeLoading) {
        return;
      }

      try {
        setLoadingDocuments(true);
        setErrorMessage("");

        if (isDemo) {
          const sampleDocuments: DocumentRecord[] =
            demoDocuments.map((document) => ({
              id: document.id,
              device_id: document.device_id,
              file_type:
                document.document_type ||
                "Document",
              file_name: document.file_name,
              document_name:
                document.document_name,
              file_url: null,
              created_at: document.created_at,
            }));

          const sampleDevices: DeviceRecord[] =
            demoDevices.map((device) => ({
              id: device.id,
              device_name:
                device.device_name,
            }));

          setDocuments(sampleDocuments);
          setDevices(sampleDevices);
          return;
        }

        if (!user) {
          setDocuments([]);
          setDevices([]);
          return;
        }

        const [
          documentResult,
          deviceResult,
        ] = await Promise.all([
          supabase
            .from("documents")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("devices")
            .select("id, device_name")
            .eq("user_id", user.id),
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

        setDocuments(
          (documentResult.data ||
            []) as DocumentRecord[]
        );

        setDevices(
          (deviceResult.data ||
            []) as DeviceRecord[]
        );
      } catch (error) {
        console.error(
          "Unable to load documents:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your documents."
        );
      } finally {
        setLoadingDocuments(false);
      }
    }

    loadDocuments();
  }, [
    user,
    isDemo,
    demoModeLoading,
  ]);

  const documentTypes = useMemo(() => {
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

  const filteredDocuments = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return documents.filter((document) => {
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
          String(value || "")
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
    });
  }, [
    documents,
    devices,
    searchTerm,
    selectedType,
  ]);

  const loading =
    demoModeLoading ||
    loadingDocuments;

  const filtersActive =
    searchTerm !== "" ||
    selectedType !== "All";

  function clearFilters() {
    setSearchTerm("");
    setSelectedType("All");
  }

  function openDemoPreview(
    document: DocumentRecord
  ) {
    alert(
      `${getDocumentTitle(
        document
      )}\n\nThis is a sample document preview. Create an account to upload, open, and manage your own files.`
    );
  }

  return (
    <PageShell>
      <PageTitle
        eyebrow="Document Vault"
        title={
          isDemo
            ? "Demo Document Vault"
            : "Documents"
        }
        description={
          isDemo
            ? "Explore how receipts, manuals, warranties, and other important technology files are organized."
            : "Keep your receipts, manuals, warranties, invoices, and device files organized in one secure place."
        }
        action={
          <Button
            href={
              isDemo
                ? "/signup"
                : "/documents/upload"
            }
          >
            <Upload size={18} />

            {isDemo
              ? "Create Your Vault"
              : "Upload Document"}
          </Button>
        }
      />

      {isDemo && !loading && (
        <PageCard className="border-[#D8C69D] bg-[#FFF8E8]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[#C8A96A]">
              <Sparkles size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
                Interactive Demo
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#111827]">
                See how important files stay organized
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                Sample documents are connected to
                devices so receipts, manuals, setup
                guides, and warranty records are easy
                to find when you need them.
              </p>
            </div>
          </div>
        </PageCard>
      )}

      {errorMessage && (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      )}

      {!loading &&
        documents.length > 0 && (
          <PageCard className="p-5 md:p-6">
            <div className="flex items-center gap-2">
              <Filter
                size={18}
                className="text-[#C8A96A]"
              />

              <h2 className="font-semibold text-[#111827]">
                Search and Filter
              </h2>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_240px]">
              <div className="relative">
                <Search
                  size={19}
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
                  placeholder="Search documents, devices, or file types..."
                  className="w-full rounded-xl border border-[#E8E2D6] bg-white py-3 pl-11 pr-4 outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20"
                />
              </div>

              <select
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(
                    event.target.value
                  )
                }
                className="rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A]"
              >
                {documentTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type === "All"
                        ? "All File Types"
                        : type}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-500">
                Showing{" "}
                {filteredDocuments.length} of{" "}
                {documents.length} document
                {documents.length === 1
                  ? ""
                  : "s"}
              </p>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F7F5EF]"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </div>
          </PageCard>
        )}

      {loading ? (
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Loading your documents...
          </div>
        </PageCard>
      ) : filteredDocuments.length >
        0 ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map(
            (document) => {
              const documentTitle =
                getDocumentTitle(
                  document
                );

              const deviceName =
                getDeviceName(
                  document,
                  devices
                );

              const isPhoto =
                document.file_type
                  ?.toLowerCase() ===
                  "photo";

              return (
                <article
                  key={document.id}
                  className="overflow-hidden rounded-[28px] border border-[#E8E2D6] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#C8A96A] hover:shadow-lg"
                >
                  {isPhoto &&
                  document.file_url &&
                  !isDemo ? (
                    <img
                      src={
                        document.file_url
                      }
                      alt={documentTitle}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-[#F7F5EF]">
                      <DocumentIcon
                        type={
                          document.file_type
                        }
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
                          {document.file_type ||
                            "Document"}
                        </p>

                        <h2 className="mt-2 break-words text-xl font-bold text-[#111827]">
                          {documentTitle}
                        </h2>
                      </div>

                      {isDemo && (
                        <span className="shrink-0 rounded-full bg-[#F3EAD7] px-3 py-1 text-xs font-semibold text-[#8A6A2F]">
                          Demo
                        </span>
                      )}
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#F7F5EF] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Connected Device
                      </p>

                      <p className="mt-2 truncate font-semibold text-[#111827]">
                        {deviceName}
                      </p>
                    </div>

                    {document.created_at && (
                      <p className="mt-4 text-sm text-neutral-400">
                        Added{" "}
                        {formatDate(
                          document.created_at
                        )}
                      </p>
                    )}

                    <div className="mt-6 flex items-center gap-3">
                      {isDemo ? (
                        <button
                          type="button"
                          onClick={() =>
                            openDemoPreview(
                              document
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#263044]"
                        >
                          <ExternalLink
                            size={17}
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
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#263044]"
                            >
                              <ExternalLink
                                size={17}
                              />
                              Open
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-500"
                            >
                              File unavailable
                            </button>
                          )}

                          <DeleteDocumentButton
                            documentId={
                              document.id
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      ) : documents.length > 0 ? (
        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Search size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#111827]">
            No matching documents
          </h2>

          <p className="mt-3 text-neutral-500">
            Try changing your search or file-type
            filter.
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
        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <FileText size={31} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#111827]">
            No documents yet
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-neutral-500">
            Upload receipts, manuals, warranties,
            invoices, and device photos so they are
            ready when you need them.
          </p>

          <Button
            href={
              isDemo
                ? "/signup"
                : "/documents/upload"
            }
            className="mt-6"
          >
            <Upload size={18} />

            {isDemo
              ? "Create Your Vault"
              : "Upload Your First Document"}
          </Button>
        </PageCard>
      )}
    </PageShell>
  );
}

function DocumentIcon({
  type,
}: {
  type?: string | null;
}) {
  const normalizedType =
    type?.toLowerCase() || "";

  if (
    normalizedType.includes("warranty")
  ) {
    return (
      <ShieldCheck
        size={58}
        className="text-[#C8A96A]"
      />
    );
  }

  if (
    normalizedType.includes("photo") ||
    normalizedType.includes("image")
  ) {
    return (
      <ImageIcon
        size={58}
        className="text-[#C8A96A]"
      />
    );
  }

  if (
    normalizedType.includes("receipt") ||
    normalizedType.includes("invoice")
  ) {
    return (
      <FileText
        size={58}
        className="text-[#C8A96A]"
      />
    );
  }

  return (
    <File
      size={58}
      className="text-[#C8A96A]"
    />
  );
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
  const device = devices.find(
    (item) =>
      item.id === document.device_id
  );

  return (
    device?.device_name ||
    "Unassigned Device"
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}