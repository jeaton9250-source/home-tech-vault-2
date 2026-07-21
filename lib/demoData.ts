export type {
  DemoDevice,
  DemoSubscription,
  DemoMaintenanceItem,
  DemoWarranty,
  DemoDocument,
  DemoTimelineEvent,
} from "@/lib/demo/types";

import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";
import { morganDevices } from "@/lib/demo/morganDevices";
import { morganDocuments } from "@/lib/demo/morganDocuments";
import { morganSubscriptions } from "@/lib/demo/morganSubscriptions";
import { morganMaintenance } from "@/lib/demo/morganMaintenance";
import { morganTimelineEvents } from "@/lib/demo/morganTimeline";
import { morganNetwork } from "@/lib/demo/morganNetwork";
import type { DemoWarranty } from "@/lib/demo/types";

export const demoDevices = morganDevices;

export const demoSubscriptions = morganSubscriptions;

export const demoNetwork = morganNetwork;

export const demoMaintenance = morganMaintenance;

export const demoDocuments = morganDocuments;

export const demoTimelineEvents = morganTimelineEvents;

export const demoWarranties: DemoWarranty[] =
  demoDevices.map((device) => ({
    id: device.id,
    device_name: device.device_name,
    brand: device.brand,
    location: device.location,
    warranty_date: device.warranty_date || null,
  }));

export const demoProfile = {
  full_name: MORGAN_HOUSEHOLD.fullName,
  household_name: MORGAN_HOUSEHOLD.name,
  email: MORGAN_HOUSEHOLD.email,
};

export const demoDashboard = {
  firstName: MORGAN_HOUSEHOLD.firstName,
  householdName: MORGAN_HOUSEHOLD.name,
  deviceCount: demoDevices.length,
  documentCount: demoDocuments.length,
  activeWarrantyCount: demoDevices.filter((device) => {
    if (!device.warranty_date) {
      return false;
    }

    const warrantyDate = new Date(
      `${device.warranty_date}T23:59:59`
    );

    return warrantyDate >= new Date();
  }).length,
  protectedValue: demoDevices.reduce(
    (total, device) => total + device.purchase_price,
    0
  ),
};
