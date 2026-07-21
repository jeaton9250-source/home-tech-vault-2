"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  Gauge,
  Globe,
  History,
  KeyRound,
  Laptop,
  Loader2,
  LockKeyhole,
  Pencil,
  Plus,
  Radar,
  Router,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";

import {
  supabase,
  formatSupabaseError,
} from "@/lib/supabase";
import {
  applyHouseholdScope,
  applyOwnerUserScope,
  loadNetworkInfoRows,
  resolveHouseholdScope,
} from "@/lib/data/householdScope";
import { usePermissions } from "@/hooks/usePermissions";
import PageShell from "@/components/ui/PageShell";
import PageHero from "@/components/ui/PageHero";

type NetworkInfo = {
  id?: string;
  user_id?: string;
  isp?: string | null;
  speed_download?: number | null;
  speed_upload?: number | null;
  router_model?: string | null;
  modem_model?: string | null;
  wifi_name?: string | null;
  guest_network?: string | null;
  admin_url?: string | null;
  notes?: string | null;
};

type NetworkScan = {
  id: string;
  scanned_at: string;
  devices_found: number;
  online_devices: number;
  offline_devices: number;
  new_devices: number;
};

type DiscoveryRow = {
  added_to_vault: boolean | null;
};

type DiscoverySummary = {
  total: number;
  protected: number;
  unprotected: number;
};

type NetworkIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

const demoNetwork: NetworkInfo = {
  isp: "Spectrum",
  speed_download: 500,
  speed_upload: 25,
  router_model: "TP-Link Archer AX55",
  modem_model: "Arris Surfboard",
  wifi_name: "HomeTech-Demo",
  guest_network: "Enabled",
  admin_url: "192.168.1.1",
  notes:
    "This sample network demonstrates how Home Tech Vault organizes provider details, equipment, Wi-Fi information, and scan history.",
};

const demoScans: NetworkScan[] = [
  {
    id: "demo-scan-1",
    scanned_at: new Date().toISOString(),
    devices_found: 18,
    online_devices: 17,
    offline_devices: 1,
    new_devices: 3,
  },
  {
    id: "demo-scan-2",
    scanned_at: new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString(),
    devices_found: 16,
    online_devices: 15,
    offline_devices: 1,
    new_devices: 1,
  },
  {
    id: "demo-scan-3",
    scanned_at: new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString(),
    devices_found: 15,
    online_devices: 15,
    offline_devices: 0,
    new_devices: 2,
  },
];

const demoDiscoverySummary: DiscoverySummary = {
  total: 18,
  protected: 15,
  unprotected: 3,
};

const emptyDiscoverySummary: DiscoverySummary = {
  total: 0,
  protected: 0,
  unprotected: 0,
};

function logNetworkLoadFailure(
  context: Record<string, unknown>,
  error: unknown
) {
  console.error("[Network Overview] load failed:", {
    ...context,
    error: formatSupabaseError(error),
  });
}

async function loadDiscoverySummaryForScan(
  scanId: string,
  householdId: string | null | undefined,
  userId: string,
  householdOwnerId: string | null | undefined
): Promise<DiscoverySummary> {
  const {
    data: discoveryRows,
    error: discoveryError,
  } = await applyOwnerUserScope(
    supabase
      .from("network_discoveries")
      .select("added_to_vault")
      .eq("scan_id", scanId),
    householdId,
    userId,
    householdOwnerId
  );

  if (discoveryError) {
    logNetworkLoadFailure(
      {
        stage: "discovery_summary",
        scanId,
      },
      discoveryError
    );

    return emptyDiscoverySummary;
  }

  const rows =
    (discoveryRows ?? []) as DiscoveryRow[];

  const protectedDevices = rows.filter(
    (row) => row.added_to_vault === true
  ).length;

  return {
    total: rows.length,
    protected: protectedDevices,
    unprotected: rows.length - protectedDevices,
  };
}

export default function NetworkPage() {
  const {
    user,
    isDemo,
    householdId,
    householdOwnerId,
    loading: permissionsLoading,
    getActionHref,
    getActionLabel,
  } = usePermissions();

  const [network, setNetwork] =
    useState<NetworkInfo | null>(null);

  const [scanHistory, setScanHistory] =
    useState<NetworkScan[]>([]);

  const [
    discoverySummary,
    setDiscoverySummary,
  ] = useState<DiscoverySummary>({
    total: 0,
    protected: 0,
    unprotected: 0,
  });

  const [loadingNetwork, setLoadingNetwork] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadNetwork() {
      if (permissionsLoading) {
        return;
      }

      const scope = user
        ? resolveHouseholdScope(
            householdId,
            user.id
          )
        : null;

      try {
        setLoadingNetwork(true);
        setErrorMessage("");

        if (isDemo) {
          if (!mounted) {
            return;
          }

          setNetwork(demoNetwork);
          setScanHistory(demoScans);
          setDiscoverySummary(
            demoDiscoverySummary
          );

          return;
        }

        if (!user) {
          if (!mounted) {
            return;
          }

          setNetwork(demoNetwork);
          setScanHistory(demoScans);
          setDiscoverySummary(
            demoDiscoverySummary
          );

          return;
        }

        const [networkResult, scansResult] =
          await Promise.all([
            loadNetworkInfoRows(
              supabase,
              householdId,
              user.id,
              householdOwnerId
            ),

            applyOwnerUserScope(
              supabase
                .from("network_scans")
                .select("*"),
              householdId,
              user.id,
              householdOwnerId
            )
              .order("scanned_at", {
                ascending: false,
              })
              .limit(6),
          ]);

        if (networkResult.error) {
          logNetworkLoadFailure(
            {
              stage: "network_info",
              scope,
              userId: user.id,
              householdId,
              householdOwnerId,
            },
            networkResult.error
          );

          throw networkResult.error;
        }

        if (scansResult.error) {
          logNetworkLoadFailure(
            {
              stage: "network_scans",
              scope,
              userId: user.id,
              householdId,
              householdOwnerId,
            },
            scansResult.error
          );
        }

        if (!mounted) {
          return;
        }

        const loadedScans = scansResult.error
          ? []
          : ((scansResult.data ??
              []) as NetworkScan[]);

        const networkRows =
          (networkResult.data ??
            []) as NetworkInfo[];

        setNetwork(networkRows[0] ?? null);
        setScanHistory(loadedScans);

        const latestLoadedScan =
          loadedScans[0];

        if (!latestLoadedScan) {
          setDiscoverySummary(
            emptyDiscoverySummary
          );

          return;
        }

        const summary =
          await loadDiscoverySummaryForScan(
            latestLoadedScan.id,
            householdId,
            user.id,
            householdOwnerId
          );

        if (!mounted) {
          return;
        }

        setDiscoverySummary(summary);
      } catch (error: unknown) {
        logNetworkLoadFailure(
          {
            stage: "network_overview",
            scope,
            userId: user?.id ?? null,
            householdId,
            isDemo,
          },
          error
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
          "We couldn't load your network information. Please try again."
        );
      } finally {
        if (mounted) {
          setLoadingNetwork(false);
        }
      }
    }

    void loadNetwork();

    return () => {
      mounted = false;
    };
  }, [
    user,
    isDemo,
    householdId,
    householdOwnerId,
    permissionsLoading,
  ]);

  const latestScan =
    scanHistory[0] ?? null;

  const networkScore = useMemo(() => {
    if (!network) {
      return 0;
    }

    let score = 40;

    if (network.isp?.trim()) {
      score += 10;
    }

    if (network.router_model?.trim()) {
      score += 10;
    }

    if (network.modem_model?.trim()) {
      score += 5;
    }

    if (network.wifi_name?.trim()) {
      score += 10;
    }

    if (network.admin_url?.trim()) {
      score += 5;
    }

    if (
      Number(
        network.speed_download ?? 0
      ) >= 100
    ) {
      score += 10;
    }

    if (
      Number(
        network.speed_upload ?? 0
      ) >= 20
    ) {
      score += 5;
    }

    if (
      isGuestNetworkEnabled(
        network.guest_network
      )
    ) {
      score += 5;
    }

    return Math.min(score, 100);
  }, [network]);

  const networkLabel =
    networkScore >= 90
      ? "Excellent"
      : networkScore >= 75
        ? "Good"
        : networkScore >= 60
          ? "Needs attention"
          : "Incomplete";

  const loading =
    permissionsLoading ||
    loadingNetwork;

  const scanHref = getActionHref(
    "/network/discover",
    "networkDiscover"
  );

  const editHref = getActionHref(
    "/network/edit"
  );

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-neutral-200 bg-white">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              className="animate-spin"
              size={22}
            />

            Loading your network...
          </div>
        </div>
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-semibold">
            Unable to load network
          </h1>

          <p className="mt-2 text-sm">
            {errorMessage}
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        section="network"
        eyebrow="Connectivity"
        title="Your network."
        description="See your internet, equipment, connected devices, and recent scans in one place."
      >
        <div className="flex flex-wrap gap-3">
          <ActionLink
            href={scanHref}
            variant="secondary"
          >
            <Radar size={17} />
            {getActionLabel(
              "Scan Network",
              "Create Vault to Scan"
            )}
          </ActionLink>

          <ActionLink
            href={editHref}
            variant="secondary"
          >
            <Pencil size={17} />
            {getActionLabel(
              network
                ? "Edit Network"
                : "Set Up Network"
            )}
          </ActionLink>
        </div>
      </PageHero>

      {isDemo && (
        <section className="rounded-3xl border border-warning/40 bg-warning-soft p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-achievement">
            Viewer Access
          </p>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            You are exploring sample
            network information. Create
            an account to save your own
            equipment, Wi-Fi details,
            and scan history.
          </p>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={ShieldCheck}
          label="Network Health"
          value={
            String(networkScore) + "%"
          }
          description={networkLabel}
        />

        <SummaryCard
          icon={Laptop}
          label="Devices Found"
          value={String(
            latestScan?.devices_found ?? 0
          )}
          description="Latest scan"
        />

        <SummaryCard
          icon={Wifi}
          label="Online"
          value={String(
            latestScan?.online_devices ?? 0
          )}
          description={
            latestScan
              ? String(
                  latestScan.offline_devices
                ) + " offline"
              : "No scan yet"
          }
        />

        <SummaryCard
          icon={Plus}
          label="New Devices"
          value={String(
            latestScan?.new_devices ?? 0
          )}
          description="Needs review"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="flex min-h-[370px] flex-col items-center justify-center p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
            Network Health
          </p>

          <div className="mt-7">
            <NetworkHealthRing
              score={networkScore}
              label={networkLabel}
            />
          </div>

          <p className="mt-7 max-w-sm text-sm leading-6 text-text-secondary">
            Your score reflects your
            provider, equipment,
            wireless, speed, and
            security details.
          </p>
        </Card>

        <Card className="p-7 md:p-9">
          <SectionHeading
            eyebrow="Latest Scan"
            title="Connected devices"
            description="A snapshot of the most recent devices found on your network."
          />

          {latestScan ? (
            <>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricTile
                  label="Found"
                  value={
                    latestScan.devices_found
                  }
                />

                <MetricTile
                  label="Online"
                  value={
                    latestScan.online_devices
                  }
                />

                <MetricTile
                  label="Offline"
                  value={
                    latestScan.offline_devices
                  }
                />

                <MetricTile
                  label="New"
                  value={
                    latestScan.new_devices
                  }
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <StatusCard
                  icon={ShieldCheck}
                  label="Protected"
                  value={
                    discoverySummary.protected
                  }
                  description="Already saved in the vault."
                  tone="green"
                />

                <StatusCard
                  icon={Plus}
                  label="Needs Review"
                  value={
                    discoverySummary.unprotected
                  }
                  description="May still need to be added."
                  tone="gold"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ActionLink href={scanHref}>
                  <Radar size={17} />

                  {getActionLabel(
                    "Scan Again",
                    "Create Vault to Scan"
                  )}
                </ActionLink>

                <ActionLink
                  href="/devices"
                  variant="secondary"
                >
                  <Laptop size={17} />
                  View Devices
                </ActionLink>
              </div>
            </>
          ) : (
            <EmptyScanState
              href={scanHref}
              scanLabel={getActionLabel(
                "Start Network Scan",
                "Create Vault to Scan"
              )}
            />
          )}
        </Card>
      </section>

      {network ? (
        <>
          <section className="grid gap-6 xl:grid-cols-2">
            <Card className="p-7 md:p-8">
              <SectionHeading
                eyebrow="Internet"
                title="Provider and speed"
                description="The connection details saved for this home."
              />

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <DetailCard
                  icon={Globe}
                  label="Provider"
                  value={network.isp}
                />

                <DetailCard
                  icon={Gauge}
                  label="Download"
                  value={
                    network.speed_download
                      ? String(
                          network.speed_download
                        ) + " Mbps"
                      : null
                  }
                />

                <DetailCard
                  icon={Gauge}
                  label="Upload"
                  value={
                    network.speed_upload
                      ? String(
                          network.speed_upload
                        ) + " Mbps"
                      : null
                  }
                />

                <DetailCard
                  icon={CheckCircle2}
                  label="Status"
                  value={
                    network.isp
                      ? "Configured"
                      : "Incomplete"
                  }
                />
              </div>
            </Card>

            <Card className="p-7 md:p-8">
              <SectionHeading
                eyebrow="Equipment"
                title="Router and modem"
                description="The hardware powering this home network."
              />

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <DetailCard
                  icon={Router}
                  label="Router"
                  value={
                    network.router_model
                  }
                />

                <DetailCard
                  icon={Router}
                  label="Modem"
                  value={
                    network.modem_model
                  }
                />

                <DetailCard
                  icon={Wifi}
                  label="Wi-Fi Name"
                  value={
                    network.wifi_name
                  }
                />

                <DetailCard
                  icon={LockKeyhole}
                  label="Admin Address"
                  value={
                    network.admin_url
                  }
                />
              </div>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-7 md:p-8">
              <SectionHeading
                eyebrow="Wireless"
                title="Wi-Fi details"
                description="Primary network, guest access, and administration information."
              />

              <div className="mt-7 space-y-3">
                <NetworkRow
                  icon={Wifi}
                  label="Primary Wi-Fi"
                  value={
                    network.wifi_name ||
                    "Not added"
                  }
                />

                <NetworkRow
                  icon={KeyRound}
                  label="Guest Network"
                  value={
                    network.guest_network ||
                    "Not added"
                  }
                />

                <NetworkRow
                  icon={LockKeyhole}
                  label="Admin Portal"
                  value={
                    network.admin_url ||
                    "Not added"
                  }
                />
              </div>
            </Card>

            <Card className="p-7 md:p-8">
              <SectionHeading
                eyebrow="Setup"
                title="Network checklist"
                description="A quick review of the saved network information."
              />

              <div className="mt-7 space-y-3">
                <ChecklistItem
                  complete={Boolean(
                    network.router_model?.trim()
                  )}
                  label="Router saved"
                />

                <ChecklistItem
                  complete={Boolean(
                    network.modem_model?.trim()
                  )}
                  label="Modem saved"
                />

                <ChecklistItem
                  complete={Boolean(
                    network.wifi_name?.trim()
                  )}
                  label="Wi-Fi documented"
                />

                <ChecklistItem
                  complete={Boolean(
                    network.admin_url?.trim()
                  )}
                  label="Admin address saved"
                />

                <ChecklistItem
                  complete={isGuestNetworkEnabled(
                    network.guest_network
                  )}
                  label="Guest network enabled"
                />
              </div>
            </Card>
          </section>

          <Card className="p-7 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="History"
                title="Recent scans"
                description="See how the connected-device count has changed over time."
              />

              {latestScan && (
                <p className="text-sm text-text-secondary">
                  Last scanned{" "}
                  {formatRelativeScanDate(
                    latestScan.scanned_at
                  )}
                </p>
              )}
            </div>

            <div className="mt-7 space-y-3">
              {scanHistory.map((scan) => (
                <ScanHistoryRow
                  key={scan.id}
                  scan={scan}
                />
              ))}
            </div>
          </Card>

          {network.notes && (
            <Card className="p-7 md:p-8">
              <SectionHeading
                eyebrow="Notes"
                title="Network notes"
                description="Troubleshooting, placement, and provider information."
              />

              <div className="mt-6 rounded-[24px] bg-surface-sunken p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-text-secondary">
                  {network.notes}
                </p>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
            <Wifi size={29} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-text-primary">
            No network profile yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
            Add your provider, router, modem,
            Wi-Fi, guest network, and internet
            speeds to get started.
          </p>

          <div className="mt-6">
            <ActionLink href={editHref}>
              Set Up Network
            </ActionLink>
          </div>
        </Card>
      )}
    </PageShell>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-[var(--radius-card)] border border-border-subtle bg-white shadow-sm " +
        className
      }
    >
      {children}
    </div>
  );
}

function ActionLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "light";
}) {
  const styles =
    variant === "light"
      ? "bg-white text-text-primary hover:bg-neutral-100"
      : variant === "secondary"
        ? "border border-border-subtle bg-white text-text-primary hover:bg-surface-sunken"
        : "bg-charcoal text-surface-card hover:bg-charcoal-hover";

  return (
    <Link
      href={href}
      className={
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition " +
        styles
      }
    >
      {children}
    </Link>
  );
}

function NetworkHealthRing({
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
        aria-label={
          "Network health score: " +
          String(normalizedScore) +
          "%"
        }
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
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold text-text-primary">
          {normalizedScore}
          <span className="text-2xl text-text-tertiary">
            %
          </span>
        </span>

        <span className="mt-2 text-sm font-semibold text-achievement">
          {label}
        </span>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: NetworkIcon;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-text-secondary">
            {label}
          </p>

          <p className="mt-2 truncate text-3xl font-semibold text-text-primary">
            {value}
          </p>

          <p className="mt-2 text-xs text-text-tertiary">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-overline text-section-network">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-text-primary">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

function MetricTile({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-surface-sunken p-4">
      <p className="text-xs text-text-tertiary">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  description,
  tone,
}: {
  icon: NetworkIcon;
  label: string;
  value: number;
  description: string;
  tone: "green" | "gold";
}) {
  const iconClasses =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-warning-soft text-achievement";

  return (
    <div className="rounded-[24px] border border-border-subtle p-5">
      <div
        className={
          "flex h-11 w-11 items-center justify-center rounded-2xl " +
          iconClasses
        }
      >
        <Icon size={20} />
      </div>

      <p className="mt-5 text-sm text-text-secondary">
        {label}
      </p>

      <p className="mt-1 text-3xl font-semibold text-text-primary">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: NetworkIcon;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-[24px] bg-surface-sunken p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
        <Icon size={18} />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-text-primary">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function NetworkRow({
  icon: Icon,
  label,
  value,
}: {
  icon: NetworkIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[22px] border border-border-subtle p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-text-tertiary">
          {label}
        </p>

        <p className="mt-1 truncate font-semibold text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

function ChecklistItem({
  complete,
  label,
}: {
  complete: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] bg-surface-sunken p-4">
      <div
        className={
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl " +
          (complete
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700")
        }
      >
        {complete ? (
          <CheckCircle2 size={17} />
        ) : (
          <WifiOff size={17} />
        )}
      </div>

      <p className="text-sm font-semibold text-text-primary">
        {label}
      </p>
    </div>
  );
}

function ScanHistoryRow({
  scan,
}: {
  scan: NetworkScan;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[24px] border border-border-subtle p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
          <History size={19} />
        </div>

        <div>
          <p className="font-semibold text-text-primary">
            {formatScanDate(
              scan.scanned_at
            )}
          </p>

          <p className="mt-1 text-sm text-text-secondary">
            Network scan completed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 lg:min-w-[360px]">
        <HistoryMetric
          label="Found"
          value={scan.devices_found}
        />

        <HistoryMetric
          label="Online"
          value={scan.online_devices}
        />

        <HistoryMetric
          label="Offline"
          value={scan.offline_devices}
        />

        <HistoryMetric
          label="New"
          value={scan.new_devices}
        />
      </div>
    </div>
  );
}

function HistoryMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </p>

      <p className="mt-1 font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function EmptyScanState({
  href,
  scanLabel,
}: {
  href: string;
  scanLabel: string;
}) {
  return (
    <div className="mt-7 rounded-[24px] bg-surface-sunken p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
        <Radar size={22} />
      </div>

      <h3 className="mt-5 text-xl font-semibold text-text-primary">
        Run your first scan
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
        Discover connected devices and
        begin building your network
        history.
      </p>

      <div className="mt-5">
        <ActionLink href={href}>
          <Radar size={17} />

          {scanLabel}
        </ActionLink>
      </div>
    </div>
  );
}

function formatScanDate(
  value: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function formatRelativeScanDate(
  value: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const difference =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return (
      String(minutes) +
      " minute" +
      (minutes === 1 ? "" : "s") +
      " ago"
    );
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return (
      String(hours) +
      " hour" +
      (hours === 1 ? "" : "s") +
      " ago"
    );
  }

  const days = Math.floor(
    hours / 24
  );

  return (
    String(days) +
    " day" +
    (days === 1 ? "" : "s") +
    " ago"
  );
}

function isGuestNetworkEnabled(
  value?: string | null
) {
  const normalized =
    value?.trim().toLowerCase() ?? "";

  return [
    "enabled",
    "yes",
    "on",
    "true",
  ].includes(normalized);
}