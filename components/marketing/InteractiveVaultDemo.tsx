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
import { getDemoImagePathForDeviceId } from "@/lib/devices/demoDeviceImages";

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
      {/* HERO */}
      <div className="rounded-[26px] bg-[#183047] p-5 text-white shadow-[0_24px_55px_-36px_rgba(24,48,71,0.8)] sm:p-6">
        <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#9fbd79]">
          Home
        </p>

        <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h3 className="font-serif text-[34px] leading-[0.98] tracking-[-0.045em] text-white">
              Your home,
              <br />
              <span className="text-[#9fbd79]">
                all in one place.
              </span>
            </h3>

            <p className="mt-4 max-w-sm text-[11px] leading-5 text-white/60">
              Everything you need to know about your home,
              ready when you need it.
            </p>
          </div>

          <div className="grid min-w-[180px] grid-cols-2 gap-4 border-white/10 sm:border-l sm:pl-5">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-white/35">
                Organized
              </p>
              <p className="mt-2 font-serif text-[26px] leading-none text-white">
                92%
              </p>
            </div>

            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-white/35">
                Attention
              </p>
              <p className="mt-2 text-[13px] font-semibold text-white/90">
                2 items
              </p>
            </div>

            <div className="col-span-2">
              <button
                type="button"
                className="flex items-center gap-2 text-[9px] font-semibold text-[#9fbd79]"
              >
                Review home health
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-[8px] text-white/45">
          <span>
            <strong className="mr-1 text-[11px] font-semibold text-white">
              12
            </strong>
            Devices
          </span>

          <span className="text-white/20">•</span>

          <span>
            <strong className="mr-1 text-[11px] font-semibold text-white">
              24
            </strong>
            Documents
          </span>

          <span className="text-white/20">•</span>

          <span>
            <strong className="mr-1 text-[11px] font-semibold text-white">
              8
            </strong>
            Warranties
          </span>

          <span className="text-white/20">•</span>

          <span>
            <strong className="mr-1 text-[11px] font-semibold text-white">
              $35/mo
            </strong>
            Subscriptions
          </span>
        </div>
      </div>

      {/* UP NEXT */}
      <button
        type="button"
        onClick={() => onOpenDevice("samsung-tv")}
        className="group flex w-full items-center gap-4 rounded-[22px] border border-[#183047]/10 bg-white px-4 py-4 text-left shadow-[0_18px_45px_-38px_rgba(24,48,71,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-34px_rgba(24,48,71,0.55)] sm:px-5"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#718d4f]/10 text-[#718d4f]">
          <ShieldCheck size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-semibold uppercase tracking-[0.17em] text-[#718d4f]">
            Up Next
          </p>
          <h4 className="mt-1 font-serif text-[20px] leading-tight text-[#183047]">
            Review Samsung TV warranty
          </h4>
          <p className="mt-1.5 text-[8px] leading-4 text-[#7a858c]">
            Coverage expires in 24 days. Keep the receipt and
            warranty details ready.
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#183047] px-3 py-2 text-[8px] font-semibold text-white">
          Take action
          <ChevronRight size={11} />
        </span>
      </button>

      {/* ASK YOUR HOME */}
      <div className="rounded-[22px] border border-[#183047]/10 bg-white p-4 shadow-[0_18px_45px_-38px_rgba(24,48,71,0.45)] sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.17em] text-[#718d4f]">
              Ask Your Home
            </p>

            <h4 className="mt-2 font-serif text-[22px] leading-tight text-[#183047]">
              Find anything in your home.
            </h4>

            <p className="mt-2 text-[8px] leading-4 text-[#7a858c]">
              Find a receipt, check a warranty, look up a
              device, or ask what needs attention.
            </p>
          </div>

          <div className="flex min-h-[50px] items-center gap-3 rounded-[16px] bg-[#f5f1e8] px-4">
            <span className="text-[#718d4f]">
              ⌕
            </span>

            <span className="min-w-0 flex-1 truncate text-[8px] text-[#929a9e]">
              Ask something about your home...
            </span>

            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#183047] text-white">
              <ChevronRight size={12} />
            </span>
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
      image: "/demo-devices/samsung-frame-tv.png",
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
      image: getDemoImagePathForDeviceId("demo-unifi-router"),
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
      image: getDemoImagePathForDeviceId("demo-macbook"),
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
                "relative flex h-[92px] items-center justify-center overflow-hidden",
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
              <div className="absolute inset-x-0 bottom-0 h-[30%] bg-white/25" />

              {device.image ? (
                <img
                  src={device.image}
                  alt={device.name}
                  loading="eager"
                  className="relative z-[1] h-[84px] w-[88%] object-contain drop-shadow-[0_14px_18px_rgba(24,48,71,0.2)] transition duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="relative flex h-[48px] w-[58px] items-center justify-center rounded-[16px] border border-white/60 bg-white/70 text-[#183047] shadow-[0_12px_28px_-18px_rgba(24,48,71,0.38)] backdrop-blur">
                  <DeviceIcon
                    type={device.icon}
                  />
                </div>
              )}

              <span className="absolute bottom-2 left-2 z-[2] rounded-full border border-white/60 bg-white/85 px-2 py-0.5 text-[5px] font-semibold uppercase tracking-[0.12em] text-[#617c43] shadow-sm backdrop-blur">
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
