"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Wrench } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { createDeviceEvent } from "@/lib/deviceEvents";
import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type DeviceOption = {
  id: string;
  device_name: string | null;
};

export default function NewMaintenanceTaskPage() {
  const router = useRouter();

  const [devices, setDevices] = useState<DeviceOption[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState("Maintenance");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [recurringInterval, setRecurringInterval] = useState("None");

  const [loadingDevices, setLoadingDevices] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadDevices() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("devices")
          .select("id, device_name")
          .eq("user_id", user.id)
          .order("device_name");

        if (error) throw error;

        setDevices((data || []) as DeviceOption[]);
      } catch (error) {
        console.error("Device loading error:", error);
      } finally {
        setLoadingDevices(false);
      }
    }

    loadDevices();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("maintenance_tasks")
        .insert({
          user_id: user.id,
          device_id: deviceId || null,
          title: title.trim(),
          description: description.trim() || null,
          task_type: taskType,
          due_date: dueDate || null,
          completed: false,
          recurring_interval:
            recurringInterval === "None"
              ? null
              : recurringInterval,
        });

      if (error) throw error;

      if (deviceId) {
        await createDeviceEvent({
          deviceId,
          userId: user.id,
          eventType: "Maintenance",
          title: "Maintenance scheduled",
          description: dueDate
            ? `${title.trim()} scheduled for ${dueDate}.`
            : `${title.trim()} was added as a maintenance task.`,
        });
      }

      router.push("/maintenance");
      router.refresh();
    } catch (error) {
      console.error("Maintenance task error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to create maintenance task."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell>
      <PageTitle
        eyebrow="Technology Care"
        title="Add Maintenance Task"
        description="Schedule cleaning, backups, updates, inspections, or repairs."
        action={
          <Button
            variant="secondary"
            onClick={() => router.push("/maintenance")}
          >
            <ArrowLeft size={17} />
            Cancel
          </Button>
        }
      />

      <PageCard>
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 md:grid-cols-2"
        >
          <FormField label="Task Title">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Clean laptop vents"
              required
              className={inputClasses}
            />
          </FormField>

          <FormField label="Device">
            <select
              value={deviceId}
              onChange={(event) => setDeviceId(event.target.value)}
              disabled={loadingDevices}
              className={inputClasses}
            >
              <option value="">General home task</option>

              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.device_name || "Unnamed Device"}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Task Type">
            <select
              value={taskType}
              onChange={(event) => setTaskType(event.target.value)}
              className={inputClasses}
            >
              <option>Maintenance</option>
              <option>Cleaning</option>
              <option>Software Update</option>
              <option>Backup</option>
              <option>Inspection</option>
              <option>Repair</option>
              <option>Battery Replacement</option>
            </select>
          </FormField>

          <FormField label="Due Date">
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Repeat">
            <select
              value={recurringInterval}
              onChange={(event) =>
                setRecurringInterval(event.target.value)
              }
              className={inputClasses}
            >
              <option>None</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Every 3 Months</option>
              <option>Every 6 Months</option>
              <option>Yearly</option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Description">
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Add instructions or important notes..."
                className={`${inputClasses} min-h-32 resize-y`}
              />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#E8E2D6] pt-6 md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {saving ? "Saving..." : "Schedule Task"}
            </Button>

            <Button
              variant="secondary"
              onClick={() => router.push("/maintenance")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </PageCard>
    </PageShell>
  );
}

const inputClasses =
  "w-full rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 text-[#111827] outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20";

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#111827]">
        {label}
      </span>

      {children}
    </label>
  );
}