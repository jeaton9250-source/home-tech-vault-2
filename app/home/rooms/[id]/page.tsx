"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Loader2,
  MapPin,
  Plus,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";
import { useDemoMode } from "@/hooks/useDemoMode";
import { createClient } from "@/lib/supabase/client";

type RoomRecord = {
  id: string;
  name: string;
  room_type?: string | null;
  cover_image_path?: string | null;
};

type RoomDevice = {
  id: string;
  device_name: string;
  brand?: string | null;
  category?: string | null;
  purchase_price?: number | null;
  warranty_expiration?: string | null;
  location?: string | null;
  room_id?: string | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RoomDetailPage() {
  const supabase = createClient();
  const params = useParams<{
    id: string;
  }>();

  const router = useRouter();

  const { user, isDemo, loading: authLoading } = useDemoMode();

  const roomId = typeof params?.id === "string" ? params.id : "";

  const [room, setRoom] = useState<RoomRecord | null>(null);

  const [devices, setDevices] = useState<RoomDevice[]>([]);

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRoom() {
      if (authLoading || !roomId) {
        return;
      }

      /*
       * Demo stays locked to /home.
       * Real room pages are signed-in only.
       */
      if (isDemo) {
        router.replace("/home");
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("id, name, room_type, cover_image_path")
          .eq("id", roomId)
          .single();

        if (roomError || !roomData) {
          throw roomError || new Error("Room not found");
        }

        setRoom(roomData);

        if (roomData.cover_image_path) {
          const { data: signedData, error: signedUrlError } =
            await supabase.storage
              .from("room-images")
              .createSignedUrl(roomData.cover_image_path, 60 * 60);

          if (signedUrlError) {
            console.warn("Room cover URL failed:", signedUrlError);
          }

          setCoverImageUrl(signedData?.signedUrl || null);
        } else {
          setCoverImageUrl(null);
        }

        const { data: deviceData, error: deviceError } = await supabase
          .from("devices")
          .select(
            "id, device_name, brand, category, purchase_price, warranty_expiration, location, room_id",
          )
          .eq("room_id", roomData.id)
          .order("device_name", {
            ascending: true,
          });

        if (deviceError) {
          throw deviceError;
        }

        setDevices(deviceData || []);
      } catch (loadError) {
        console.error("Room detail load failed:", loadError);

        setError("This room could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    void loadRoom();
  }, [authLoading, isDemo, roomId, router, user]);

  const recordedValue = useMemo(
    () =>
      devices.reduce(
        (total, device) => total + Number(device.purchase_price || 0),
        0,
      ),
    [devices],
  );

  const expiringWarrantyCount = useMemo(() => {
    const now = Date.now();

    const ninetyDays = now + 90 * 24 * 60 * 60 * 1000;

    return devices.filter((device) => {
      if (!device.warranty_expiration) {
        return false;
      }

      const expiration = new Date(device.warranty_expiration).getTime();

      return expiration >= now && expiration <= ninetyDays;
    }).length;
  }, [devices]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#f2eee5] px-6 pb-16 pt-32">
        <div className="mx-auto flex max-w-6xl justify-center py-24">
          <Loader2 size={28} className="animate-spin text-[#617c43]" />
        </div>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="min-h-screen bg-[#f2eee5] px-6 pb-16 pt-32">
        <div className="mx-auto max-w-xl rounded-[28px] border border-[#20384b]/10 bg-[#fbfaf7] p-8 text-center">
          <CircleAlert size={30} className="mx-auto text-[#a85f08]" />

          <h1 className="mt-4 text-2xl font-semibold text-[#172b3a]">
            Room unavailable
          </h1>

          <p className="mt-2 text-sm text-[#617078]">{error}</p>

          <Link
            href="/home"
            className="mt-6 inline-flex rounded-full bg-[#20384b] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to My Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2eee5] px-5 pb-16 pt-32 sm:px-7">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#617078] transition hover:text-[#20384b]"
        >
          <ArrowLeft size={16} />
          My Home
        </Link>

        <section className="mt-5 overflow-hidden rounded-[32px] border border-[#20384b]/10 bg-[#fbfaf7] shadow-[0_24px_70px_-52px_rgba(23,43,58,0.65)]">
          {coverImageUrl ? (
            <div className="relative h-56 overflow-hidden sm:h-72">
              <img
                src={coverImageUrl}
                alt={`${room.name} room`}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#172b3a]/50 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="h-32 bg-[linear-gradient(135deg,#e5ebe4_0%,#f3efe6_56%,#e8dfd2_100%)]" />
          )}

          <div className="px-6 py-7 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#617c43]">
              In your home
            </p>

            <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.045em] text-[#172b3a]">
                  {room.name}
                </h1>

                <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#617078]">
                  <MapPin size={15} />
                  {devices.length}{" "}
                  {devices.length === 1
                    ? "thing remembered"
                    : "things remembered"}
                </p>
              </div>

              <Link
                href={`/devices/add?room=${encodeURIComponent(room.name)}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#617c43] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#536b39]"
              >
                <Plus size={16} />
                Add to this room
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] border border-[#20384b]/10 bg-[#fbfaf7] p-5">
            <p className="text-xs text-[#7b858c]">Remembered</p>

            <p className="mt-1 text-2xl font-semibold text-[#172b3a]">
              {devices.length}
            </p>
          </div>

          <div className="rounded-[22px] border border-[#20384b]/10 bg-[#fbfaf7] p-5">
            <p className="text-xs text-[#7b858c]">Recorded value</p>

            <p className="mt-1 text-2xl font-semibold text-[#172b3a]">
              {formatCurrency(recordedValue)}
            </p>
          </div>

          <div className="rounded-[22px] border border-[#20384b]/10 bg-[#fbfaf7] p-5">
            <p className="text-xs text-[#7b858c]">Warranties soon</p>

            <p className="mt-1 text-2xl font-semibold text-[#172b3a]">
              {expiringWarrantyCount}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#617c43]">
            Remembered here
          </p>

          <div className="mt-1 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-[-0.035em] text-[#172b3a]">
              What’s in {room.name}
            </h2>

            <Link
              href={`/devices?search=${encodeURIComponent(room.name)}`}
              className="text-sm font-semibold text-[#9a6d2c]"
            >
              View all
            </Link>
          </div>

          {devices.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {devices.map((device) => (
                <Link
                  key={device.id}
                  href={`/devices/${device.id}`}
                  className="group flex items-center gap-4 rounded-[22px] border border-[#20384b]/10 bg-[#fbfaf7] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <DeviceImageDisplay
                    device={{
                      id: device.id,
                      device_name: device.device_name,
                      brand: device.brand,
                      category: device.category,
                    }}
                    variant="thumbnail"
                    className="!aspect-auto h-14 w-14 shrink-0 rounded-2xl"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#172b3a]">
                      {device.device_name}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#7b858c]">
                      {[device.brand, device.category]
                        .filter(Boolean)
                        .join(" · ") || "Device"}
                    </p>
                  </div>

                  <ArrowRight
                    size={16}
                    className="text-[#8b969d] transition group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[26px] border border-dashed border-[#617c43]/25 bg-[#f7f4ed] px-6 py-12 text-center">
              <h3 className="font-semibold text-[#172b3a]">
                Nothing remembered here yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#617078]">
                Add the first device to start building this room’s memory.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
