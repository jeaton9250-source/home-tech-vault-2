"use client";

import PremiumGate from "@/components/PremiumGate";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  Network,
  Plus,
  Radar,
  Search,
  Wifi,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type DiscoveredDevice = {
  key: string;
  ipAddress: string;
  macAddress: string;
  deviceName: string;
  manufacturer: string;
  selected: boolean;
};

function NetworkDiscoveryContent() {
  const router = useRouter();

  const [rawResults, setRawResults] = useState("");
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [importing, setImporting] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState("");

  const filteredDevices = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return devices;
    }

    return devices.filter((device) =>
      [
        device.deviceName,
        device.ipAddress,
        device.macAddress,
        device.manufacturer,
      ].some((value) =>
        value.toLowerCase().includes(search)
      )
    );
  }, [devices, searchTerm]);

  const selectedCount = devices.filter(
    (device) => device.selected
  ).length;

  function parseResults() {
    if (!rawResults.trim()) {
      alert("Paste your network scan results first.");
      return;
    }

    const parsedDevices = parseArpOutput(rawResults);

    if (parsedDevices.length === 0) {
      alert(
        "No devices were detected. Make sure you pasted the complete arp -a output."
      );
      return;
    }

    setDevices(parsedDevices);
  }

  function updateDevice(
    key: string,
    changes: Partial<DiscoveredDevice>
  ) {
    setDevices((current) =>
      current.map((device) =>
        device.key === key
          ? {
              ...device,
              ...changes,
            }
          : device
      )
    );
  }

  function toggleAll() {
    const shouldSelectAll =
      selectedCount !== devices.length;

    setDevices((current) =>
      current.map((device) => ({
        ...device,
        selected: shouldSelectAll,
      }))
    );
  }

  async function importSelectedDevices() {
    const selectedDevices = devices.filter(
      (device) => device.selected
    );

    if (selectedDevices.length === 0) {
      alert("Select at least one device to sync.");
      return;
    }

    try {
      setImporting(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const now = new Date().toISOString();

      const normalizedDevices = selectedDevices.map(
        (device) => ({
          ...device,
          normalizedMac: normalizeMacAddress(
            device.macAddress
          ),
        })
      );

      const scannedMacAddresses = normalizedDevices
        .map((device) => device.normalizedMac)
        .filter(Boolean);

      const {
        data: existingRows,
        error: existingError,
      } = await supabase
        .from("devices")
        .select(
          `
            id,
            device_name,
            brand,
            manufacturer,
            mac_address,
            ip_address
          `
        )
        .eq("user_id", user.id)
        .in("mac_address", scannedMacAddresses);

      if (existingError) {
        throw existingError;
      }

      const existingByMac = new Map(
        (existingRows || []).map((device) => [
          normalizeMacAddress(
            device.mac_address || ""
          ),
          device,
        ])
      );

      let addedCount = 0;
      let updatedCount = 0;

      for (const discoveredDevice of normalizedDevices) {
        const existingDevice = existingByMac.get(
          discoveredDevice.normalizedMac
        );

        if (existingDevice) {
          const suggestedName =
            discoveredDevice.deviceName.trim();

          const currentName =
            existingDevice.device_name?.trim() || "";

          const currentNameIsGeneric =
            currentName === "" ||
            currentName.startsWith(
              "Network Device "
            );

          const updatePayload: {
            ip_address: string | null;
            last_seen_at: string;
            online: boolean;
            discovery_source: string;
            manufacturer?: string | null;
            brand?: string | null;
            device_name?: string;
          } = {
            ip_address:
              discoveredDevice.ipAddress || null,
            last_seen_at: now,
            online: true,
            discovery_source: "ARP Sync",
          };

          if (
            discoveredDevice.manufacturer.trim()
          ) {
            updatePayload.manufacturer =
              discoveredDevice.manufacturer.trim();

            if (!existingDevice.brand?.trim()) {
              updatePayload.brand =
                discoveredDevice.manufacturer.trim();
            }
          }

          if (
            currentNameIsGeneric &&
            suggestedName &&
            !suggestedName.startsWith(
              "Network Device "
            )
          ) {
            updatePayload.device_name =
              suggestedName;
          }

          const { error: updateError } =
            await supabase
              .from("devices")
              .update(updatePayload)
              .eq("id", existingDevice.id)
              .eq("user_id", user.id);

          if (updateError) {
            throw updateError;
          }

          updatedCount += 1;
          continue;
        }

        const { error: insertError } =
          await supabase
            .from("devices")
            .insert({
              user_id: user.id,
              device_name:
                discoveredDevice.deviceName.trim() ||
                `Network Device ${discoveredDevice.ipAddress}`,
              category: guessCategory(
                discoveredDevice.deviceName,
                discoveredDevice.manufacturer
              ),
              brand:
                discoveredDevice.manufacturer.trim() ||
                null,
              manufacturer:
                discoveredDevice.manufacturer.trim() ||
                null,
              ip_address:
                discoveredDevice.ipAddress || null,
              mac_address:
                discoveredDevice.normalizedMac ||
                null,
              location: "Network",
              discovery_source: "ARP Sync",
              last_seen_at: now,
              online: true,
              notes:
                "Discovered from a local network scan. Review this record and add its correct room, purchase details, warranty information, photos, and documents.",
            });

        if (insertError) {
          throw insertError;
        }

        addedCount += 1;
      }

      alert(
        [
          `${addedCount} new device${
            addedCount === 1 ? "" : "s"
          } added.`,
          `${updatedCount} existing device${
            updatedCount === 1 ? "" : "s"
          } updated.`,
          "No duplicate records were created.",
        ].join("\n")
      );

      router.push("/devices");
      router.refresh();
    } catch (error) {
      console.error(
        "Network sync error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to sync the selected devices."
      );
    } finally {
      setImporting(false);
    }
  }

  async function copyCommand(
    command: string,
    label: string
  ) {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(label);

      window.setTimeout(() => {
        setCopiedCommand("");
      }, 1500);
    } catch {
      alert(`Copy this command: ${command}`);
    }
  }

  function clearResults() {
    setRawResults("");
    setDevices([]);
    setSearchTerm("");
  }

  return (
    <PageShell>
      <PageTitle
        eyebrow="Network Discovery"
        title="Discover Connected Devices"
        description="Scan your local network, review detected devices, and sync the ones you want to track."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              router.push("/network")
            }
          >
            <ArrowLeft size={17} />
            Back to Network
          </Button>
        }
      />

      <PageCard>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Radar size={23} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#111827]">
              Run a Local Network Scan
            </h2>

            <p className="mt-2 max-w-3xl text-neutral-500">
              Run the command below on a
              computer connected to your home
              network, then paste the complete
              results into the box below.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <CommandCard
            title="macOS"
            command="arp -a"
            copied={copiedCommand === "mac"}
            onCopy={() =>
              copyCommand("arp -a", "mac")
            }
          />

          <CommandCard
            title="Windows"
            command="arp -a"
            copied={
              copiedCommand === "windows"
            }
            onCopy={() =>
              copyCommand(
                "arp -a",
                "windows"
              )
            }
          />
        </div>
      </PageCard>

      <PageCard>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Network size={21} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#111827]">
              Paste Scan Results
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Paste the full output from your
              network scan.
            </p>
          </div>
        </div>

        <textarea
          value={rawResults}
          onChange={(event) =>
            setRawResults(event.target.value)
          }
          placeholder={`Example:

living-room-appletv (192.168.1.10) at aa:bb:cc:dd:ee:ff on en0
brother-printer (192.168.1.24) at 11:22:33:44:55:66 on en0`}
          className="mt-6 min-h-64 w-full resize-y rounded-2xl border border-[#E8E2D6] bg-[#FBFAF7] px-5 py-4 font-mono text-sm text-[#111827] outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={parseResults}>
            <Search size={18} />
            Detect Devices
          </Button>

          <Button
            variant="secondary"
            onClick={clearResults}
          >
            Clear Results
          </Button>
        </div>
      </PageCard>

      {devices.length > 0 && (
        <PageCard>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Discovery Results
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#111827]">
                Review Detected Devices
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                Suggested names and categories are
                generated from available hostnames
                and local manufacturer clues.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F5EF] px-5 py-3">
              <p className="text-sm font-semibold text-[#111827]">
                {selectedCount} of{" "}
                {devices.length} selected
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
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
                placeholder="Search detected devices..."
                className="w-full rounded-xl border border-[#E8E2D6] bg-white py-3 pl-11 pr-4 outline-none focus:border-[#C8A96A]"
              />
            </div>

            <button
              type="button"
              onClick={toggleAll}
              className="rounded-xl bg-[#F7F5EF] px-4 py-3 text-sm font-semibold text-[#111827]"
            >
              {selectedCount ===
              devices.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {filteredDevices.map(
              (device) => (
                <DiscoveredDeviceRow
                  key={device.key}
                  device={device}
                  onChange={(changes) =>
                    updateDevice(
                      device.key,
                      changes
                    )
                  }
                />
              )
            )}
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-[#E8E2D6] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">
              Existing devices are updated by MAC
              address. New devices are added
              without creating duplicates.
            </p>

            <Button
              onClick={
                importSelectedDevices
              }
              disabled={
                selectedCount === 0 ||
                importing
              }
            >
              {importing ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Plus size={18} />
              )}

              {importing
                ? "Syncing..."
                : `Sync ${selectedCount} Device${
                    selectedCount === 1
                      ? ""
                      : "s"
                  }`}
            </Button>
          </div>
        </PageCard>
      )}
    </PageShell>
  );
}

function CommandCard({
  title,
  command,
  copied,
  onCopy,
}: {
  title: string;
  command: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E2D6] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
        {title}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <code className="min-w-0 flex-1 rounded-xl bg-[#111827] px-4 py-3 text-sm text-white">
          {command}
        </code>

        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${title} command`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7F5EF] text-[#111827]"
        >
          {copied ? (
            <CheckCircle2
              size={19}
              className="text-emerald-700"
            />
          ) : (
            <Copy size={19} />
          )}
        </button>
      </div>
    </div>
  );
}

function DiscoveredDeviceRow({
  device,
  onChange,
}: {
  device: DiscoveredDevice;
  onChange: (
    changes: Partial<DiscoveredDevice>
  ) => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        device.selected
          ? "border-[#C8A96A] bg-[#FBFAF7]"
          : "border-[#E8E2D6] bg-white"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <button
          type="button"
          onClick={() =>
            onChange({
              selected: !device.selected,
            })
          }
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            device.selected
              ? "bg-[#111827] text-[#C8A96A]"
              : "bg-[#F7F5EF] text-neutral-400"
          }`}
          aria-label={
            device.selected
              ? "Deselect device"
              : "Select device"
          }
        >
          {device.selected ? (
            <CheckCircle2 size={21} />
          ) : (
            <Wifi size={21} />
          )}
        </button>

        <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">
              Device Name
            </span>

            <input
              value={device.deviceName}
              onChange={(event) =>
                onChange({
                  deviceName:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#C8A96A]"
            />
          </label>

          <InfoField
            label="IP Address"
            value={device.ipAddress}
          />

          <InfoField
            label="MAC Address"
            value={device.macAddress}
          />

          <label>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">
              Manufacturer
            </span>

            <input
              value={
                device.manufacturer
              }
              onChange={(event) =>
                onChange({
                  manufacturer:
                    event.target.value,
                })
              }
              placeholder="Unknown"
              className="w-full rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#C8A96A]"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">
        {label}
      </span>

      <div className="rounded-xl bg-[#F7F5EF] px-4 py-3 text-sm font-medium text-[#111827]">
        {value || "Unknown"}
      </div>
    </div>
  );
}

function parseArpOutput(
  input: string
): DiscoveredDevice[] {
  const found = new Map<
    string,
    DiscoveredDevice
  >();

  const macPattern =
    /([0-9a-fA-F]{1,2}[:-]){5}[0-9a-fA-F]{1,2}/;

  const ipPattern =
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

  const lines = input.split(/\r?\n/);

  for (const line of lines) {
    const ipMatch = line.match(ipPattern);
    const macMatch = line.match(macPattern);

    if (!ipMatch || !macMatch) {
      continue;
    }

    const ipAddress = ipMatch[0];
    const macAddress =
      normalizeMacAddress(macMatch[0]);

    if (
      macAddress ===
        "ff:ff:ff:ff:ff:ff" ||
      macAddress ===
        "00:00:00:00:00:00"
    ) {
      continue;
    }

    const key =
      `${ipAddress}-${macAddress}`;

    if (found.has(key)) {
      continue;
    }

    const hostname = extractHostname(
      line,
      ipAddress
    );

    const manufacturer =
      guessManufacturer(
        hostname,
        macAddress
      );

    found.set(key, {
      key,
      ipAddress,
      macAddress,
      manufacturer,
      deviceName: suggestDeviceName({
        hostname,
        manufacturer,
        ipAddress,
      }),
      selected: true,
    });
  }

  return Array.from(found.values()).sort(
    (a, b) =>
      compareIpAddresses(
        a.ipAddress,
        b.ipAddress
      )
  );
}

function guessCategory(
  deviceName: string,
  manufacturer: string
) {
  const text =
    `${deviceName} ${manufacturer}`.toLowerCase();

  if (
    text.includes("iphone") ||
    text.includes("android") ||
    text.includes("phone")
  ) {
    return "Mobile";
  }

  if (
    text.includes("ipad") ||
    text.includes("tablet")
  ) {
    return "Tablet";
  }

  if (
    text.includes("macbook") ||
    text.includes("imac") ||
    text.includes("laptop") ||
    text.includes("desktop") ||
    text.includes("computer")
  ) {
    return "Computer";
  }

  if (
    text.includes("printer") ||
    text.includes("brother") ||
    text.includes("epson") ||
    text.includes("canon") ||
    text.includes("laserjet") ||
    text.includes("officejet")
  ) {
    return "Printer";
  }

  if (
    text.includes("apple tv") ||
    text.includes("chromecast") ||
    text.includes("roku") ||
    text.includes("fire tv")
  ) {
    return "Streaming Device";
  }

  if (
    text.includes("samsung tv") ||
    text.includes("lg tv") ||
    text.includes("smart tv")
  ) {
    return "TV";
  }

  if (
    text.includes("xbox") ||
    text.includes("playstation") ||
    text.includes("ps5") ||
    text.includes("ps4")
  ) {
    return "Gaming";
  }

  if (
    text.includes("router") ||
    text.includes("eero") ||
    text.includes("netgear") ||
    text.includes("tp-link") ||
    text.includes("tplink") ||
    text.includes("modem")
  ) {
    return "Network Equipment";
  }

  if (
    text.includes("echo") ||
    text.includes("sonos") ||
    text.includes("speaker")
  ) {
    return "Audio";
  }

  if (
    text.includes("ring") ||
    text.includes("camera") ||
    text.includes("doorbell")
  ) {
    return "Security";
  }

  if (
    text.includes("thermostat") ||
    text.includes("smart plug") ||
    text.includes("smart bulb") ||
    text.includes("homepod")
  ) {
    return "Smart Home";
  }

  return "Network Device";
}

function suggestDeviceName({
  hostname,
  manufacturer,
  ipAddress,
}: {
  hostname: string;
  manufacturer: string;
  ipAddress: string;
}) {
  const text =
    `${hostname} ${manufacturer}`.toLowerCase();

  if (text.includes("iphone")) {
    return formatHostname(
      hostname,
      "iPhone"
    );
  }

  if (text.includes("ipad")) {
    return formatHostname(
      hostname,
      "iPad"
    );
  }

  if (text.includes("macbook")) {
    return formatHostname(
      hostname,
      "MacBook"
    );
  }

  if (text.includes("imac")) {
    return formatHostname(
      hostname,
      "iMac"
    );
  }

  if (
    text.includes("apple-tv") ||
    text.includes("appletv") ||
    text.includes("apple tv")
  ) {
    return "Apple TV";
  }

  if (
    text.includes("chromecast")
  ) {
    return "Google Chromecast";
  }

  if (
    text.includes("google-home") ||
    text.includes("nest")
  ) {
    return "Google Nest Device";
  }

  if (text.includes("roku")) {
    return "Roku";
  }

  if (
    text.includes("firetv") ||
    text.includes("fire-tv") ||
    text.includes("fire tv")
  ) {
    return "Amazon Fire TV";
  }

  if (text.includes("echo")) {
    return "Amazon Echo";
  }

  if (text.includes("ring")) {
    return "Ring Device";
  }

  if (text.includes("sonos")) {
    return "Sonos Speaker";
  }

  if (text.includes("xbox")) {
    return "Xbox";
  }

  if (
    text.includes("playstation") ||
    text.includes("ps5") ||
    text.includes("ps4")
  ) {
    return "PlayStation";
  }

  if (
    text.includes("brother") ||
    hostname
      .toLowerCase()
      .startsWith("brn")
  ) {
    return "Brother Printer";
  }

  if (text.includes("epson")) {
    return "Epson Printer";
  }

  if (text.includes("canon")) {
    return "Canon Printer";
  }

  if (
    text.includes("hp") &&
    (
      text.includes("printer") ||
      text.includes("officejet") ||
      text.includes("laserjet")
    )
  ) {
    return "HP Printer";
  }

  if (
    text.includes("samsung") &&
    text.includes("tv")
  ) {
    return "Samsung Smart TV";
  }

  if (
    text.includes("lg") &&
    text.includes("tv")
  ) {
    return "LG Smart TV";
  }

  if (
    text.includes("tplink") ||
    text.includes("tp-link")
  ) {
    return "TP-Link Network Device";
  }

  if (text.includes("netgear")) {
    return "Netgear Network Device";
  }

  if (text.includes("eero")) {
    return "Eero Router";
  }

  if (
    hostname &&
    hostname !== "?"
  ) {
    return formatHostname(
      hostname,
      hostname
    );
  }

  if (manufacturer) {
    return `${manufacturer} Device`;
  }

  return `Network Device ${ipAddress}`;
}

function guessManufacturer(
  hostname: string,
  macAddress: string
) {
  const text =
    hostname.toLowerCase();

  const prefix = macAddress
    .replaceAll(":", "")
    .slice(0, 6)
    .toUpperCase();

  if (
    text.includes("apple") ||
    text.includes("iphone") ||
    text.includes("ipad") ||
    text.includes("macbook") ||
    text.includes("appletv")
  ) {
    return "Apple";
  }

  if (text.includes("samsung")) {
    return "Samsung";
  }

  if (
    text.includes("brother") ||
    text.startsWith("brn")
  ) {
    return "Brother";
  }

  if (text.includes("epson")) {
    return "Epson";
  }

  if (text.includes("canon")) {
    return "Canon";
  }

  if (text.includes("roku")) {
    return "Roku";
  }

  if (text.includes("ring")) {
    return "Ring";
  }

  if (text.includes("sonos")) {
    return "Sonos";
  }

  if (
    text.includes("tplink") ||
    text.includes("tp-link")
  ) {
    return "TP-Link";
  }

  if (text.includes("netgear")) {
    return "Netgear";
  }

  if (text.includes("eero")) {
    return "Eero";
  }

  if (
    text.includes("google") ||
    text.includes("nest")
  ) {
    return "Google";
  }

  if (
    text.includes("amazon") ||
    text.includes("echo")
  ) {
    return "Amazon";
  }

  const localPrefixes: Record<
    string,
    string
  > = {
    B827EB: "Raspberry Pi",
    DC4F22: "Raspberry Pi",
    "001A11": "Google",
    F4F5D8: "Google",
    "44650D": "Amazon",
    F0272D: "Amazon",
  };

  return localPrefixes[prefix] || "";
}

function formatHostname(
  hostname: string,
  fallback: string
) {
  if (
    !hostname ||
    hostname === "?"
  ) {
    return fallback;
  }

  return hostname
    .replace(/\.(local|lan)$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function normalizeMacAddress(
  value: string
) {
  return value
    .split(/[:-]/)
    .map((part) =>
      part.padStart(2, "0")
    )
    .join(":")
    .toLowerCase();
}

function extractHostname(
  line: string,
  ipAddress: string
) {
  const hostnameMatch = line.match(
    /^([^\s(]+)\s+\((?:\d{1,3}\.){3}\d{1,3}\)/
  );

  if (
    hostnameMatch &&
    hostnameMatch[1] !== "?" &&
    hostnameMatch[1] !==
      ipAddress
  ) {
    return hostnameMatch[1];
  }

  return "";
}

function compareIpAddresses(
  first: string,
  second: string
) {
  const firstParts = first
    .split(".")
    .map(Number);

  const secondParts = second
    .split(".")
    .map(Number);

  for (
    let index = 0;
    index < 4;
    index += 1
  ) {
    const difference =
      (firstParts[index] || 0) -
      (secondParts[index] || 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

export default function NetworkDiscoveryPage() {
  return (
    <PremiumGate
      feature="Network Discovery"
      description="Automatically discover, identify, and sync devices connected to your home network."
    >
      <NetworkDiscoveryContent />
    </PremiumGate>
  );
}