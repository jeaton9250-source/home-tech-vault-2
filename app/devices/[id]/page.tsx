"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Pencil,
  Radio,
  Trash2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import DeviceDocuments from "@/components/DeviceDocuments";
import DeviceTimeline from "@/components/DeviceTimeline";
import { createDeviceEvent } from "@/lib/deviceEvents";

type Device = {
  id: string;
  user_id: string;
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

export default function DevicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [device, setDevice] = useState<Device | null>(null);
  const [images, setImages] = useState<DeviceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadImages = useCallback(
    async (deviceId: string, userId: string) => {
      const { data, error } = await supabase
        .from("device_images")
        .select("*")
        .eq("device_id", deviceId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const rows = (data || []) as DeviceImageRow[];

      const imagesWithUrls = await Promise.all(
        rows.map(async (image) => {
          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("device-images")
              .createSignedUrl(image.image_url, 3600);

          if (signedError) {
            console.error(
              "Unable to create signed image URL:",
              signedError
            );
          }

          return {
            ...image,
            signedUrl: signedData?.signedUrl || "",
          };
        })
      );

      setImages(
        imagesWithUrls.filter((image) =>
          Boolean(image.signedUrl)
        )
      );
    },
    []
  );

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        setErrorMessage("");

        const deviceId = params.id;

        if (!deviceId) {
          setErrorMessage("Invalid device ID.");
          return;
        }

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

        const { data: deviceData, error: deviceError } =
          await supabase
            .from("devices")
            .select("*")
            .eq("id", deviceId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (deviceError) {
          throw deviceError;
        }

        if (!deviceData) {
          setErrorMessage("Device not found.");
          return;
        }

        setDevice(deviceData as Device);
        await loadImages(deviceId, user.id);
      } catch (error) {
        console.error("Unable to load device page:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this device."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [loadImages, params.id, router]);

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);
    const uploadedFileCount = files.length;

    if (!device || files.length === 0) {
      return;
    }

    try {
      setUploading(true);

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

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image.`);
        }

        if (file.size > 6 * 1024 * 1024) {
          throw new Error(
            `${file.name} must be smaller than 6 MB.`
          );
        }

        const extension =
          file.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath =
          `${user.id}/${device.id}/` +
          `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("device-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { error: recordError } = await supabase
          .from("device_images")
          .insert({
            device_id: device.id,
            user_id: user.id,
            image_url: filePath,
          });

        if (recordError) {
          await supabase.storage
            .from("device-images")
            .remove([filePath]);

          throw recordError;
        }
      }

      await createDeviceEvent({
        deviceId: device.id,
        userId: user.id,
        eventType: "Photo",
        title:
          uploadedFileCount === 1
            ? "Photo uploaded"
            : `${uploadedFileCount} photos uploaded`,
        description:
          uploadedFileCount === 1
            ? "A new device photo was added to the vault."
            : `${uploadedFileCount} new device photos were added to the vault.`,
      });

      event.target.value = "";
      await loadImages(device.id, user.id);
    } catch (error) {
      console.error("Unable to upload image:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to upload the photo."
      );
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(image: DeviceImage) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this photo?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingImageId(image.id);

      const { error: storageError } = await supabase.storage
        .from("device-images")
        .remove([image.image_url]);

      if (storageError) {
        throw storageError;
      }

      const { error: databaseError } = await supabase
        .from("device_images")
        .delete()
        .eq("id", image.id);

      if (databaseError) {
        throw databaseError;
      }

      setImages((currentImages) =>
        currentImages.filter(
          (currentImage) =>
            currentImage.id !== image.id
        )
      );
    } catch (error) {
      console.error("Unable to delete image:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete the photo."
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  async function deleteDevice() {
    if (!device || deletingDevice) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${
        device.device_name || "this device"
      }"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingDevice(true);

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

      const imagePaths = images.map(
        (image) => image.image_url
      );

      if (imagePaths.length > 0) {
        const { error: imageStorageError } =
          await supabase.storage
            .from("device-images")
            .remove(imagePaths);

        if (imageStorageError) {
          throw imageStorageError;
        }
      }

      const {
        data: documentRows,
        error: documentLoadError,
      } = await supabase
        .from("device_documents")
        .select("file_path")
        .eq("device_id", device.id)
        .eq("user_id", user.id);

      if (documentLoadError) {
        console.error(
          "Unable to load device documents before deletion:",
          documentLoadError
        );
      }

      const documentPaths =
        documentRows?.map(
          (document) => document.file_path
        ) || [];

      if (documentPaths.length > 0) {
        const { error: documentStorageError } =
          await supabase.storage
            .from("device-documents")
            .remove(documentPaths);

        if (documentStorageError) {
          throw documentStorageError;
        }
      }

      const { error: deleteError } = await supabase
        .from("devices")
        .delete()
        .eq("id", device.id)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      alert("Device deleted successfully.");
      router.push("/devices");
      router.refresh();
    } catch (error) {
      console.error("Unable to delete device:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete this device."
      );
    } finally {
      setDeletingDevice(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5EF] p-8">
        <div className="flex items-center gap-3 text-neutral-600">
          <Loader2
            className="animate-spin"
            size={20}
          />
          Loading device...
        </div>
      </main>
    );
  }

  if (errorMessage || !device) {
    return (
      <main className="min-h-screen bg-[#F7F5EF] p-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-[#111827]">
            Device not found
          </h1>

          <p className="mt-4 text-neutral-600">
            {errorMessage ||
              "This device could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/devices")}
            className="mt-6 rounded-xl bg-[#111827] px-5 py-3 font-semibold text-white"
          >
            Back to Devices
          </button>
        </div>
      </main>
    );
  }

  const hasNetworkInformation = Boolean(
    device.ip_address ||
      device.mac_address ||
      device.manufacturer ||
      device.discovery_source ||
      device.last_seen_at ||
      device.online !== null &&
        device.online !== undefined
  );

  return (
    <main className="min-h-screen bg-[#F7F5EF] p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/devices")}
          className="mb-6 inline-flex items-center gap-2 font-medium text-[#111827] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Devices
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
                Device Vault
              </p>

              <h1 className="mt-3 text-4xl font-bold text-[#111827]">
                {device.device_name || "Unnamed Device"}
              </h1>

              <p className="mt-2 text-neutral-500">
                {[device.brand, device.model_number]
                  .filter(Boolean)
                  .join(" · ") ||
                  "Brand and model not provided"}
              </p>

              {hasNetworkInformation && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      device.online === true
                        ? "bg-emerald-100 text-emerald-700"
                        : device.online === false
                          ? "bg-neutral-100 text-neutral-600"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        device.online === true
                          ? "bg-emerald-500"
                          : device.online === false
                            ? "bg-neutral-400"
                            : "bg-amber-500"
                      }`}
                    />

                    {device.online === true
                      ? "Online"
                      : device.online === false
                        ? "Offline"
                        : "Status unknown"}
                  </span>

                  <span className="text-sm text-neutral-400">
                    {formatLastSeen(
                      device.last_seen_at
                    )}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/devices/${device.id}/edit`
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263044]"
            >
              <Pencil size={17} />
              Edit Device
            </button>
          </header>

          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">
                  Device Photos
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Add photos of the device, receipt,
                  label, or serial number.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#111827] px-5 py-3 font-semibold text-white transition hover:opacity-90">
                {uploading ? (
                  <Loader2
                    className="animate-spin"
                    size={18}
                  />
                ) : (
                  <ImagePlus size={18} />
                )}

                {uploading
                  ? "Uploading..."
                  : "Add Photos"}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>

            {images.length === 0 ? (
              <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D8D1C3] bg-[#FBFAF7] px-6 py-14 text-center transition hover:border-[#C8A96A]">
                <ImagePlus
                  size={36}
                  className="text-[#C8A96A]"
                />

                <p className="mt-4 font-semibold text-[#111827]">
                  Add your first device photo
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Choose one or multiple images up to
                  6 MB each.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-2xl border border-[#E8E2D6] bg-white"
                  >
                    <img
                      src={image.signedUrl}
                      alt={`${
                        device.device_name || "Device"
                      } photo`}
                      className="aspect-square w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        deleteImage(image)
                      }
                      disabled={
                        deletingImageId === image.id
                      }
                      aria-label="Delete photo"
                      className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition hover:bg-red-600 disabled:opacity-60"
                    >
                      {deletingImageId ===
                      image.id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="my-10 h-px bg-[#E8E2D6]" />

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
              Inventory Details
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#111827]">
              Device Information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Category"
                value={device.category}
              />

              <InfoItem
                label="Brand"
                value={device.brand}
              />

              <InfoItem
                label="Model"
                value={device.model_number}
              />

              <InfoItem
                label="Serial Number"
                value={device.serial_number}
              />

              <InfoItem
                label="Purchase Date"
                value={formatDate(
                  device.purchase_date
                )}
              />

              <InfoItem
                label="Warranty Expiration"
                value={formatDate(
                  device.warranty_date
                )}
              />

              <InfoItem
                label="Purchase Price"
                value={formatPrice(
                  device.purchase_price
                )}
              />

              <InfoItem
                label="Location"
                value={device.location}
              />
            </div>

            <div className="mt-5">
              <InfoItem
                label="Notes"
                value={device.notes}
              />
            </div>
          </section>

          {hasNetworkInformation && (
            <section className="mt-10 border-t border-[#E8E2D6] pt-10">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                  <Radio size={21} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                    Network Presence
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-[#111827]">
                    Network Information
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Connection details collected from
                    network discovery.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <InfoItem
                  label="Status"
                  value={
                    device.online === true
                      ? "Online"
                      : device.online === false
                        ? "Offline"
                        : "Not tracked"
                  }
                />

                <InfoItem
                  label="IP Address"
                  value={device.ip_address}
                />

                <InfoItem
                  label="MAC Address"
                  value={device.mac_address}
                />

                <InfoItem
                  label="Manufacturer"
                  value={device.manufacturer}
                />

                <InfoItem
                  label="Discovery Source"
                  value={device.discovery_source}
                />

                <InfoItem
                  label="Last Seen"
                  value={formatLastSeen(
                    device.last_seen_at
                  )}
                />
              </div>
            </section>
          )}

          <DeviceDocuments deviceId={device.id} />

          <DeviceTimeline
            deviceId={device.id}
            purchaseDate={device.purchase_date}
            warrantyDate={device.warranty_date}
          />

          <section className="mt-10 border-t border-[#E8E2D6] pt-8">
            <p className="text-sm font-semibold text-red-700">
              Danger Zone
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Deleting this device permanently removes
              its details, photos, and document records.
            </p>

            <button
              type="button"
              onClick={deleteDevice}
              disabled={deletingDevice}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingDevice ? (
                <Loader2
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <Trash2 size={18} />
              )}

              {deletingDevice
                ? "Deleting..."
                : "Delete Device"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C8A96A]">
        {label}
      </p>

      <p className="mt-2 break-words font-medium text-[#111827]">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(value: number | null) {
  if (value === null || value === undefined) {
    return null;
  }

  return `$${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLastSeen(value?: string | null) {
  if (!value) {
    return "Never seen";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const difference = Date.now() - date.getTime();
  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return "Seen just now";
  }

  if (minutes < 60) {
    return `Seen ${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Seen ${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `Seen ${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return `Last seen ${date.toLocaleDateString(
    undefined,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  )}`;
}