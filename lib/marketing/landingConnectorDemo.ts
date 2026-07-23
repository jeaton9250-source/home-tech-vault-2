/** Static demo copy for the marketing homepage — clearly labeled, no live API data. */

export const LANDING_DEMO_LABEL = "Demo data";

export const landingConnectorDemoSummary = {
  connectorName: "Morgan Home Mac",
  connectorStatus: "Connected",
  lastScanLabel: "4 minutes ago",
  devicesDiscovered: 18,
  devicesMatched: 12,
  needsReview: 3,
  onlineNow: 14,
} as const;

export const landingMonitoringDemoDevices = [
  {
    name: "UniFi Router",
    location: "Network Closet",
    status: "Online",
    tone: "success" as const,
    lastSeen: "Just now",
  },
  {
    name: "LG OLED TV",
    location: "Living Room",
    status: "Recently Detected",
    tone: "info" as const,
    lastSeen: "12 minutes ago",
  },
  {
    name: "Sonos Arc",
    location: "Living Room",
    status: "Online",
    tone: "success" as const,
    lastSeen: "2 minutes ago",
  },
  {
    name: "Guest iPad",
    location: "Guest Room",
    status: "Needs Review",
    tone: "warning" as const,
    lastSeen: "New this scan",
  },
] as const;

export const landingConnectorCategories = [
  "Computers & tablets",
  "Smart TVs & streaming",
  "Printers",
  "Smart speakers",
  "Game consoles",
  "Cameras & doorbells",
  "Thermostats & plugs",
  "Robot vacuums",
  "Lighting & hubs",
  "Routers & mesh",
  "NAS & storage",
  "Appliances",
  "Aquarium tech",
  "Other Wi‑Fi devices",
] as const;

export const landingVaultPillars = [
  { label: "Devices", detail: "Photos, specs, locations, and purchase history" },
  { label: "Warranties", detail: "Coverage status and expiration alerts" },
  { label: "Documents", detail: "Manuals, receipts, and warranty cards" },
  { label: "Receipts", detail: "Proof of purchase linked to each item" },
  { label: "Network", detail: "Discovery, matching, and live presence" },
  { label: "Maintenance", detail: "Schedules, filters, and service reminders" },
  { label: "Subscriptions", detail: "Streaming, SaaS, and renewal tracking" },
] as const;
