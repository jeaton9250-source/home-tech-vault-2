"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Activity,
  ArrowLeft,
  Camera,
  FileText,
  HeartPulse,
  ImagePlus,
  Laptop,
  Loader2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Radio,
  ShieldCheck,
  Trash2,
  Wifi,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  applyHouseholdMutationScope,
  applyHouseholdScope,
} from "@/lib/data/householdScope";
import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";

import {
  demoDevices,
  demoDocuments,
  getDemoTimelineForDevice,
} from "@/lib/demoData";

import {
  resolveDeviceImage,
} from "@/lib/devices/getDeviceImage";
import { isDemoDeviceAssetPath } from "@/lib/devices/demoDeviceImages";
import {
  displayValue,
  formatNetworkUpdatedAt,
  formatProfileCurrency,
  formatProfileDate,
  getWarrantyPresentation,
} from "@/lib/devices/deviceProfileUtils";
import { getDevicePresence } from "@/lib/devices/devicePresence";
import {
  calculateDeviceHealth,
  getDeviceHealthLabel,
} from "@/lib/calculateDeviceHealth";
import { cn } from "@/lib/design-system/cn";

import { usePermissions } from "@/hooks/usePermissions";

import DeviceDocuments from "@/components/DeviceDocuments";
import DeviceTimeline from "@/components/DeviceTimeline";
import DeviceProfileMaintenance from "@/components/devices/DeviceProfileMaintenance";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ViewerBanner } from "@/components/ui/PermissionUI";

import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { useDeviceNetworkRefresh } from "@/hooks/useDeviceNetworkRefresh";
import { DEMO_CONNECTOR_NAME } from "@/lib/demo/demoDeviceNetworkProfiles";

type Device = {
  id: string;
  user_id?: string;
  household_id?: string | null;
  device_name: string | null;
  category: string | null;
  brand: string | null;
  model_number: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_date: string | null;
  purchase_price: number | null;
  location: string | null;
  notes: string | null;
  online?: boolean | null;
  last_seen_at?: string | null;
  ip_address?: string | null;
  mac_address?: string | null;
  manufacturer?: string | null;
  discovery_source?: string | null;
  hostname?: string | null;
  connector_id?: string | null;
  network_fingerprint?: string | null;
  first_seen_at?: string | null;
  network_updated_at?: string | null;
};

type DeviceImageRow = {
  id: string;
  device_id: string;
  user_id: string;
  image_url: string;
  created_at: string | null;
};

type DeviceImage = DeviceImageRow & {
  signedUrl: string;
};

type DeviceDetailTab =
  | "overview"
  | "documents"
  | "maintenance"
  | "warranty"
  | "network"
  | "timeline";

const DEVICE_TABS: {
  id: DeviceDetailTab;
  label: string;
}[] = [
  { id: "overview", label: "Overview" },
  { id: "documents", label: "Documents" },
  { id: "maintenance", label: "Maintenance" },
  { id: "warranty", label: "Warranty" },
  { id: "network", label: "Network" },
  { id: "timeline", label: "Timeline" },
];

function resolveDeviceDetailTab(
  value: string | null
): DeviceDetailTab {
  if (value === "activity" || value === "photos") {
    return value === "photos" ? "overview" : "timeline";
  }

  const match = DEVICE_TABS.find((tab) => tab.id === value);

  return match?.id ?? "overview";
}

export default function DevicePage() {
  const params = useParams<{
    id: string;
  }>();

  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    user,
    isDemo,
    householdId,
    canEdit,
    canUpload,
    canDelete,
    loading: permissionsLoading,
  } = usePermissions();

  const showReadOnlyModal =
    useDemoReadOnlyAction();

  const deviceId = params.id;

  const [device, setDevice] =
    useState<Device | null>(null);

  const [images, setImages] =
    useState<DeviceImage[]>([]);

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState(0);

  const [
    loadingDevice,
    setLoadingDevice,
  ] = useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [
    deletingDevice,
    setDeletingDevice,
  ] = useState(false);

  const [
    deletingImageId,
    setDeletingImageId,
  ] = useState<string | null>(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [documentCount, setDocumentCount] =
    useState<number | null>(null);

  const [activeTab, setActiveTab] =
    useState<DeviceDetailTab>(() =>
      resolveDeviceDetailTab(searchParams.get("tab"))
    );

  const [actionsOpen, setActionsOpen] =
    useState(false);

  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(
      resolveDeviceDetailTab(searchParams.get("tab"))
    );
  }, [searchParams]);

  function selectTab(tab: DeviceDetailTab) {
    setActiveTab(tab);

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }

    const query = params.toString();

    router.replace(
      query
        ? `/devices/${deviceId}?${query}`
        : `/devices/${deviceId}`,
      { scroll: false }
    );
  }

  const sampleDocuments = useMemo(
    () =>
      demoDocuments.filter(
        (document) =>
          document.device_id === deviceId
      ),
    [deviceId]
  );

  const demoDeviceRecord = useMemo(
    () =>
      demoDevices.find((item) => item.id === deviceId) ??
      null,
    [deviceId]
  );

  const demoTimeline = useMemo(() => {
    if (!demoDeviceRecord) {
      return [];
    }

    return getDemoTimelineForDevice(demoDeviceRecord);
  }, [demoDeviceRecord]);

  const loadImages = useCallback(
    async (
      selectedDeviceId: string
    ) => {
      const {
        data,
        error,
      } = await supabase
        .from("device_images")
        .select("*")
        .eq(
          "device_id",
          selectedDeviceId
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const rows =
        (data ?? []) as DeviceImageRow[];

      const imagesWithUrls =
        await Promise.all(
          rows.map(async (image) => {
            const {
              data: signedData,
              error: signedError,
            } =
              await supabase.storage
                .from(
                  "device-images"
                )
                .createSignedUrl(
                  image.image_url,
                  3600
                );

            if (signedError) {
              console.error(
                "Unable to create signed image URL:",
                signedError
              );
            }

            return {
              ...image,
              signedUrl:
                signedData?.signedUrl ??
                "",
            };
          })
        );

      const validImages =
        imagesWithUrls.filter(
          (image) =>
            Boolean(image.signedUrl)
        );

      setImages(validImages);

      setSelectedImageIndex(
        (currentIndex) =>
          validImages.length === 0
            ? 0
            : Math.min(
                currentIndex,
                validImages.length - 1
              )
      );
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingDevice(true);
        setErrorMessage("");

        if (!deviceId) {
          if (!mounted) {
            return;
          }

          setDevice(null);
          setErrorMessage(
            "Invalid device ID."
          );

          return;
        }

        if (isDemo || !user) {
          const sampleDevice =
            demoDevices.find(
              (item) =>
                item.id === deviceId
            );

          if (!mounted) {
            return;
          }

          if (!sampleDevice) {
            setDevice(null);
            setErrorMessage(
              "Demo device not found."
            );

            return;
          }

          setDevice({
            id: sampleDevice.id,
            device_name:
              sampleDevice.device_name,
            category:
              sampleDevice.category,
            brand:
              sampleDevice.brand,
            model_number:
              sampleDevice.model_number,
            serial_number:
              sampleDevice.serial_number,
            purchase_date:
              sampleDevice.purchase_date,
            warranty_date:
              sampleDevice.warranty_date,
            purchase_price:
              sampleDevice.purchase_price,
            location:
              sampleDevice.location,
            notes:
              sampleDevice.notes,
            online:
              sampleDevice.online,
            last_seen_at:
              sampleDevice.last_seen_at,
            ip_address:
              sampleDevice.ip_address,
            mac_address:
              sampleDevice.mac_address,
            manufacturer:
              sampleDevice.manufacturer,
            discovery_source:
              sampleDevice.discovery_source,
            hostname: sampleDevice.hostname ?? null,
            connector_id: sampleDevice.connector_id ?? null,
            first_seen_at: sampleDevice.first_seen_at ?? null,
            network_updated_at:
              sampleDevice.network_updated_at ?? null,
            network_fingerprint: sampleDevice.connector_id
              ? `demo:${sampleDevice.id}`
              : null,
          });

          const demoImage =
            resolveDeviceImage({
              id: sampleDevice.id,
              device_name:
                sampleDevice.device_name,
              brand:
                sampleDevice.brand,
              category:
                sampleDevice.category,
              demo_image:
                sampleDevice.demo_image,
            });

          if (demoImage.src) {
            setImages([
              {
                id: "demo-image-primary",
                device_id:
                  sampleDevice.id,
                user_id: "demo",
                image_url:
                  sampleDevice.demo_image,
                created_at: null,
                signedUrl:
                  demoImage.src,
              },
            ]);
          } else {
            setImages([]);
          }

          setDocumentCount(
            demoDocuments.filter(
              (document) =>
                document.device_id === deviceId
            ).length
          );

          return;
        }

        const deviceQuery =
          applyHouseholdScope(
            supabase
              .from("devices")
              .select("*")
              .eq("id", deviceId),
            householdId,
            user.id
          );

        const {
          data: deviceData,
          error: deviceError,
        } =
          await deviceQuery.maybeSingle();

        if (deviceError) {
          throw deviceError;
        }

        if (!mounted) {
          return;
        }

        if (!deviceData) {
          setDevice(null);
          setErrorMessage(
            "Device not found."
          );

          return;
        }

        setDevice(
          deviceData as Device
        );

        await loadImages(deviceId);

        const {
          count,
          error: documentCountError,
        } = await supabase
          .from("device_documents")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("device_id", deviceId);

        if (documentCountError) {
          console.error(
            "Unable to load document count:",
            documentCountError
          );

          if (mounted) {
            setDocumentCount(null);
          }
        } else if (mounted) {
          setDocumentCount(count ?? 0);
        }
      } catch (error: unknown) {
        console.error(
          "Unable to load device page:",
          error
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this device."
        );
      } finally {
        if (mounted) {
          setLoadingDevice(false);
        }
      }
    }

    void loadPage();

    return () => {
      mounted = false;
    };
  }, [
    deviceId,
    user,
    isDemo,
    householdId,
    permissionsLoading,
    loadImages,
  ]);

  useEffect(() => {
    if (!actionsOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (actionsRef.current?.contains(target)) {
        return;
      }

      setActionsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [actionsOpen]);

  const handleDeviceNetworkUpdate = useCallback(
    (fields: Partial<Device>) => {
      setDevice((current) =>
        current ? { ...current, ...fields } : current
      );
    },
    []
  );

  const {
    connectorName,
    connectorStatusMayBeOutdated,
  } = useDeviceNetworkRefresh(
    {
      deviceId,
      householdId,
      userId: user?.id ?? null,
      enabled: Boolean(device && user && !isDemo && householdId),
    },
    device,
    handleDeviceNetworkUpdate
  );

  function redirectViewer() {
    if (isDemo || !user) {
      showReadOnlyModal();
      return;
    }

    router.push("/devices");
  }

  function handleEditDevice() {
    if (!device) {
      return;
    }

    if (!canEdit) {
      redirectViewer();
      return;
    }

    router.push(
      "/devices/" +
        device.id +
        "/edit"
    );
  }

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    if (!canUpload || !user) {
      event.target.value = "";
      redirectViewer();
      return;
    }

    const files = Array.from(
      event.target.files ?? []
    );

    if (
      !device ||
      files.length === 0
    ) {
      return;
    }

    try {
      setUploading(true);

      for (const file of files) {
        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          throw new Error(
            file.name +
              " is not an image."
          );
        }

        if (
          file.size >
          6 * 1024 * 1024
        ) {
          throw new Error(
            file.name +
              " must be smaller than 6 MB."
          );
        }

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() ??
          "jpg";

        const filePath =
          user.id +
          "/" +
          device.id +
          "/" +
          crypto.randomUUID() +
          "." +
          extension;

        const {
          error: uploadError,
        } =
          await supabase.storage
            .from("device-images")
            .upload(
              filePath,
              file,
              {
                cacheControl:
                  "3600",
                contentType:
                  file.type,
                upsert: false,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        const {
          error: recordError,
        } = await supabase
          .from("device_images")
          .insert({
            device_id:
              device.id,
            user_id:
              user.id,
            image_url:
              filePath,
          });

        if (recordError) {
          await supabase.storage
            .from("device-images")
            .remove([filePath]);

          throw recordError;
        }
      }

      await recordActivity({
        activityType: "photo.uploaded",
        title:
          files.length === 1
            ? "Photo uploaded"
            : `${files.length} photos uploaded`,
        description:
          files.length === 1
            ? "A new device photo was added to the vault."
            : `${files.length} new device photos were added to the vault.`,
        userId: user.id,
        householdId,
        deviceId: device.id,
      });

      event.target.value = "";

      setSelectedImageIndex(0);

      await loadImages(
        device.id
      );
    } catch (error: unknown) {
      console.error(
        "Unable to upload image:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to upload the photo."
      );
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(
    image: DeviceImage
  ) {
    if (!canDelete || !user) {
      redirectViewer();
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this photo?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingImageId(
        image.id
      );

      const {
        error: storageError,
      } =
        await supabase.storage
          .from("device-images")
          .remove([
            image.image_url,
          ]);

      if (storageError) {
        throw storageError;
      }

      const {
        error: databaseError,
      } = await applyHouseholdMutationScope(
        supabase
          .from("device_images")
          .delete()
          .eq("id", image.id),
        householdId,
        user.id
      );

      if (databaseError) {
        throw databaseError;
      }

      setImages(
        (currentImages) =>
          currentImages.filter(
            (currentImage) =>
              currentImage.id !==
              image.id
          )
      );

      setSelectedImageIndex(0);
    } catch (error: unknown) {
      console.error(
        "Unable to delete image:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete the photo."
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  async function deleteDevice() {
    if (!canDelete || !user) {
      redirectViewer();
      return;
    }

    if (
      !device ||
      deletingDevice
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete "' +
          (device.device_name ||
            "this device") +
          '"? This cannot be undone.'
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingDevice(true);

      const response = await fetch(
        `/api/devices/${encodeURIComponent(device.id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        }
      );

      const payload = (await response
        .json()
        .catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            `Unable to delete this device (${response.status}).`
        );
      }

      await recordActivity({
        activityType: "device.deleted",
        title: getDefaultActivityTitle(
          "device.deleted",
          device.device_name ||
            "Device"
        ),
        description:
          "Device removed from the vault.",
        userId: user.id,
        householdId,
        deviceId: device.id,
      });

      router.push("/devices");
      router.refresh();
    } catch (error: unknown) {
      console.error(
        "Unable to delete device:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete this device."
      );
    } finally {
      setDeletingDevice(false);
    }
  }

  const profilePhotos = useMemo(
    () =>
      images.map((image) => ({
        id: image.id,
        src: image.signedUrl,
        isDemoAsset: isDemoDeviceAssetPath(image.signedUrl),
      })),
    [images]
  );

  const profileDocuments = useMemo(
    () =>
      sampleDocuments.map((document) => ({
        id: document.id,
        name: document.document_name,
        type: document.document_type,
        fileName: document.file_name,
        dateAdded: document.created_at,
      })),
    [sampleDocuments]
  );

  const profileTimeline = useMemo(
    () =>
      demoTimeline.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.event_date,
      })),
    [demoTimeline]
  );

  const loading =
    permissionsLoading ||
    loadingDevice;

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              className="animate-spin"
              size={22}
            />

            Loading device...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (
    errorMessage ||
    !device
  ) {
    return (
      <PageShell>
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
            <Laptop size={28} />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
            Device not found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
            {errorMessage ||
              "This device could not be loaded."}
          </p>

          <Button
            href="/devices"
            className="mt-6"
          >
            <ArrowLeft size={17} />
            Back to Devices
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  const isGuestDemo = isDemo || !user;

  const demoConnectorName = isGuestDemo ? DEMO_CONNECTOR_NAME : null;
  const resolvedConnectorName = isGuestDemo
    ? demoConnectorName
    : connectorName;

  const warranty = getWarrantyPresentation(device.warranty_date);

  const healthScore = calculateDeviceHealth({
    photo_url: images.length > 0 ? "present" : undefined,
    serial_number: device.serial_number ?? undefined,
    warranty_date: device.warranty_date ?? undefined,
    purchase_date: device.purchase_date ?? undefined,
    purchase_price: device.purchase_price ?? undefined,
    location: device.location ?? undefined,
    notes: device.notes ?? undefined,
  });

  const healthLabel = getDeviceHealthLabel(healthScore);

  const devicePresence = getDevicePresence({
    online: device.online,
    lastSeenAt: device.last_seen_at,
    firstSeenAt: device.first_seen_at,
    networkUpdatedAt: device.network_updated_at,
  });

  const statusBadge = devicePresence.badge;

  const brandModel = [device.brand, device.model_number]
    .filter(Boolean)
    .join(" · ");

  const hasNetworkMatch = Boolean(
    device.connector_id ||
      device.network_fingerprint ||
      device.network_updated_at
  );

  const hasNetwork = Boolean(
    hasNetworkMatch ||
      device.ip_address ||
      device.mac_address ||
      device.hostname ||
      device.manufacturer ||
      device.discovery_source ||
      device.last_seen_at ||
      device.online !== null
  );

  const recentActivity = profileTimeline.slice(0, 3);

  const selectedPhoto =
    profilePhotos[selectedImageIndex] ?? profilePhotos[0] ?? null;

  function handleDeleteAction() {
    setActionsOpen(false);

    if (!canDelete) {
      redirectViewer();
      return;
    }

    void deleteDevice();
  }

  return (
    <PageShell className="space-y-6 pb-10">
      <header className="space-y-4">
        <Link
          href="/devices"
          className="htv-focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-text-secondary transition hover:text-text-primary"
        >
          <ArrowLeft size={17} aria-hidden />
          Back to Devices
        </Link>

        {!canEdit && !isGuestDemo ? (
          <ViewerBanner description="You can view this device, its photos, documents, network details, and history. Viewer access cannot edit, upload, or delete anything." />
        ) : null}

        <PageCard className="p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                    statusBadge.className
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      statusBadge.dotClassName
                    )}
                    aria-hidden
                  />
                  {statusBadge.label}
                </span>

                {device.category ? (
                  <span className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-text-secondary">
                    {device.category}
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
                {displayValue(device.device_name, "Unnamed Device")}
              </h1>

              <p className="text-base text-text-secondary">
                {brandModel || "Brand and model not provided"}
              </p>

              <p className="inline-flex items-center gap-2 text-sm text-text-muted">
                <MapPin size={15} aria-hidden />
                {device.location?.trim() || "Location not provided"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleEditDevice}
              >
                <Pencil size={16} />
                Edit Device
              </Button>

              <div className="relative" ref={actionsRef}>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Device actions"
                  aria-haspopup="menu"
                  aria-expanded={actionsOpen}
                  onClick={() => setActionsOpen((open) => !open)}
                  className="px-3"
                >
                  <MoreHorizontal size={18} />
                </Button>

                {actionsOpen ? (
                  <div
                    role="menu"
                    aria-label="Device actions"
                    className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-[var(--radius-dialog)] border border-border-subtle bg-surface-card shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      disabled={deletingDevice}
                      onClick={handleDeleteAction}
                      className="htv-focus-ring flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-danger transition hover:bg-danger-soft"
                    >
                      {deletingDevice ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {deletingDevice ? "Deleting..." : "Delete Device"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </PageCard>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          icon={HeartPulse}
          label="Device Health"
          value={`${healthScore}/100`}
          detail={healthLabel}
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Warranty Status"
          value={warranty.shortLabel}
          detail={warranty.label}
          valueClassName={
            warranty.tone === "protected"
              ? "text-home-health"
              : warranty.tone === "warning"
                ? "text-warning"
                : warranty.tone === "expired"
                  ? "text-danger"
                  : undefined
          }
        />
        <SummaryCard
          icon={Radio}
          label="Last Seen"
          value={devicePresence.lastActiveLabel}
          detail={devicePresence.label}
        />
        <SummaryCard
          icon={FileText}
          label="Documents"
          value={
            documentCount == null
              ? "—"
              : String(documentCount)
          }
          detail={
            documentCount == null
              ? "Count unavailable"
              : documentCount === 1
                ? "1 file on record"
                : `${documentCount} files on record`
          }
        />
        <SummaryCard
          icon={Camera}
          label="Photos"
          value={String(images.length)}
          detail={
            images.length === 1
              ? "1 photo saved"
              : `${images.length} photos saved`
          }
        />
      </div>

      <div className="border-b border-border-subtle">
        <div
          className="-mb-px flex gap-1 overflow-x-auto pb-px"
          role="tablist"
          aria-label="Device detail sections"
        >
          {DEVICE_TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`device-panel-${tab.id}`}
                id={`device-tab-${tab.id}`}
                onClick={() => selectTab(tab.id)}
                className={cn(
                  "htv-focus-ring shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "border-charcoal text-text-primary"
                    : "border-transparent text-text-secondary hover:border-border-subtle hover:text-text-primary"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`device-panel-${activeTab}`}
        aria-labelledby={`device-tab-${activeTab}`}
      >
        {activeTab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <PageCard className="p-6 md:p-8">
                <SectionHeading title="Device information" />
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoItem label="Brand" value={device.brand} />
                  <InfoItem label="Model" value={device.model_number} />
                  <InfoItem label="Category" value={device.category} />
                  <InfoItem
                    label="Serial number"
                    value={device.serial_number}
                    showEmpty
                  />
                </dl>
              </PageCard>

              <PageCard className="p-6 md:p-8">
                <SectionHeading title="Purchase information" />
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Purchase date"
                    value={formatProfileDate(device.purchase_date)}
                  />
                  <InfoItem
                    label="Purchase price"
                    value={formatProfileCurrency(device.purchase_price)}
                  />
                </dl>
              </PageCard>

              <PageCard className="p-6 md:p-8">
                <SectionHeading title="Location" />
                <p className="mt-5 text-sm leading-6 text-text-primary">
                  {device.location?.trim() || "Not provided"}
                </p>
              </PageCard>

              <PageCard className="p-6 md:p-8">
                <SectionHeading title="Notes" />
                {device.notes?.trim() ? (
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-text-primary">
                    {device.notes}
                  </p>
                ) : (
                  <p className="mt-5 text-sm text-text-secondary">
                    No notes have been added yet.
                  </p>
                )}
              </PageCard>

              <PageCard className="p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-overline text-section-technology">Photos</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-text-primary">
                      Device photos
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      Keep clear images to identify this device later.
                    </p>
                  </div>

                  {canUpload ? (
                    <label className="htv-focus-ring inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-2.5 text-sm font-semibold text-text-primary shadow-[var(--shadow-sm)] transition hover:bg-surface-hover">
                      {uploading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ImagePlus size={16} />
                      )}
                      {uploading ? "Uploading..." : "Upload photos"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploading}
                        onChange={handleUpload}
                        className="hidden"
                      />
                    </label>
                  ) : isGuestDemo ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={showReadOnlyModal}
                    >
                      <ImagePlus size={16} />
                      Upload photos
                    </Button>
                  ) : null}
                </div>

                {profilePhotos.length === 0 ? (
                  <div className="mt-6 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken/60 p-8 text-center">
                    <Camera size={28} className="mx-auto text-text-tertiary" />
                    <p className="mt-4 text-sm font-medium text-text-primary">
                      No photos have been added yet.
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      Add clear photos to make this device easy to identify later.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-6 overflow-hidden rounded-[24px] border border-border-subtle bg-surface-sunken">
                      <div className="relative aspect-[16/10]">
                        {selectedPhoto ? (
                          <Image
                            src={selectedPhoto.src}
                            alt={`${device.device_name ?? "Device"} preview`}
                            fill
                            unoptimized={
                              selectedPhoto.isDemoAsset ||
                              selectedPhoto.src.startsWith("http")
                            }
                            className="object-cover object-center"
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {profilePhotos.map((photo, index) => {
                        const active = index === selectedImageIndex;

                        return (
                          <div
                            key={photo.id}
                            className="group relative aspect-[4/3] overflow-hidden rounded-[20px] border border-border-subtle bg-surface-sunken"
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedImageIndex(index)}
                              className={cn(
                                "htv-focus-ring absolute inset-0",
                                active && "ring-2 ring-charcoal ring-offset-2"
                              )}
                              aria-label={`View photo ${index + 1}`}
                              aria-pressed={active}
                            >
                              <Image
                                src={photo.src}
                                alt=""
                                fill
                                unoptimized={
                                  photo.isDemoAsset ||
                                  photo.src.startsWith("http")
                                }
                                className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                              />
                            </button>

                            {canDelete ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const image = images.find(
                                    (item) => item.id === photo.id
                                  );

                                  if (image) {
                                    void deleteImage(image);
                                  }
                                }}
                                disabled={deletingImageId === photo.id}
                                aria-label="Delete photo"
                                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/70 text-surface-card opacity-100 backdrop-blur transition hover:bg-danger md:opacity-0 md:group-hover:opacity-100"
                              >
                                {deletingImageId === photo.id ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </PageCard>
            </div>

            <div className="space-y-6">
              <PageCard className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-3">
                  <SectionHeading title="Recent activity" />
                  <button
                    type="button"
                    onClick={() => selectTab("timeline")}
                    className="htv-focus-ring text-sm font-medium text-interaction hover:text-interaction-hover"
                  >
                    View all
                  </button>
                </div>

                {isGuestDemo ? (
                  recentActivity.length === 0 ? (
                    <p className="mt-5 text-sm text-text-secondary">
                      No recent activity recorded for this device.
                    </p>
                  ) : (
                    <ol className="mt-5 space-y-3">
                      {recentActivity.map((event) => (
                        <li
                          key={event.id}
                          className="rounded-[20px] border border-border-subtle bg-surface-sunken/50 p-4"
                        >
                          <p className="text-sm font-semibold text-text-primary">
                            {event.title}
                          </p>
                          <p className="mt-1 text-xs text-text-tertiary">
                            {formatProfileDate(event.date.slice(0, 10))}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )
                ) : (
                  <div className="mt-5">
                    <p className="text-sm leading-6 text-text-secondary">
                      Purchases, uploads, warranty changes, and maintenance
                      updates appear in the Timeline tab.
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-4"
                      onClick={() => selectTab("timeline")}
                    >
                      <Activity size={16} />
                      Open Timeline
                    </Button>
                  </div>
                )}
              </PageCard>
            </div>
          </div>
        ) : null}

        {activeTab === "warranty" ? (
          <PageCard className="p-6 md:p-8">
            <SectionHeading title="Warranty coverage" />
            <div className="mt-5 space-y-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                  warranty.className
                )}
              >
                {warranty.label}
              </span>
              <dl className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Warranty ends"
                  value={formatProfileDate(device.warranty_date)}
                  showEmpty
                />
                {warranty.daysRemaining != null &&
                warranty.daysRemaining >= 0 ? (
                  <InfoItem
                    label="Days remaining"
                    value={String(warranty.daysRemaining)}
                  />
                ) : null}
                <InfoItem
                  label="Purchase date"
                  value={formatProfileDate(device.purchase_date)}
                />
                <InfoItem
                  label="Purchase price"
                  value={formatProfileCurrency(device.purchase_price)}
                />
              </dl>
              <div className="pt-2">
                <Button href={`/devices/${device.id}/edit`} variant="secondary">
                  <Pencil size={16} />
                  Update warranty details
                </Button>
              </div>
            </div>
          </PageCard>
        ) : null}

        {activeTab === "network" ? (
          <PageCard className="p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-sm)]">
                <Wifi size={20} />
              </div>
              <div>
                <p className="text-overline text-section-technology">Network</p>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                  Network details
                </h2>
              </div>
            </div>

            {connectorStatusMayBeOutdated ? (
              <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                Connector online. Device status may be outdated.
              </p>
            ) : null}

            {hasNetwork ? (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <DetailCard
                    label="Online status"
                    value={devicePresence.label}
                  />
                  <DetailCard
                    label="Last seen"
                    value={devicePresence.lastActiveLabel}
                  />
                  <DetailCard
                    label="IP address"
                    value={displayValue(device.ip_address, "Not provided")}
                  />
                  <DetailCard
                    label="MAC address"
                    value={displayValue(device.mac_address, "Not provided")}
                  />
                  <DetailCard
                    label="Manufacturer"
                    value={displayValue(device.manufacturer, "Not provided")}
                  />
                  <DetailCard
                    label="Discovery source"
                    value={displayValue(device.discovery_source, "Not provided")}
                  />
                  {device.hostname ? (
                    <DetailCard
                      label="Hostname"
                      value={device.hostname}
                    />
                  ) : null}
                  <DetailCard
                    label="Connector"
                    value={displayValue(
                      resolvedConnectorName,
                      "Home Tech Vault Connector"
                    )}
                  />
                  {device.first_seen_at ? (
                    <DetailCard
                      label="First detected"
                      value={
                        formatProfileDate(device.first_seen_at) ??
                        "Not recorded"
                      }
                    />
                  ) : null}
                  {device.network_updated_at ? (
                    <DetailCard
                      label="Last network update"
                      value={formatNetworkUpdatedAt(device.network_updated_at)}
                    />
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/network/discovery" variant="secondary">
                    Review discovery
                  </Button>
                  <Button href="/network?tab=monitoring" variant="ghost">
                    View monitoring
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-6">
                <EmptyState
                  icon={Wifi}
                  title="No network details yet"
                  description="Network details will appear after this device is detected by a Home Tech Vault connector."
                  actionLabel="Match Network Device"
                  actionHref="/network/discovery"
                  className="shadow-none"
                />
              </div>
            )}
          </PageCard>
        ) : null}

        {activeTab === "documents" ? (
          isGuestDemo ? (
            <PageCard className="p-6 md:p-8">
              <SectionHeading title="Documents" />
              {profileDocuments.length === 0 ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken/60 p-8 text-center">
                  <FileText size={28} className="mx-auto text-text-tertiary" />
                  <p className="mt-4 text-sm font-medium text-text-primary">
                    No documents have been added yet.
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    Upload receipts or manuals to keep everything in one place.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {profileDocuments.map((document) => (
                    <article
                      key={document.id}
                      className="rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-text-primary">
                            {document.fileName}
                          </p>
                          <p className="mt-1 text-sm text-text-secondary">
                            {document.type}
                          </p>
                          <p className="mt-1 text-xs text-text-tertiary">
                            Added{" "}
                            {formatProfileDate(document.dateAdded.slice(0, 10))}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </PageCard>
          ) : (
            <PageCard className="p-6 md:p-8">
              <DeviceDocuments deviceId={device.id} embedded />
            </PageCard>
          )
        ) : null}

        {activeTab === "maintenance" ? (
          <DeviceProfileMaintenance
            deviceId={device.id}
            onReadOnlyAction={showReadOnlyModal}
            embedded
          />
        ) : null}

        {activeTab === "timeline" ? (
          isGuestDemo ? (
            <PageCard className="p-6 md:p-8">
              <SectionHeading title="Device history" />
              {profileTimeline.length === 0 ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken/60 p-8 text-center">
                  <p className="text-sm font-medium text-text-primary">
                    No timeline events have been recorded yet.
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    Purchases, uploads, and maintenance will appear here over
                    time.
                  </p>
                </div>
              ) : (
                <ol className="relative mt-6 space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border-subtle">
                  {profileTimeline.map((event) => (
                    <li key={event.id} className="relative pl-8">
                      <span
                        className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-4 border-surface-card bg-home-health shadow-sm"
                        aria-hidden
                      />
                      <article className="rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-text-primary">
                              {event.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                              {event.description}
                            </p>
                          </div>
                          <time
                            dateTime={event.date}
                            className="shrink-0 text-xs text-text-tertiary"
                          >
                            {formatProfileDate(event.date.slice(0, 10))}
                          </time>
                        </div>
                      </article>
                    </li>
                  ))}
                </ol>
              )}
            </PageCard>
          ) : (
            <PageCard className="p-6 md:p-8">
              <DeviceTimeline
                embedded
                deviceId={device.id}
                purchaseDate={device.purchase_date}
                warrantyDate={device.warranty_date}
              />
            </PageCard>
          )
        ) : null}
      </div>
    </PageShell>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="text-xl font-semibold tracking-[-0.03em] text-text-primary">
      {title}
    </h2>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  valueClassName,
}: {
  icon: typeof Camera;
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
}) {
  return (
    <PageCard className="p-4 md:p-5" elevated>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-sunken text-charcoal">
          <Icon size={16} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 truncate text-lg font-semibold text-text-primary",
              valueClassName
            )}
          >
            {value}
          </p>
          <p className="mt-0.5 truncate text-xs text-text-secondary">
            {detail}
          </p>
        </div>
      </div>
    </PageCard>
  );
}

function InfoItem({
  label,
  value,
  showEmpty = false,
}: {
  label: string;
  value?: string | null;
  showEmpty?: boolean;
}) {
  const trimmed = value?.trim();

  if (!trimmed && !showEmpty) {
    return null;
  }

  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-medium text-text-primary">
        {trimmed || "Not provided"}
      </dd>
    </div>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface-sunken/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}
