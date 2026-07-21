import type { ComponentType } from "react";

import {
  Camera,
  DoorOpen,
  FileText,
  History,
  Laptop,
  PackagePlus,
  Pencil,
  Radar,
  Receipt,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";

import type { VaultActivityType } from "@/lib/activity/types";

export function getActivityIcon(
  activityType: VaultActivityType | string
): ComponentType<{
  size?: number;
  className?: string;
}> {
  switch (activityType) {
    case "device.added":
      return PackagePlus;

    case "device.edited":
      return Pencil;

    case "device.deleted":
      return Trash2;

    case "document.uploaded":
      return FileText;

    case "receipt.uploaded":
      return Receipt;

    case "warranty.added":
    case "warranty.expiring":
      return ShieldCheck;

    case "maintenance.scheduled":
    case "maintenance.completed":
      return Wrench;

    case "subscription.added":
      return FileText;

    case "network.scan.completed":
      return Radar;

    case "family.member.invited":
    case "family.member.joined":
      return UserPlus;

    case "family.member.removed":
      return UserMinus;

    case "room.created":
    case "room.deleted":
      return DoorOpen;

    case "photo.uploaded":
      return Camera;

    default:
      return History;
  }
}

export function getActivityTypeLabel(
  activityType: VaultActivityType | string
): string {
  switch (activityType) {
    case "device.added":
      return "Device Added";

    case "device.edited":
      return "Device Edited";

    case "device.deleted":
      return "Device Deleted";

    case "document.uploaded":
      return "Document Uploaded";

    case "receipt.uploaded":
      return "Receipt Uploaded";

    case "warranty.added":
      return "Warranty Added";

    case "warranty.expiring":
      return "Warranty Expiring";

    case "maintenance.scheduled":
      return "Maintenance Scheduled";

    case "maintenance.completed":
      return "Maintenance Completed";

    case "subscription.added":
      return "Subscription Added";

    case "network.scan.completed":
      return "Network Scan Completed";

    case "family.member.invited":
      return "Family Member Invited";

    case "family.member.joined":
      return "Family Member Joined";

    case "family.member.removed":
      return "Family Member Removed";

    case "room.created":
      return "Room Created";

    case "room.deleted":
      return "Room Deleted";

    case "photo.uploaded":
      return "Photo Uploaded";

    default:
      return "Activity";
  }
}
