import { supabase } from "@/lib/supabase";

type DeviceEventInput = {
  deviceId: string;
  userId: string;
  eventType: string;
  title: string;
  description?: string | null;
  eventDate?: string;
};

/** @deprecated Prefer recordActivity from @/lib/activity */
export async function createDeviceEvent({
  deviceId,
  userId,
  eventType,
  title,
  description = null,
  eventDate,
}: DeviceEventInput): Promise<void> {
  const { error } = await supabase
    .from("device_events")
    .insert({
      device_id: deviceId,
      user_id: userId,
      event_type: eventType,
      title,
      description,
      event_date: eventDate || new Date().toISOString(),
    });

  if (error) {
    console.error("Unable to create timeline event:", error);
  }
}