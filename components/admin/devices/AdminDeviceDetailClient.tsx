"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  Copy,
  FileText,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Wifi,
} from "lucide-react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";
import {
  AdminContentSection,
  AdminDetailField,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHero,
  AdminStatusBadge,
} from "@/components/admin/layout/AdminPageLayout";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import {
  getAdminDeviceOnlineLabel,
  getAdminOnlineBadgeTone,
  getAdminWarrantyBadgeTone,
  getAdminWarrantyLabel,
} from "@/lib/admin/devices/status";
import type { AdminDeviceDetail } from "@/lib/admin/types";
import {
  formatLastSeen,
  formatProfileCurrency,
  formatProfileDate,
} from "@/lib/devices/deviceProfileUtils";

type AdminDeviceDetailClientProps = {
  deviceId: string;
};

function displayValue(value: string | null | undefined) {
  return value?.trim() || "Not available";
}

export default function AdminDeviceDetailClient({
  deviceId,
}: AdminDeviceDetailClientProps) {
  const [device, setDevice] =
    useState<AdminDeviceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDevice() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/devices/${deviceId}`
        );

        const payload =
          (await response.json()) as {
            device?: AdminDeviceDetail;
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            payload.error || "Unable to load device."
          );
        }

        if (!cancelled) {
          setDevice(payload.device ?? null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setDevice(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load device."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDevice();

    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  async function copyDeviceId() {
    try {
      await navigator.clipboard.writeText(deviceId);
      setCopyMessage("Device ID copied.");
      window.setTimeout(() => {
        setCopyMessage("");
      }, 2000);
    } catch {
      setCopyMessage("Unable to copy device ID.");
    }
  }

  if (loading) {
    return (
      <AdminLoadingState label="Loading device…" />
    );
  }

  if (error || !device) {
    return (
      <div className="space-y-4">
        <AdminErrorState
          message={error || "Device not found."}
        />
        <Button href="/admin/devices" variant="secondary">
          Back to devices
        </Button>
      </div>
    );
  }

  return (
    <>
      <AdminPageHero
        title={device.deviceName || "Device"}
        description="Read-only customer device view for platform administrators."
        badge={
          <span className="inline-flex rounded-full border border-border-subtle bg-surface-sunken px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
            Read only
          </span>
        }
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              href="/admin/devices"
              variant="secondary"
            >
              <ArrowLeft size={16} />
              All devices
            </Button>
            {device.householdId ? (
              <Button
                href={`/admin/households?${new URLSearchParams({ q: device.householdId }).toString()}`}
                variant="secondary"
              >
                View household
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void copyDeviceId();
              }}
            >
              <Copy size={16} />
              Copy Device ID
            </Button>
          </div>
        }
      />

      {copyMessage ? (
        <p className="rounded-[20px] border border-border-subtle bg-surface-card px-4 py-3 text-sm text-text-secondary shadow-[var(--shadow-sm)]">
          {copyMessage}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PageCard className="overflow-hidden p-0">
          <div className="relative">
            <DeviceImageDisplay
              device={{
                id: device.id,
                device_name: device.deviceName,
                brand: device.brand,
                category: device.category,
                photo_url: device.photoUrl,
              }}
              variant="card"
            />
            {device.category ? (
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-text-primary shadow-sm backdrop-blur">
                {device.category}
              </span>
            ) : null}
          </div>

          <div className="space-y-5 p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              <AdminStatusBadge
                tone={getAdminOnlineBadgeTone(
                  device.onlineStatus
                )}
              >
                {getAdminDeviceOnlineLabel(
                  device.onlineStatus
                )}
              </AdminStatusBadge>
              <AdminStatusBadge
                tone={getAdminWarrantyBadgeTone(
                  device.warrantyStatus
                )}
              >
                {getAdminWarrantyLabel(
                  device.warrantyStatus
                )}
              </AdminStatusBadge>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                {[device.brand, device.modelNumber]
                  .filter(Boolean)
                  .join(" · ") || "Device details"}
              </h2>
              {device.serialNumber ? (
                <p className="mt-2 text-sm text-text-secondary">
                  Serial {device.serialNumber}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoTile
                icon={<MapPin size={16} />}
                label="Location"
                value={displayValue(device.location)}
              />
              <InfoTile
                icon={<ShieldCheck size={16} />}
                label="Warranty expiration"
                value={
                  formatProfileDate(device.warrantyDate) ||
                  "Not available"
                }
              />
              <InfoTile
                icon={<Wifi size={16} />}
                label="Last seen"
                value={
                  formatLastSeen(device.lastSeenAt) ||
                  "Not available"
                }
              />
              <InfoTile
                icon={<HeartPulse size={16} />}
                label="Maintenance records"
                value={String(device.maintenanceCount)}
              />
            </div>
          </div>
        </PageCard>

        <div className="space-y-6">
          <AdminContentSection title="Overview">
            <div className="space-y-4">
              <AdminDetailField
                label="Household"
                value={displayValue(device.householdName)}
              />
              <AdminDetailField
                label="Household owner"
                value={displayValue(
                  device.householdOwnerName ||
                    device.householdOwnerEmail
                )}
              />
              <AdminDetailField
                label="Purchase date"
                value={
                  formatProfileDate(device.purchaseDate) ||
                  "Not available"
                }
              />
              <AdminDetailField
                label="Purchase price"
                value={
                  formatProfileCurrency(
                    device.purchasePrice
                  ) || "Not available"
                }
              />
              <AdminDetailField
                label="Created date"
                value={
                  formatAdminDate(device.createdAt) === "—"
                    ? "Not available"
                    : formatAdminDate(device.createdAt)
                }
              />
            </div>
          </AdminContentSection>

          <AdminContentSection title="Network">
            <div className="space-y-4">
              <AdminDetailField
                label="IP address"
                value={displayValue(device.ipAddress)}
              />
              <AdminDetailField
                label="MAC address"
                value={displayValue(device.macAddress)}
              />
              <AdminDetailField
                label="Manufacturer"
                value={displayValue(device.manufacturer)}
              />
              <AdminDetailField
                label="Discovery source"
                value={displayValue(device.discoverySource)}
              />
              <AdminDetailField
                label="First seen"
                value={
                  formatLastSeen(device.firstSeenAt) ||
                  "Not available"
                }
              />
              <AdminDetailField
                label="Network updated"
                value={
                  formatLastSeen(device.networkUpdatedAt) ||
                  "Not available"
                }
              />
            </div>
          </AdminContentSection>

          <AdminContentSection title="Linked records">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                icon={<FileText size={18} />}
                label="Documents"
                value={device.documentCount}
              />
              <StatCard
                icon={<HeartPulse size={18} />}
                label="Photos"
                value={device.photoCount}
              />
              <StatCard
                icon={<HeartPulse size={18} />}
                label="Maintenance"
                value={device.maintenanceCount}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              Document contents, photo downloads, and maintenance
              actions are not exposed in Control Center.
            </p>
          </AdminContentSection>

          <AdminContentSection title="Customer context">
            <p className="text-sm leading-6 text-text-secondary">
              This page mirrors the household device layout without
              edit, upload, delete, or maintenance actions. Customer
              routes such as{" "}
              <Link
                href={`/devices/${device.id}`}
                className="text-text-primary underline-offset-4 hover:underline"
              >
                /devices/{device.id}
              </Link>{" "}
              remain unchanged and still require household membership.
            </p>
          </AdminContentSection>
        </div>
      </div>
    </>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface-sunken p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-sm text-text-primary">{value}</p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface-sunken p-4 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-text-secondary">
        {icon}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}
