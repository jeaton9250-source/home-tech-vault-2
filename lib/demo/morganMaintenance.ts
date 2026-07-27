import type { DemoMaintenanceItem } from "@/lib/demo/types";

export const morganMaintenance: DemoMaintenanceItem[] = [
  {
    id: "demo-maint-1",
    title: "Update Wi-Fi Router firmware",
    device_id: "demo-unifi-router",
    device_name: "Wi-Fi Router",
    due_date: "2026-08-02",
    status: "Upcoming",
    category: "Software Update",
    frequency: "Every 3 months",
    notes:
      "Firmware version 3.2.7 available. Schedule update during off-hours.",
  },
  {
    id: "demo-maint-2",
    title: "Clean MacBook vents",
    device_id: "demo-macbook",
    device_name: "Office MacBook",
    due_date: "2026-08-01",
    status: "Completed",
    completed: true,
    category: "Cleaning",
    frequency: "Every 6 months",
    notes:
      "Use compressed air and inspect vents for dust buildup.",
  },
  {
    id: "demo-maint-3",
    title: "Replace Epson printer ink",
    device_id: "demo-canon-printer",
    device_name: "Epson Printer",
    due_date: "2026-07-20",
    status: "Overdue",
    category: "Maintenance",
    frequency: "As needed",
    notes:
      "Black and color cartridges running low.",
  },
  {
    id: "demo-maint-4",
    title: "Clean LG dryer lint trap and vent",
    device_id: "demo-lg-dryer",
    device_name: "LG Dryer",
    due_date: "2026-08-10",
    status: "Upcoming",
    category: "Cleaning",
    frequency: "Every 3 months",
    notes:
      "Deep clean the lint trap housing and inspect the exterior vent.",
  },
  {
    id: "demo-maint-5",
    title: "Test smoke and CO detectors",
    device_id: "",
    device_name: "Whole Home",
    due_date: "2026-08-15",
    status: "Upcoming",
    category: "Safety",
    frequency: "Every 6 months",
    notes:
      "Press test buttons on all detectors and replace batteries if needed.",
  },
  {
    id: "demo-maint-6",
    title: "Roborock brush and filter replacement",
    device_id: "demo-robot-vacuum",
    device_name: "Robot Vacuum",
    due_date: "2026-07-30",
    status: "Due Soon",
    category: "Maintenance",
    frequency: "Every 3 months",
    notes:
      "Replace main brush and HEPA filter per manufacturer schedule.",
  },
];
