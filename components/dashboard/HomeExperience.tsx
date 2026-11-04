"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Home,
  Laptop,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sofa,
  BedDouble,
  ChefHat,
  Trees,
  Bath,
  Sparkles,
  History,
} from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import { useDemoMode } from "@/hooks/useDemoMode";
import { supabase } from "@/lib/supabase";
import { loadDashboardMetrics } from "@/lib/data/dashboardData";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import { groupHomeRooms } from "@/lib/home/roomGrouping";
import { getDemoHomeDevices } from "@/lib/demo/homeDevices";
import { demoActivityEvents } from "@/lib/activity/demoActivity";
import { loadActivityFeed } from "@/lib/activity/loadActivityFeed";
import { demoDashboard, demoMaintenance, demoDevices } from "@/lib/demoData";
import type { VaultActivityEvent } from "@/lib/activity/types";
import { getActivityIcon } from "@/lib/activity/icons";

type HomeRoom = {
  id?: string;
  name: string;
  count: number;
  coverUrl: string | null;
};
type HomeCare = {
  id: string;
  title: string;
  detail: string;
  href: string;
  kind: "maintenance" | "warranty" | "next";
};
type HomeView = {
  firstName: string;
  householdName: string;
  devices: number;
  documents: number;
  rooms: HomeRoom[];
  care: HomeCare[];
  activity: VaultActivityEvent[];
};
type RoomRow = {
  id: string;
  name: string;
  cover_image_path: string | null;
};
type DeviceRow = {
  id: string;
  room_id: string | null;
  location: string | null;
  device_name: string | null;
  warranty_date: string | null;
};
type MaintenanceRow = {
  id: string;
  title: string | null;
  due_date: string | null;
  completed: boolean;
};

const roomIllustrations: Record<string, string> = {
  kitchen: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=760&q=85",
  living: "/images/pricing-living-room.jpg",
  bedroom: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=760&q=85",
  office: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=760&q=85",
  exterior: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=760&q=85",
  bathroom: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=760&q=85",
  other: "/images/home-hero.jpg",
};

function roomStyle(name: string) {
  const value = name.toLowerCase();
  if (/(kitchen|dining|pantry)/.test(value)) return { image: roomIllustrations.kitchen, Icon: ChefHat };
  if (/(living|family|lounge|den)/.test(value)) return { image: roomIllustrations.living, Icon: Sofa };
  if (/(bed|nursery|guest)/.test(value)) return { image: roomIllustrations.bedroom, Icon: BedDouble };
  if (/(office|study|work)/.test(value)) return { image: roomIllustrations.office, Icon: Laptop };
  if (/(outdoor|exterior|yard|garden|garage|patio)/.test(value)) return { image: roomIllustrations.exterior, Icon: Trees };
  if (/(bath|laundry)/.test(value)) return { image: roomIllustrations.bathroom, Icon: Bath };
  return { image: roomIllustrations.other, Icon: Home };
}

function niceDate(date: string) {
  const parsed = new Date(date + "T12:00:00");
  return Number.isNaN(parsed.getTime())
    ? "Date to review"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(parsed);
}

function makeCare(
  tasks: MaintenanceRow[],
  devices: DeviceRow[],
  recommendation?: { title: string; description: string; href: string } | null,
): HomeCare[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ninetyDays = new Date(today);
  ninetyDays.setDate(ninetyDays.getDate() + 90);
  const maintenance = tasks
    .filter((task) => !task.completed && Boolean(task.due_date))
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
    .slice(0, 2)
    .map((task): HomeCare => {
      const due = new Date((task.due_date || "") + "T12:00:00");
      const overdue = due.getTime() < today.getTime();
      return {
        id: "maintenance-" + task.id,
        title: task.title?.trim() || "Home maintenance reminder",
        detail: overdue ? "Past due · " + niceDate(task.due_date || "") : "Scheduled for " + niceDate(task.due_date || ""),
        href: "/maintenance",
        kind: "maintenance",
      };
    });

  const warranties = devices
    .filter((device) => {
      if (!device.warranty_date) return false;
      const expiry = new Date(device.warranty_date + "T12:00:00");
      return !Number.isNaN(expiry.getTime()) && expiry >= today && expiry <= ninetyDays;
    })
    .sort((a, b) => (a.warranty_date || "").localeCompare(b.warranty_date || ""))
    .slice(0, 2)
    .map((device): HomeCare => ({
      id: "warranty-" + device.id,
      title: (device.device_name?.trim() || "Device") + " warranty",
      detail: "Coverage ends " + niceDate(device.warranty_date || ""),
      href: "/devices/" + device.id,
      kind: "warranty",
    }));

  const selected = [...maintenance, ...warranties].slice(0, 2);
  if (selected.length === 0 && recommendation) {
    selected.push({
      id: "next",
      title: recommendation.title,
      detail: recommendation.description,
      href: recommendation.href,
      kind: "next",
    });
  }
  return selected;
}

function relativeDate(iso: string) {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "Recently";
  const days = Math.floor((Date.now() - timestamp) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return String(days) + " days ago";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(timestamp);
}

function CareIcon({ kind }: { kind: HomeCare["kind"] }) {
  const Icon = kind === "warranty" ? ShieldCheck : kind === "maintenance" ? CalendarDays : Sparkles;
  return <Icon size={21} strokeWidth={1.75} aria-hidden />;
}

function StoryIcon({ type }: { type: VaultActivityEvent["activityType"] }) {
  const Icon: ComponentType<{ size?: number; className?: string }> = getActivityIcon(type);
  return <Icon size={19} aria-hidden />;
}

export default function HomeExperience() {
  const { user, householdId, householdOwnerId, loading: permissionsLoading } = usePermissions();
  const { isDemo, loading: demoLoading } = useDemoMode();
  const [view, setView] = useState<HomeView | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHome = useCallback(async (background = false) => {
    if (permissionsLoading || demoLoading) return;
    if (background) setRefreshing(true);
    else setLoading(true);

    try {
      setError("");
      if (isDemo) {
        const grouped = groupHomeRooms([], getDemoHomeDevices().map((device) => ({
          location: device.location,
          roomId: null,
          id: device.id,
        })));
        const demoTasks = demoMaintenance.map((task) => ({
          id: task.id,
          title: task.title,
          due_date: task.due_date,
          completed: Boolean(task.completed),
        }));
        const demoWarrantyDevices: DeviceRow[] = demoDevices.map((device) => ({
          id: device.id,
          device_name: device.device_name,
          location: device.location,
          room_id: null,
          warranty_date: device.warranty_date,
        }));
        setView({
          firstName: demoDashboard.firstName,
          householdName: demoDashboard.householdName,
          devices: demoDashboard.deviceCount,
          documents: demoDashboard.documentCount,
          rooms: grouped.map((room) => ({
            name: room.name,
            count: room.devices.length,
            coverUrl: null,
          })),
          care: makeCare(demoTasks, demoWarrantyDevices),
          activity: demoActivityEvents.slice(0, 3),
        });
        return;
      }

      if (!user) {
        setView(null);
        return;
      }

      // Keep the existing household-scoped data source. No demo counts for real accounts.
      let roomQuery = supabase
        .from("rooms")
        .select("id, name, cover_image_path")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      roomQuery = householdId
        ? roomQuery.eq("household_id", householdId)
        : roomQuery.is("household_id", null).eq("user_id", user.id);

      const [metrics, deviceResult, roomResult, maintenanceResult, events] = await Promise.all([
        loadDashboardMetrics(user, householdId, supabase),
        applyHouseholdScope(
          supabase.from("devices").select("id, device_name, room_id, location, warranty_date"),
          householdId, user.id,
        ),
        roomQuery,
        applyHouseholdScope(
          supabase.from("maintenance_tasks").select("id, title, due_date, completed"),
          householdId, user.id,
        ),
        loadActivityFeed({
          userId: user.id,
          householdId: householdId || null,
          householdOwnerId: householdOwnerId || user.id,
          limit: 3,
        }),
      ]);

      if (deviceResult.error) throw deviceResult.error;
      if (roomResult.error) console.error("Room preview error:", roomResult.error);
      if (maintenanceResult.error) console.error("Homekeeping summary error:", maintenanceResult.error);

      const devices = (deviceResult.data || []) as DeviceRow[];
      const rooms = (roomResult.data || []) as RoomRow[];
      const grouped = groupHomeRooms(rooms, devices.map((device) => ({
        id: device.id,
        roomId: device.room_id,
        location: device.location,
      })));

      const roomTiles: HomeRoom[] = await Promise.all(
        grouped.map(async (room) => {
          let coverUrl: string | null = null;
          if (room.record?.cover_image_path) {
            const { data } = await supabase.storage
              .from("room-images")
              .createSignedUrl(room.record.cover_image_path, 60 * 60);
            coverUrl = data?.signedUrl || null;
          }
          return {
            id: room.record?.id,
            name: room.name,
            count: room.devices.length,
            coverUrl,
          };
        }),
      );

      setView({
        firstName: metrics.firstName,
        householdName: metrics.householdName,
        devices: metrics.deviceCount,
        documents: metrics.documentCount,
        rooms: roomTiles,
        care: makeCare(
          maintenanceResult.error ? [] : ((maintenanceResult.data || []) as MaintenanceRow[]),
          devices,
          metrics.homeHealth.recommendation,
        ),
        activity: events.slice(0, 3),
      });
    } catch (caught) {
      console.error("Home experience loading error:", caught);
      setError("Some home information could not be loaded. Try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, isDemo, householdId, householdOwnerId, permissionsLoading, demoLoading]);

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void loadHome(true);
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadHome]);

  const roomTiles = useMemo(() => view?.rooms.slice(0, 5) || [], [view]);
  if (loading || permissionsLoading || demoLoading) {
    return (
      <main className="min-h-[65vh] bg-[#f5f1e8]">
        <div className="mx-auto flex min-h-[60vh] max-w-[1300px] items-center justify-center gap-3 px-6 text-sm text-[#59625d]">
          <Loader2 className="animate-spin text-[#617c43]" size={19} />
          Opening your home…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1e8] pb-28 text-[#183047] md:pb-20">
      <section className="relative isolate min-h-[385px] overflow-hidden bg-[#183047] md:min-h-[420px]">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/home-hero.jpg')" }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0d1c25]/90 via-[#142530]/72 to-[#142530]/10" />
        <div className="mx-auto flex min-h-[385px] w-full max-w-[1500px] items-center px-6 pb-16 pt-9 md:min-h-[420px] md:px-10 lg:px-16">
          <div className="max-w-[720px]">
            <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#b9cb89]">
              YOUR HOME, ORGANIZED
            </p>
            <h1 className="mt-4 font-serif text-[clamp(3.5rem,7vw,6.9rem)] font-medium leading-[.95] tracking-[-.05em] text-[#fffdf8]">
              Welcome home{view?.firstName ? "," : "."}
              {view?.firstName ? (
                <><span className="sr-only"> </span><br />{view.firstName}.</>
              ) : null}
            </h1>
            <p className="mt-6 max-w-[470px] text-base leading-[1.75] text-[#f1f0e9] md:text-lg">
              Everything worth remembering about your home, right where you need it.
            </p>
            <Link href="/home" className="mt-7 inline-flex min-h-[50px] items-center gap-3 rounded-2xl bg-[#718d4f] px-6 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,0,0,.18)] transition hover:-translate-y-0.5 hover:bg-[#819e59]">
              Explore my spaces <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-9 max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {error ? (
          <div role="alert" className="mb-4 flex items-start gap-3 rounded-2xl border border-[#b4534b]/20 bg-[#fff7f4] p-4 text-sm text-[#8b4641]">
            <CircleAlert size={18} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button type="button" className="inline-flex items-center gap-1 font-semibold underline underline-offset-4" onClick={() => void loadHome(true)}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : null}

        <section className="rounded-[30px] border border-[#e4dfd2] bg-[#fffdf8] px-5 pb-7 pt-7 shadow-[0_20px_60px_rgba(24,48,71,.08)] sm:px-8 sm:pb-9 sm:pt-8 lg:px-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-[clamp(1.85rem,3vw,2.6rem)] font-semibold tracking-[-.035em]">Your spaces</h2>
              <p className="mt-1 text-sm text-[#738078]">{view?.householdName || "Your home"}</p>
            </div>
            <Link href="/home" className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-[#536b36] transition hover:gap-3 md:text-sm">
              View all spaces <ArrowRight size={16} aria-hidden />
            </Link>
          </div>

          {roomTiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
              {roomTiles.map((room, index) => {
                const visual = roomStyle(room.name);
                const Icon = visual.Icon;
                const href = room.id
                  ? "/home/rooms/" + room.id
                  : "/devices?search=" + encodeURIComponent(room.name);
                return (
                  <Link
                    key={(room.id || room.name) + String(index)}
                    href={href}
                    className="group relative isolate flex aspect-[.92] min-h-[148px] flex-col justify-end overflow-hidden rounded-[20px] bg-[#e5e6da] p-4 text-white shadow-[0_7px_18px_rgba(24,48,71,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(24,48,71,.18)] sm:aspect-[1.17] md:p-5 lg:aspect-[1.06]"
                  >
                    <span
                      className="absolute inset-0 -z-20 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.055]"
                      style={{ backgroundImage: "url(" + (room.coverUrl || visual.image) + ")" }}
                    />
                    <span className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1720]/85 via-[#0b1720]/12 to-transparent" />
                    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fffdf8]/95 text-[#526b39] shadow-md">
                      <Icon size={21} strokeWidth={1.8} aria-hidden />
                    </span>
                    <span className="truncate text-base font-semibold leading-tight tracking-[-.02em]">{room.name}</span>
                    <span className="mt-1 text-[12px] text-white/85">
                      {room.count} {room.count === 1 ? "item" : "items"}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Link href="/home" className="group flex min-h-[165px] items-center gap-5 rounded-[22px] border border-dashed border-[#c7cdbb] bg-[#f4f5ef] p-6 transition hover:border-[#617c43] hover:bg-[#edf2e7]">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#617c43] shadow-sm"><Plus size={24} /></span>
              <span className="flex-1">
                <span className="block text-lg font-semibold">Give your home its first space</span>
                <span className="mt-1 block text-sm text-[#68716c]">Add a room and start connecting the things you own.</span>
              </span>
              <ChevronRight size={21} className="text-[#617c43]" />
            </Link>
          )}
        </section>

        <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-[1.3fr_.86fr]">
          <section className="relative isolate overflow-hidden rounded-[28px] border border-[#d9dccd] bg-[#e6eadc] p-6 shadow-[0_8px_24px_rgba(24,48,71,.04)] sm:p-8 md:p-10">
            <span aria-hidden className="pointer-events-none absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-[#bbcaa9]/45 blur-3xl" />
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#536b36]">AT A GLANCE</p>
              {refreshing ? <Loader2 size={16} className="animate-spin text-[#536b36]" aria-label="Refreshing home" /> : null}
            </div>
            <h2 className="mt-4 max-w-xl font-serif text-[clamp(2.15rem,4vw,3.5rem)] font-semibold leading-[1.07] tracking-[-.04em]">
              {view?.devices === 0
                ? "Let's give your home a memory."
                : (view?.care.length || 0) > 0
                  ? "A little homekeeping goes a long way."
                  : "Your home is looking good."}
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-[#3c4a45]">
              {(view?.care.length || 0) > 0
                ? "A few things worth keeping on your radar."
                : "Your home’s useful details stay here, ready whenever you need them."}
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-[#dedfd5] bg-[#fffdf8] shadow-[0_8px_20px_rgba(24,48,71,.055)]">
              {view?.care.length ? view.care.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex min-h-[88px] items-center gap-4 border-b border-[#e7e5db] px-4 py-4 transition last:border-0 hover:bg-[#f7f8f2] sm:px-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf0e2] text-[#617c43]">
                    <CareIcon kind={item.kind} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#183047] sm:text-base">{item.title}</span>
                    <span className="mt-1 block line-clamp-2 text-xs leading-5 text-[#68716c] sm:text-sm">{item.detail}</span>
                  </span>
                  <ChevronRight size={19} className="shrink-0 text-[#7b8774] transition group-hover:translate-x-1" aria-hidden />
                </Link>
              )) : (
                <div className="flex items-center gap-4 p-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf0e2] text-[#617c43]">
                    <CheckCircle2 size={23} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">Nothing to review right now</span>
                    <span className="mt-1 block text-xs leading-5 text-[#68716c]">New maintenance and warranty reminders will appear here.</span>
                  </span>
                </div>
              )}
            </div>
            <Link href="/maintenance" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#536b36] transition hover:gap-3 sm:text-sm">
              View homekeeping <ArrowRight size={15} aria-hidden />
            </Link>
          </section>

          <section className="rounded-[28px] border border-[#e2ddd2] bg-[#fffdf8] p-6 shadow-[0_8px_24px_rgba(24,48,71,.04)] sm:p-8 md:p-10">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-semibold tracking-[-.04em]">Recently remembered</h2>
              <Link href="/activity" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#536b36] hover:underline">
                View history <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
            <div className="mt-5 divide-y divide-[#e8e5dc]">
              {view?.activity.length ? view.activity.map((event) => (
                <Link key={event.id} href={event.deviceId ? "/devices/" + event.deviceId : "/activity"} className="group flex items-center gap-4 py-4 first:pt-1 last:pb-1">
                  <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-[#eff0e7] text-[#617c43]">
                    <StoryIcon type={event.activityType} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#183047]">{event.title}</span>
                    <span className="mt-1 block truncate text-xs text-[#68716c]">
                      {event.description ? event.description + " · " : ""}{relativeDate(event.occurredAt)}
                    </span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-[#879380] opacity-0 transition group-hover:opacity-100" aria-hidden />
                </Link>
              )) : (
                <div className="py-10 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf2e7] text-[#617c43]"><History size={23}/></span>
                  <p className="mt-4 text-sm font-semibold">Your home's story starts here</p>
                  <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-[#68716c]">
                    As you add things and save records, they'll become part of your home's history.
                  </p>
                  <Link href="/devices/add" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#536b36] underline underline-offset-4">Add your first item <ArrowRight size={14}/></Link>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 grid gap-4 rounded-[28px] border border-[#e1ddcf] bg-[#fffdf8] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7 lg:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]"><Sparkles size={22} /></span>
            <div>
              <h2 className="font-serif text-[24px] font-semibold tracking-[-.035em] sm:text-[29px]">Need to remember something?</h2>
              <p className="mt-1 text-sm leading-6 text-[#68716c]">Search your home or ask HTV about the details you've saved.</p>
            </div>
          </div>
          <Link href="/smart-search" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#183047] px-6 text-sm font-semibold text-white transition hover:bg-[#29445a]">
            <Search size={17} aria-hidden /> Ask HTV <ArrowRight size={16} aria-hidden />
          </Link>
        </section>

        <nav className="mt-5 flex flex-wrap items-center justify-center gap-2 px-2 text-[12px] font-medium text-[#63746c]" aria-label="More home tools">
          <Link href="/devices" className="rounded-full px-3 py-2 hover:bg-[#e8eee1] hover:text-[#183047]">My things</Link>
          <Link href="/documents" className="rounded-full px-3 py-2 hover:bg-[#e8eee1] hover:text-[#183047]">Documents</Link>
          <Link href="/warranties" className="rounded-full px-3 py-2 hover:bg-[#e8eee1] hover:text-[#183047]">Warranties</Link>
          <Link href="/network" className="rounded-full px-3 py-2 hover:bg-[#e8eee1] hover:text-[#183047]">Network</Link>
          <Link href="/health-check" className="rounded-full px-3 py-2 hover:bg-[#e8eee1] hover:text-[#183047]">Home health details</Link>
        </nav>
      </div>
    </main>
  );
}
