"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
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
  Signal,
  Wifi,
  WifiOff,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

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

type DiscoverySummary = {
  total: number;
  protected: number;
  unprotected: number;
};

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
    "Demo network information. Sign in to manage your own network details.",
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

export default function NetworkPage() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const [data, setData] =
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
    async function loadNetworkDashboard() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingNetwork(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setData(demoNetwork);
          setScanHistory(demoScans);
          setDiscoverySummary(
            demoDiscoverySummary
          );
          return;
        }

        const [
          networkResult,
          scansResult,
        ] = await Promise.all([
          supabase
            .from("network_info")
            .select("*")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle(),

          supabase
            .from("network_scans")
            .select(
              `
                id,
                scanned_at,
                devices_found,
                online_devices,
                offline_devices,
                new_devices
              `
            )
            .eq("user_id", user.id)
            .order("scanned_at", {
              ascending: false,
            })
            .limit(6),
        ]);

        if (networkResult.error) {
          throw networkResult.error;
        }

        if (scansResult.error) {
          throw scansResult.error;
        }

        const loadedScans =
          (scansResult.data ||
            []) as NetworkScan[];

        setData(
          (networkResult.data as NetworkInfo) ||
            null
        );

        setScanHistory(loadedScans);

        const latestScan =
          loadedScans[0] || null;

        if (!latestScan) {
          setDiscoverySummary({
            total: 0,
            protected: 0,
            unprotected: 0,
          });
          return;
        }

        const {
          data: discoveryRows,
          error: discoveryError,
        } = await supabase
          .from("network_discoveries")
          .select("added_to_vault")
          .eq("user_id", user.id)
          .eq("scan_id", latestScan.id);

        if (discoveryError) {
          throw discoveryError;
        }

        const total =
          discoveryRows?.length || 0;

        const protectedDevices =
          discoveryRows?.filter(
            (device) =>
              device.added_to_vault === true
          ).length || 0;

        setDiscoverySummary({
          total,
          protected: protectedDevices,
          unprotected:
            total - protectedDevices,
        });
      } catch (error) {
        console.error(
          "Network dashboard loading error:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the network dashboard."
        );
      } finally {
        setLoadingNetwork(false);
      }
    }

    loadNetworkDashboard();
  }, [
    user,
    isDemo,
    demoLoading,
  ]);

  const loading =
    demoLoading || loadingNetwork;

  const latestScan =
    scanHistory[0] || null;

  const networkScore = useMemo(() => {
    if (!data) {
      return 0;
    }

    let score = 40;

    if (data.isp?.trim()) score += 10;
    if (data.router_model?.trim()) score += 10;
    if (data.modem_model?.trim()) score += 5;
    if (data.wifi_name?.trim()) score += 10;
    if (data.admin_url?.trim()) score += 5;

    if (
      Number(
        data.speed_download || 0
      ) >= 100
    ) {
      score += 10;
    }

    if (
      Number(
        data.speed_upload || 0
      ) >= 20
    ) {
      score += 5;
    }

    if (
      isGuestNetworkEnabled(
        data.guest_network
      )
    ) {
      score += 5;
    }

    return Math.min(score, 100);
  }, [data]);

  const networkLabel =
    networkScore >= 90
      ? "Excellent"
      : networkScore >= 75
        ? "Good"
        : networkScore >= 60
          ? "Needs Attention"
          : "Incomplete";

  return (
    <PageShell>
      <PageTitle
        eyebrow="Connectivity Center"
        title={
          isDemo
            ? "Demo Network Center"
            : "Network Center"
        }
        description={
          isDemo
            ? "Explore sample internet, equipment, network-discovery, and scan-history information."
            : "Monitor your internet service, equipment, connected devices, and recent network scans."
        }
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              href="/network/discover"
              variant="secondary"
            >
              <Radar size={18} />
              Scan Network
            </Button>

            <Button
              href={
                isDemo
                  ? "/signup"
                  : "/network/edit"
              }
            >
              <Pencil size={18} />

              {isDemo
                ? "Create Your Vault"
                : data
                  ? "Edit Network"
                  : "Set Up Network"}
            </Button>
          </div>
        }
      />

      {loading ? (
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              className="animate-spin"
              size={22}
            />
            Loading network dashboard...
          </div>
        </PageCard>
      ) : errorMessage ? (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      ) : (
        <>
          {isDemo && (
            <PageCard className="border-[#D8C69D] bg-[#FFF8E8]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
                Interactive Demo
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#111827]">
                Preview your future network
                dashboard
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                This sample shows how Home Tech
                Vault combines saved network
                information with device discovery
                and scan history.
              </p>
            </PageCard>
          )}

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <NetworkStat
              label="Network Health"
              value={`${networkScore}/100`}
              description={networkLabel}
              icon={ShieldCheck}
            />

            <NetworkStat
              label="Devices Found"
              value={String(
                latestScan?.devices_found || 0
              )}
              description={
                latestScan
                  ? "From your latest scan"
                  : "Run your first network scan"
              }
              icon={Laptop}
            />

            <NetworkStat
              label="Online"
              value={String(
                latestScan?.online_devices || 0
              )}
              description={
                latestScan
                  ? `${latestScan.offline_devices} offline`
                  : "No scan data available"
              }
              icon={Wifi}
            />

            <NetworkStat
              label="New Devices"
              value={String(
                latestScan?.new_devices || 0
              )}
              description={
                latestScan
                  ? "Not previously recognized"
                  : "Scan to discover devices"
              }
              icon={Plus}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <PageCard>
              <SectionHeader
                icon={Radar}
                eyebrow="Latest Scan"
                title="Network Discovery Summary"
                description="A snapshot of the most recent devices discovered on your network."
              />

              {latestScan ? (
                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoTile
                      label="Devices Found"
                      value={String(
                        latestScan.devices_found
                      )}
                    />

                    <InfoTile
                      label="Online"
                      value={String(
                        latestScan.online_devices
                      )}
                    />

                    <InfoTile
                      label="Offline"
                      value={String(
                        latestScan.offline_devices
                      )}
                    />

                    <InfoTile
                      label="New"
                      value={String(
                        latestScan.new_devices
                      )}
                    />
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <StatusPanel
                      icon={ShieldCheck}
                      label="Already Protected"
                      value={
                        discoverySummary.protected
                      }
                      description="Discovered devices already saved in your vault."
                      tone="green"
                    />

                    <StatusPanel
                      icon={Plus}
                      label="Needs Review"
                      value={
                        discoverySummary.unprotected
                      }
                      description="Discovered devices that may still need to be added."
                      tone="gold"
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href="/network/discover">
                      <Radar size={18} />
                      Scan Again
                    </Button>

                    <Button
                      href="/devices"
                      variant="secondary"
                    >
                      <Laptop size={18} />
                      View Devices
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-2xl bg-[#F7F5EF] p-6">
                  <h3 className="font-bold text-[#111827]">
                    No scans yet
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Run your first network scan
                    to discover connected devices
                    and begin building network
                    history.
                  </p>

                  <Button
                    href="/network/discover"
                    className="mt-5"
                  >
                    <Radar size={18} />
                    Start Network Scan
                  </Button>
                </div>
              )}
            </PageCard>

            <PageCard>
              <SectionHeader
                icon={Clock3}
                eyebrow="Last Activity"
                title="Most Recent Scan"
                description="When your network was last analyzed."
              />

              <div className="mt-6 rounded-3xl bg-[#111827] p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                  Last Scan
                </p>

                <h3 className="mt-3 text-2xl font-bold">
                  {latestScan
                    ? formatScanDate(
                        latestScan.scanned_at
                      )
                    : "Never"}
                </h3>

                <p className="mt-2 text-sm text-neutral-300">
                  {latestScan
                    ? `${latestScan.devices_found} devices were found during this scan.`
                    : "Your network has not been scanned yet."}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <ChecklistItem
                  complete={
                    Boolean(latestScan)
                  }
                  label="Network scan completed"
                />

                <ChecklistItem
                  complete={
                    discoverySummary.total > 0
                  }
                  label="Discovered devices recorded"
                />

                <ChecklistItem
                  complete={
                    discoverySummary.unprotected ===
                      0 &&
                    discoverySummary.total > 0
                  }
                  label="All discovered devices protected"
                />
              </div>
            </PageCard>
          </section>
                    {data ? (
            <>
              <section className="grid gap-6 xl:grid-cols-2">
                <PageCard>
                  <SectionHeader
                    icon={Globe}
                    eyebrow="Internet Service"
                    title="Provider & Speeds"
                    description="Your saved internet-service details."
                  />

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <InfoTile
                      label="Internet Provider"
                      value={data.isp}
                    />

                    <InfoTile
                      label="Download Speed"
                      value={
                        data.speed_download
                          ? `${data.speed_download} Mbps`
                          : null
                      }
                    />

                    <InfoTile
                      label="Upload Speed"
                      value={
                        data.speed_upload
                          ? `${data.speed_upload} Mbps`
                          : null
                      }
                    />

                    <InfoTile
                      label="Connection Status"
                      value={
                        data.isp
                          ? "Configured"
                          : "Incomplete"
                      }
                    />
                  </div>
                </PageCard>

                <PageCard>
                  <SectionHeader
                    icon={Router}
                    eyebrow="Network Equipment"
                    title="Router & Modem"
                    description="The primary equipment powering your home network."
                  />

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <InfoTile
                      label="Router Model"
                      value={data.router_model}
                    />

                    <InfoTile
                      label="Modem Model"
                      value={data.modem_model}
                    />

                    <InfoTile
                      label="Wi-Fi Name"
                      value={data.wifi_name}
                    />

                    <InfoTile
                      label="Admin Address"
                      value={data.admin_url}
                    />
                  </div>
                </PageCard>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <PageCard>
                  <SectionHeader
                    icon={Signal}
                    eyebrow="Wi-Fi Overview"
                    title="Wireless Network"
                    description="Your primary and guest wireless settings."
                  />

                  <div className="mt-6 space-y-4">
                    <NetworkDetailRow
                      icon={Wifi}
                      label="Primary Wi-Fi"
                      value={
                        data.wifi_name ||
                        "Not added"
                      }
                    />

                    <NetworkDetailRow
                      icon={KeyRound}
                      label="Guest Network"
                      value={
                        data.guest_network ||
                        "Not added"
                      }
                    />

                    <NetworkDetailRow
                      icon={LockKeyhole}
                      label="Admin Portal"
                      value={
                        data.admin_url ||
                        "Not added"
                      }
                    />
                  </div>
                </PageCard>

                <PageCard>
                  <SectionHeader
                    icon={ShieldCheck}
                    eyebrow="Security Check"
                    title="Network Checklist"
                    description="Simple indicators based on your saved setup."
                  />

                  <div className="mt-6 space-y-3">
                    <ChecklistItem
                      complete={Boolean(
                        data.router_model?.trim()
                      )}
                      label="Router information saved"
                    />

                    <ChecklistItem
                      complete={Boolean(
                        data.modem_model?.trim()
                      )}
                      label="Modem information saved"
                    />

                    <ChecklistItem
                      complete={Boolean(
                        data.wifi_name?.trim()
                      )}
                      label="Wi-Fi name documented"
                    />

                    <ChecklistItem
                      complete={Boolean(
                        data.admin_url?.trim()
                      )}
                      label="Admin address documented"
                    />

                    <ChecklistItem
                      complete={isGuestNetworkEnabled(
                        data.guest_network
                      )}
                      label="Guest network enabled"
                    />
                  </div>
                </PageCard>
              </section>

              <PageCard>
                <SectionHeader
                  icon={History}
                  eyebrow="Scan History"
                  title="Recent Network Scans"
                  description="Review how your connected-device count has changed over time."
                />

                {scanHistory.length === 0 ? (
                  <div className="mt-6 rounded-2xl bg-[#F7F5EF] p-5 text-sm text-neutral-500">
                    No network scans have been
                    saved yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {scanHistory.map(
                      (scan) => (
                        <div
                          key={scan.id}
                          className="grid gap-4 rounded-2xl border border-[#E8E2D6] p-5 sm:grid-cols-[1fr_auto_auto_auto_auto]"
                        >
                          <div>
                            <p className="font-semibold text-[#111827]">
                              {formatScanDate(
                                scan.scanned_at
                              )}
                            </p>

                            <p className="mt-1 text-sm text-neutral-500">
                              Scan completed
                            </p>
                          </div>

                          <HistoryMetric
                            label="Found"
                            value={
                              scan.devices_found
                            }
                          />

                          <HistoryMetric
                            label="Online"
                            value={
                              scan.online_devices
                            }
                          />

                          <HistoryMetric
                            label="Offline"
                            value={
                              scan.offline_devices
                            }
                          />

                          <HistoryMetric
                            label="New"
                            value={
                              scan.new_devices
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                )}
              </PageCard>

              <PageCard>
                <SectionHeader
                  icon={Router}
                  eyebrow="Network Notes"
                  title="Notes"
                  description="Keep troubleshooting details, placement notes, or provider information."
                />

                <div className="mt-6 rounded-2xl bg-[#F7F5EF] p-5">
                  <p className="whitespace-pre-wrap leading-7 text-neutral-600">
                    {data.notes ||
                      "No network notes saved."}
                  </p>
                </div>
              </PageCard>
            </>
          ) : (
            <PageCard className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                <Wifi size={30} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#111827]">
                No network information yet
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-neutral-500">
                Add your provider, router,
                modem, Wi-Fi details, guest
                network, and internet speeds.
              </p>

              <Button
                href="/network/edit"
                className="mt-6"
              >
                Set Up Your Network
              </Button>
            </PageCard>
          )}
        </>
      )}
    </PageShell>
  );
}

type NetworkStatProps = {
  label: string;
  value: string;
  description: string;
  icon: typeof Wifi;
};

function NetworkStat({
  label,
  value,
  description,
  icon: Icon,
}: NetworkStatProps) {
  return (
    <PageCard className="p-6 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={24} />
      </div>

      <p className="mt-5 text-sm text-neutral-500">
        {label}
      </p>

      <h2 className="mt-2 break-words text-3xl font-bold text-[#111827]">
        {value}
      </h2>

      <p className="mt-2 text-sm text-neutral-400">
        {description}
      </p>
    </PageCard>
  );
}

type SectionHeaderProps = {
  icon: typeof Wifi;
  eyebrow: string;
  title: string;
  description: string;
};

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={21} />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-bold text-[#111827]">
          {title}
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-[#111827]">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function StatusPanel({
  icon: Icon,
  label,
  value,
  description,
  tone,
}: {
  icon: typeof Wifi;
  label: string;
  value: number;
  description: string;
  tone: "green" | "gold";
}) {
  const iconClasses =
    tone === "green"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-[#F3EAD7] text-[#8A6A2F]";

  return (
    <div className="rounded-2xl border border-[#E8E2D6] p-5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClasses}`}
      >
        <Icon size={21} />
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold text-[#111827]">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}

type NetworkDetailRowProps = {
  icon: typeof Wifi;
  label: string;
  value: string;
};

function NetworkDetailRow({
  icon: Icon,
  label,
  value,
}: NetworkDetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8E2D6] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-sm text-neutral-500">
            {label}
          </p>

          <p className="truncate font-semibold text-[#111827]">
            {value}
          </p>
        </div>
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
    <div className="flex items-center gap-3 rounded-2xl bg-[#F7F5EF] p-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          complete
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {complete ? (
          <CheckCircle2 size={18} />
        ) : (
          <WifiOff size={18} />
        )}
      </div>

      <p className="text-sm font-semibold text-[#111827]">
        {label}
      </p>
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
      <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-[#111827]">
        {value}
      </p>
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

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isGuestNetworkEnabled(
  value?: string | null
) {
  const normalized =
    value?.trim().toLowerCase() || "";

  return (
    normalized === "enabled" ||
    normalized === "yes" ||
    normalized === "on" ||
    normalized === "true"
  );
}