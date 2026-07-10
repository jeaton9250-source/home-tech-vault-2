"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  FileText,
  History,
  Loader2,
  PackagePlus,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Wrench,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type DeviceTimelineProps = {
  deviceId: string;
  purchaseDate?: string | null;
  warrantyDate?: string | null;
};

type DeviceEvent = {
  id: string;
  device_id: string;
  user_id: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  created_at: string;
};

type TimelineEvent = {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  automatic: boolean;
};

const eventTypes = [
  "Maintenance",
  "Repair",
  "Software Update",
  "Cleaning",
  "Warranty",
  "Note",
];

export default function DeviceTimeline({
  deviceId,
  purchaseDate,
  warrantyDate,
}: DeviceTimelineProps) {
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [eventType, setEventType] = useState("Maintenance");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error("Please sign in to view the timeline.");
        }

        const { data, error } = await supabase
          .from("device_events")
          .select("*")
          .eq("device_id", deviceId)
          .eq("user_id", user.id)
          .order("event_date", { ascending: false });

        if (error) {
          throw error;
        }

        setEvents((data || []) as DeviceEvent[]);
      } catch (error) {
        console.error("Timeline loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [deviceId]);

  async function reloadEvents() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error("Please sign in to view the timeline.");
    }

    const { data, error } = await supabase
      .from("device_events")
      .select("*")
      .eq("device_id", deviceId)
      .eq("user_id", user.id)
      .order("event_date", { ascending: false });

    if (error) {
      throw error;
    }

    setEvents((data || []) as DeviceEvent[]);
  }

  async function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter an event title.");
      return;
    }

    try {
      setAdding(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Please sign in before adding an event.");
      }

      const { error } = await supabase
        .from("device_events")
        .insert({
          device_id: deviceId,
          user_id: user.id,
          event_type: eventType,
          title: title.trim(),
          description: description.trim() || null,
          event_date: `${eventDate}T12:00:00`,
        });

      if (error) {
        throw error;
      }

      setTitle("");
      setDescription("");
      setEventType("Maintenance");
      setEventDate(new Date().toISOString().slice(0, 10));
      setShowForm(false);

      await reloadEvents();
    } catch (error) {
      console.error("Timeline insert error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to add timeline event."
      );
    } finally {
      setAdding(false);
    }
  }

  async function deleteEvent(eventId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this timeline entry?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(eventId);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Please sign in before deleting an event.");
      }

      const { error } = await supabase
        .from("device_events")
        .delete()
        .eq("id", eventId)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setEvents((current) =>
        current.filter((event) => event.id !== eventId)
      );
    } catch (error) {
      console.error("Timeline deletion error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete the timeline entry."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const combinedTimeline = useMemo<TimelineEvent[]>(() => {
    const automaticEvents: TimelineEvent[] = [];

    if (purchaseDate) {
      automaticEvents.push({
        id: "automatic-purchase",
        event_type: "Purchase",
        title: "Device purchased",
        description: "Purchase date saved in the device record.",
        event_date: `${purchaseDate}T12:00:00`,
        automatic: true,
      });
    }

    if (warrantyDate) {
      automaticEvents.push({
        id: "automatic-warranty",
        event_type: "Warranty",
        title: "Warranty expiration",
        description: "The saved warranty coverage ends on this date.",
        event_date: `${warrantyDate}T12:00:00`,
        automatic: true,
      });
    }

    const savedEvents: TimelineEvent[] = events.map((event) => ({
      id: event.id,
      event_type: event.event_type,
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      automatic: false,
    }));

    return [...savedEvents, ...automaticEvents].sort(
      (a, b) =>
        new Date(b.event_date).getTime() -
        new Date(a.event_date).getTime()
    );
  }, [events, purchaseDate, warrantyDate]);

  return (
    <section className="mt-10 border-t border-[#E8E2D6] pt-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
            Device History
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#111827]">
            Timeline
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Track maintenance, repairs, updates, and important milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:bg-[#263044]"
        >
          <Plus size={18} />
          Add Event
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={addEvent}
          className="mt-6 grid gap-4 rounded-3xl border border-[#E8E2D6] bg-[#F7F5EF] p-6 md:grid-cols-2"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Event Type
            </span>

            <select
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              className="w-full rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A]"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Date
            </span>

            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              className="w-full rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A]"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Title
            </span>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Cleaned laptop vents"
              className="w-full rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A]"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Description
            </span>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add any details about this event..."
              className="min-h-28 w-full resize-y rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A]"
            />
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {adding ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}

              {adding ? "Saving..." : "Save Event"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-[#E8E2D6] bg-white px-5 py-3 text-sm font-semibold text-[#111827]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#F7F5EF] p-6 text-neutral-500">
          <Loader2 size={20} className="animate-spin" />
          Loading timeline...
        </div>
      ) : combinedTimeline.length === 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-[#D8D1C3] bg-[#FBFAF7] p-10 text-center">
          <History size={36} className="mx-auto text-[#C8A96A]" />

          <h3 className="mt-4 font-semibold text-[#111827]">
            No history yet
          </h3>

          <p className="mt-2 text-sm text-neutral-500">
            Add maintenance, repair, cleaning, or update events.
          </p>
        </div>
      ) : (
        <div className="relative mt-8 space-y-5 before:absolute before:bottom-3 before:left-[21px] before:top-3 before:w-px before:bg-[#E8E2D6]">
          {combinedTimeline.map((event) => {
            const Icon = getEventIcon(event.event_type);

            return (
              <div
                key={event.id}
                className="relative flex items-start gap-5"
              >
                <div className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[#C8A96A] shadow-sm">
                  <Icon size={19} />
                </div>

                <div className="flex-1 rounded-2xl border border-[#E8E2D6] bg-white p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
                        {event.event_type}
                      </p>

                      <h3 className="mt-2 font-bold text-[#111827]">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="mt-2 text-sm leading-6 text-neutral-500">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
                        <CalendarDays size={15} />
                        {formatEventDate(event.event_date)}
                      </div>
                    </div>

                    {!event.automatic && (
                      <button
                        type="button"
                        onClick={() => deleteEvent(event.id)}
                        disabled={deletingId === event.id}
                        aria-label="Delete timeline event"
                        className="rounded-xl bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        {deletingId === event.id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case "Added":
      return PackagePlus;

    case "Update":
      return Pencil;

    case "Purchase":
      return ShoppingBag;

    case "Photo":
      return Camera;

    case "Document":
      return FileText;

    case "Warranty":
      return ShieldCheck;

    case "Maintenance":
    case "Repair":
    case "Cleaning":
    case "Software Update":
      return Wrench;

    default:
      return History;
  }
}

function formatEventDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}