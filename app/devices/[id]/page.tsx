"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Camera,
  CircleDollarSign,
  FileText,
  ImagePlus,
  Laptop,
  Loader2,
  MapPin,
  Pencil,
  Radio,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
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
  demoTimelineEvents,
} from "@/lib/demoData";

import {
  resolveDeviceImage,
} from "@/lib/devices/getDeviceImage";

import { usePermissions } from "@/hooks/usePermissions";

import DeviceDocuments from "@/components/DeviceDocuments";
import DeviceTimeline from "@/components/DeviceTimeline";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import {
  ViewerBanner,
} from "@/components/ui/PermissionUI";

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
          document.device_id ===
          deviceId
      ),
    [deviceId]
  );

  const sampleTimeline = useMemo(
    () =>
      demoTimelineEvents.filter(
        (event) =>
          event.device_id ===
          deviceId
      ),
    [deviceId]
  );

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

  function redirectViewer() {
    router.push(
      user ? "/devices" : "/signup"
    );
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

  const hasNetworkInformation =
    Boolean(
      device.ip_address ||
        device.mac_address ||
        device.manufacturer ||
        device.discovery_source ||
        device.last_seen_at ||
        (device.online !==
          null &&
          device.online !==
            undefined)
    );

  const selectedImage =
    images[
      selectedImageIndex
    ];

  const warranty =
    getWarrantyStatus(
      device.warranty_date
    );

  return (
    <PageShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/devices"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
        >
          <ArrowLeft size={17} />
          Devices
        </Link>

        {canEdit ? (
          <Button
            onClick={
              handleEditDevice
            }
            variant="secondary"
          >
            <Pencil size={16} />
            Edit Device
          </Button>
        ) : !user ? (
          <Button
            href="/signup"
            variant="secondary"
          >
            Create Your Vault
          </Button>
        ) : (
          <div className="rounded-2xl border border-border-subtle bg-surface-sunken px-4 py-3 text-sm font-semibold text-text-secondary">
            Viewer Access · Read Only
          </div>
        )}
      </div>

      <ViewerBanner
        description={
          user
            ? "You can view this device, its photos, documents, network details, and history. Viewer access cannot edit, upload, or delete anything."
            : "This sample profile demonstrates how device photos, documents, network information, and history are organized."
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PageCard className="overflow-hidden p-0">
          <div className="relative aspect-[5/4] overflow-hidden bg-surface-sunken">
            {selectedImage ? (
              <Image
                src={
                  selectedImage.signedUrl
                }
                alt={
                  device.device_name ||
                  "Device photo"
                }
                fill
                unoptimized={
                  !selectedImage.signedUrl.startsWith(
                    "/demo-devices/"
                  )
                }
                className={
                  selectedImage.signedUrl.startsWith(
                    "/demo-devices/"
                  )
                    ? "object-contain p-6 md:p-8"
                    : "object-cover"
                }
              />
            ) : canUpload ? (
              <label className="flex h-full cursor-pointer flex-col items-center justify-center px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
                  <Camera size={32} />
                </div>

                <p className="mt-5 text-lg font-semibold text-text-primary">
                  Add a device photo
                </p>

                <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                  Photos make your
                  inventory easier to
                  identify and document.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={
                    uploading
                  }
                  onChange={
                    handleUpload
                  }
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
                  <Camera size={32} />
                </div>

                <p className="mt-5 text-lg font-semibold text-text-primary">
                  No device photo
                </p>

                <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                  Viewer access is
                  read-only. Members and
                  Admins can upload device
                  photos.
                </p>
              </div>
            )}

            {images.length > 0 &&
              canUpload && (
                <label className="absolute bottom-4 right-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-surface-card/90 px-4 py-2.5 text-sm font-semibold text-text-primary shadow-lg backdrop-blur transition hover:bg-surface-card">
                  {uploading ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <ImagePlus
                      size={16}
                    />
                  )}

                  {uploading
                    ? "Uploading"
                    : "Add Photos"}

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={
                      uploading
                    }
                    onChange={
                      handleUpload
                    }
                    className="hidden"
                  />
                </label>
              )}
          </div>

          {images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto p-4">
              {images.map(
                (
                  image,
                  index
                ) => {
                  const active =
                    index ===
                    selectedImageIndex;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(
                          index
                        )
                      }
                      className={
                        "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition " +
                        (active
                          ? "border-charcoal"
                          : "border-transparent opacity-70 hover:opacity-100")
                      }
                    >
                      <Image
                        src={
                          image.signedUrl
                        }
                        alt="Device thumbnail"
                        fill
                        unoptimized={
                          !image.signedUrl.startsWith(
                            "/demo-devices/"
                          )
                        }
                        className={
                          image.signedUrl.startsWith(
                            "/demo-devices/"
                          )
                            ? "object-contain bg-surface-sunken p-1"
                            : "object-cover"
                        }
                      />
                    </button>
                  );
                }
              )}
            </div>
          )}
        </PageCard>

        <PageCard className="flex flex-col justify-between p-7 md:p-9">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {device.category && (
                <span className="rounded-full bg-surface-sunken px-3 py-1.5 text-xs font-semibold text-text-secondary">
                  {device.category}
                </span>
              )}

              <span
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold " +
                  warranty.className
                }
              >
                <ShieldCheck
                  size={13}
                />
                {warranty.label}
              </span>
            </div>

            <p className="mt-7 text-overline text-section-technology">
              Device Profile
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-text-primary md:text-5xl">
              {device.device_name ||
                "Unnamed Device"}
            </h1>

            <p className="mt-3 text-base text-text-secondary">
              {[
                device.brand,
                device.model_number,
              ]
                .filter(Boolean)
                .join(" · ") ||
                "Brand and model not provided"}
            </p>

            {device.location && (
              <p className="mt-5 inline-flex items-center gap-2 text-sm text-text-secondary">
                <MapPin
                  size={16}
                  className="text-section-vault"
                />
                {device.location}
              </p>
            )}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3">
            <HeroMetric
              label="Purchase Value"
              value={formatPrice(
                device.purchase_price
              )}
            />

            <HeroMetric
              label="Warranty"
              value={
                warranty.shortLabel
              }
            />
          </div>
        </PageCard>
      </section>

      {images.length > 0 && (
        <PageCard className="p-6 md:p-8">
          <SectionHeading
            eyebrow="Photo Gallery"
            title="Device photos"
            description={
              String(images.length) +
              " " +
              (images.length === 1
                ? "photo"
                : "photos") +
              " stored in your vault."
            }
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map(
              (image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-[24px] bg-surface-sunken"
                >
                  <Image
                    src={
                      image.signedUrl
                    }
                    alt={
                      (device.device_name ||
                        "Device") +
                      " photo"
                    }
                    fill
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() =>
                        void deleteImage(
                          image
                        )
                      }
                      disabled={
                        deletingImageId ===
                        image.id
                      }
                      aria-label="Delete photo"
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-charcoal/65 text-surface-card opacity-100 backdrop-blur transition hover:bg-danger md:opacity-0 md:group-hover:opacity-100"
                    >
                      {deletingImageId ===
                      image.id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2
                          size={17}
                        />
                      )}
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </PageCard>
      )}

      <PageCard className="p-6 md:p-8">
        <SectionHeading
          eyebrow="At a Glance"
          title="Device information"
          description="The most important ownership and identification details."
        />

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailCard
            icon={Tag}
            label="Category"
            value={device.category}
          />

          <DetailCard
            icon={Laptop}
            label="Brand"
            value={device.brand}
          />

          <DetailCard
            icon={Sparkles}
            label="Model"
            value={
              device.model_number
            }
          />

          <DetailCard
            icon={MapPin}
            label="Location"
            value={device.location}
          />

          <DetailCard
            icon={
              CalendarDays
            }
            label="Purchase Date"
            value={formatDate(
              device.purchase_date
            )}
          />

          <DetailCard
            icon={ShieldCheck}
            label="Warranty Expiration"
            value={formatDate(
              device.warranty_date
            )}
          />

          <DetailCard
            icon={
              CircleDollarSign
            }
            label="Purchase Price"
            value={formatPrice(
              device.purchase_price
            )}
          />

          <DetailCard
            icon={FileText}
            label="Serial Number"
            value={
              device.serial_number
            }
          />
        </div>

        {device.notes && (
          <div className="mt-4 rounded-[24px] bg-surface-sunken p-5">
            <p className="text-overline text-section-technology">
              Notes
            </p>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-primary">
              {device.notes}
            </p>
          </div>
        )}
      </PageCard>

      {hasNetworkInformation && (
        <PageCard className="p-6 md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <SectionHeading
              eyebrow="Network Presence"
              title="Connection information"
              description="Details collected through network discovery."
            />

            <NetworkStatus
              online={
                device.online
              }
              lastSeen={
                device.last_seen_at
              }
            />
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DetailCard
              icon={Radio}
              label="Status"
              value={
                device.online ===
                true
                  ? "Online"
                  : device.online ===
                      false
                    ? "Offline"
                    : "Not tracked"
              }
            />

            <DetailCard
              icon={Radio}
              label="IP Address"
              value={
                device.ip_address
              }
            />

            <DetailCard
              icon={Radio}
              label="MAC Address"
              value={
                device.mac_address
              }
            />

            <DetailCard
              icon={Laptop}
              label="Manufacturer"
              value={
                device.manufacturer
              }
            />

            <DetailCard
              icon={Sparkles}
              label="Discovery Source"
              value={
                device.discovery_source
              }
            />

            <DetailCard
              icon={
                CalendarDays
              }
              label="Last Seen"
              value={formatLastSeen(
                device.last_seen_at
              )}
            />
          </div>
        </PageCard>
      )}

      {isDemo || !user ? (
        <>
          <DemoDocuments
            documents={
              sampleDocuments
            }
          />

          <DemoTimeline
            events={
              sampleTimeline
            }
          />
        </>
      ) : (
        <>
          <DeviceDocuments
            deviceId={device.id}
          />

          <DeviceTimeline
            deviceId={device.id}
            purchaseDate={
              device.purchase_date
            }
            warrantyDate={
              device.warranty_date
            }
          />
        </>
      )}

      {canDelete && (
        <PageCard className="border-danger/20 bg-danger-soft/30 p-6 md:p-8">
          <p className="text-overline text-danger">
            Danger zone
          </p>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Delete this device
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                This permanently removes the device and its
                associated photos and records.
              </p>
            </div>

            <Button
              type="button"
              variant="danger"
              onClick={() =>
                void deleteDevice()
              }
              disabled={
                deletingDevice
              }
            >
              {deletingDevice ? (
                <Loader2
                  className="animate-spin"
                  size={17}
                  aria-hidden
                />
              ) : (
                <Trash2
                  size={17}
                  aria-hidden
                />
              )}

              {deletingDevice
                ? "Deleting..."
                : "Delete device"}
            </Button>
          </div>
        </PageCard>
      )}
    </PageShell>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-overline text-section-technology">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-[22px] bg-surface-sunken p-4">
      <p className="text-xs text-text-secondary">
        {label}
      </p>

      <p className="mt-2 truncate text-lg font-semibold text-text-primary">
        {value || "Not recorded"}
      </p>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Laptop;
  label: string;
  value:
    | string
    | null
    | undefined;
}) {
  return (
    <div className="rounded-[24px] bg-surface-sunken p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
        <Icon size={18} />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-text-primary">
        {value ||
          "Not provided"}
      </p>
    </div>
  );
}

function NetworkStatus({
  online,
  lastSeen,
}: {
  online:
    | boolean
    | null
    | undefined;
  lastSeen:
    | string
    | null
    | undefined;
}) {
  const status =
    online === true
      ? {
          label: "Online",
          dot: "bg-home-health",
          className:
            "bg-home-health-soft text-home-health",
        }
      : online === false
        ? {
            label: "Offline",
            dot: "bg-text-tertiary",
            className:
              "bg-surface-sunken text-text-secondary",
          }
        : {
            label:
              "Status unknown",
            dot: "bg-warning",
            className:
              "bg-warning-soft text-warning",
          };

  return (
    <div className="shrink-0">
      <span
        className={
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold " +
          status.className
        }
      >
        <span
          className={
            "h-2 w-2 rounded-full " +
            status.dot
          }
        />

        {status.label}
      </span>

      <p className="mt-2 text-right text-xs text-text-tertiary">
        {formatLastSeen(
          lastSeen
        )}
      </p>
    </div>
  );
}

function DemoDocuments({
  documents,
}: {
  documents:
    typeof demoDocuments;
}) {
  return (
    <PageCard className="p-6 md:p-8">
      <SectionHeading
        eyebrow="Documents"
        title="Device documents"
        description="Receipts, manuals, warranty files, and setup guides."
      />

      {documents.length ===
      0 ? (
        <div className="mt-6 rounded-2xl bg-surface-sunken p-5 text-sm text-text-secondary">
          No sample documents
          are attached to this
          device.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {documents.map(
            (document) => (
              <div
                key={
                  document.id
                }
                className="flex items-center gap-4 rounded-[22px] border border-border-subtle p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
                  <FileText
                    size={19}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text-primary">
                    {
                      document.document_name
                    }
                  </p>

                  <p className="mt-1 truncate text-sm text-text-secondary">
                    {
                      document.document_type
                    }{" "}
                    ·{" "}
                    {
                      document.file_name
                    }
                  </p>
                </div>

                <span className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-achievement">
                  Demo
                </span>
              </div>
            )
          )}
        </div>
      )}
    </PageCard>
  );
}

function DemoTimeline({
  events,
}: {
  events:
    typeof demoTimelineEvents;
}) {
  return (
    <PageCard className="p-6 md:p-8">
      <SectionHeading
        eyebrow="Device History"
        title="Timeline"
        description="A simple history of important device activity."
      />

      {events.length ===
      0 ? (
        <div className="mt-6 rounded-2xl bg-surface-sunken p-5 text-sm text-text-secondary">
          No sample timeline
          events are recorded for
          this device.
        </div>
      ) : (
        <div className="relative mt-7 space-y-6 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border-subtle">
          {events.map(
            (event) => (
              <div
                key={event.id}
                className="relative pl-8"
              >
                <span className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-4 border-surface-card bg-home-health shadow-sm" />

                <div className="rounded-[22px] bg-surface-sunken p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">
                        {
                          event.title
                        }
                      </p>

                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {
                          event.description
                        }
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-text-tertiary">
                      {new Date(
                        event.event_date
                      ).toLocaleDateString(
                        undefined,
                        {
                          month:
                            "short",
                          day:
                            "numeric",
                          year:
                            "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </PageCard>
  );
}

function getWarrantyStatus(
  warrantyDate:
    | string
    | null
    | undefined
) {
  if (!warrantyDate) {
    return {
      label:
        "No warranty recorded",
      shortLabel:
        "Not recorded",
      className:
        "bg-surface-sunken text-text-secondary",
    };
  }

  const expiration =
    new Date(
      warrantyDate +
        "T23:59:59"
    );

  if (
    Number.isNaN(
      expiration.getTime()
    )
  ) {
    return {
      label:
        "Warranty status unknown",
      shortLabel:
        "Unknown",
      className:
        "bg-surface-sunken text-text-secondary",
    };
  }

  const daysRemaining =
    Math.ceil(
      (expiration.getTime() -
        Date.now()) /
        (1000 *
          60 *
          60 *
          24)
    );

  if (daysRemaining < 0) {
    return {
      label:
        "Warranty expired",
      shortLabel:
        "Expired",
      className:
        "bg-danger-soft text-danger",
    };
  }

  if (
    daysRemaining === 0
  ) {
    return {
      label:
        "Warranty expires today",
      shortLabel:
        "Today",
      className:
        "bg-warning-soft text-warning",
    };
  }

  if (
    daysRemaining <= 60
  ) {
    return {
      label:
        String(
          daysRemaining
        ) +
        " days remaining",
      shortLabel:
        String(
          daysRemaining
        ) +
        " days",
      className:
        "bg-warning-soft text-warning",
    };
  }

  return {
    label:
      "Warranty active",
    shortLabel:
      String(
        daysRemaining
      ) +
      " days",
    className:
      "bg-home-health-soft text-home-health",
  };
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return null;
  }

  const date = new Date(
    value + "T00:00:00"
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatPrice(
  value: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return Number(
    value
  ).toLocaleString(
    undefined,
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );
}

function formatLastSeen(
  value?: string | null
) {
  if (!value) {
    return "Never seen";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  const difference =
    Date.now() -
    date.getTime();

  const minutes =
    Math.floor(
      difference /
        (1000 * 60)
    );

  if (minutes < 1) {
    return "Seen just now";
  }

  if (minutes < 60) {
    return (
      "Seen " +
      String(minutes) +
      " minute" +
      (minutes === 1
        ? ""
        : "s") +
      " ago"
    );
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return (
      "Seen " +
      String(hours) +
      " hour" +
      (hours === 1
        ? ""
        : "s") +
      " ago"
    );
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return (
      "Seen " +
      String(days) +
      " day" +
      (days === 1
        ? ""
        : "s") +
      " ago"
    );
  }

  return (
    "Last seen " +
    date.toLocaleDateString(
      undefined,
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    )
  );
}