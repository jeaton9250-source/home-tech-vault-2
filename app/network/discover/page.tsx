"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  History,
  Loader2,
  Network,
  Plus,
  Radar,
  Search,
  ShieldCheck,
  Wifi,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";

import PremiumGate from "@/components/PremiumGate";
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
  alreadyInVault: boolean;
  discoveryId?: string;
};

type ScanHistory = {
  id: string;
  scanned_at: string;
  devices_found: number;
  online_devices: number;
  offline_devices: number;
  new_devices: number;
};

type VaultDevice = {
  id: string;
  device_name: string | null;
  mac_address: string | null;
  ip_address: string | null;
};

function NetworkDiscoveryContent() {
  const router = useRouter();

  const {
    user,
    isDemo,
    loading: demoModeLoading,
  } = useDemoMode();

  const [rawResults, setRawResults] =
    useState("");

  const [devices, setDevices] =
    useState<DiscoveredDevice[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [importing, setImporting] =
    useState(false);

  const [copiedCommand, setCopiedCommand] =
    useState("");

  const [scanHistory, setScanHistory] =
    useState<ScanHistory[]>([]);

  const [scanning, setScanning] =
    useState(false);

  const [loadingHistory, setLoadingHistory] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadScanHistory() {
      if (demoModeLoading) {
        return;
      }

      try {
        setLoadingHistory(true);

        if (isDemo || !user) {
          setScanHistory([]);
          return;
        }

        const { data, error } =
          await supabase
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
            .limit(10);

        if (error) {
          throw error;
        }

        setScanHistory(
          (data || []) as ScanHistory[]
        );
      } catch (error) {
        console.error(
          "Unable to load scan history:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load scan history."
        );
      } finally {
        setLoadingHistory(false);
      }
    }

    loadScanHistory();
  }, [
    user,
    isDemo,
    demoModeLoading,
  ]);

  const filteredDevices = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

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
        value
          .toLowerCase()
          .includes(search)
      )
    );
  }, [devices, searchTerm]);

  const selectableDevices =
    devices.filter(
      (device) =>
        !device.alreadyInVault
    );

  const selectedCount =
    selectableDevices.filter(
      (device) => device.selected
    ).length;

  const protectedCount =
    devices.filter(
      (device) =>
        device.alreadyInVault
    ).length;

  const newDeviceCount =
    selectableDevices.length;

  function toggleAll() {
    const allSelected =
      selectableDevices.length > 0 &&
      selectableDevices.every(
        (device) => device.selected
      );

    setDevices((current) =>
      current.map((device) => {
        if (device.alreadyInVault) {
          return device;
        }

        return {
          ...device,
          selected: !allSelected,
        };
      })
    );
  }

  async function parseResults() {
    if (!rawResults.trim()) {
      alert(
        "Paste your network scan results first."
      );
      return;
    }

    try {
      setScanning(true);
      setErrorMessage("");

      const parsedDevices =
        parseArpOutput(rawResults);

      if (parsedDevices.length === 0) {
        alert(
          "No devices were detected. Make sure you pasted the complete arp -a output."
        );
        return;
      }

      if (isDemo || !user) {
        setDevices(
          parsedDevices.map((device) => ({
            ...device,
            alreadyInVault: false,
            selected: true,
          }))
        );

        return;
      }

      const normalizedMacAddresses =
        parsedDevices
          .map((device) =>
            normalizeMacAddress(
              device.macAddress
            )
          )
          .filter(Boolean);

      let existingRows: VaultDevice[] = [];

      if (
        normalizedMacAddresses.length > 0
      ) {
        const {
          data,
          error: existingError,
        } = await supabase
          .from("devices")
          .select(
            "id, device_name, mac_address, ip_address"
          )
          .eq("user_id", user.id)
          .in(
            "mac_address",
            normalizedMacAddresses
          );

        if (existingError) {
          throw existingError;
        }

        existingRows =
          (data || []) as VaultDevice[];
      }

      const existingMacs = new Set(
        existingRows
          .map((device) =>
            normalizeMacAddress(
              device.mac_address || ""
            )
          )
          .filter(Boolean)
      );

      const comparedDevices =
        parsedDevices.map((device) => {
          const alreadyInVault =
            existingMacs.has(
              normalizeMacAddress(
                device.macAddress
              )
            );

          return {
            ...device,
            alreadyInVault,
            selected: !alreadyInVault,
          };
        });

      const newCount =
        comparedDevices.filter(
          (device) =>
            !device.alreadyInVault
        ).length;

      const {
        data: scanRow,
        error: scanError,
      } = await supabase
        .from("network_scans")
        .insert({
          user_id: user.id,
          devices_found:
            comparedDevices.length,
          online_devices:
            comparedDevices.length,
          offline_devices: 0,
          new_devices: newCount,
        })
        .select("id, scanned_at")
        .single();

      if (scanError) {
        throw scanError;
      }

      const discoveryPayload =
        comparedDevices.map((device) => ({
          scan_id: scanRow.id,
          user_id: user.id,
          device_name:
            device.deviceName ||
            `Network Device ${device.ipAddress}`,
          manufacturer:
            device.manufacturer || null,
          ip_address:
            device.ipAddress || null,
          mac_address:
            normalizeMacAddress(
              device.macAddress
            ) || null,
          online: true,
          added_to_vault:
            device.alreadyInVault,
        }));

      const {
        data: discoveryRows,
        error: discoveryError,
      } = await supabase
        .from("network_discoveries")
        .insert(discoveryPayload)
        .select("id, mac_address");

      if (discoveryError) {
        throw discoveryError;
      }

      const discoveryByMac =
        new Map<string, string>();

      for (const row of discoveryRows || []) {
        const normalizedMac =
          normalizeMacAddress(
            row.mac_address || ""
          );

        if (normalizedMac) {
          discoveryByMac.set(
            normalizedMac,
            row.id
          );
        }
      }

      setDevices(
        comparedDevices.map((device) => ({
          ...device,
          discoveryId:
            discoveryByMac.get(
              normalizeMacAddress(
                device.macAddress
              )
            ),
        }))
      );

      setScanHistory((current) =>
        [
          {
            id: scanRow.id,
            scanned_at:
              scanRow.scanned_at ||
              new Date().toISOString(),
            devices_found:
              comparedDevices.length,
            online_devices:
              comparedDevices.length,
            offline_devices: 0,
            new_devices: newCount,
          },
          ...current,
        ].slice(0, 10)
      );
    } catch (error: unknown) {
  const supabaseError =
    error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };

  console.error("Unable to save network scan:", {
    message: supabaseError?.message,
    code: supabaseError?.code,
    details: supabaseError?.details,
    hint: supabaseError?.hint,
    rawError: error,
  });

  setErrorMessage(
    supabaseError?.message ||
      supabaseError?.details ||
      "Unable to process this network scan."
  );
}

  finally {
    setScanning(false);
  }
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

  async function importSelectedDevices() {
    const selectedDevices =
      devices.filter(
        (device) =>
          device.selected &&
          !device.alreadyInVault
      );

    if (selectedDevices.length === 0) {
      alert(
        "Select at least one device to sync."
      );
      return;
    }

    try {
      setImporting(true);
      setErrorMessage("");

      if (isDemo) {
        router.push("/signup");
        return;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const now =
        new Date().toISOString();

      const normalizedDevices =
        selectedDevices.map((device) => ({
          ...device,
          normalizedMac:
            normalizeMacAddress(
              device.macAddress
            ),
        }));

      const scannedMacAddresses =
        normalizedDevices
          .map(
            (device) =>
              device.normalizedMac
          )
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
        .in(
          "mac_address",
          scannedMacAddresses
        );

      if (existingError) {
        throw existingError;
      }

      const existingByMac = new Map(
        (existingRows || []).map(
          (device) => [
            normalizeMacAddress(
              device.mac_address || ""
            ),
            device,
          ]
        )
      );

      let addedCount = 0;
      let updatedCount = 0;

      for (const discoveredDevice of
        normalizedDevices) {
        const existingDevice =
          existingByMac.get(
            discoveredDevice.normalizedMac
          );

        if (existingDevice) {
          const suggestedName =
            discoveredDevice.deviceName.trim();

          const currentName =
            existingDevice.device_name?.trim() ||
            "";

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
              discoveredDevice.ipAddress ||
              null,
            last_seen_at: now,
            online: true,
            discovery_source:
              "ARP Sync",
          };

          if (
            discoveredDevice.manufacturer.trim()
          ) {
            updatePayload.manufacturer =
              discoveredDevice.manufacturer.trim();

            if (
              !existingDevice.brand?.trim()
            ) {
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

          const {
            error: updateError,
          } = await supabase
            .from("devices")
            .update(updatePayload)
            .eq(
              "id",
              existingDevice.id
            )
            .eq("user_id", user.id);

          if (updateError) {
            throw updateError;
          }

          updatedCount += 1;
          continue;
        }

        const {
          error: insertError,
        } = await supabase
          .from("devices")
          .insert({
            user_id: user.id,
            device_name:
              discoveredDevice
                .deviceName
                .trim() ||
              `Network Device ${discoveredDevice.ipAddress}`,
            category:
              guessCategory(
                discoveredDevice.deviceName,
                discoveredDevice.manufacturer
              ),
            brand:
              discoveredDevice
                .manufacturer
                .trim() ||
              null,
            manufacturer:
              discoveredDevice
                .manufacturer
                .trim() ||
              null,
            ip_address:
              discoveredDevice.ipAddress ||
              null,
            mac_address:
              discoveredDevice.normalizedMac ||
              null,
            location: "Network",
            discovery_source:
              "ARP Sync",
            last_seen_at: now,
            online: true,
            notes:
              "Discovered from a local network scan. Review this record and add its correct room, purchase details, warranty information, photos, and documents.",
          });

        if (insertError) {
          if (
            insertError.message.includes(
              "DEVICE_LIMIT_REACHED"
            )
          ) {
            router.push(
              "/upgrade?reason=device-limit"
            );
            return;
          }

          throw insertError;
        }

        if (
          discoveredDevice.discoveryId
        ) {
          const {
            error:
              discoveryUpdateError,
          } = await supabase
            .from(
              "network_discoveries"
            )
            .update({
              added_to_vault: true,
            })
            .eq(
              "id",
              discoveredDevice.discoveryId
            )
            .eq("user_id", user.id);

          if (
            discoveryUpdateError
          ) {
            console.error(
              "Unable to update discovery record:",
              discoveryUpdateError
            );
          }
        }

        addedCount += 1;
      }

      setDevices((current) =>
        current.map((device) => {
          const imported =
            selectedDevices.some(
              (selectedDevice) =>
                selectedDevice.key ===
                device.key
            );

          if (!imported) {
            return device;
          }

          return {
            ...device,
            selected: false,
            alreadyInVault: true,
          };
        })
      );

      alert(
        [
          `${addedCount} new device${
            addedCount === 1 ? "" : "s"
          } added.`,
          `${updatedCount} existing device${
            updatedCount === 1
              ? ""
              : "s"
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

      setErrorMessage(
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
      await navigator.clipboard.writeText(
        command
      );

      setCopiedCommand(label);

      window.setTimeout(() => {
        setCopiedCommand("");
      }, 1500);
    } catch {
      alert(
        `Copy this command: ${command}`
      );
    }
  }

  function clearResults() {
    setRawResults("");
    setDevices([]);
    setSearchTerm("");
    setErrorMessage("");
  }

  if (
    demoModeLoading ||
    loadingHistory
  ) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Loading Network Discovery...
          </div>
        </PageCard>
      </PageShell>
    );
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

      {errorMessage && (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      )}

      {isDemo && (
        <PageCard className="border-[#D8C69D] bg-[#FFF8E8]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            Interactive Demo
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#111827]">
            Preview network discovery
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Demo scans are not saved. Create an
            account to save scan history and add
            devices to your vault.
          </p>
        </PageCard>
      )}

      {devices.length > 0 && (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <ScanStat
            label="Devices Found"
            value={devices.length}
            icon={Network}
          />

          <ScanStat
            label="Online"
            value={devices.length}
            icon={Wifi}
          />

          <ScanStat
            label="Already Protected"
            value={protectedCount}
            icon={ShieldCheck}
          />

          <ScanStat
            label="New Devices"
            value={newDeviceCount}
            icon={Plus}
          />
        </section>
      )}

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
              Run the command below on a computer
              connected to your home network, then
              paste the complete results into the
              box below.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <CommandCard
            title="macOS"
            command="arp -a"
            copied={
              copiedCommand === "mac"
            }
            onCopy={() =>
              copyCommand(
                "arp -a",
                "mac"
              )
            }
          />

          <CommandCard
            title="Windows"
            command="arp -a"
            copied={
              copiedCommand ===
              "windows"
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
            setRawResults(
              event.target.value
            )
          }
          placeholder={`Example:

living-room-appletv (192.168.1.10) at aa:bb:cc:dd:ee:ff on en0
brother-printer (192.168.1.24) at 11:22:33:44:55:66 on en0`}
          className="mt-6 min-h-64 w-full resize-y rounded-2xl border border-[#E8E2D6] bg-[#FBFAF7] px-5 py-4 font-mono text-sm text-[#111827] outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            onClick={parseResults}
            disabled={scanning}
          >
            {scanning ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Search size={18} />
            )}

            {scanning
              ? "Analyzing Network..."
              : "Detect Devices"}
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
                {protectedCount} already protected
                and {newDeviceCount} available to
                add.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F5EF] px-5 py-3">
              <p className="text-sm font-semibold text-[#111827]">
                {selectedCount} of{" "}
                {selectableDevices.length} new
                devices selected
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
                selectableDevices.length &&
              selectableDevices.length > 0
                ? "Deselect All"
                : "Select All New Devices"}
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
              Devices already stored in your
              vault will not be duplicated.
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

              {isDemo
                ? "Create Vault to Add"
                : importing
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

      <PageCard>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <History size={21} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Scan History
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#111827]">
              Recent network scans
            </h2>
          </div>
        </div>

        {scanHistory.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-[#F7F5EF] p-5 text-sm text-neutral-500">
            {isDemo
              ? "Demo scans are not saved."
              : "No saved scans yet. Run your first scan to begin building network history."}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {scanHistory.map((scan) => (
              <div
                key={scan.id}
                className="grid gap-4 rounded-2xl border border-[#E8E2D6] p-5 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <div>
                  <p className="font-semibold text-[#111827]">
                    {formatScanDate(
                      scan.scanned_at
                    )}
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">
                    {scan.devices_found} devices
                    found
                  </p>
                </div>

                <HistoryMetric
                  label="Online"
                  value={
                    scan.online_devices
                  }
                  className="text-emerald-700"
                />

                <HistoryMetric
                  label="Offline"
                  value={
                    scan.offline_devices
                  }
                  className="text-neutral-600"
                />

                <HistoryMetric
                  label="New"
                  value={
                    scan.new_devices
                  }
                  className="text-[#111827]"
                />
              </div>
            ))}
          </div>
        )}
      </PageCard>
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
        device.alreadyInVault
          ? "border-emerald-200 bg-emerald-50/40"
          : device.selected
            ? "border-[#C8A96A] bg-[#FBFAF7]"
            : "border-[#E8E2D6] bg-white"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <button
          type="button"
          disabled={
            device.alreadyInVault
          }
          onClick={() =>
            onChange({
              selected: !device.selected,
            })
          }
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl disabled:cursor-not-allowed disabled:opacity-60 ${
            device.alreadyInVault
              ? "bg-emerald-100 text-emerald-700"
              : device.selected
                ? "bg-[#111827] text-[#C8A96A]"
                : "bg-[#F7F5EF] text-neutral-400"
          }`}
          aria-label={
            device.alreadyInVault
              ? "Device already in vault"
              : device.selected
                ? "Deselect device"
                : "Select device"
          }
        >
          {device.alreadyInVault ? (
            <ShieldCheck size={21} />
          ) : device.selected ? (
            <CheckCircle2 size={21} />
          ) : (
            <Wifi size={21} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          {device.alreadyInVault && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck size={15} />
              Already in Vault
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">
                Device Name
              </span>

              <input
                value={device.deviceName}
                disabled={
                  device.alreadyInVault
                }
                onChange={(event) =>
                  onChange({
                    deviceName:
                      event.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#C8A96A] disabled:cursor-not-allowed disabled:bg-neutral-100"
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
                disabled={
                  device.alreadyInVault
                }
                onChange={(event) =>
                  onChange({
                    manufacturer:
                      event.target.value,
                  })
                }
                placeholder="Unknown"
                className="w-full rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#C8A96A] disabled:cursor-not-allowed disabled:bg-neutral-100"
              />
            </label>
          </div>
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

function ScanStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Network;
}) {
  return (
    <PageCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
            {label}
          </p>

          <p className="mt-3 text-4xl font-bold text-[#111827]">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={21} />
        </div>
      </div>
    </PageCard>
  );
}

function HistoryMetric({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>

      <p
        className={`mt-1 font-semibold ${className}`}
      >
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

  const lines =
    input.split(/\r?\n/);

  for (const line of lines) {
    const ipMatch =
      line.match(ipPattern);

    const macMatch =
      line.match(macPattern);

    if (!ipMatch || !macMatch) {
      continue;
    }

    const ipAddress =
      ipMatch[0];

    const macAddress =
      normalizeMacAddress(
        macMatch[0]
      );

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

    const hostname =
      extractHostname(
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
      deviceName:
        suggestDeviceName({
          hostname,
          manufacturer,
          ipAddress,
        }),
      selected: true,
      alreadyInVault: false,
    });
  }

  return Array.from(
    found.values()
  ).sort((first, second) =>
    compareIpAddresses(
      first.ipAddress,
      second.ipAddress
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

  return (
    localPrefixes[prefix] || ""
  );
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
    .replace(
      /\.(local|lan)$/i,
      ""
    )
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
  if (!value) {
    return "";
  }

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
  const hostnameMatch =
    line.match(
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
  const firstParts =
    first
      .split(".")
      .map(Number);

  const secondParts =
    second
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