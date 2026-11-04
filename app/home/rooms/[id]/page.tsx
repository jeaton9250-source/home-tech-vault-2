"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileText,
  FolderOpen,
  Home,
  ImageIcon,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";
import { usePermissions } from "@/hooks/usePermissions";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import { groupHomeRooms } from "@/lib/home/roomGrouping";
import { MORGAN_ROOMS } from "@/lib/demo/morganRooms";
import { demoDevices, demoDocuments, demoMaintenance } from "@/lib/demoData";
import { supabase } from "@/lib/supabase";

type RoomRecord = {
  id: string;
  name: string;
  room_type: string | null;
  cover_image_path: string | null;
};

type RoomDevice = {
  id: string;
  device_name: string | null;
  brand: string | null;
  category: string | null;
  purchase_price: number | null;
  warranty_date: string | null;
  location: string | null;
  room_id: string | null;
  photo_url?: string | null;
  demo_image?: string | null;
};

type MaintenanceItem = {
  id: string;
  device_id: string | null;
  title: string | null;
  due_date: string | null;
  completed: boolean;
};

type RoomExperience = {
  record: RoomRecord;
  coverUrl: string | null;
  devices: RoomDevice[];
  documentsByDevice: Record<string, number>;
  maintenance: MaintenanceItem[];
};

const todayDay = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const dateLabel = (date: string) => {
  const parsed = new Date(date + "T12:00:00");
  return Number.isNaN(parsed.getTime())
    ? "No date set"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
};

const warrantyExpiring = (value: string | null) => {
  if (!value) return false;
  const date = new Date(value + "T12:00:00");
  const days = (date.getTime() - todayDay().getTime()) / 86400000;
  return Number.isFinite(days) && days >= 0 && days <= 90;
};

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomId = typeof params?.id === "string" ? params.id : "";

  const { user, isDemo, householdId, canCreate, loading: permissionsLoading } =
    usePermissions();

  const [room, setRoom] = useState<RoomExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const loadRoom = useCallback(async () => {
    if (permissionsLoading || !roomId) return;
    if (isDemo) {
      const slug = roomId.startsWith("demo-") ? roomId.slice(5) : "";
      const demoRoom = MORGAN_ROOMS.find((candidate) =>
        candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slug
      );
      if (!demoRoom) {
        setRoom(null);
        setError("That sample room isn't available.");
        setLoading(false);
        return;
      }
      const selected = demoDevices.filter((device) =>
        (demoRoom.deviceIds as readonly string[]).includes(device.id)
      );
      const documentsByDevice: Record<string, number> = {};
      for (const doc of demoDocuments) {
        if (doc.device_id && selected.some((device) => device.id === doc.device_id)) {
          documentsByDevice[doc.device_id] = (documentsByDevice[doc.device_id] || 0) + 1;
        }
      }
      setRoom({
        record: { id: roomId, name: demoRoom.name, room_type: "room", cover_image_path: null },
        coverUrl: null,
        devices: selected.map((device) => ({
          id: device.id,
          device_name: device.device_name,
          brand: device.brand,
          category: device.category,
          purchase_price: device.purchase_price,
          warranty_date: device.warranty_date,
          location: device.location,
          room_id: null,
          demo_image: device.demo_image,
        })),
        documentsByDevice,
        maintenance: demoMaintenance
          .filter((task) => selected.some((device) => device.id === task.device_id))
          .map((task) => ({
            id: task.id,
            device_id: task.device_id,
            title: task.title,
            due_date: task.due_date,
            completed: Boolean(task.completed),
          })),
      });
      setError("");
      setLoading(false);
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Respect the same household isolation as /home and /devices.
      const roomScope = applyHouseholdScope(
        supabase
          .from("rooms")
          .select("id, name, room_type, cover_image_path")
          .eq("id", roomId),
        householdId,
        user.id,
      );
      const { data: roomData, error: roomError } = await roomScope.maybeSingle();
      if (roomError) throw roomError;
      if (!roomData) {
        setRoom(null);
        setError("This room is not part of your home or is no longer available.");
        return;
      }

      const record = roomData as RoomRecord;
      const deviceScope = applyHouseholdScope(
        supabase
          .from("devices")
          .select("id, device_name, brand, category, purchase_price, warranty_date, location, room_id"),
        householdId,
        user.id,
      );
      const { data: deviceData, error: devicesError } = await deviceScope;
      if (devicesError) throw devicesError;
      const allDevices = (deviceData || []) as RoomDevice[];

      // Include both UUID-linked devices and unambiguously matched legacy locations.
      const matched = groupHomeRooms(
        [record],
        allDevices.map((device) => ({ ...device, roomId: device.room_id })),
      ).find((group) => group.record?.id === record.id);
      const roomDevices = matched?.devices || [];
      const ids = roomDevices.map((device) => device.id);

      const [coverResult, docsResult, vaultDocsResult, maintenanceResult, imagesResult] =
        await Promise.all([
          record.cover_image_path
            ? supabase.storage.from("room-images").createSignedUrl(record.cover_image_path, 3600)
            : Promise.resolve({ data: null, error: null }),
          ids.length
            ? supabase.from("device_documents").select("device_id").in("device_id", ids)
            : Promise.resolve({ data: [], error: null }),
          ids.length
            ? applyHouseholdScope(
                supabase.from("documents").select("device_id").in("device_id", ids),
                householdId, user.id,
              )
            : Promise.resolve({ data: [], error: null }),
          ids.length
            ? applyHouseholdScope(
                supabase.from("maintenance_tasks")
                  .select("id, device_id, title, due_date, completed")
                  .in("device_id", ids),
                householdId, user.id,
              )
            : Promise.resolve({ data: [], error: null }),
          ids.length
            ? supabase.from("device_images")
                .select("device_id, image_url")
                .in("device_id", ids)
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
        ]);

      if (coverResult.error) console.warn("Room cover not available", coverResult.error);
      if (docsResult.error) console.warn("Room documents not available", docsResult.error);
      if (vaultDocsResult.error) console.warn("Room files not available", vaultDocsResult.error);
      if (maintenanceResult.error) console.warn("Room reminders not available", maintenanceResult.error);
      if (imagesResult.error) console.warn("Room device photos not available", imagesResult.error);

      const documentCounts: Record<string, number> = {};
      for (const row of [...(docsResult.data || []), ...(vaultDocsResult.data || [])]) {
        if (row.device_id) documentCounts[row.device_id] = (documentCounts[row.device_id] || 0) + 1;
      }

      const firstImageByDevice = new Map<string, string>();
      for (const img of imagesResult.data || []) {
        if (img.device_id && img.image_url && !firstImageByDevice.has(img.device_id)) {
          firstImageByDevice.set(img.device_id, img.image_url);
        }
      }
      const signedImages = await Promise.all(
        Array.from(firstImageByDevice.entries()).map(async ([id, path]) => {
          const { data } = await supabase.storage
            .from("device-images")
            .createSignedUrl(path, 3600);
          return [id, data?.signedUrl || null] as const;
        }),
      );
      const photoByDevice = new Map(signedImages);

      setRoom({
        record,
        coverUrl: coverResult.data?.signedUrl || null,
        devices: roomDevices.map((device) => ({
          ...device,
          photo_url: photoByDevice.get(device.id) || null,
        })),
        documentsByDevice: documentCounts,
        maintenance: (maintenanceResult.data || []) as MaintenanceItem[],
      });
    } catch (caught) {
      console.error("Room experience error:", caught);
      setError("We couldn't open this room right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [permissionsLoading, roomId, isDemo, user, householdId, router]);

  useEffect(() => {
    void loadRoom();
  }, [loadRoom]);

  const filteredDevices = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!room || !search) return room?.devices || [];
    return room.devices.filter((device) =>
      [device.device_name, device.brand, device.category]
        .filter(Boolean).join(" ").toLowerCase().includes(search),
    );
  }, [room, query]);

  const dueMaintenance = useMemo(() => {
    if (!room) return [];
    return room.maintenance
      .filter((task) => !task.completed)
      .sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"))
      .slice(0, 3);
  }, [room]);

  const expiringCount = room?.devices.filter((device) => warrantyExpiring(device.warranty_date)).length || 0;
  const documentCount = Object.values(room?.documentsByDevice || {}).reduce((a, b) => a + b, 0);
  const recordedValue = room?.devices.reduce((sum, device) => sum + Number(device.purchase_price || 0), 0) || 0;

  if (permissionsLoading || loading) {
    return (
      <main className="min-h-[60vh] bg-[#f5f1e8] px-6 py-16">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 py-20 text-sm text-[#59625d]">
          <Loader2 size={22} className="animate-spin text-[#617c43]" />
          Opening your room…
        </div>
      </main>
    );
  }

  if (!room || error) {
    return (
      <main className="min-h-[65vh] bg-[#f5f1e8] px-5 py-12">
        <div className="mx-auto max-w-xl rounded-[28px] border border-[#ddd8cb] bg-[#fffdf8] p-10 text-center shadow-sm">
          <CircleAlert size={32} className="mx-auto text-[#a16b45]" />
          <h1 className="mt-4 font-serif text-4xl text-[#183047]">Room unavailable</h1>
          <p className="mt-3 text-sm leading-7 text-[#59625d]">{error || "This room could not be found."}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/home" className="inline-flex items-center gap-2 rounded-full bg-[#183047] px-6 py-3 text-sm font-semibold text-white">
              <ArrowLeft size={17} /> All spaces
            </Link>
            <button type="button" onClick={() => void loadRoom()} className="rounded-full border border-[#d8d6cb] px-6 py-3 text-sm font-semibold text-[#183047]">
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { record, coverUrl, devices, documentsByDevice } = room;
  const samplePhoto = /living|family|den|lounge/i.test(record.name)
    ? "/images/pricing-living-room.jpg"
    : "/images/home-hero.jpg";

  return (
    <main className="htv-native-page min-h-screen bg-[#f5f1e8] pb-12 text-[#183047] lg:pb-24">
      <div className="mx-auto max-w-[1450px] px-4 pt-6 sm:px-6 lg:px-10">
        <nav aria-label="Breadcrumb" className="mb-5 flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 text-[12px] font-semibold text-[#697871] sm:mb-6">
          <Link href="/dashboard" className="hover:text-[#183047]">My Home</Link>
          <ChevronRight size={14} />
          <Link href="/home" className="hover:text-[#183047]">My Spaces</Link>
          <ChevronRight size={14} />
          <span className="truncate text-[#183047]" aria-current="page">{record.name}</span>
        </nav>

        <section className="relative isolate overflow-hidden rounded-[30px] bg-[#183047] text-white shadow-[0_24px_60px_rgba(24,48,71,.13)]">
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{ backgroundImage: "url(" + (coverUrl || samplePhoto) + ")" }}
            role="img"
            aria-label={coverUrl ? record.name + " room photo" : "Illustrative interior photograph"}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#142536]/95 via-[#15293a]/78 to-[#15293a]/15" />
          {!coverUrl ? (
            <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-[#183047]/65 px-3 py-1.5 text-[10px] font-semibold text-white/85 backdrop-blur">
              Sample room photo
            </span>
          ) : null}

          <div className="flex min-h-[340px] max-w-3xl flex-col justify-end px-5 py-9 sm:min-h-[400px] sm:px-11 lg:min-h-[440px] lg:px-16">
            <p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#b9d19c]">A SPACE IN YOUR HOME</p>
            <h1 className="mt-4 font-serif text-[clamp(2.75rem,9vw,7rem)] font-medium leading-[.95] tracking-[-.05em]">
              {record.name}
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#e7e8e1] sm:text-lg">
              The things you use, the details you keep, and the stories worth remembering.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {canCreate && !isDemo ? (
                <Link
                  href={"/devices/add?room=" + encodeURIComponent(record.name)}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#718d4f] sm:w-auto px-6 text-sm font-semibold text-white transition hover:bg-[#819d5a]"
                >
                  <Plus size={17} /> Add something here
                </Link>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
                <Home size={16} /> {devices.length} {devices.length === 1 ? "thing" : "things"} remembered
              </span>
            </div>
          </div>
        </section>

        <section aria-label="Room record summary" className="htv-room-stat-scroll mt-6 grid auto-cols-[minmax(215px,70vw)] grid-flow-col gap-3 overflow-x-auto pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 sm:overflow-visible">
          <div className="snap-start flex items-center gap-4 rounded-[22px] border border-[#dedbd0] bg-[#fffdf8] p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2e8] text-[#617c43]"><FileText size={22} /></span>
            <div><p className="font-serif text-3xl leading-none">{documentCount}</p><p className="mt-1 text-xs text-[#68766f]">saved documents</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-[22px] border border-[#dedbd0] bg-[#fffdf8] p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2e8] text-[#617c43]"><ShieldCheck size={22} /></span>
            <div><p className="font-serif text-3xl leading-none">{expiringCount}</p><p className="mt-1 text-xs text-[#68766f]">warranties to review</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-[22px] border border-[#dedbd0] bg-[#fffdf8] p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2e8] text-[#617c43]"><CalendarClock size={22} /></span>
            <div><p className="font-serif text-3xl leading-none">{room.maintenance.filter((task) => !task.completed).length}</p><p className="mt-1 text-xs text-[#68766f]">open maintenance items</p></div>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="room-things-heading">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.21em] text-[#617c43]">YOUR ROOM COLLECTION</p>
              <h2 id="room-things-heading" className="mt-3 font-serif text-[clamp(2.45rem,4vw,4rem)] font-medium leading-[1.05] tracking-[-.045em]">
                Everything in {record.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#66756d]">
                Open a device to see its photos, paperwork, warranty and service history.
              </p>
            </div>
            <div className="relative w-full md:max-w-[285px]">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#617c43]" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                placeholder="Find something in this room"
                aria-label="Search items in this room"
                className="h-12 w-full rounded-full border border-[#d8d8cc] bg-[#fffdf8] pl-11 pr-11 text-base sm:text-sm text-[#183047] outline-none placeholder:text-[#879084] focus:border-[#718d4f] focus:ring-2 focus:ring-[#718d4f]/15" />
              {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#617c43]"><X size={16}/></button> : null}
            </div>
          </div>

          {filteredDevices.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDevices.map((device) => {
                const docs = documentsByDevice[device.id] || 0;
                const expiring = warrantyExpiring(device.warranty_date);
                return (
                  <Link key={device.id} href={"/devices/" + device.id} className="htv-touch-card group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#dedbd0] bg-[#fffdf8] shadow-[0_10px_34px_rgba(24,48,71,.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(24,48,71,.12)]">
                    <div className="relative overflow-hidden bg-[#e8ede6]">
                      <DeviceImageDisplay
                        device={{
                          id: device.id,
                          device_name: device.device_name,
                          brand: device.brand,
                          category: device.category,
                          photo_url: device.photo_url,
                  demo_image: device.demo_image,
                        }}
                        variant="room"
                        className="!aspect-[16/10]"
                      />
                      {expiring ? (
                        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#fffdf8]/95 px-3 py-1.5 text-[11px] font-semibold text-[#9c7131] shadow-sm">
                          <ShieldCheck size={13} /> Warranty ending soon
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#617c43]">{device.category || "Home essential"}</p>
                      <h3 className="mt-2 font-serif text-[29px] leading-tight tracking-[-.035em]">{device.device_name || "Unnamed item"}</h3>
                      <p className="mt-1 text-sm text-[#66756d]">{device.brand || "Saved in your home"}</p>
                      <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-[#506c50]">
                        <span className="rounded-full bg-[#eef2e8] px-3 py-1.5">{docs} {docs === 1 ? "document" : "documents"}</span>
                        {device.warranty_date ? (
                          <span className="rounded-full bg-[#f4f1e9] px-3 py-1.5">Warranty: {dateLabel(device.warranty_date)}</span>
                        ) : null}
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-[#e9e6dc] pt-4 text-sm font-semibold text-[#526b39]">
                        Open device record <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-7 rounded-[28px] border border-dashed border-[#bdc9b7] bg-[#e9eee5] px-7 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#617c43]"><FolderOpen size={25} /></span>
              <h3 className="mt-5 font-serif text-3xl">
                {query ? "Nothing matches that search." : "A room full of possibilities."}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#65736b]">
                {query ? "Try a different name, brand or category." : "Start by adding something you want to keep track of in this room."}
              </p>
              {canCreate && !isDemo && !query ? (
                <Link href={"/devices/add?room=" + encodeURIComponent(record.name)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#617c43] px-5 py-3 text-sm font-semibold text-white">
                  <Plus size={16} /> Add your first item
                </Link>
              ) : null}
            </div>
          )}
        </section>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
          <section className="rounded-[26px] border border-[#dedbd0] bg-[#fffdf8] p-7 sm:p-9" aria-labelledby="room-maintenance-title">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.19em] text-[#617c43]">CARE FOR YOUR SPACE</p>
                <h2 id="room-maintenance-title" className="mt-2 font-serif text-3xl">Upcoming homekeeping</h2>
              </div>
              <CalendarClock size={22} className="text-[#617c43]" aria-hidden />
            </div>
            {dueMaintenance.length ? (
              <div className="mt-5 divide-y divide-[#e5e3d8]">
                {dueMaintenance.map((task) => {
                  const linked = devices.find((device) => device.id === task.device_id);
                  return (
                    <Link key={task.id} href={linked ? "/devices/" + linked.id + "?tab=maintenance" : "/maintenance"}
                      className="group flex items-center gap-3 py-4 text-sm">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2e8] text-[#617c43]"><CalendarClock size={18} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-[#183047]">{task.title || "Maintenance reminder"}</span>
                        <span className="mt-1 block text-xs text-[#68766f]">
                          {task.due_date ? "Due " + dateLabel(task.due_date) : "No due date"}
                          {linked ? " · " + (linked.device_name || "Device") : ""}
                        </span>
                      </span>
                      <ChevronRight size={17} className="text-[#617c43] transition group-hover:translate-x-1" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#eef2e8] p-5">
                <CheckCircle2 size={23} className="shrink-0 text-[#617c43]" />
                <div><p className="text-sm font-semibold">Nothing due in this room</p><p className="mt-1 text-xs leading-6 text-[#65736b]">Your future service reminders will live here.</p></div>
              </div>
            )}
          </section>

          <section className="relative isolate overflow-hidden rounded-[26px] bg-[#183047] p-7 text-[#fffdf8] sm:p-9" aria-labelledby="room-papers-title">
            <div className="absolute -right-16 -top-10 -z-10 h-60 w-60 rounded-full bg-[#718d4f]/25 blur-[70px]" />
            <p className="text-[11px] font-bold uppercase tracking-[.19em] text-[#b5cd92]">THE DETAILS STAY TOGETHER</p>
            <h2 id="room-papers-title" className="mt-4 font-serif text-[clamp(2.2rem,3vw,3.3rem)] leading-[1.09] tracking-[-.04em]">
              An easier way to find the paperwork.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#cdd9dc]">
              Keep the right receipts, manuals, coverage and service history attached to the things they belong to.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <Link href="/documents" className="flex items-center justify-between gap-2 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm font-semibold transition hover:bg-white/15">
                Documents <FileText size={17}/>
              </Link>
              <Link href="/warranties" className="flex items-center justify-between gap-2 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm font-semibold transition hover:bg-white/15">
                Warranties <ShieldCheck size={17}/>
              </Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-[#b5c9cf]">
              These links open your household collections. Open an item above for its specific documents and warranty.
            </p>
          </section>
        </div>

        {record.name && recordedValue > 0 ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#738077]">
            <BookOpen size={15} aria-hidden />
            Recorded purchase value of items in this room: {new Intl.NumberFormat("en-US", {style:"currency",currency:"USD",maximumFractionDigits:0}).format(recordedValue)}
          </div>
        ) : null}

        <div className="mt-12 text-center">
          <Link href="/home" className="inline-flex items-center gap-2 rounded-full border border-[#d9d5ca] bg-[#fffdf8] px-6 py-3 text-sm font-semibold text-[#183047] transition hover:bg-[#e8eddf]">
            <ArrowLeft size={17} /> Back to all my spaces
          </Link>
        </div>
      </div>
    </main>
  );
}
