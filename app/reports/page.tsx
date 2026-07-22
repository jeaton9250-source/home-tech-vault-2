"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import {
  Crown,
  Download,
  Eye,
  FileText,
  Home,
  Laptop,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Wifi,
  Wrench,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import { usePermissions } from "@/hooks/usePermissions";

import {
  generateReportPdf,
  type ReportPdfDevice,
  type ReportPdfType,
} from "@/lib/reports/generateReportPdf";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";

type ReportIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

type PreviewReport = {
  type: ReportPdfType;
  title: string;
  description: string;
  rows: {
    label: string;
    value: string;
  }[];
};

type DeviceRow = {
  id: string;
  device_name: string | null;
  purchase_price: number | null;
  warranty_date: string | null;
  serial_number: string | null;
  location: string | null;
};

type ReportCoverage = {
  photos: number;
  documents: number;
  serialNumbers: number;
  warranties: number;
};

type ReportOption = {
  type: ReportPdfType;
  title: string;
  description: string;
  icon: ReportIcon;
};

const reportOptions: ReportOption[] = [
  {
    type: "household",
    title: "Household Summary",
    description:
      "A simple overview of your devices, value, documents, and warranties.",
    icon: Home,
  },
  {
    type: "devices",
    title: "Device Inventory",
    description:
      "A complete list of every device stored in your vault.",
    icon: Laptop,
  },
  {
    type: "insurance",
    title: "Insurance Report",
    description:
      "Claim-ready device, photo, document, and value information.",
    icon: ShieldCheck,
  },
  {
    type: "warranties",
    title: "Warranty Report",
    description:
      "A summary of active, expiring, expired, and missing coverage.",
    icon: ShieldCheck,
  },
  {
    type: "network",
    title: "Network Report",
    description:
      "A record of your internet, Wi-Fi, router, modem, and network devices.",
    icon: Wifi,
  },
  {
    type: "maintenance",
    title: "Maintenance Report",
    description:
      "A summary of maintenance, repairs, cleaning, and software updates.",
    icon: Wrench,
  },
];

export default function ReportsPage() {
  const {
    user,
    isDemo,
    householdId,
    loading: permissionsLoading,
    canAccessFeature,
  } = usePermissions();

  const [devices, setDevices] =
    useState<DeviceRow[]>([]);

  const [deviceCount, setDeviceCount] =
    useState(0);

  const [documentCount, setDocumentCount] =
    useState(0);

  const [photoCount, setPhotoCount] =
    useState(0);

  const [
    serialNumberCount,
    setSerialNumberCount,
  ] = useState(0);

  const [roomCount, setRoomCount] =
    useState(0);

  const [
    protectedValue,
    setProtectedValue,
  ] = useState(0);

  const [
    activeWarrantyCount,
    setActiveWarrantyCount,
  ] = useState(0);

  const [
    reportCoverage,
    setReportCoverage,
  ] = useState<ReportCoverage>({
    photos: 0,
    documents: 0,
    serialNumbers: 0,
    warranties: 0,
  });

  const [
    loadingReports,
    setLoadingReports,
  ] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    selectedReportType,
    setSelectedReportType,
  ] =
    useState<ReportPdfType>("household");

  const [
    previewReport,
    setPreviewReport,
  ] = useState<PreviewReport | null>(
    null
  );

  const [
    generatingReport,
    setGeneratingReport,
  ] =
    useState<ReportPdfType | null>(
      null
    );

  const hasPdfAccess =
    canAccessFeature("reports");

  useEffect(() => {
    async function loadReportOverview() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingReports(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setDeviceCount(24);
          setDocumentCount(47);
          setPhotoCount(24);
          setSerialNumberCount(24);
          setRoomCount(8);
          setProtectedValue(27200);
          setActiveWarrantyCount(18);

          setReportCoverage({
            photos: 96,
            documents: 87,
            serialNumbers: 100,
            warranties: 78,
          });

          return;
        }

        const devicesResult =
          await applyHouseholdScope(
            supabase
              .from("devices")
              .select(
                `
                id,
                device_name,
                location,
                warranty_date,
                serial_number,
                purchase_price
              `
              ),
            householdId,
            user.id
          );

        if (devicesResult.error) {
          throw devicesResult.error;
        }

        const loadedDevices =
          (devicesResult.data ||
            []) as DeviceRow[];

        const deviceIds =
          loadedDevices.map(
            (device) => device.id
          );

        const [
          documentsResult,
          photosResult,
        ] = await Promise.all([
          deviceIds.length > 0
            ? supabase
                .from(
                  "device_documents"
                )
                .select("device_id")
                .in(
                  "device_id",
                  deviceIds
                )
            : Promise.resolve({
                data: [],
                error: null,
              }),

          deviceIds.length > 0
            ? supabase
                .from("device_images")
                .select("device_id")
                .in(
                  "device_id",
                  deviceIds
                )
            : Promise.resolve({
                data: [],
                error: null,
              }),
        ]);

        if (documentsResult.error) {
          console.error(
            "Unable to load report documents:",
            documentsResult.error
          );
        }

        if (photosResult.error) {
          console.error(
            "Unable to load report photos:",
            photosResult.error
          );
        }

        const documentDeviceIds =
          new Set(
            (
              documentsResult.data ||
              []
            ).map(
              (row) =>
                row.device_id
            )
          );

        const photoDeviceIds =
          new Set(
            (
              photosResult.data ||
              []
            ).map(
              (row) =>
                row.device_id
            )
          );

        const totalValue =
          loadedDevices.reduce(
            (total, device) =>
              total +
              Number(
                device.purchase_price ||
                  0
              ),
            0
          );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeWarranties =
          loadedDevices.filter(
            (device) => {
              if (
                !device.warranty_date
              ) {
                return false;
              }

              const expiration =
                new Date(
                  `${device.warranty_date}T23:59:59`
                );

              return (
                expiration >= today
              );
            }
          ).length;

        const devicesWithSerialNumbers =
          loadedDevices.filter(
            (device) =>
              Boolean(
                device.serial_number?.trim()
              )
          ).length;

        const rooms = new Set(
          loadedDevices
            .map((device) =>
              device.location?.trim()
            )
            .filter(Boolean)
        );

        function calculateCoverage(
          value: number
        ) {
          if (
            loadedDevices.length ===
            0
          ) {
            return 0;
          }

          return Math.round(
            (value /
              loadedDevices.length) *
              100
          );
        }

        setDevices(loadedDevices);

        setDeviceCount(
          loadedDevices.length
        );

        setDocumentCount(
          documentDeviceIds.size
        );

        setPhotoCount(
          photoDeviceIds.size
        );

        setSerialNumberCount(
          devicesWithSerialNumbers
        );

        setRoomCount(rooms.size);

        setProtectedValue(
          totalValue
        );

        setActiveWarrantyCount(
          activeWarranties
        );

        setReportCoverage({
          photos: calculateCoverage(
            photoDeviceIds.size
          ),
          documents:
            calculateCoverage(
              documentDeviceIds.size
            ),
          serialNumbers:
            calculateCoverage(
              devicesWithSerialNumbers
            ),
          warranties:
            calculateCoverage(
              activeWarranties
            ),
        });
      } catch (error: unknown) {
        const possibleError =
          error as {
            message?: string;
            details?: string;
          };

        console.error(
          "Unable to load Reports Center:",
          error
        );

        setErrorMessage(
          possibleError.message ||
            possibleError.details ||
            "Unable to load your reports."
        );
      } finally {
        setLoadingReports(false);
      }
    }

    loadReportOverview();
  }, [
    user,
    isDemo,
    householdId,
    permissionsLoading,
  ]);

  const readinessScore =
    useMemo(() => {
      if (deviceCount === 0) {
        return 0;
      }

      return Math.round(
        (reportCoverage.photos +
          reportCoverage.documents +
          reportCoverage.serialNumbers +
          reportCoverage.warranties) /
          4
      );
    }, [
      deviceCount,
      reportCoverage,
    ]);

  const readinessLabel =
    readinessScore >= 90
      ? "Insurance ready"
      : readinessScore >= 75
        ? "Nearly ready"
        : readinessScore >= 50
          ? "Needs attention"
          : "Getting started";

  const selectedOption =
    reportOptions.find(
      (report) =>
        report.type ===
        selectedReportType
    ) || reportOptions[0];

  function getPreviewReport(
    type: ReportPdfType
  ): PreviewReport {
    switch (type) {
      case "household":
        return {
          type,
          title:
            "Household Summary",
          description:
            "A high-level overview of your complete Home Tech Vault.",
          rows: [
            {
              label: "Devices",
              value:
                deviceCount.toLocaleString(),
            },
            {
              label:
                "Recorded Value",
              value:
                formatCurrency(
                  protectedValue
                ),
            },
            {
              label: "Documents",
              value:
                documentCount.toLocaleString(),
            },
            {
              label:
                "Active Warranties",
              value:
                activeWarrantyCount.toLocaleString(),
            },
          ],
        };

      case "devices":
        return {
          type,
          title:
            "Device Inventory",
          description:
            "A complete inventory of your saved household technology.",
          rows: [
            {
              label:
                "Total Devices",
              value:
                deviceCount.toLocaleString(),
            },
            {
              label: "Rooms",
              value:
                roomCount.toLocaleString(),
            },
            {
              label:
                "Serial Numbers",
              value:
                serialNumberCount.toLocaleString(),
            },
            {
              label:
                "Recorded Value",
              value:
                formatCurrency(
                  protectedValue
                ),
            },
          ],
        };

      case "insurance":
        return {
          type,
          title:
            "Insurance Report",
          description:
            "Claim-ready technology information for insurance purposes.",
          rows: [
            {
              label: "Devices",
              value:
                deviceCount.toLocaleString(),
            },
            {
              label: "Documents",
              value:
                documentCount.toLocaleString(),
            },
            {
              label: "Photos",
              value:
                photoCount.toLocaleString(),
            },
            {
              label:
                "Recorded Value",
              value:
                formatCurrency(
                  protectedValue
                ),
            },
          ],
        };

      case "warranties":
        return {
          type,
          title:
            "Warranty Report",
          description:
            "Review active and documented warranties.",
          rows: [
            {
              label:
                "Active Warranties",
              value:
                activeWarrantyCount.toLocaleString(),
            },
            {
              label:
                "Total Devices",
              value:
                deviceCount.toLocaleString(),
            },
            {
              label:
                "Warranty Coverage",
              value: `${reportCoverage.warranties}%`,
            },
            {
              label:
                "Documented Devices",
              value:
                documentCount.toLocaleString(),
            },
          ],
        };

      case "network":
        return {
          type,
          title:
            "Network Report",
          description:
            "Document your home network devices and configuration.",
          rows: [
            {
              label: "Devices",
              value:
                deviceCount.toLocaleString(),
            },
            {
              label: "Rooms",
              value:
                roomCount.toLocaleString(),
            },
            {
              label:
                "Serial Numbers",
              value:
                serialNumberCount.toLocaleString(),
            },
            {
              label:
                "Photo Coverage",
              value: `${reportCoverage.photos}%`,
            },
          ],
        };

      case "maintenance":
        return {
          type,
          title:
            "Maintenance Report",
          description:
            "Track service, repairs, and maintenance history.",
          rows: [
            {
              label: "Devices",
              value:
                deviceCount.toLocaleString(),
            },
            {
              label:
                "Active Warranties",
              value:
                activeWarrantyCount.toLocaleString(),
            },
            {
              label:
                "Document Coverage",
              value: `${reportCoverage.documents}%`,
            },
            {
              label:
                "Photo Coverage",
              value: `${reportCoverage.photos}%`,
            },
          ],
        };

      default:
        return {
          type,
          title: "Report",
          description:
            "Preview report details.",
          rows: [],
        };
    }
  }

  function handlePreview() {
    setPreviewReport(
      getPreviewReport(
        selectedReportType
      )
    );
  }

  async function handlePdfRequest(
    type: ReportPdfType
  ) {
    if (permissionsLoading) {
      return;
    }

    if (isDemo) {
      window.location.href =
        "/signup";
      return;
    }

    if (!hasPdfAccess) {
      window.location.href =
        "/upgrade";
      return;
    }

    setGeneratingReport(type);

    try {
      const reportDevices: ReportPdfDevice[] =
        devices.map((device) => ({
          name:
            device.device_name ||
            "Unnamed Device",
          purchasePrice:
            device.purchase_price ||
            0,
          location:
            device.location || "",
          serialNumber:
            device.serial_number ||
            "",
          warrantyDate:
            device.warranty_date ||
            "",
        }));

      generateReportPdf({
        type,
        householdName:
          user?.email ||
          "Home Tech Vault",
        ownerName:
          user?.email ||
          undefined,
        city: "",
        devices: reportDevices,
      });
    } finally {
      setGeneratingReport(null);
    }
  }

  const loading =
    permissionsLoading ||
    loadingReports;

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Loading reports...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          <h1 className="text-xl font-semibold">
            Unable to load reports
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
      <PageHero
        section="insights"
        eyebrow="Reports"
        title="Export your vault."
        description="Create clear PDF reports for insurance, organization, warranties, maintenance, and planning."
      >
        {!hasPdfAccess && !isDemo && (
          <Button href="/upgrade">
            <Crown size={17} />
            Upgrade to Pro
          </Button>
        )}

        {isDemo && (
          <Button href="/signup">
            Create Your Vault
          </Button>
        )}
      </PageHero>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Devices"
          value={deviceCount.toLocaleString()}
          icon={Laptop}
        />

        <SummaryCard
          title="Protected Value"
          value={formatCurrency(
            protectedValue
          )}
          icon={ShieldCheck}
        />

        <SummaryCard
          title="Documents"
          value={documentCount.toLocaleString()}
          icon={FileText}
        />

        <SummaryCard
          title="Report Readiness"
          value={`${readinessScore}%`}
          icon={ShieldCheck}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <PageCard className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
            Report Readiness
          </p>

          <div className="mt-7">
            <ReadinessRing
              score={readinessScore}
              label={readinessLabel}
            />
          </div>

          <p className="mt-7 max-w-sm text-sm leading-6 text-text-secondary">
            Your score is based on photo,
            document, serial-number, and
            warranty coverage.
          </p>
        </PageCard>

        <PageCard className="p-7 md:p-9">
          <p className="text-overline text-charcoal-soft">
            Choose a Report
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            What would you like to export?
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Select one report, review its
            summary, and download the PDF.
          </p>

          <div className="mt-7">
            <label
              htmlFor="report-type"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary"
            >
              Report Type
            </label>

            <select
              id="report-type"
              value={selectedReportType}
              onChange={(event) =>
                setSelectedReportType(
                  event.target
                    .value as ReportPdfType
                )
              }
              className="mt-2 w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-sm font-semibold text-text-primary outline-none transition focus:border-interaction focus:ring-4 focus:ring-interaction/10"
            >
              {reportOptions.map(
                (report) => (
                  <option
                    key={report.type}
                    value={report.type}
                  >
                    {report.title}
                  </option>
                )
              )}
            </select>
          </div>

          <SelectedReportCard
            report={selectedOption}
          />

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              onClick={handlePreview}
              variant="secondary"
            >
              <Eye size={17} />
              Preview
            </Button>

            <Button
              onClick={() =>
                void handlePdfRequest(
                  selectedReportType
                )
              }
              disabled={
                generatingReport ===
                selectedReportType
              }
            >
              {generatingReport ===
              selectedReportType ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : hasPdfAccess ? (
                <Download size={17} />
              ) : (
                <LockKeyhole
                  size={17}
                />
              )}

              {generatingReport ===
              selectedReportType
                ? "Generating..."
                : isDemo
                  ? "Create Vault to Download"
                  : hasPdfAccess
                    ? "Download PDF"
                    : "Unlock with Pro"}
            </Button>
          </div>
        </PageCard>
      </section>

      {previewReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] border border-border-subtle bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-5 border-b border-border-subtle p-6 md:p-8">
              <div>
                <p className="text-overline text-charcoal-soft">
                  Report Preview
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
                  {previewReport.title}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                  {
                    previewReport.description
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewReport(null)
                }
                aria-label="Close preview"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-sunken text-text-primary transition hover:bg-[#EEEAE1]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <div className="space-y-3">
                {previewReport.rows.map(
                  (row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-4 rounded-[22px] bg-surface-sunken p-4"
                    >
                      <p className="text-sm text-text-secondary">
                        {row.label}
                      </p>

                      <p className="text-right text-sm font-semibold text-text-primary">
                        {row.value}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  onClick={() =>
                    void handlePdfRequest(
                      previewReport.type
                    )
                  }
                  disabled={
                    generatingReport ===
                    previewReport.type
                  }
                >
                  {generatingReport ===
                  previewReport.type ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : hasPdfAccess ? (
                    <Download size={17} />
                  ) : (
                    <LockKeyhole
                      size={17}
                    />
                  )}

                  {generatingReport ===
                  previewReport.type
                    ? "Generating..."
                    : isDemo
                      ? "Create Vault to Download"
                      : hasPdfAccess
                        ? "Download PDF"
                        : "Unlock with Pro"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() =>
                    setPreviewReport(null)
                  }
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function SelectedReportCard({
  report,
}: {
  report: ReportOption;
}) {
  const Icon = report.icon;

  return (
    <div className="mt-5 flex items-start gap-4 rounded-[24px] bg-surface-sunken p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
        <Icon size={21} />
      </div>

      <div>
        <h3 className="font-semibold text-text-primary">
          {report.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {report.description}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: ReportIcon;
}) {
  return (
    <PageCard className="p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-text-secondary">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
          <Icon size={20} />
        </div>
      </div>
    </PageCard>
  );
}

function ReadinessRing({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const normalizedScore = Math.max(
    0,
    Math.min(score, 100)
  );

  const radius = 72;

  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (normalizedScore / 100) *
      circumference;

  return (
    <div className="relative h-44 w-44 md:h-48 md:w-48">
      <svg
        viewBox="0 0 176 176"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`Report readiness: ${normalizedScore}%`}
      >
        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="12"
        />

        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke="#111827"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tracking-[-0.05em] text-text-primary">
          {normalizedScore}

          <span className="ml-0.5 text-2xl text-text-tertiary">
            %
          </span>
        </span>

        <span className="mt-2 max-w-28 text-sm font-semibold text-achievement">
          {label}
        </span>
      </div>
    </div>
  );
}

function formatCurrency(
  value: number
) {
  return value.toLocaleString(
    undefined,
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  );
}