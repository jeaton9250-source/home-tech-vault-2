/** Static demo copy for the marketing homepage — clearly labeled, no live API data. */

export const LANDING_DEMO_LABEL = "Demo data";

export const landingConnectorDemoSummary = {
  connectorName: "Morgan Home Mac",
  connectorStatus: "Watching quietly",
  lastScanLabel: "4 minutes ago",
  devicesDiscovered: 18,
  devicesMatched: 12,
  needsReview: 3,
  onlineNow: 14,
} as const;

export const landingHomePulseSummary = {
  headline: "Everything looks good today.",
  items: [
    {
      text: "Your home is organized.",
      tone: "success" as const,
    },
    {
      text: "Your devices are up to date.",
      tone: "success" as const,
    },
    {
      text: "One warranty expires next month.",
      tone: "warning" as const,
    },
    {
      text: "One new device needs your attention.",
      tone: "info" as const,
    },
  ],
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
    status: "Recently seen",
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
    status: "Needs review",
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
  {
    label: "Devices",
    detail:
      "Every TV, speaker, and gadget — where it lives and when you bought it.",
  },
  {
    label: "Warranties",
    detail:
      "Never lose another warranty. Know what's covered and when it expires.",
  },
  {
    label: "Manuals",
    detail:
      "Keep every manual in one place — no more digging through drawers.",
  },
  {
    label: "Receipts",
    detail: "Proof of purchase, linked to the device it belongs to.",
  },
  {
    label: "Maintenance",
    detail: "Filters, service dates, and reminders — taken care of.",
  },
  {
    label: "Network",
    detail:
      "Know what's connected. Always know when a device was last seen.",
  },
  {
    label: "Family",
    detail:
      "Share access with the people who help take care of your home.",
  },
] as const;
