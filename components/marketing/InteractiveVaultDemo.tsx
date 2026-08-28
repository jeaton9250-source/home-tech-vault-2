"use client";

import { useState } from "react";
import {
  Check,
  ChevronRight,
  FileText,
  House,
  Laptop,
  MapPin,
  Router,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Tv,
  Wifi,
} from "lucide-react";

type DemoTab =
  | "overview"
  | "devices"
  | "warranties"
  | "wifi";

type DemoDevice = {
  id: string;
  name: string;
  brand: string;
  location: string;
  model: string;
  warranty: string;
  manual: boolean;
  receipt: boolean;
  icon: "tv" | "router" | "laptop";
};

const devices: DemoDevice[] = [
  {
    id: "samsung-tv",
    name: "Samsung QN90D",
    brand: "Samsung",
    location: "Living Room",
    model: "QN90D",
    warranty: "Active through Mar 2027",
    manual: true,
    receipt: true,
    icon: "tv",
  },
  {
    id: "spectrum-router",
    name: "Spectrum WiFi 6E Router",
    brand: "Spectrum",
    location: "Office",
    model: "SAX2V1R",
    warranty: "Provider managed",
    manual: true,
    receipt: false,
    icon: "router",
  },
  {
    id: "macbook",
    name: "MacBook Air",
    brand: "Apple",
    location: "Home Office",
    model: "M4",
    warranty: "Active through Jun 2027",
    manual: true,
    receipt: true,
    icon: "laptop",
  },
];

const tabs: Array<{
  id: DemoTab;
  label: string;
}> = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "devices",
    label: "Devices",
  },
  {
    id: "warranties",
    label: "Warranties",
  },
  {
    id: "wifi",
    label: "Home Wi-Fi",
  },
];

function DeviceIcon({
  type,
}: {
  type: DemoDevice["icon"];
}) {
  if (type === "router") {
    return <Router size={18} />;
  }

  if (type === "laptop") {
    return <Laptop size={18} />;
  }

  return <Tv size={18} />;
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#183047]/10 bg-white p-4 shadow-[0_12px_35px_-28px_rgba(24,48,71,0.45)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#718d4f]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#183047]">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-[#73808a]">
        {detail}
      </p>
    </div>
  );
}

function StatusRow({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#183047]/10 py-3 last:border-b-0">
      <span className="text-sm text-[#6f7a82]">
        {label}
      </span>

      <span
        className={
          positive
            ? "inline-flex items-center gap-1.5 text-sm font-semibold text-[#617c43]"
            : "text-sm font-semibold text-[#183047]"
        }
      >
        {positive ? <Check size={14} /> : null}
        {value}
      </span>
    </div>
  );
}

export default function InteractiveVaultDemo() {
  const [activeTab, setActiveTab] =
    useState<DemoTab>("overview");

  const [selectedDeviceId, setSelectedDeviceId] =
    useState<string | null>(null);

  const selectedDevice =
    devices.find(
      (device) =>
        device.id === selectedDeviceId
    ) ?? null;

  function openDevice(deviceId: string) {
    setSelectedDeviceId(deviceId);
  }

  function changeTab(tab: DemoTab) {
    setSelectedDeviceId(null);
    setActiveTab(tab);
  }

  return (
    <div className="relative">
      <div className="absolute -inset-5 rounded-[40px] bg-[#718d4f]/5 blur-2xl" />

      <div className="relative overflow-hidden rounded-[32px] border border-[#183047]/10 bg-[#f8f5ef] shadow-[0_40px_100px_-45px_rgba(24,48,71,0.5)]">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#183047] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
              <House size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Demo Home
              </p>

              <p className="text-[11px] text-white/55">
                Home Tech Vault
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#9dbb78]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
              Interactive
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border-b border-[#183047]/10 bg-white px-3 sm:px-5">
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const active =
                activeTab === tab.id &&
                !selectedDevice;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    changeTab(tab.id)
                  }
                  className={[
                    "relative px-3 py-4 text-xs font-semibold transition sm:px-4",
                    active
                      ? "text-[#183047]"
                      : "text-[#859097] hover:text-[#183047]",
                  ].join(" ")}
                >
                  {tab.label}

                  {active ? (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#718d4f]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[480px] p-5 sm:p-6">
          {selectedDevice ? (
            <DeviceDetail
              device={selectedDevice}
              onBack={() =>
                setSelectedDeviceId(null)
              }
            />
          ) : null}

          {!selectedDevice &&
          activeTab === "overview" ? (
            <OverviewTab
              onOpenDevice={openDevice}
            />
          ) : null}

          {!selectedDevice &&
          activeTab === "devices" ? (
            <DevicesTab
              onOpenDevice={openDevice}
            />
          ) : null}

          {!selectedDevice &&
          activeTab === "warranties" ? (
            <WarrantiesTab
              onOpenDevice={openDevice}
            />
          ) : null}

          {!selectedDevice &&
          activeTab === "wifi" ? (
            <WifiTab />
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[#7c878e]">
        Try it — this preview is fully interactive.
      </p>
    </div>
  );
}

function OverviewTab({
  onOpenDevice,
}: {
  onOpenDevice: (id: string) => void;
}) {
  return (
    <div className="animate-[fadeIn_250ms_ease-out] space-y-4">
      {/* HOME AT A GLANCE */}
      <div className="rounded-[26px] bg-[#183047] p-5 text-white shadow-[0_24px_55px_-36px_rgba(24,48,71,0.8)] sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.15em] text-white/45">
                Thursday, August 27
              </span>

              <span className="rounded-full border border-[#718d4f]/30 bg-[#718d4f]/10 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.15em] text-[#b8cd9e]">
                Home Pulse
              </span>
            </div>

            <h3 className="mt-5 font-serif text-[34px] leading-[0.96] tracking-[-0.045em] text-white">
              Demo&apos;s home,
              <br />
              <span className="text-[#9fbd79]">
                at a glance.
              </span>
            </h3>

            <p className="mt-4 max-w-sm text-[11px] leading-5 text-white/60">
              Your Home Tech Vault is organized and
              ready when you need it.
            </p>

            <div className="mt-4 flex items-center gap-2 text-[9px] font-medium text-[#a9c786]">
              <ShieldCheck size={13} />
              Important details are organized and ready.
            </div>
          </div>

          <div className="flex justify-start sm:justify-end">
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-center">
              <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-white/35">
                Vault Readiness
              </p>

              <div className="relative mx-auto mt-3 flex h-[78px] w-[78px] items-center justify-center rounded-full border-[7px] border-white/15">
                <div className="absolute inset-[-7px] rounded-full border-[7px] border-transparent border-r-[#718d4f] border-t-[#718d4f]" />

                <div>
                  <p className="font-serif text-[21px] text-white">
                    92%
                  </p>
                  <p className="text-[6px] uppercase tracking-[0.12em] text-white/30">
                    Organized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 border-t border-white/10 pt-4">
          <div>
            <p className="text-[7px] uppercase tracking-[0.14em] text-white/30">
              Devices
            </p>
            <p className="mt-1 text-[9px] text-white/75">
              <span className="text-[#9fbd79]">●</span>{" "}
              Organized
            </p>
          </div>

          <div className="border-l border-white/10 pl-4">
            <p className="text-[7px] uppercase tracking-[0.14em] text-white/30">
              Records
            </p>
            <p className="mt-1 text-[9px] text-white/75">
              <span className="text-[#9fbd79]">●</span>{" "}
              Available
            </p>
          </div>

          <div className="border-l border-white/10 pl-4">
            <p className="text-[7px] uppercase tracking-[0.14em] text-white/30">
              Home Pulse
            </p>
            <p className="mt-1 text-[9px] text-white/75">
              <span className="text-[#9fbd79]">●</span>{" "}
              Ready
            </p>
          </div>
        </div>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          ["Devices", "12", "11 online"],
          ["Active Warranties", "8", "Coverage tracked"],
          ["Documents", "24", "Stored in your Vault"],
          ["Household", "3", "Members"],
          ["Offline Devices", "1", "Worth reviewing"],
        ].map(([label, value, detail]) => (
          <div
            key={label}
            className="rounded-[15px] border border-[#183047]/10 bg-white px-3 py-3"
          >
            <p className="text-[7px] font-semibold text-[#6f7a82]">
              {label}
            </p>

            <p className="mt-1 font-serif text-[18px] text-[#183047]">
              {value}
            </p>

            <p className="mt-0.5 text-[7px] text-[#9aa2a7]">
              {detail}
            </p>
          </div>
        ))}
      </div>

      {/* LOWER DASHBOARD */}
      <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[22px] border border-[#183047]/10 bg-white p-4">
          <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#718d4f]">
            Home Advisor
          </p>

          <h4 className="mt-2 font-serif text-[18px] text-[#183047]">
            What deserves your attention
          </h4>

          <div className="mt-4 space-y-2">
            <div className="rounded-[14px] bg-[#f5f1e8] p-3">
              <p className="text-[9px] font-semibold text-[#183047]">
                What your Vault found
              </p>

              <p className="mt-1 text-[8px] leading-4 text-[#7a858c]">
                Start with 2 important issues, then review
                the remaining recommendations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenDevice("samsung-tv")}
              className="flex w-full items-center justify-between rounded-[13px] border border-[#183047]/8 px-3 py-2.5 text-left transition hover:bg-[#f8f5ef]"
            >
              <div>
                <p className="text-[9px] font-semibold text-[#183047]">
                  Warranty expiring soon
                </p>
                <p className="mt-1 text-[8px] text-[#7a858c]">
                  Samsung TV warranty expires in 24 days.
                </p>
              </div>

              <ChevronRight
                size={13}
                className="text-[#718d4f]"
              />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-[22px] bg-[#183047] p-4 text-white">
            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#9fbd79]">
              Ask Your Vault
            </p>

            <h4 className="mt-2 font-serif text-[18px]">
              Find anything in your home.
            </h4>

            <p className="mt-2 text-[8px] leading-4 text-white/55">
              Search devices, warranties, documents,
              and household information from one place.
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-[12px] border border-white/15 bg-white/5 px-3 py-2.5">
              <span className="flex-1 truncate text-[8px] text-white/55">
                Ask something about your home...
              </span>

              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#718d4f]">
                <ChevronRight size={12} />
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {[
                "Expiring warranties",
                "Find a receipt",
                "Offline devices",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 px-2 py-1 text-[6px] text-white/50"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-[#183047]/10 bg-white p-4">
            <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-[#718d4f]">
              First milestone complete
            </p>

            <p className="mt-2 font-serif text-[15px] leading-5 text-[#183047]">
              3 devices organized.
              <br />
              Protect the paperwork next.
            </p>

            <p className="mt-2 text-[8px] leading-4 text-[#7a858c]">
              Save a receipt, warranty, or manual so it
              is already here when you need it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DevicesTab({
  onOpenDevice,
}: {
  onOpenDevice: (id: string) => void;
}) {
  const demoDevices = [
    {
      id: "samsung-tv",
      name: "Samsung QN90D",
      brandModel: "Samsung · QN90D",
      location: "Living Room",
      status: "Online",
      warranty: "Warranty active",
      value: "$1,499",
      icon: "tv" as const,
      tone: "warm",
    },
    {
      id: "spectrum-router",
      name: "Spectrum WiFi 6E Router",
      brandModel: "Spectrum · SAX2V1R",
      location: "Office",
      status: "Online",
      warranty: "Provider managed",
      value: "Included",
      icon: "router" as const,
      tone: "neutral",
    },
    {
      id: "macbook",
      name: "MacBook Air",
      brandModel: "Apple · M4",
      location: "Home Office",
      status: "Online",
      warranty: "Warranty active",
      value: "$999",
      icon: "laptop" as const,
      tone: "soft",
    },
  ];

  return (
    <div className="animate-[fadeIn_250ms_ease-out]">
      {/* SEARCH */}
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[14px] border border-[#183047]/10 bg-white px-3 py-2.5">
          <Search
            size={13}
            className="shrink-0 text-[#89939a]"
          />

          <span className="truncate text-[8px] text-[#929ba0]">
            Search your devices...
          </span>
        </div>

        <button
          type="button"
          aria-label="Filters"
          className="flex h-[37px] w-[40px] shrink-0 items-center justify-center rounded-[14px] border border-[#183047]/10 bg-white text-[#183047]"
        >
          <SlidersHorizontal size={13} />
        </button>
      </div>

      {/* FILTER CHIPS */}
      <div className="mt-3 flex gap-1.5 overflow-hidden">
        {[
          "All",
          "Appliance",
          "Computer",
          "Network",
          "Smart Home",
        ].map((category, index) => (
          <button
            key={category}
            type="button"
            className={[
              "shrink-0 rounded-full px-3 py-1.5 text-[6px] font-semibold",
              index === 0
                ? "bg-[#718d4f] text-white"
                : "border border-[#183047]/10 bg-white text-[#7f898f]",
            ].join(" ")}
          >
            {category}
          </button>
        ))}
      </div>

      {/* DEVICE GRID */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {demoDevices.map((device) => (
          <button
            key={device.id}
            type="button"
            onClick={() => onOpenDevice(device.id)}
            className="group overflow-hidden rounded-[20px] border border-[#183047]/10 bg-white text-left shadow-[0_16px_35px_-30px_rgba(24,48,71,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-28px_rgba(24,48,71,0.52)]"
          >
            {/* COMPACT PRODUCT VISUAL */}
            <div
              className={[
                "relative flex h-[78px] items-center justify-center overflow-hidden",
                device.tone === "warm"
                  ? "bg-[linear-gradient(135deg,#ddd3c5_0%,#f0ebe2_55%,#d6ccbd_100%)]"
                  : "",
                device.tone === "neutral"
                  ? "bg-[linear-gradient(135deg,#e1dbd1_0%,#f2eee6_55%,#d2cabf_100%)]"
                  : "",
                device.tone === "soft"
                  ? "bg-[linear-gradient(135deg,#e7e1d7_0%,#f5f1e9_55%,#dad2c7_100%)]"
                  : "",
              ].join(" ")}
            >
              <div className="absolute inset-x-0 bottom-0 h-[34%] bg-white/25" />

              <div className="relative flex h-[48px] w-[58px] items-center justify-center rounded-[16px] border border-white/60 bg-white/70 text-[#183047] shadow-[0_12px_28px_-18px_rgba(24,48,71,0.38)] backdrop-blur">
                <DeviceIcon
                  type={device.icon}
                />
              </div>

              <span className="absolute bottom-2 left-2 rounded-full bg-white/75 px-2 py-0.5 text-[5px] font-semibold uppercase tracking-[0.12em] text-[#617c43] backdrop-blur">
                {device.location}
              </span>
            </div>

            {/* DETAILS */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate font-serif text-[13px] leading-4 text-[#17212a]">
                    {device.name}
                  </h4>

                  <p className="mt-1 truncate text-[6px] text-[#8a9499]">
                    {device.brandModel}
                  </p>
                </div>

                <ChevronRight
                  size={12}
                  className="mt-0.5 shrink-0 text-[#a2aaae] transition group-hover:translate-x-0.5 group-hover:text-[#718d4f]"
                />
              </div>

              <div className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1.5">
                <div className="flex items-center gap-1 text-[5px] text-[#78838a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#718d4f]" />
                  {device.status}
                </div>

                <div className="flex items-center gap-1 text-[5px] text-[#78838a]">
                  <MapPin
                    size={7}
                    className="text-[#718d4f]"
                  />
                  {device.location}
                </div>

                <div className="flex items-center gap-1 text-[5px] text-[#78838a]">
                  <ShieldCheck
                    size={7}
                    className="text-[#718d4f]"
                  />
                  {device.warranty}
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-[#183047]/8 pt-2">
                <span className="text-[5px] font-semibold uppercase tracking-[0.14em] text-[#a0a7aa]">
                  Value
                </span>

                <span className="font-serif text-[11px] text-[#17212a]">
                  {device.value}
                </span>
              </div>
            </div>
          </button>
        ))}

        {/* FOURTH TILE */}
        <div className="flex min-h-[168px] items-center justify-center rounded-[20px] border border-dashed border-[#183047]/15 bg-[#f5f1e8]/65 p-4">
          <div className="text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-[13px] bg-white text-[#718d4f] shadow-sm">
              <House size={15} />
            </div>

            <p className="mt-3 font-serif text-[13px] text-[#183047]">
              Your whole home.
            </p>

            <p className="mx-auto mt-1 max-w-[120px] text-[6px] leading-3 text-[#899299]">
              Appliances and technology organized in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarrantiesTab({
  onOpenDevice,
}: {
  onOpenDevice: (id: string) => void;
}) {
  const protectedDevices =
    devices.filter((device) =>
      device.warranty
        .toLowerCase()
        .includes("active")
    );

  return (
    <div className="animate-[fadeIn_250ms_ease-out]">
      <div className="flex items-center justify-between gap-5 rounded-[24px] bg-[#183047] p-5 text-white">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/50">
            Warranty protection
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
            8 covered
          </p>

          <p className="mt-1 text-xs text-white/55">
            Across your home
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <ShieldCheck size={23} />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {protectedDevices.map(
          (device) => (
            <button
              key={device.id}
              type="button"
              onClick={() =>
                onOpenDevice(device.id)
              }
              className="flex w-full items-center justify-between gap-4 rounded-[20px] border border-[#183047]/10 bg-white p-4 text-left transition hover:-translate-y-0.5"
            >
              <div>
                <p className="text-sm font-semibold text-[#183047]">
                  {device.name}
                </p>

                <p className="mt-1 text-xs text-[#7a858c]">
                  {device.warranty}
                </p>
              </div>

              <span className="rounded-full bg-[#718d4f]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#617c43]">
                Active
              </span>
            </button>
          )
        )}
      </div>

      <div className="mt-5 rounded-[20px] border border-dashed border-[#183047]/15 bg-white/50 p-4">
        <p className="text-xs leading-5 text-[#718087]">
          Home Tech Vault keeps warranty dates
          beside the device they belong to, so
          you know what is still covered.
        </p>
      </div>
    </div>
  );
}

function WifiTab() {
  return (
    <div className="animate-[fadeIn_250ms_ease-out]">
      <div className="rounded-[26px] bg-[#183047] p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/50">
              Home network
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Network looks healthy.
            </h3>

            <p className="mt-2 text-xs leading-5 text-white/60">
              Last checked a few minutes ago
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Wifi size={23} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#a6c780]" />
          <span className="text-xs font-semibold text-white/80">
            Connector online
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-[#183047]/10 bg-white p-5">
        <StatusRow
          label="Router"
          value="Spectrum WiFi 6E"
        />

        <StatusRow
          label="Known devices"
          value="12"
        />

        <StatusRow
          label="Network status"
          value="Healthy"
          positive
        />

        <StatusRow
          label="Last scan"
          value="Today"
        />
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-[20px] bg-[#718d4f]/8 p-4">
        <Router
          size={18}
          className="mt-0.5 shrink-0 text-[#617c43]"
        />

        <p className="text-xs leading-5 text-[#66716f]">
          Home Tech Vault can help identify
          devices on your network and organize
          what you choose to save.
        </p>
      </div>
    </div>
  );
}

function DeviceDetail({
  device,
  onBack,
}: {
  device: DemoDevice;
  onBack: () => void;
}) {
  return (
    <div className="animate-[fadeIn_220ms_ease-out]">
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-semibold text-[#718d4f] transition hover:text-[#617c43]"
      >
        ← Back to devices
      </button>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#183047] text-white shadow-[0_15px_35px_-25px_rgba(24,48,71,0.8)]">
          <DeviceIcon type={device.icon} />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#718d4f]">
            {device.brand}
          </p>

          <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#183047]">
            {device.name}
          </h3>

          <p className="mt-1 text-xs text-[#7a858c]">
            {device.location}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-[#183047]/10 bg-white p-5">
        <StatusRow
          label="Model"
          value={device.model}
        />

        <StatusRow
          label="Serial number"
          value="0A7X••••92"
        />

        <StatusRow
          label="Purchase date"
          value="Mar 14, 2026"
        />

        <StatusRow
          label="Warranty"
          value="Active"
          positive
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[20px] border border-[#183047]/10 bg-white p-4">
          <FileText
            size={18}
            className="text-[#718d4f]"
          />

          <p className="mt-3 text-sm font-semibold text-[#183047]">
            Manual
          </p>

          <p className="mt-1 text-xs text-[#718087]">
            Saved and ready
          </p>
        </div>

        <div className="rounded-[20px] border border-[#183047]/10 bg-white p-4">
          <ShieldCheck
            size={18}
            className="text-[#718d4f]"
          />

          <p className="mt-3 text-sm font-semibold text-[#183047]">
            Receipt
          </p>

          <p className="mt-1 text-xs text-[#718087]">
            Purchase record saved
          </p>
        </div>
      </div>
    </div>
  );
}
