"use client";

import {
  useEffect,
  useRef,
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
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";

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
    description: "A complete list of every device stored in your vault.",
    icon: Laptop,
  },
  {
    type: "insurance",
    title: "Insurance Report",
    description: "Claim-ready device, photo, document, and value information.",
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
  const insuranceAutoGenerateHandled = useRef(false);
  const {
    user,
    isDemo,
    householdId,
    loading: permissionsLoading,
    canAccessFeature,
  } = usePermissions();

  const showReadOnlyModal = useDemoReadOnlyAction();

  const [devices, setDevices] = useState<DeviceRow[]>([]);

  const [deviceCount, setDeviceCount] = useState(0);

  const [documentCount, setDocumentCount] = useState(0);

  const [photoCount, setPhotoCount] = useState(0);

  const [serialNumberCount, setSerialNumberCount] = useState(0);

  const [roomCount, setRoomCount] = useState(0);

  const [protectedValue, setProtectedValue] = useState(0);

  const [activeWarrantyCount, setActiveWarrantyCount] = useState(0);

  const [reportCoverage, setReportCoverage] = useState<ReportCoverage>({
    photos: 0,
    documents: 0,
    serialNumbers: 0,
    warranties: 0,
  });

  const [loadingReports, setLoadingReports] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [selectedReportType, setSelectedReportType] =
    useState<ReportPdfType>("household");

  const [previewReport, setPreviewReport] = useState<PreviewReport | null>(
    null,
  );

  const [generatingReport, setGeneratingReport] =
    useState<ReportPdfType | null>(null);

  const hasPdfAccess = canAccessFeature("reports");

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

        const devicesResult = await applyHouseholdScope(
          supabase.from("devices").select(
            `
                id,
                device_name,
                location,
                warranty_date,
                serial_number,
                purchase_price
              `,
          ),
          householdId,
          user.id,
        );

        if (devicesResult.error) {
          throw devicesResult.error;
        }

        const loadedDevices = (devicesResult.data || []) as DeviceRow[];

        const deviceIds = loadedDevices.map((device) => device.id);

        const [documentsResult, photosResult] = await Promise.all([
          deviceIds.length > 0
            ? supabase
                .from("device_documents")
                .select("device_id")
                .in("device_id", deviceIds)
            : Promise.resolve({
                data: [],
                error: null,
              }),

          deviceIds.length > 0
            ? supabase
                .from("device_images")
                .select("device_id")
                .in("device_id", deviceIds)
            : Promise.resolve({
                data: [],
                error: null,
              }),
        ]);

        if (documentsResult.error) {
          console.error(
            "Unable to load report documents:",
            documentsResult.error,
          );
        }

        if (photosResult.error) {
          console.error("Unable to load report photos:", photosResult.error);
        }

        const documentDeviceIds = new Set(
          (documentsResult.data || []).map((row) => row.device_id),
        );

        const photoDeviceIds = new Set(
          (photosResult.data || []).map((row) => row.device_id),
        );

        const totalValue = loadedDevices.reduce(
          (total, device) => total + Number(device.purchase_price || 0),
          0,
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeWarranties = loadedDevices.filter((device) => {
          if (!device.warranty_date) {
            return false;
          }

          const expiration = new Date(`${device.warranty_date}T23:59:59`);

          return expiration >= today;
        }).length;

        const devicesWithSerialNumbers = loadedDevices.filter((device) =>
          Boolean(device.serial_number?.trim()),
        ).length;

        const rooms = new Set(
          loadedDevices
            .map((device) => device.location?.trim())
            .filter(Boolean),
        );

        function calculateCoverage(value: number) {
          if (loadedDevices.length === 0) {
            return 0;
          }

          return Math.round((value / loadedDevices.length) * 100);
        }

        setDevices(loadedDevices);

        setDeviceCount(loadedDevices.length);

        setDocumentCount(documentDeviceIds.size);

        setPhotoCount(photoDeviceIds.size);

        setSerialNumberCount(devicesWithSerialNumbers);

        setRoomCount(rooms.size);

        setProtectedValue(totalValue);

        setActiveWarrantyCount(activeWarranties);

        setReportCoverage({
          photos: calculateCoverage(photoDeviceIds.size),
          documents: calculateCoverage(documentDeviceIds.size),
          serialNumbers: calculateCoverage(devicesWithSerialNumbers),
          warranties: calculateCoverage(activeWarranties),
        });
      } catch (error: unknown) {
        const possibleError = error as {
          message?: string;
          details?: string;
        };

        console.error("Unable to load Reports Center:", error);

        setErrorMessage(
          possibleError.message ||
            possibleError.details ||
            "Unable to load your reports.",
        );
      } finally {
        setLoadingReports(false);
      }
    }

    loadReportOverview();
  }, [user, isDemo, householdId, permissionsLoading]);

  const readinessScore = useMemo(() => {
    if (deviceCount === 0) {
      return 0;
    }

    return Math.round(
      (reportCoverage.photos +
        reportCoverage.documents +
        reportCoverage.serialNumbers +
        reportCoverage.warranties) /
        4,
    );
  }, [deviceCount, reportCoverage]);

  const readinessLabel =
    readinessScore >= 90
      ? "Insurance ready"
      : readinessScore >= 75
        ? "Nearly ready"
        : readinessScore >= 50
          ? "Needs attention"
          : "Getting started";

  const selectedOption =
    reportOptions.find((report) => report.type === selectedReportType) ||
    reportOptions[0];

  function getPreviewReport(type: ReportPdfType): PreviewReport {
    switch (type) {
      case "household":
        return {
          type,
          title: "Household Summary",
          description:
            "A high-level overview of your complete Home Tech Vault.",
          rows: [
            {
              label: "Devices",
              value: deviceCount.toLocaleString(),
            },
            {
              label: "Recorded Value",
              value: formatCurrency(protectedValue),
            },
            {
              label: "Documents",
              value: documentCount.toLocaleString(),
            },
            {
              label: "Active Warranties",
              value: activeWarrantyCount.toLocaleString(),
            },
          ],
        };

      case "devices":
        return {
          type,
          title: "Device Inventory",
          description:
            "A complete inventory of your saved household technology.",
          rows: [
            {
              label: "Total Devices",
              value: deviceCount.toLocaleString(),
            },
            {
              label: "Rooms",
              value: roomCount.toLocaleString(),
            },
            {
              label: "Serial Numbers",
              value: serialNumberCount.toLocaleString(),
            },
            {
              label: "Recorded Value",
              value: formatCurrency(protectedValue),
            },
          ],
        };

      case "insurance":
        return {
          type,
          title: "Insurance Report",
          description:
            "Claim-ready technology information for insurance purposes.",
          rows: [
            {
              label: "Devices",
              value: deviceCount.toLocaleString(),
            },
            {
              label: "Documents",
              value: documentCount.toLocaleString(),
            },
            {
              label: "Photos",
              value: photoCount.toLocaleString(),
            },
            {
              label: "Recorded Value",
              value: formatCurrency(protectedValue),
            },
          ],
        };

      case "warranties":
        return {
          type,
          title: "Warranty Report",
          description: "Review active and documented warranties.",
          rows: [
            {
              label: "Active Warranties",
              value: activeWarrantyCount.toLocaleString(),
            },
            {
              label: "Total Devices",
              value: deviceCount.toLocaleString(),
            },
            {
              label: "Warranty Coverage",
              value: `${reportCoverage.warranties}%`,
            },
            {
              label: "Documented Devices",
              value: documentCount.toLocaleString(),
            },
          ],
        };

      case "network":
        return {
          type,
          title: "Network Report",
          description: "Document your home network devices and configuration.",
          rows: [
            {
              label: "Devices",
              value: deviceCount.toLocaleString(),
            },
            {
              label: "Rooms",
              value: roomCount.toLocaleString(),
            },
            {
              label: "Serial Numbers",
              value: serialNumberCount.toLocaleString(),
            },
            {
              label: "Photo Coverage",
              value: `${reportCoverage.photos}%`,
            },
          ],
        };

      case "maintenance":
        return {
          type,
          title: "Maintenance Report",
          description: "Track service, repairs, and maintenance history.",
          rows: [
            {
              label: "Devices",
              value: deviceCount.toLocaleString(),
            },
            {
              label: "Active Warranties",
              value: activeWarrantyCount.toLocaleString(),
            },
            {
              label: "Document Coverage",
              value: `${reportCoverage.documents}%`,
            },
            {
              label: "Photo Coverage",
              value: `${reportCoverage.photos}%`,
            },
          ],
        };

      default:
        return {
          type,
          title: "Report",
          description: "Preview report details.",
          rows: [],
        };
    }
  }

  function handlePreview() {
    setPreviewReport(getPreviewReport(selectedReportType));
  }

  async function handlePdfRequest(type: ReportPdfType) {
    if (permissionsLoading) {
      return;
    }

    if (isDemo) {
      showReadOnlyModal();
      return;
    }

    if (!hasPdfAccess) {
      window.location.href = "/upgrade";
      return;
    }

    setGeneratingReport(type);

    try {
      const reportDevices: ReportPdfDevice[] = devices.map((device) => ({
        name: device.device_name || "Unnamed Device",
        purchasePrice: device.purchase_price || 0,
        location: device.location || "",
        serialNumber: device.serial_number || "",
        warrantyDate: device.warranty_date || "",
      }));

      generateReportPdf({
        type,
        householdName: user?.email || "Home Tech Vault",
        ownerName: user?.email || undefined,
        city: "",
        devices: reportDevices,
      });
    } finally {
      setGeneratingReport(null);
    }
  }

  useEffect(() => {
    if (
      insuranceAutoGenerateHandled.current ||
      permissionsLoading ||
      loadingReports
    ) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get("generate") !== "insurance") {
      return;
    }

    insuranceAutoGenerateHandled.current = true;

    /*
     * Remove the query parameter first so a
     * refresh does not download another PDF.
     */
    const cleanUrl = new URL(window.location.href);

    cleanUrl.searchParams.delete("generate");

    window.history.replaceState(
      {},
      "",
      cleanUrl.pathname + cleanUrl.search + cleanUrl.hash,
    );

    void handlePdfRequest("insurance");
  }, [permissionsLoading, loadingReports]);

  const loading = permissionsLoading || loadingReports;

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 size={22} className="animate-spin" />
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
          <h1 className="text-xl font-semibold">Unable to load reports</h1>

          <p className="mt-2 text-sm">{errorMessage}</p>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* REPORTS HERO */}
      <section className="overflow-hidden rounded-[32px] bg-[#183047] text-[#f8f5ef] shadow-[0_28px_70px_-48px_rgba(15,25,35,0.65)]">
        <div className="grid gap-8 px-7 py-9 md:px-10 md:py-11 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-[#718d4f]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9db47e]">
                Home Reports
              </p>
            </div>

            <h1 className="mt-5 font-serif text-4xl font-medium tracking-[-0.045em] text-[#f8f5ef] md:text-5xl">
              Your home, documented.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#c2cbd1]">
              Create insurance-ready inventories, warranty summaries, and
              household records from everything remembered in your Vault.
            </p>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#d6dcd9]">
              <span>
                {deviceCount.toLocaleString()}{" "}
                {deviceCount === 1 ? "item" : "items"} documented
              </span>

              <span
                aria-hidden="true"
                className="my-auto h-1 w-1 rounded-full bg-[#718d4f]"
              />

              <span>{formatCurrency(protectedValue)} recorded</span>

              <span
                aria-hidden="true"
                className="my-auto h-1 w-1 rounded-full bg-[#718d4f]"
              />

              <span>
                {documentCount.toLocaleString()} supporting{" "}
                {documentCount === 1 ? "record" : "records"}
              </span>
            </div>
          </div>

          <div className="min-w-[190px] rounded-[24px] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#9db47e]">
              Insurance readiness
            </p>

            <div className="mt-3 flex items-end gap-2">
              <span className="font-serif text-4xl font-medium tracking-[-0.04em] text-white">
                {readinessScore}%
              </span>

              <span className="pb-1 text-xs text-[#c2cbd1]">ready</span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#9db47e] transition-all duration-500"
                style={{
                  width: `${Math.max(2, Math.min(100, readinessScore))}%`,
                }}
              />
            </div>

            <a
              href="/documents"
              className="mt-4 inline-flex text-xs font-semibold text-[#dfe8d2] transition hover:text-white"
            >
              Improve my records →
            </a>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportMetricCard
          icon={Laptop}
          label="Items Documented"
          value={deviceCount.toLocaleString()}
          detail="Saved home technology"
        />

        <ReportMetricCard
          icon={ShieldCheck}
          label="Recorded Value"
          value={formatCurrency(protectedValue)}
          detail="Value currently documented"
        />

        <ReportMetricCard
          icon={FileText}
          label="Supporting Records"
          value={documentCount.toLocaleString()}
          detail="Receipts, manuals and files"
        />

        <ReportMetricCard
          icon={ShieldCheck}
          label="Insurance Ready"
          value={`${readinessScore}%`}
          detail={
            readinessScore >= 80
              ? "Strong documentation"
              : readinessScore >= 50
                ? "Getting there"
                : "More detail will strengthen your report"
          }
        />
      </section>

      {/* FEATURED INSURANCE REPORT */}
      <section className="overflow-hidden rounded-[32px] border border-[#182533]/8 bg-[#f8f5ef] shadow-[0_22px_60px_-48px_rgba(15,25,35,0.55)]">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-7 md:p-9 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                Insurance Report
              </span>

              <span className="rounded-full bg-[#617c43]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#617c43]">
                Most Useful
              </span>
            </div>

            <h2 className="mt-4 max-w-xl font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a] md:text-4xl">
              Be ready before you ever need to make a claim.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#68737b]">
              Turn what you&apos;ve saved in Home Tech Vault into a claim-ready
              inventory with device details, purchase values, serial numbers,
              and warranty information.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <InsuranceIncludedItem
                title="Device inventory"
                description={`${deviceCount.toLocaleString()} saved items`}
              />

              <InsuranceIncludedItem
                title="Recorded value"
                description={formatCurrency(protectedValue)}
              />

              <InsuranceIncludedItem
                title="Supporting records"
                description={`${documentCount.toLocaleString()} documents saved`}
              />

              <InsuranceIncludedItem
                title="Warranty information"
                description={`${activeWarrantyCount.toLocaleString()} active warranties`}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedReportType("insurance");
                  setPreviewReport(getPreviewReport("insurance"));
                }}
              >
                <Eye size={17} />
                Preview Report
              </Button>

              <Button
                onClick={() => void handlePdfRequest("insurance")}
                disabled={generatingReport === "insurance"}
              >
                {generatingReport === "insurance" ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Download size={17} />
                )}

                {generatingReport === "insurance"
                  ? "Creating PDF..."
                  : "Download Insurance Report"}
              </Button>
            </div>

            {!hasPdfAccess && !isDemo ? (
              <p className="mt-4 flex items-center gap-2 text-xs text-[#8a949b]">
                <LockKeyhole size={13} />
                PDF exports require report access. Selecting download will show
                your upgrade options.
              </p>
            ) : null}
          </div>

          {/* READINESS PANEL */}
          <div className="border-t border-[#182533]/8 bg-[#eee9df]/60 p-7 md:p-9 lg:border-l lg:border-t-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
              Make your report stronger
            </p>

            <h3 className="mt-3 font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a]">
              Better records make a better claim file.
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#68737b]">
              Your readiness score reflects how completely your household
              technology has been documented.
            </p>

            <div className="mt-7 space-y-5">
              <ReadinessRow
                label="Photo coverage"
                value={reportCoverage.photos}
              />

              <ReadinessRow
                label="Document coverage"
                value={reportCoverage.documents}
              />

              <ReadinessRow
                label="Serial numbers"
                value={reportCoverage.serialNumbers}
              />

              <ReadinessRow
                label="Warranty coverage"
                value={reportCoverage.warranties}
              />
            </div>

            <div className="mt-8 border-t border-[#182533]/10 pt-6">
              <a
                href="/documents"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#617c43] transition hover:text-[#526b39]"
              >
                <FileText size={16} />
                Improve My Records
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* OTHER REPORTS */}
      <section className="border-t border-[#182533]/10 pt-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            More ways to export your Vault
          </p>

          <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a]">
            Other reports.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68737b]">
            Create a focused report for organization, warranties, your network,
            or maintenance history.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reportOptions
            .filter((option) => option.type !== "insurance")
            .map((option) => {
              const ReportIcon = option.icon;
              const active = selectedReportType === option.type;

              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setSelectedReportType(option.type)}
                  className={[
                    "group text-left rounded-[26px] border p-6 transition duration-200",
                    active
                      ? "border-[#617c43]/35 bg-[#617c43]/[0.07] shadow-[0_18px_45px_-38px_rgba(15,25,35,0.5)]"
                      : "border-[#182533]/8 bg-[#f8f5ef] hover:-translate-y-0.5 hover:border-[#617c43]/20 hover:shadow-[0_18px_45px_-38px_rgba(15,25,35,0.45)]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#617c43]/10 text-[#617c43] transition group-hover:bg-[#617c43] group-hover:text-white">
                      <ReportIcon size={19} />
                    </div>

                    {active ? (
                      <span className="rounded-full bg-[#617c43]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#617c43]">
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-5 font-serif text-xl font-medium tracking-[-0.03em] text-[#17212a]">
                    {option.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#68737b]">
                    {option.description}
                  </p>

                  <span className="mt-5 inline-flex text-xs font-semibold text-[#617c43]">
                    Select report →
                  </span>
                </button>
              );
            })}
        </div>

        {selectedReportType !== "insurance" ? (
          <div className="mt-6 flex flex-col gap-4 rounded-[26px] border border-[#182533]/8 bg-[#eee9df]/55 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#718d4f]">
                Selected report
              </p>

              <h3 className="mt-1 font-serif text-xl font-medium text-[#17212a]">
                {
                  reportOptions.find(
                    (option) => option.type === selectedReportType,
                  )?.title
                }
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handlePreview}>
                <Eye size={16} />
                Preview
              </Button>

              <Button
                onClick={() => void handlePdfRequest(selectedReportType)}
                disabled={generatingReport === selectedReportType}
              >
                {generatingReport === selectedReportType ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}

                {generatingReport === selectedReportType
                  ? "Creating..."
                  : "Download PDF"}
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {previewReport ? (
        <ReportPreviewModal
          report={previewReport}
          onClose={() => setPreviewReport(null)}
          onDownload={() => void handlePdfRequest(previewReport.type)}
          downloading={generatingReport === previewReport.type}
        />
      ) : null}
    </PageShell>
  );
}

function ReportPreviewModal({
  report,
  onClose,
  onDownload,
  downloading,
}: {
  report: PreviewReport;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101820]/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-preview-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/10 bg-[#f8f5ef] shadow-[0_35px_100px_-35px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-5 border-b border-[#182533]/10 px-6 py-6 md:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
              Report Preview
            </p>

            <h2
              id="report-preview-title"
              className="mt-2 font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a]"
            >
              {report.title}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#68737b]">
              {report.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close report preview"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#182533]/10 text-[#68737b] transition hover:bg-[#182533]/5 hover:text-[#17212a]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 md:px-8 md:py-8">
          <div className="overflow-hidden rounded-[24px] border border-[#182533]/8 bg-white/55">
            <div className="bg-[#183047] px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#718d4f]/20 text-[#b9ce9d]">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9db47e]">
                    Home Tech Vault
                  </p>

                  <p className="mt-0.5 text-sm font-semibold">{report.title}</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#182533]/8">
              {report.rows.length > 0 ? (
                report.rows.map((row) => (
                  <div
                    key={`${row.label}-${row.value}`}
                    className="flex items-center justify-between gap-6 px-6 py-4"
                  >
                    <span className="text-sm text-[#68737b]">{row.label}</span>

                    <span className="text-sm font-semibold text-[#17212a]">
                      {row.value}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-[#68737b]">
                    No preview details are available for this report yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-[22px] bg-[#eee9df]/65 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#617c43]"
              />

              <div>
                <p className="text-sm font-semibold text-[#17212a]">
                  This is a summary preview.
                </p>

                <p className="mt-1 text-xs leading-5 text-[#68737b]">
                  Your downloaded PDF uses the current information stored in
                  your Vault.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#182533]/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-end md:px-8">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          <Button onClick={onDownload} disabled={downloading}>
            {downloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}

            {downloading ? "Creating PDF..." : "Download PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReportMetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ReportIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[24px] border border-[#182533]/8 bg-[#f8f5ef] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#7a858d]">{label}</p>

          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17212a]">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eee9df] text-[#183047]">
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-3 text-xs text-[#8a949b]">{detail}</p>
    </article>
  );
}

function InsuranceIncludedItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-[#182533]/8 bg-[#eee9df]/45 px-4 py-3.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#617c43]/10 text-[#617c43]">
        <ShieldCheck size={14} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#17212a]">{title}</p>

        <p className="mt-0.5 truncate text-xs text-[#7a858d]">{description}</p>
      </div>
    </div>
  );
}

function ReadinessRow({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-[#17212a]">{label}</span>

        <span className="text-xs font-semibold text-[#68737b]">
          {safeValue}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#182533]/8">
        <div
          className="h-full rounded-full bg-[#718d4f] transition-all duration-500"
          style={{
            width: `${safeValue}%`,
          }}
        />
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
          <p className="text-sm text-text-secondary">{title}</p>

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

function ReadinessRing({ score, label }: { score: number; label: string }) {
  const normalizedScore = Math.max(0, Math.min(score, 100));

  const radius = 72;

  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (normalizedScore / 100) * circumference;

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
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tracking-[-0.05em] text-text-primary">
          {normalizedScore}

          <span className="ml-0.5 text-2xl text-text-tertiary">%</span>
        </span>

        <span className="mt-2 max-w-28 text-sm font-semibold text-achievement">
          {label}
        </span>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
