"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";

import Link from "next/link";

import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Car,
  ChefHat,
  CircleAlert,
  Gamepad2,
  Home,
  ImageIcon,
  Laptop,
  Loader2,
  MapPin,
  Monitor,
  Plus,
  Search,
  Sofa,
  Trees,
  Warehouse,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";
import DemoRoomCard from "@/components/home/DemoRoomCard";
import RealRoomCard from "@/components/home/RealRoomCard";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import { usePermissions } from "@/hooks/usePermissions";

import FeatureGate from "@/components/permissions/FeatureGate";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ViewerBanner } from "@/components/ui/PermissionUI";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { getDemoHomeDevices } from "@/lib/demo/homeDevices";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";

type DeviceRow = {
  id: string;
  device_name: string | null;
  brand: string | null;
  category: string | null;
  location: string | null;
  purchase_price: number | null;
  warranty_date: string | null;
};

type DeviceReferenceRow = {
  device_id: string;
};

type HomeDevice = {
  id: string;
  deviceName: string;
  brand: string;
  category: string;
  location: string;
  purchasePrice: number;
  warrantyDate: string;
  demoImage?: string;
  hasPhoto: boolean;
  hasDocument: boolean;
};

type RoomRecord = {
  id: string;
  name: string;
  room_type: string | null;
  cover_image_path: string | null;
  sort_order: number;
  coverImageUrl?: string | null;
};

type RoomSummary = {
  id?: string;
  name: string;
  roomType?: string | null;
  coverImagePath?: string | null;
  coverImageUrl?: string | null;
  devices: HomeDevice[];
  deviceCount: number;
  recordedValue: number;
  photoCount: number;
  documentCount: number;
  completeness: number;
  expiringWarrantyCount: number;
};

type RoomIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

function RoomsContent() {
  const {
    user,
    isDemo,
    householdId,
    canCreate,
    loading: permissionsLoading,
    getActionHref,
    getActionLabel,
  } = usePermissions();

  const showReadOnlyModal = useDemoReadOnlyAction();

  function handleAddDevice() {
    if (isDemo) {
      showReadOnlyModal();
      return;
    }
  }

  const [devices, setDevices] = useState<HomeDevice[]>([]);

  const [householdName, setHouseholdName] = useState("My Home");

  const [loadingRooms, setLoadingRooms] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [roomRecords, setRoomRecords] = useState<RoomRecord[]>([]);

  const [addRoomOpen, setAddRoomOpen] = useState(false);

  const [newRoomName, setNewRoomName] = useState("");

  const [newRoomType, setNewRoomType] = useState("room");

  const [newRoomPhoto, setNewRoomPhoto] = useState<File | null>(null);

  const [savingRoom, setSavingRoom] = useState(false);

  const [roomFormError, setRoomFormError] = useState("");

  const [savingRoomCoverId, setSavingRoomCoverId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isDemo) {
      return;
    }

    /*
     * Safari and Next route restoration can restore
     * the previous scroll position after the first
     * render. Disable restoration for the demo and
     * force the viewport home again after layout.
     */
    const previousRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = "manual";

    const scrollHome = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollHome();

    const firstFrame = window.requestAnimationFrame(() => {
      scrollHome();

      window.requestAnimationFrame(scrollHome);
    });

    const timer = window.setTimeout(scrollHome, 150);

    return () => {
      window.cancelAnimationFrame(firstFrame);

      window.clearTimeout(timer);

      window.history.scrollRestoration = previousRestoration;
    };
  }, [isDemo, loadingRooms]);

  useEffect(() => {
    async function loadRooms() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingRooms(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setDevices(getDemoHomeDevices());
          setHouseholdName(MORGAN_HOUSEHOLD.name);
          return;
        }

        const profilePromise = supabase
          .from("profiles")
          .select("full_name, household_name")
          .eq("id", user.id)
          .maybeSingle();

        const householdPromise = householdId
          ? supabase
              .from("households")
              .select("name")
              .eq("id", householdId)
              .maybeSingle()
          : Promise.resolve({
              data: null,
              error: null,
            });

        let devicesQuery = applyHouseholdScope(
          supabase.from("devices").select(
            `
                id,
                device_name,
                brand,
                category,
                location,
                purchase_price,
                warranty_date
              `,
          ),
          householdId,
          user.id,
        );

        const [profileResult, householdResult, devicesResult] =
          await Promise.all([profilePromise, householdPromise, devicesQuery]);

        if (profileResult.error) {
          console.error("Unable to load home profile:", profileResult.error);
        }

        if (householdResult.error) {
          console.error("Unable to load household:", householdResult.error);
        }

        if (devicesResult.error) {
          console.error("Unable to load devices:", devicesResult.error);
          setDevices([]);
          setErrorMessage("Unable to load your rooms.");
          return;
        }

        const sharedHouseholdName = householdResult.data?.name?.trim();

        if (sharedHouseholdName) {
          setHouseholdName(sharedHouseholdName);
        } else {
          const displayName =
            profileResult.data?.full_name?.trim() ||
            user.email?.split("@")[0] ||
            "Homeowner";

          const firstName = displayName.split(" ")[0];

          setHouseholdName(
            profileResult.data?.household_name?.trim() || `${firstName}'s Home`,
          );
        }

        const deviceRows = (devicesResult.data || []) as DeviceRow[];

        if (deviceRows.length === 0) {
          setDevices([]);
          return;
        }

        const deviceIds = deviceRows.map((device) => device.id);

        const [imageResult, documentResult] = await Promise.all([
          supabase
            .from("device_images")
            .select("device_id")
            .in("device_id", deviceIds),

          supabase
            .from("device_documents")
            .select("device_id")
            .in("device_id", deviceIds),
        ]);

        if (imageResult.error) {
          console.error("Unable to load room photos:", imageResult.error);
        }

        if (documentResult.error) {
          console.error("Unable to load room documents:", documentResult.error);
        }

        const deviceIdsWithPhotos = new Set(
          ((imageResult.data || []) as DeviceReferenceRow[]).map(
            (row) => row.device_id,
          ),
        );

        const deviceIdsWithDocuments = new Set(
          ((documentResult.data || []) as DeviceReferenceRow[]).map(
            (row) => row.device_id,
          ),
        );

        setDevices(
          deviceRows.map((device) => ({
            id: device.id,
            deviceName: device.device_name || "Unnamed Device",
            brand: device.brand || "",
            category: device.category || "",
            location: device.location?.trim() || "Unassigned",
            purchasePrice: Number(device.purchase_price || 0),
            warrantyDate: device.warranty_date || "",
            hasPhoto: deviceIdsWithPhotos.has(device.id),
            hasDocument: deviceIdsWithDocuments.has(device.id),
          })),
        );
      } catch (error: unknown) {
        const possibleError = error as {
          message?: string;
          details?: string;
        };

        console.error("Rooms loading error:", error);

        setErrorMessage("Unable to load your rooms.");
      } finally {
        setLoadingRooms(false);
      }
    }

    loadRooms();
  }, [user, isDemo, householdId, permissionsLoading]);

  useEffect(() => {
    async function loadRoomRecords() {
      if (permissionsLoading) {
        return;
      }

      if (isDemo || !user) {
        setRoomRecords([]);
        return;
      }

      try {
        let query = supabase
          .from("rooms")
          .select(
            `
              id,
              name,
              room_type,
              cover_image_path,
              sort_order
            `,
          )
          .order("sort_order", {
            ascending: true,
          })
          .order("created_at", {
            ascending: true,
          });

        query = householdId
          ? query.eq("household_id", householdId)
          : query.is("household_id", null).eq("user_id", user.id);

        const { data, error } = await query;

        if (error) {
          console.error("Unable to load room records:", error);
          return;
        }

        const records = (data || []) as RoomRecord[];

        const withCovers = await Promise.all(
          records.map(async (room) => {
            if (!room.cover_image_path) {
              return {
                ...room,
                coverImageUrl: null,
              };
            }

            const { data: signedData } = await supabase.storage
              .from("room-images")
              .createSignedUrl(room.cover_image_path, 60 * 60);

            return {
              ...room,
              coverImageUrl: signedData?.signedUrl || null,
            };
          }),
        );

        setRoomRecords(withCovers);
      } catch (error) {
        console.error("Room record loading error:", error);
      }
    }

    void loadRoomRecords();
  }, [user, isDemo, householdId, permissionsLoading]);

  const rooms = useMemo(() => {
    const groupedRooms = new Map<
      string,
      {
        name: string;
        devices: HomeDevice[];
      }
    >();

    for (const device of devices) {
      const roomName = device.location.trim() || "Unassigned";

      const key = roomName.toLowerCase();

      const existing = groupedRooms.get(key);

      if (existing) {
        existing.devices.push(device);
      } else {
        groupedRooms.set(key, {
          name: roomName,
          devices: [device],
        });
      }
    }

    for (const record of roomRecords) {
      const key = record.name.trim().toLowerCase();

      if (!groupedRooms.has(key)) {
        groupedRooms.set(key, {
          name: record.name,
          devices: [],
        });
      }
    }

    const roomRecordByName = new Map(
      roomRecords.map((record) => [record.name.trim().toLowerCase(), record]),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from(groupedRooms.values())
      .map(({ name, devices: roomDevices }) => {
        const record = roomRecordByName.get(name.trim().toLowerCase());

        const photoCount = roomDevices.filter(
          (device) => device.hasPhoto,
        ).length;

        const documentCount = roomDevices.filter(
          (device) => device.hasDocument,
        ).length;

        const possibleItems = roomDevices.length * 2;

        const completeness =
          possibleItems === 0
            ? 0
            : Math.round(((photoCount + documentCount) / possibleItems) * 100);

        const expiringWarrantyCount = roomDevices.filter((device) => {
          if (!device.warrantyDate) {
            return false;
          }

          const expiration = new Date(`${device.warrantyDate}T23:59:59`);

          const daysRemaining = Math.ceil(
            (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );

          return daysRemaining >= 0 && daysRemaining <= 90;
        }).length;

        return {
          id: record?.id,
          name: record?.name || name,
          roomType: record?.room_type || null,
          coverImagePath: record?.cover_image_path || null,
          coverImageUrl:
            record?.coverImageUrl ||
            (isDemo
              ? roomDevices.find((device) => Boolean(device.demoImage))
                  ?.demoImage || null
              : null),
          devices: roomDevices,
          deviceCount: roomDevices.length,
          recordedValue: roomDevices.reduce(
            (total, device) => total + device.purchasePrice,
            0,
          ),
          photoCount,
          documentCount,
          completeness,
          expiringWarrantyCount,
        } satisfies RoomSummary;
      })
      .sort((first, second) => {
        if (first.name === "Unassigned") {
          return 1;
        }

        if (second.name === "Unassigned") {
          return -1;
        }

        const firstRecord = roomRecords.findIndex(
          (record) => record.id === first.id,
        );

        const secondRecord = roomRecords.findIndex(
          (record) => record.id === second.id,
        );

        if (firstRecord >= 0 && secondRecord >= 0) {
          return firstRecord - secondRecord;
        }

        if (firstRecord >= 0) {
          return -1;
        }

        if (secondRecord >= 0) {
          return 1;
        }

        return second.recordedValue - first.recordedValue;
      });
  }, [devices, roomRecords, isDemo]);

  const filteredRooms = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return rooms;
    }

    return rooms.filter((room) => {
      const roomMatches = room.name.toLowerCase().includes(query);

      const deviceMatches = room.devices.some((device) =>
        [device.deviceName, device.brand, device.category]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );

      return roomMatches || deviceMatches;
    });
  }, [rooms, searchTerm]);

  const photographedDeviceCount = devices.filter(
    (device) => device.hasPhoto,
  ).length;

  const totalExpiringWarranties = rooms.reduce(
    (total, room) => total + room.expiringWarrantyCount,
    0,
  );

  async function handleCreateRoom() {
    const trimmedName = newRoomName.trim();

    if (!trimmedName) {
      setRoomFormError("Give this room a name.");
      return;
    }

    if (isDemo) {
      showReadOnlyModal();
      return;
    }

    if (!user || !canCreate) {
      setRoomFormError("You do not have permission to create rooms.");
      return;
    }

    if (newRoomPhoto && newRoomPhoto.size > 12 * 1024 * 1024) {
      setRoomFormError("Room photos must be 12 MB or smaller.");
      return;
    }

    if (
      newRoomPhoto &&
      !["image/jpeg", "image/png", "image/webp"].includes(newRoomPhoto.type)
    ) {
      setRoomFormError("Use a JPG, PNG, or WebP photo.");
      return;
    }

    try {
      setSavingRoom(true);
      setRoomFormError("");

      const { data: createdRoom, error: createError } = await supabase
        .from("rooms")
        .insert({
          household_id: householdId || null,
          user_id: user.id,
          name: trimmedName,
          room_type: newRoomType || "room",
        })
        .select(
          `
            id,
            name,
            room_type,
            cover_image_path,
            sort_order
          `,
        )
        .single();

      if (createError || !createdRoom) {
        if (createError?.code === "23505") {
          setRoomFormError("That room already exists.");
          return;
        }

        throw createError || new Error("Room could not be created.");
      }

      let coverImagePath: string | null = null;

      let coverImageUrl: string | null = null;

      if (newRoomPhoto) {
        const extension =
          newRoomPhoto.type === "image/png"
            ? "png"
            : newRoomPhoto.type === "image/webp"
              ? "webp"
              : "jpg";

        const storagePath = `${user.id}/${createdRoom.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("room-images")
          .upload(storagePath, newRoomPhoto, {
            contentType: newRoomPhoto.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Room created but cover upload failed:", uploadError);
        } else {
          coverImagePath = storagePath;

          const { error: updateError } = await supabase
            .from("rooms")
            .update({
              cover_image_path: storagePath,
            })
            .eq("id", createdRoom.id);

          if (!updateError) {
            const { data: signedData } = await supabase.storage
              .from("room-images")
              .createSignedUrl(storagePath, 60 * 60);

            coverImageUrl = signedData?.signedUrl || null;
          }
        }
      }

      setRoomRecords((current) => [
        ...current,
        {
          id: createdRoom.id,
          name: createdRoom.name,
          room_type: createdRoom.room_type,
          cover_image_path: coverImagePath,
          sort_order: createdRoom.sort_order ?? current.length,
          coverImageUrl,
        },
      ]);

      setNewRoomName("");
      setNewRoomType("room");
      setNewRoomPhoto(null);
      setRoomFormError("");
      setAddRoomOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Room could not be created.";

      console.error("Create room error:", error);

      setRoomFormError(message);
    } finally {
      setSavingRoom(false);
    }
  }

  async function handleRoomCoverChange(
    room: {
      id?: string;
      name: string;
      coverImagePath?: string | null;
    },
    file: File,
  ) {
    if (isDemo || !user || !canCreate || !room.id) {
      if (isDemo) {
        showReadOnlyModal();
      }

      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      window.alert("Room photos must be 12 MB or smaller.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      window.alert("Use a JPG, PNG, or WebP photo.");
      return;
    }

    setSavingRoomCoverId(room.id);

    let uploadedPath: string | null = null;

    try {
      const extension =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";

      uploadedPath = `${user.id}/${room.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("room-images")
        .upload(uploadedPath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: updateError } = await supabase
        .from("rooms")
        .update({
          cover_image_path: uploadedPath,
        })
        .eq("id", room.id);

      if (updateError) {
        await supabase.storage.from("room-images").remove([uploadedPath]);

        throw updateError;
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from("room-images")
        .createSignedUrl(uploadedPath, 60 * 60);

      if (signedError) {
        console.error("Room cover signed URL error:", signedError);
      }

      setRoomRecords((current) =>
        current.map((record) =>
          record.id === room.id
            ? {
                ...record,
                cover_image_path: uploadedPath,
                coverImageUrl: signedData?.signedUrl || null,
              }
            : record,
        ),
      );

      /*
       * Remove the old file only after the new
       * file and database path are both safe.
       */
      if (room.coverImagePath && room.coverImagePath !== uploadedPath) {
        const { error: removeError } = await supabase.storage
          .from("room-images")
          .remove([room.coverImagePath]);

        if (removeError) {
          console.warn("Old room cover could not be removed:", removeError);
        }
      }
    } catch (error) {
      console.error("Room cover update failed:", error);

      window.alert("That room photo could not be saved. Please try again.");
    } finally {
      setSavingRoomCoverId(null);
    }
  }

  async function handleRemoveRoomCover(room: {
    id?: string;
    name: string;
    coverImagePath?: string | null;
  }) {
    if (isDemo || !user || !canCreate || !room.id || !room.coverImagePath) {
      if (isDemo) {
        showReadOnlyModal();
      }

      return;
    }

    const confirmed = window.confirm(
      `Remove the cover photo from ${room.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setSavingRoomCoverId(room.id);

    try {
      const oldPath = room.coverImagePath;

      const { error: updateError } = await supabase
        .from("rooms")
        .update({
          cover_image_path: null,
        })
        .eq("id", room.id);

      if (updateError) {
        throw updateError;
      }

      setRoomRecords((current) =>
        current.map((record) =>
          record.id === room.id
            ? {
                ...record,
                cover_image_path: null,
                coverImageUrl: null,
              }
            : record,
        ),
      );

      const { error: removeError } = await supabase.storage
        .from("room-images")
        .remove([oldPath]);

      if (removeError) {
        console.warn("Old room cover storage cleanup failed:", removeError);
      }
    } catch (error) {
      console.error("Remove room cover failed:", error);

      window.alert("The room photo could not be removed. Please try again.");
    } finally {
      setSavingRoomCoverId(null);
    }
  }

  const loading = permissionsLoading || loadingRooms;

  if (loading) {
    return (
      <PageShell className="!max-w-[1500px]">
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 size={22} className="animate-spin" />
            Building your rooms...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell className="!max-w-[1500px]">
        <PageCard className="border-danger/30 bg-danger-soft text-danger">
          <h1 className="text-xl font-semibold">Unable to load rooms</h1>

          <p className="mt-2 text-sm">{errorMessage}</p>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell className="!max-w-[1500px]">
      <div className="h-12 sm:h-14" />

      <PageHero
        className="mt-0"
        section="technology"
        title={
          isDemo
            ? "See what a remembered home looks like."
            : "Your home, room by room."
        }
        description={
          isDemo
            ? "Explore a complete sample home with devices, records, warranties, rooms, and the details Home Tech Vault keeps ready for you."
            : "Everything you’ve remembered, organized by where it lives."
        }
      >
        {canCreate ? (
          <>
            <Button href={getActionHref("/devices/add", "devices")}>
              <Plus size={17} />
              {getActionLabel("Add Device")}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setAddRoomOpen(true)}
            >
              <Plus size={17} />
              Add Room
            </Button>
          </>
        ) : isDemo ? (
          <Button type="button" onClick={handleAddDevice}>
            <Plus size={17} />
            Add Device
          </Button>
        ) : !user ? (
          <Button href="/signup">
            <Plus size={17} />
            Create Your Vault
          </Button>
        ) : (
          <div className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card/80 px-4 py-3 text-sm font-medium text-text-secondary shadow-[var(--shadow-sm)]">
            Viewer Access · Read Only
          </div>
        )}
      </PageHero>

      <ViewerBanner
        show={!isDemo && !canCreate && Boolean(user)}
        description="You can browse rooms and shared devices. Viewer access cannot add, edit, move, or delete room content."
      />

      {devices.length > 0 && (
        <PageCard className="mt-5 p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search your home..."
                className="w-full rounded-[var(--radius-input)] border border-border-subtle bg-surface-sunken py-3.5 pl-11 pr-11 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:bg-surface-card focus:ring-4 focus:ring-interaction/10"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-tertiary transition hover:bg-surface-card hover:text-text-primary"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <p className="shrink-0 text-sm text-text-secondary">
              {filteredRooms.length}{" "}
              {filteredRooms.length === 1 ? "room" : "rooms"}
            </p>
          </div>
        </PageCard>
      )}

      {rooms.length === 0 ? (
        <EmptyState
          icon={Home}
          title="Every room tells a story"
          description="Add your first device and assign it a room to begin seeing your home the way you live in it."
          section="technology"
        >
          {canCreate ? (
            <Button
              href={getActionHref("/devices/add", "devices")}
              className="mt-6"
            >
              <Plus size={17} aria-hidden />
              {getActionLabel("Add your first device")}
            </Button>
          ) : isDemo ? (
            <Button type="button" onClick={handleAddDevice} className="mt-6">
              <Plus size={17} aria-hidden />
              Add your first device
            </Button>
          ) : !user ? (
            <Button href="/signup" className="mt-6">
              <Plus size={17} aria-hidden />
              Create your vault
            </Button>
          ) : (
            <div className="mx-auto mt-6 max-w-md rounded-[var(--radius-button)] bg-surface-sunken px-5 py-4 text-sm text-text-secondary">
              You have viewer access. You can browse shared rooms, but you
              cannot add or change devices.
            </div>
          )}
        </EmptyState>
      ) : filteredRooms.length > 0 ? (
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-overline text-charcoal-soft">
                {isDemo ? "Explore the sample home" : "Room by Room"}
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
                Rooms in your home
              </h2>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
              {totalExpiringWarranties > 0 && (
                <span className="text-amber-700">
                  {totalExpiringWarranties} warranties expiring
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRooms
              .filter((room) => room.name.trim().toLowerCase() !== "network")
              .map((room) =>
                isDemo ? (
                  <DemoRoomCard key={room.name} room={room} />
                ) : (
                  <RealRoomCard
                    key={room.name}
                    room={room}
                    canEdit={canCreate && !isDemo}
                    savingCover={savingRoomCoverId === room.id}
                    onCoverChange={handleRoomCoverChange}

                    onRemoveCover={handleRemoveRoomCover}
                  />
                ),
              )}
          </div>

          {filteredRooms.some(
            (room) => room.name.trim().toLowerCase() === "network",
          ) ? (
            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#617c43]">
                    Home systems
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-text-primary">
                    The systems behind your home
                  </h2>

                  <p className="mt-1 text-sm text-text-secondary">
                    Connectivity and infrastructure live here instead of inside
                    a room.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredRooms
                  .filter(
                    (room) => room.name.trim().toLowerCase() === "network",
                  )
                  .map((room) => (
                    <HomeSystemCard key={room.name} room={room} />
                  ))}
              </div>
            </section>
          ) : null}
        </section>
      ) : (
        <EmptyState
          icon={Search}
          title="No matching rooms"
          description="Try searching for a different room, device, brand, or category."
          section="technology"
        >
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => setSearchTerm("")}
          >
            Clear search
          </Button>
        </EmptyState>
      )}
      {addRoomOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101a22]/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAddRoomOpen(false);
              setRoomFormError("");
            }
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-[30px] border border-white/40 bg-[#f8f5ef] shadow-[0_35px_100px_-35px_rgba(10,20,30,0.65)]">
            <div className="flex items-start justify-between border-b border-[#182533]/10 px-7 py-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#617c43]">
                  My Home
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#101a22]">
                  Create a room
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#67727a]">
                  Add a space to your home and give it an optional cover photo.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => {
                  setAddRoomOpen(false);
                  setRoomFormError("");
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#182533]/10 bg-white text-[#67727a]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-5 px-7 py-6">
              <label className="block">
                <span className="text-sm font-semibold text-[#101a22]">
                  Room name
                </span>

                <input
                  value={newRoomName}
                  onChange={(event) => setNewRoomName(event.target.value)}
                  placeholder="Kitchen"
                  maxLength={80}
                  className="mt-2 w-full rounded-2xl border border-[#182533]/12 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#617c43]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#101a22]">
                  Room type
                </span>

                <select
                  value={newRoomType}
                  onChange={(event) => setNewRoomType(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#182533]/12 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#617c43]"
                >
                  <option value="room">Other Room</option>
                  <option value="living_room">Living Room</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="office">Office / Study</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="garage">Garage</option>
                  <option value="laundry">Laundry Room</option>
                  <option value="dining">Dining Room</option>
                  <option value="outdoor">Patio / Outdoor</option>
                  <option value="storage">Storage</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#101a22]">
                  Room photo
                </span>

                <div className="mt-2 rounded-2xl border border-dashed border-[#617c43]/30 bg-white/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef1e9] text-[#617c43]">
                      <ImageIcon size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#101a22]">
                        {newRoomPhoto ? newRoomPhoto.name : "Add a cover photo"}
                      </p>

                      <p className="mt-1 text-xs text-[#7b858c]">
                        JPG, PNG or WebP · 12 MB max
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      setNewRoomPhoto(event.target.files?.[0] || null)
                    }
                    className="mt-4 block w-full text-xs text-[#67727a]"
                  />
                </div>
              </label>

              {roomFormError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {roomFormError}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-3 border-t border-[#182533]/10 px-7 py-5">
              <Button
                type="button"
                variant="secondary"
                disabled={savingRoom}
                onClick={() => {
                  setAddRoomOpen(false);
                  setRoomFormError("");
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={savingRoom}
                onClick={() => void handleCreateRoom()}
              >
                {savingRoom ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}

                {savingRoom ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

function HomeSystemCard({ room }: { room: RoomSummary }) {
  const previewDevices = room.devices.slice(0, 4);

  return (
    <Link
      href="/network"
      className="group block overflow-hidden rounded-[28px] border border-[#20384b]/20 shadow-[0_24px_60px_-38px_rgba(23,43,58,0.75)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-38px_rgba(23,43,58,0.85)]"
      style={{
        backgroundColor: "#20384b",
        color: "#ffffff",
      }}
    >
      <div
        className="relative overflow-hidden p-7"
        style={{
          backgroundColor: "#20384b",
          color: "#ffffff",
        }}
      >
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/8 blur-2xl" />

        <div className="relative flex items-start justify-between gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
            <Home size={22} />
          </div>

          <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">
            Home System
          </span>
        </div>

        <div className="relative mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Home Wi-Fi
          </p>

          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Your connected home
          </h3>

          <p className="mt-2 text-sm text-white/65">
            {room.deviceCount}{" "}
            {room.deviceCount === 1
              ? "device documented"
              : "devices documented"}
          </p>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-2">
          {previewDevices.map((device) => (
            <div
              key={device.id}
              className="truncate rounded-xl bg-white/7 px-3 py-2 text-xs text-white/75"
            >
              {device.deviceName}
            </div>
          ))}
        </div>

        <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <span className="text-xs text-white/50">Manage your Home Wi-Fi</span>

          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            Open
            <ArrowRight
              size={14}
              className="transition group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function getRoomVisualClass(roomName: string) {
  const room = roomName.toLowerCase();

  if (room.includes("living") || room.includes("family")) {
    return "bg-[linear-gradient(145deg,#d8dfce_0%,#eee9dc_100%)]";
  }

  if (
    room.includes("office") ||
    room.includes("study") ||
    room.includes("den")
  ) {
    return "bg-[linear-gradient(145deg,#d7dde0_0%,#ebe7dc_100%)]";
  }

  if (room.includes("bed")) {
    return "bg-[linear-gradient(145deg,#ddd8d2_0%,#f1ebe0_100%)]";
  }

  if (room.includes("kitchen") || room.includes("dining")) {
    return "bg-[linear-gradient(145deg,#e4dccd_0%,#f4efe4_100%)]";
  }

  if (room.includes("garage")) {
    return "bg-[linear-gradient(145deg,#d4d8d3_0%,#e8e4da_100%)]";
  }

  return "bg-[linear-gradient(145deg,#dfe1d6_0%,#eee8dc_100%)]";
}

function RoomStatusBadge({ completeness }: { completeness: number }) {
  const complete = completeness >= 100;

  if (complete) {
    return (
      <span
        className="relative z-20 inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold shadow-md"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "rgba(34, 99, 65, 0.35)",
          color: "#17643a",
          opacity: 1,
        }}
      >
        Complete
      </span>
    );
  }

  return (
    <span
      className="relative z-20 inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold shadow-sm"
      style={{
        backgroundColor: "#fff8eb",
        borderColor: "rgba(168, 95, 8, 0.25)",
        color: "#a85f08",
        opacity: 1,
      }}
    >
      Details to finish
    </span>
  );
}

function RoomMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-sunken p-4">
      <p className="text-xs text-text-tertiary">{label}</p>

      <p className="mt-2 truncate font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function getRoomIcon(roomName: string): RoomIcon {
  const room = roomName.toLowerCase();

  if (room.includes("living") || room.includes("family")) {
    return Sofa;
  }

  if (room.includes("office") || room.includes("study")) {
    return Monitor;
  }

  if (room.includes("bed")) {
    return BedDouble;
  }

  if (room.includes("kitchen") || room.includes("dining")) {
    return ChefHat;
  }

  if (room.includes("garage")) {
    return Car;
  }

  if (room.includes("bath")) {
    return Bath;
  }

  if (room.includes("game") || room.includes("media")) {
    return Gamepad2;
  }

  if (
    room.includes("patio") ||
    room.includes("outdoor") ||
    room.includes("yard")
  ) {
    return Trees;
  }

  if (
    room.includes("storage") ||
    room.includes("attic") ||
    room.includes("basement")
  ) {
    return Warehouse;
  }

  if (room.includes("unassigned")) {
    return CircleAlert;
  }

  return Home;
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function HomePage() {
  return <RoomsContent />;
}
