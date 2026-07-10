"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Globe,
  Gauge,
  KeyRound,
  Loader2,
  LockKeyhole,
  Pencil,
  Radar,
  Router,
  ShieldCheck,
  Signal,
  Wifi,
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

export default function NetworkPage() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const [data, setData] = useState<NetworkInfo | null>(null);
  const [loadingNetwork, setLoadingNetwork] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadNetwork() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingNetwork(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setData(demoNetwork);
          return;
        }

        const { data: networkData, error } = await supabase
          .from("network_info")
          .select("*")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setData((networkData as NetworkInfo) || null);
      } catch (error) {
        console.error("Network loading error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load network information."
        );
      } finally {
        setLoadingNetwork(false);
      }
    }

    loadNetwork();
  }, [user, isDemo, demoLoading]);

  const loading = demoLoading || loadingNetwork;

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
    if (Number(data.speed_download || 0) >= 100) score += 10;
    if (Number(data.speed_upload || 0) >= 20) score += 5;

    const guestNetwork = data.guest_network?.toLowerCase() || "";

    if (
      guestNetwork.includes("enabled") ||
      guestNetwork.includes("yes") ||
      guestNetwork.includes("on")
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
    isDemo ? "Demo Network Center" : "Network Center"
  }
  description={
    isDemo
      ? "You are viewing sample network information. Sign in to manage your own setup."
      : "Track your internet provider, speeds, router, modem, Wi-Fi details, and network health."
  }
  action={
    <div className="flex flex-wrap gap-3">
      {!isDemo && (
        <Button
          href="/network/discover"
          variant="secondary"
        >
          <Radar size={18} />
          Discover Devices
        </Button>
      )}

      <Button
        href={isDemo ? "/login" : "/network/edit"}
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
            Loading network information...
          </div>
        </PageCard>
      ) : errorMessage ? (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      ) : !data ? (
        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Wifi size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#111827]">
            No network information yet
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-neutral-500">
            Add your internet provider, router, modem, Wi-Fi
            name, guest network status, and connection speeds.
          </p>

          <Button href="/network/edit" className="mt-6">
            Set Up Your Network
          </Button>
        </PageCard>
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <NetworkStat
              label="Network Health"
              value={`${networkScore}/100`}
              description={networkLabel}
              icon={ShieldCheck}
            />

            <NetworkStat
              label="Download Speed"
              value={`${Number(
                data.speed_download || 0
              ).toLocaleString()} Mbps`}
              description="Recorded internet speed"
              icon={Gauge}
            />

            <NetworkStat
              label="Upload Speed"
              value={`${Number(
                data.speed_upload || 0
              ).toLocaleString()} Mbps`}
              description="Recorded internet speed"
              icon={Activity}
            />

            <NetworkStat
              label="Guest Network"
              value={data.guest_network || "Not added"}
              description="Separate visitor access"
              icon={KeyRound}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PageCard>
              <SectionHeader
                icon={Globe}
                eyebrow="Internet Service"
                title="Provider & Speeds"
                description="Your saved internet service details."
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
                    data.isp ? "Configured" : "Incomplete"
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
                  value={data.wifi_name || "Not added"}
                />

                <NetworkDetailRow
                  icon={KeyRound}
                  label="Guest Network"
                  value={data.guest_network || "Not added"}
                />

                <NetworkDetailRow
                  icon={LockKeyhole}
                  label="Admin Portal"
                  value={data.admin_url || "Not added"}
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
                  complete={Boolean(data.router_model?.trim())}
                  label="Router information saved"
                />

                <ChecklistItem
                  complete={Boolean(data.modem_model?.trim())}
                  label="Modem information saved"
                />

                <ChecklistItem
                  complete={Boolean(data.wifi_name?.trim())}
                  label="Wi-Fi name documented"
                />

                <ChecklistItem
                  complete={Boolean(data.admin_url?.trim())}
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
              icon={Router}
              eyebrow="Network Notes"
              title="Notes"
              description="Keep troubleshooting details, placement notes, or provider information."
            />

            <div className="mt-6 rounded-2xl bg-[#F7F5EF] p-5">
              <p className="whitespace-pre-wrap leading-7 text-neutral-600">
                {data.notes || "No network notes saved."}
              </p>
            </div>
          </PageCard>
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
          <Signal size={18} />
        )}
      </div>

      <p className="text-sm font-semibold text-[#111827]">
        {label}
      </p>
    </div>
  );
}

function isGuestNetworkEnabled(value?: string | null) {
  const normalized = value?.trim().toLowerCase() || "";

  return (
    normalized === "enabled" ||
    normalized === "yes" ||
    normalized === "on" ||
    normalized === "true"
  );
}