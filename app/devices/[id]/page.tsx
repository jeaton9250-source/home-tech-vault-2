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

import {
  retryDeviceManualLookup,
} from "@/app/devices/actions";

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

  manual_status?:
    | "pending"
    | "found"
    | "not_found"
    | null;

  manual_checked_at?: string | null;
  manual_url?: string | null;
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
  { id: "network", label: "Home Wi-Fi" },
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

  const activeTab = useMemo(
    () => resolveDeviceDetailTab(searchParams.get("tab")),
    [searchParams]
  );

  const [actionsOpen, setActionsOpen] =
    useState(false);

  const actionsRef = useRef<HTMLDivElement>(null);

  const [
    manualFinderOpen,
    setManualFinderOpen,
  ] = useState(false);

  const [
    manualFinderModel,
    setManualFinderModel,
  ] = useState("");

  const [
    manualFinderPending,
    setManualFinderPending,
  ] = useState(false);

  const [
    manualFinderMessage,
    setManualFinderMessage,
  ] = useState("");

  async function handleForceManualRerun() {
    if (
      !device ||
      manualFinderPending
    ) {
      return;
    }

    const modelNumber =
      device.model_number?.trim();

    if (!modelNumber) {
      setManualFinderModel("");
      setManualFinderMessage(
        "Enter the full model number from the product label."
      );
      setManualFinderOpen(true);
      return;
    }

    const confirmed =
      window.confirm(
        "Search again for a verified official manual?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setManualFinderPending(true);

      const result =
        await retryDeviceManualLookup({
          deviceId: device.id,
          modelNumber,
          force: true,
        });

      if (!result.success) {
        alert(result.error);
        return;
      }

      if (
        result.status === "found"
      ) {
        window.location.assign(
          `/devices/${device.id}?tab=documents`
        );
        return;
      }

      alert(
        "No new verified official manual was found."
      );
    } catch (error) {
      console.error(
        "Unable to rerun manual lookup:",
        error
      );

      alert(
        "Unable to rerun the manual lookup."
      );
    } finally {
      setManualFinderPending(false);
    }
  }

  async function handleManualFinderSearch() {
    if (
      !device ||
      manualFinderPending
    ) {
      return;
    }

    const modelNumber =
      manualFinderModel
        .trim();

    if (!modelNumber) {
      setManualFinderMessage(
        "Enter the full model number from the product label."
      );

      return;
    }

    try {
      setManualFinderPending(
        true
      );

      setManualFinderMessage(
        ""
      );

      /*
       * Show immediate feedback without writing
       * a temporary DB status that could become
       * stuck if a remote lookup fails.
       */
      setDevice(
        (current) =>
          current
            ? {
                ...current,
                manual_status:
                  "pending",
              }
            : current
      );

      const result =
        await retryDeviceManualLookup({
          deviceId:
            device.id,

          modelNumber,
        });

      if (!result.success) {
        setDevice(
          (current) =>
            current
              ? {
                  ...current,
                  manual_status:
                    "not_found",
                }
              : current
        );

        setManualFinderMessage(
          result.error
        );

        return;
      }

      if (
        result.status ===
        "found"
      ) {
        setDevice(
          (current) =>
            current
              ? {
                  ...current,

                  model_number:
                    result.modelNumber,

                  manual_status:
                    "found",

                  manual_checked_at:
                    result.checkedAt,
                }
              : current
        );

        setManualFinderMessage(
          "Official manual found. Opening the updated device record..."
        );

        /*
         * Reload so DeviceDocuments also fetches
         * the newly-created PDF immediately.
         */
        window.location.assign(
          `/devices/${device.id}?tab=documents`
        );

        return;
      }

      if (
        result.status ===
        "skipped"
      ) {
        setDevice(
          (current) =>
            current
              ? {
                  ...current,
                  manual_status:
                    "not_found",
                }
              : current
        );

        setManualFinderMessage(
          "The search could not save another document. Check your document limit and try again."
        );

        return;
      }

      setDevice(
        (current) =>
          current
            ? {
                ...current,

                model_number:
                  result.modelNumber,

                manual_status:
                  "not_found",

                manual_checked_at:
                  result.checkedAt,
              }
            : current
      );

      setManualFinderMessage(
        "We still couldn't verify an official manual. Double-check the full model number on the product label."
      );
    } catch (error) {
      console.error(
        "Unable to retry manual lookup:",
        error
      );

      setDevice(
        (current) =>
          current
            ? {
                ...current,
                manual_status:
                  "not_found",
              }
            : current
      );

      setManualFinderMessage(
        "The manual search could not be completed. Please try again."
      );
    } finally {
      setManualFinderPending(
        false
      );
    }
  }


  function selectTab(tab: DeviceDetailTab) {
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

        const [
          deviceDocumentCountResult,
          vaultDocumentCountResult,
        ] = await Promise.all([
          supabase
            .from("device_documents")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq(
              "device_id",
              deviceId
            ),

          supabase
            .from("documents")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq(
              "device_id",
              deviceId
            ),
        ]);

        if (
          deviceDocumentCountResult.error ||
          vaultDocumentCountResult.error
        ) {
          console.error(
            "Unable to load complete document count:",
            {
              deviceDocuments:
                deviceDocumentCountResult.error,

              vaultDocuments:
                vaultDocumentCountResult.error,
            }
          );

          if (mounted) {
            setDocumentCount(null);
          }
        } else if (mounted) {
          setDocumentCount(
            (
              deviceDocumentCountResult.count ??
              0
            ) +
              (
                vaultDocumentCountResult.count ??
                0
              )
          );
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

      /*
       * The device and its timeline rows are already gone.
       * Do not attempt to attach a new device_event to a
       * device ID that no longer exists.
       */
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
          <ViewerBanner description="You can view this device, its photos, documents, Home Wi-Fi details, and history. Viewer access cannot edit, upload, or delete anything." />
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
                <p className="text-overline text-section-technology">
                  Home Wi-Fi
                </p>

                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                  {hasNetwork
                    ? "Connected to your home"
                    : "Not connected yet"}
                </h2>
              </div>
            </div>

            {hasNetwork ? (
              <>
                <div className="mt-5 rounded-[22px] border border-[#718d4f]/20 bg-[#718d4f]/[0.06] px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#718d4f]" />

                    <div>
                      <p className="font-medium text-text-primary">
                        {devicePresence.label === "Online"
                          ? "This device is connected."
                          : "This device was recently seen."}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        Last seen {devicePresence.lastActiveLabel.toLowerCase()} on your Home Wi-Fi.
                      </p>
                    </div>
                  </div>
                </div>

                {connectorStatusMayBeOutdated ? (
                  <p className="mt-4 text-sm leading-6 text-text-secondary">
                    The connection status may take a few minutes to refresh.
                  </p>
                ) : null}

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <DetailCard
                    label="Last seen"
                    value={devicePresence.lastActiveLabel}
                  />

                  <DetailCard
                    label="IP address"
                    value={displayValue(
                      device.ip_address,
                      "Not available"
                    )}
                  />

                  <DetailCard
                    label="Connected through"
                    value={displayValue(
                      resolvedConnectorName,
                      "Home Tech Vault"
                    )}
                  />
                </div>

                <details className="mt-6 rounded-[22px] border border-border-subtle bg-surface-sunken/50">
                  <summary className="cursor-pointer select-none px-5 py-4 text-sm font-medium text-text-primary">
                    Technical details
                  </summary>

                  <div className="grid gap-4 border-t border-border-subtle px-5 py-5 sm:grid-cols-2">
                    {device.hostname ? (
                      <DetailCard
                        label="Device name"
                        value={device.hostname}
                      />
                    ) : null}

                    <DetailCard
                      label="MAC address"
                      value={displayValue(
                        device.mac_address,
                        "Not available"
                      )}
                    />

                    {device.manufacturer ? (
                      <DetailCard
                        label="Manufacturer"
                        value={device.manufacturer}
                      />
                    ) : null}

                    {device.first_seen_at ? (
                      <DetailCard
                        label="First seen"
                        value={
                          formatProfileDate(
                            device.first_seen_at
                          ) ?? "Not recorded"
                        }
                      />
                    ) : null}

                    {device.network_updated_at ? (
                      <DetailCard
                        label="Last Wi-Fi update"
                        value={formatNetworkUpdatedAt(
                          device.network_updated_at
                        )}
                      />
                    ) : null}

                    {device.discovery_source ? (
                      <DetailCard
                        label="How it was found"
                        value={device.discovery_source}
                      />
                    ) : null}
                  </div>
                </details>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    href="/network/discovery"
                    variant="secondary"
                  >
                    Check device
                  </Button>

                  <Button
                    href="/network"
                    variant="ghost"
                  >
                    View Home Wi-Fi
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-6">
                <EmptyState
                  icon={Wifi}
                  title="Not connected to Home Wi-Fi yet"
                  description="Once this device is found on your home network, its connection details will appear here."
                  actionLabel="Find this device"
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
            <div className="space-y-5">
              <PageCard className="overflow-hidden p-0">
                <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                        device.manual_status ===
                          "found"
                          ? "border-home-health/20 bg-home-health-soft text-home-health"
                          : device.manual_status ===
                              "pending"
                            ? "border-border-subtle bg-surface-sunken text-text-secondary"
                            : "border-border-subtle bg-surface-sunken text-charcoal"
                      )}
                    >
                      {device.manual_status ===
                      "found" ? (
                        <ShieldCheck
                          size={22}
                          aria-hidden
                        />
                      ) : (
                        <FileText
                          size={22}
                          aria-hidden
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold tracking-[-0.02em] text-text-primary">
                          {device.manual_status ===
                          "found"
                            ? "Manual ready"
                            : device.manual_status ===
                                "pending"
                              ? "Manual search pending"
                              : device.manual_status ===
                                  "not_found"
                                ? "No manual found automatically"
                                : "Product manual"}
                        </h2>

                        {device.manual_status ? (
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                              device.manual_status ===
                                "found"
                                ? "bg-home-health-soft text-home-health"
                                : device.manual_status ===
                                    "pending"
                                  ? "bg-surface-sunken text-text-secondary"
                                  : "bg-surface-sunken text-text-secondary"
                            )}
                          >
                            {device.manual_status ===
                            "found"
                              ? "Saved"
                              : device.manual_status ===
                                  "pending"
                                ? "Pending"
                                : "Not found"}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                        {device.manual_status ===
                        "found"
                          ? "An official product manual is saved with this device."
                          : device.manual_status ===
                              "pending"
                            ? "Home Tech Vault has not completed this device's automatic manual lookup yet."
                            : device.manual_status ===
                                "not_found"
                              ? "We couldn't match an official manual yet. The saved model may be a product family instead of the exact model number."
                              : "No automatic manual lookup was recorded for this device. You can still upload the correct manual yourself."}
                      </p>

                      {device.manual_status ===
                      "not_found" ? (
                        <div
                          data-manual-finder="true"
                          className="mt-4"
                        >
                          {!manualFinderOpen ? (
                            <button
                              type="button"
                              onClick={() => {
                                setManualFinderModel(
                                  device.model_number ??
                                    ""
                                );

                                setManualFinderMessage(
                                  ""
                                );

                                setManualFinderOpen(
                                  true
                                );
                              }}
                              disabled={
                                !canUpload
                              }
                              className={cn(
                                "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
                                canUpload
                                  ? "border border-home-health/20 bg-home-health-soft text-home-health hover:bg-home-health/10"
                                  : "cursor-not-allowed border border-border-subtle bg-surface-sunken text-text-muted"
                              )}
                            >
                              ✨ Help me find my manual
                            </button>
                          ) : (
                            <div className="max-w-xl rounded-[20px] border border-border-subtle bg-surface-sunken/60 p-4">
                              <p className="text-sm font-semibold text-text-primary">
                                Find the exact version
                              </p>

                              <p className="mt-1 text-xs leading-5 text-text-secondary">
                                Look for the full model
                                number on the label on
                                the back or bottom of
                                the device. A series
                                name alone may not be
                                specific enough.
                              </p>

                              <label className="mt-4 block">
                                <span className="mb-1.5 block text-xs font-semibold text-text-secondary">
                                  Full model number
                                </span>

                                <input
                                  type="text"
                                  value={
                                    manualFinderModel
                                  }
                                  onChange={(
                                    event
                                  ) => {
                                    setManualFinderModel(
                                      event
                                        .target
                                        .value
                                    );

                                    if (
                                      manualFinderMessage
                                    ) {
                                      setManualFinderMessage(
                                        ""
                                      );
                                    }
                                  }}
                                  onKeyDown={(
                                    event
                                  ) => {
                                    if (
                                      event.key ===
                                        "Enter" &&
                                      !manualFinderPending
                                    ) {
                                      event.preventDefault();

                                      void handleManualFinderSearch();
                                    }
                                  }}
                                  disabled={
                                    manualFinderPending
                                  }
                                  autoComplete="off"
                                  placeholder="Enter the exact model from the label"
                                  className="w-full rounded-xl border border-border-subtle bg-surface-card px-3.5 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-home-health/40 focus:ring-2 focus:ring-home-health/10 disabled:cursor-wait disabled:opacity-70"
                                />
                              </label>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    void handleManualFinderSearch();
                                  }}
                                  disabled={
                                    manualFinderPending ||
                                    !manualFinderModel.trim()
                                  }
                                  className={cn(
                                    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
                                    manualFinderPending ||
                                      !manualFinderModel.trim()
                                      ? "cursor-not-allowed bg-charcoal/50 text-surface-card"
                                      : "bg-charcoal text-surface-card hover:bg-charcoal-hover"
                                  )}
                                >
                                  {manualFinderPending
                                    ? "Searching..."
                                    : "Search again"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setManualFinderOpen(
                                      false
                                    );

                                    setManualFinderMessage(
                                      ""
                                    );
                                  }}
                                  disabled={
                                    manualFinderPending
                                  }
                                  className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-surface-card px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-hover disabled:cursor-wait disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>

                              {manualFinderPending ? (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-text-secondary">
                                    Checking official
                                    product sources...
                                  </p>

                                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border-subtle">
                                    <div className="h-full w-2/3 animate-pulse rounded-full bg-home-health" />
                                  </div>
                                </div>
                              ) : null}

                              {manualFinderMessage ? (
                                <p
                                  className="mt-3 text-xs leading-5 text-text-secondary"
                                  aria-live="polite"
                                >
                                  {
                                    manualFinderMessage
                                  }
                                </p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {device.manual_checked_at ? (
                        <p className="mt-2 text-xs text-text-tertiary">
                          Last checked{" "}
                          {formatProfileDate(
                            device.manual_checked_at.slice(
                              0,
                              10
                            )
                          )}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        device.manual_status ===
                        "found"
                      ) {
                        /*
                         * Official web guides live directly on
                         * the manufacturer website rather than
                         * in Supabase Storage.
                         */
                        if (
                          device.manual_url
                        ) {
                          window.open(
                            device.manual_url,
                            "_blank",
                            "noopener,noreferrer"
                          );

                          return;
                        }

                        /*
                         * Otherwise use the existing stored-PDF
                         * preview link rendered by DeviceDocuments.
                         */
                        const manualLink =
                          document.querySelector<HTMLAnchorElement>(
                            '[data-device-manual-preview="true"]'
                          );

                        if (
                          manualLink?.href
                        ) {
                          window.open(
                            manualLink.href,
                            "_blank",
                            "noopener,noreferrer"
                          );

                          return;
                        }

                        document
                          .getElementById(
                            "device-manual-upload"
                          )
                          ?.scrollIntoView({
                            behavior:
                              "smooth",
                            block:
                              "center",
                          });

                        return;
                      }

                      const typeSelect =
                        document.getElementById(
                          "device-document-type-select"
                        ) as
                          | HTMLSelectElement
                          | null;

                      if (
                        typeSelect &&
                        typeSelect.value !==
                          "Manual"
                      ) {
                        typeSelect.value =
                          "Manual";

                        typeSelect.dispatchEvent(
                          new Event(
                            "change",
                            {
                              bubbles:
                                true,
                            }
                          )
                        );
                      }

                      const fileInput =
                        document.getElementById(
                          "device-manual-file-input"
                        ) as
                          | HTMLInputElement
                          | null;

                      fileInput?.click();
                    }}
                    disabled={
                      device.manual_status !==
                        "found" &&
                      !canUpload
                    }
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition",
                      device.manual_status ===
                        "found"
                        ? "border border-border-subtle bg-surface-card text-text-primary shadow-[var(--shadow-sm)] hover:bg-surface-hover"
                        : canUpload
                          ? "bg-charcoal text-surface-card hover:bg-charcoal-hover"
                          : "cursor-not-allowed border border-border-subtle bg-surface-sunken text-text-muted"
                    )}
                  >
                    {device.manual_status ===
                    "found"
                      ? "View manual"
                      : canUpload
                        ? "Upload manual"
                        : "Read only"}
                  </button>
                </div>
              </PageCard>

              <PageCard className="p-6 md:p-8">
                <DeviceDocuments
                  deviceId={device.id}
                  manualUrl={
                    device.manual_url ??
                    null
                  }
                  embedded
                  rerunningManual={
                    manualFinderPending
                  }
                  onRerunManual={
                    handleForceManualRerun
                  }
                  onManualStatusChange={(
                    status
                  ) => {
                    setDevice(
                      (
                        current
                      ) => {
                        if (
                          !current
                        ) {
                          return current;
                        }

                        return {
                          ...current,

                          manual_status:
                            status,

                          manual_checked_at:
                            status ===
                            "found"
                              ? new Date()
                                  .toISOString()
                              : null,
                        };
                      }
                    );
                  }}
                />
              </PageCard>
            </div>
          )
        ) : null}

        {activeTab === "maintenance" ? (
          <DeviceProfileMaintenance
            deviceId={device.id}
            device={device}
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
