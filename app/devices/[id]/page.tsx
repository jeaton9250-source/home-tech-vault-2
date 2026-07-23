"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  Laptop,
  Loader2,
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

import DeviceProfile from "@/components/devices/DeviceProfile";
import DeviceProfileTimelineSlot from "@/components/devices/DeviceProfileTimelineSlot";

import {
  resolveDeviceImage,
} from "@/lib/devices/getDeviceImage";
import { isDemoDeviceAssetPath } from "@/lib/devices/demoDeviceImages";

import { usePermissions } from "@/hooks/usePermissions";

import DeviceDocuments from "@/components/DeviceDocuments";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

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

type DocumentStorageRow = {
  file_path: string;
};

export default function DevicePage() {
  const params = useParams<{
    id: string;
  }>();

  const router = useRouter();

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

      const imagePaths =
        images.map(
          (image) =>
            image.image_url
        );

      if (
        imagePaths.length > 0
      ) {
        const {
          error:
            imageStorageError,
        } =
          await supabase.storage
            .from(
              "device-images"
            )
            .remove(imagePaths);

        if (
          imageStorageError
        ) {
          throw imageStorageError;
        }
      }

      const {
        data: documentRows,
        error:
          documentLoadError,
      } = await supabase
        .from(
          "device_documents"
        )
        .select("file_path")
        .eq(
          "device_id",
          device.id
        );

      if (
        documentLoadError
      ) {
        console.error(
          "Unable to load device documents before deletion:",
          documentLoadError
        );
      }

      const documentPaths =
        (
          (documentRows ??
            []) as DocumentStorageRow[]
        ).map(
          (document) =>
            document.file_path
        );

      if (
        documentPaths.length > 0
      ) {
        const {
          error:
            documentStorageError,
        } =
          await supabase.storage
            .from(
              "device-documents"
            )
            .remove(
              documentPaths
            );

        if (
          documentStorageError
        ) {
          throw documentStorageError;
        }
      }

      const {
        error: deleteError,
      } = await applyHouseholdMutationScope(
        supabase
          .from("devices")
          .delete()
          .eq("id", device.id),
        householdId,
        user.id
      );

      if (deleteError) {
        throw deleteError;
      }

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

  return (
    <DeviceProfile
      device={device}
      photos={profilePhotos}
      documents={isGuestDemo ? profileDocuments : undefined}
      timeline={isGuestDemo ? profileTimeline : undefined}
      selectedPhotoIndex={selectedImageIndex}
      onSelectPhoto={setSelectedImageIndex}
      canEdit={canEdit}
      canUpload={canUpload}
      canDelete={canDelete}
      isDemo={isGuestDemo}
      uploading={uploading}
      deletingDevice={deletingDevice}
      deletingPhotoId={deletingImageId}
      viewerBannerDescription={
        !canEdit && !isGuestDemo
          ? "You can view this device, its photos, documents, network details, and history. Viewer access cannot edit, upload, or delete anything."
          : undefined
      }
      onEdit={handleEditDevice}
      onDelete={() => void deleteDevice()}
      onReadOnlyAction={showReadOnlyModal}
      onUploadPhotos={handleUpload}
      onDeletePhoto={(photoId) => {
        const image = images.find((item) => item.id === photoId);

        if (image) {
          void deleteImage(image);
        }
      }}
      documentsSection={
        !isGuestDemo ? (
          <PageCard className="p-6 md:p-8">
            <DeviceDocuments deviceId={device.id} embedded />
          </PageCard>
        ) : undefined
      }
      timelineSection={
        !isGuestDemo ? (
          <DeviceProfileTimelineSlot
            deviceId={device.id}
            purchaseDate={device.purchase_date}
            warrantyDate={device.warranty_date}
          />
        ) : undefined
      }
      connectorName={
        isGuestDemo ? demoConnectorName : connectorName
      }
      connectorStatusMayBeOutdated={connectorStatusMayBeOutdated}
    />
  );
}
