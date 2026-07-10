export type DemoDevice = {
  id: string;
  device_name: string;
  brand: string;
  category: string;
  model_number: string;
  serial_number: string;
  purchase_date: string;
  warranty_date: string;
  purchase_price: number;
  location: string;
  notes: string;
  online: boolean;
  last_seen_at: string;
  ip_address: string;
  mac_address: string;
  manufacturer: string;
  discovery_source: string;
  photo_url: string;
};

export const demoDevices: DemoDevice[] = [
  {
    id: "demo-macbook",
    device_name: "MacBook Pro",
    brand: "Apple",
    category: "Computer",
    model_number: "14-inch M3 Pro",
    serial_number: "DEMO-MBP-2025",
    purchase_date: "2025-03-12",
    warranty_date: "2027-03-12",
    purchase_price: 1999,
    location: "Home Office",
    notes:
      "Primary work computer with AppleCare coverage and regular maintenance.",
    online: true,
    last_seen_at: new Date().toISOString(),
    ip_address: "192.168.1.14",
    mac_address: "AA:BB:CC:11:22:33",
    manufacturer: "Apple",
    discovery_source: "Demo Network Scan",
    photo_url: "",
  },
  {
    id: "demo-tv",
    device_name: "Living Room Smart TV",
    brand: "Samsung",
    category: "TV",
    model_number: "65-inch QLED",
    serial_number: "DEMO-TV-2024",
    purchase_date: "2024-08-10",
    warranty_date: "2026-08-10",
    purchase_price: 1199,
    location: "Living Room",
    notes:
      "Connected to the entertainment system and living-room streaming devices.",
    online: true,
    last_seen_at: new Date().toISOString(),
    ip_address: "192.168.1.25",
    mac_address: "AA:BB:CC:44:55:66",
    manufacturer: "Samsung",
    discovery_source: "Demo Network Scan",
    photo_url: "",
  },
  {
    id: "demo-printer",
    device_name: "Brother Laser Printer",
    brand: "Brother",
    category: "Printer",
    model_number: "HL-L2395DW",
    serial_number: "DEMO-PRINT-01",
    purchase_date: "2023-11-08",
    warranty_date: "2024-11-08",
    purchase_price: 249,
    location: "Home Office",
    notes:
      "Black-and-white wireless printer. Cleaning is currently due.",
    online: false,
    last_seen_at: "2026-07-05T14:30:00.000Z",
    ip_address: "192.168.1.31",
    mac_address: "AA:BB:CC:77:88:99",
    manufacturer: "Brother",
    discovery_source: "Demo Network Scan",
    photo_url: "",
  },
  {
    id: "demo-xbox",
    device_name: "Xbox Series X",
    brand: "Microsoft",
    category: "Gaming",
    model_number: "Series X",
    serial_number: "DEMO-XBOX-01",
    purchase_date: "2024-12-20",
    warranty_date: "2026-12-20",
    purchase_price: 499,
    location: "Living Room",
    notes:
      "Primary game console connected to the Samsung television.",
    online: true,
    last_seen_at: new Date().toISOString(),
    ip_address: "192.168.1.40",
    mac_address: "AA:BB:CC:12:34:56",
    manufacturer: "Microsoft",
    discovery_source: "Demo Network Scan",
    photo_url: "",
  },
  {
    id: "demo-iphone",
    device_name: "Jason’s iPhone",
    brand: "Apple",
    category: "Mobile",
    model_number: "iPhone 16 Pro",
    serial_number: "DEMO-IPHONE-01",
    purchase_date: "2025-09-22",
    warranty_date: "2027-09-22",
    purchase_price: 1199,
    location: "Personal",
    notes:
      "Primary mobile device with cloud backup enabled.",
    online: true,
    last_seen_at: new Date().toISOString(),
    ip_address: "192.168.1.19",
    mac_address: "AA:BB:CC:98:76:54",
    manufacturer: "Apple",
    discovery_source: "Demo Network Scan",
    photo_url: "",
  },
  {
    id: "demo-router",
    device_name: "TP-Link Wi-Fi Router",
    brand: "TP-Link",
    category: "Network Equipment",
    model_number: "Archer AX55",
    serial_number: "DEMO-ROUTER-01",
    purchase_date: "2024-05-15",
    warranty_date: "2026-05-15",
    purchase_price: 149,
    location: "Utility Closet",
    notes:
      "Main home router. Guest network is enabled.",
    online: true,
    last_seen_at: new Date().toISOString(),
    ip_address: "192.168.1.1",
    mac_address: "AA:BB:CC:10:20:30",
    manufacturer: "TP-Link",
    discovery_source: "Demo Network Scan",
    photo_url: "",
  },
];

export type DemoSubscription = {
  id: string;
  service_name: string;
  name: string;
  category: string;
  monthly_cost: number;
  renewal_date: string;
  billing_cycle: string;
  notes: string;
};

export const demoSubscriptions: DemoSubscription[] = [
  {
    id: "demo-subscription-adobe",
    service_name: "Adobe Creative Cloud",
    name: "Adobe Creative Cloud",
    category: "Software",
    monthly_cost: 59.99,
    renewal_date: "2026-08-15",
    billing_cycle: "Monthly",
    notes: "Design, photo, and document software.",
  },
  {
    id: "demo-subscription-icloud",
    service_name: "iCloud+",
    name: "iCloud+",
    category: "Cloud Storage",
    monthly_cost: 9.99,
    renewal_date: "2026-08-03",
    billing_cycle: "Monthly",
    notes: "2 TB cloud-storage plan.",
  },
  {
    id: "demo-subscription-microsoft",
    service_name: "Microsoft 365",
    name: "Microsoft 365",
    category: "Productivity",
    monthly_cost: 9.99,
    renewal_date: "2026-08-22",
    billing_cycle: "Monthly",
    notes: "Office applications and OneDrive storage.",
  },
  {
    id: "demo-subscription-netflix",
    service_name: "Netflix",
    name: "Netflix",
    category: "Streaming",
    monthly_cost: 17.99,
    renewal_date: "2026-08-07",
    billing_cycle: "Monthly",
    notes: "Living-room entertainment subscription.",
  },
];

export const demoNetwork = {
  id: "demo-network",
  isp: "Spectrum",
  speed_download: 500,
  speed_upload: 25,
  router_model: "TP-Link Archer AX55",
  modem_model: "Arris Surfboard",
  wifi_name: "HomeTech-Demo",
  guest_network: "Enabled",
  admin_url: "192.168.1.1",
  notes:
    "Sample home network with documented equipment, guest Wi-Fi, and connected-device discovery.",
};

export type DemoMaintenanceItem = {
  id: string;
  title: string;
  device_id: string;
  device_name: string;
  due_date: string;
  status: string;
  category: string;
  frequency: string;
  notes: string;
};

export const demoMaintenance: DemoMaintenanceItem[] = [
  {
    id: "demo-maintenance-macbook",
    title: "Clean MacBook vents",
    device_id: "demo-macbook",
    device_name: "MacBook Pro",
    due_date: "2026-07-18",
    status: "Due Soon",
    category: "Cleaning",
    frequency: "Every 6 months",
    notes:
      "Use compressed air and inspect the vents for dust buildup.",
  },
  {
    id: "demo-maintenance-router",
    title: "Update router firmware",
    device_id: "demo-router",
    device_name: "TP-Link Wi-Fi Router",
    due_date: "2026-07-12",
    status: "Due",
    category: "Software Update",
    frequency: "Every 3 months",
    notes:
      "Check the router administration portal for firmware updates.",
  },
  {
    id: "demo-maintenance-printer",
    title: "Clean printer rollers",
    device_id: "demo-printer",
    device_name: "Brother Laser Printer",
    due_date: "2026-08-05",
    status: "Upcoming",
    category: "Maintenance",
    frequency: "Every 6 months",
    notes:
      "Clean paper rollers and inspect toner and drum condition.",
  },
];

export type DemoWarranty = {
  id: string;
  device_name: string;
  brand: string;
  location: string;
  warranty_date: string | null;
};

export const demoWarranties: DemoWarranty[] = demoDevices.map(
  (device) => ({
    id: device.id,
    device_name: device.device_name,
    brand: device.brand,
    location: device.location,
    warranty_date: device.warranty_date || null,
  })
);

export const demoDocuments = [
  {
    id: "demo-document-1",
    device_id: "demo-macbook",
    document_name: "MacBook Purchase Receipt",
    document_type: "Receipt",
    file_name: "macbook-receipt.pdf",
    created_at: "2025-03-12T15:00:00.000Z",
  },
  {
    id: "demo-document-2",
    device_id: "demo-tv",
    document_name: "Samsung TV User Manual",
    document_type: "Manual",
    file_name: "samsung-tv-manual.pdf",
    created_at: "2024-08-10T15:00:00.000Z",
  },
  {
    id: "demo-document-3",
    device_id: "demo-router",
    document_name: "Router Setup Guide",
    document_type: "Setup Guide",
    file_name: "router-setup-guide.pdf",
    created_at: "2024-05-15T15:00:00.000Z",
  },
];

export const demoTimelineEvents = [
  {
    id: "demo-event-1",
    device_id: "demo-macbook",
    event_type: "Purchase",
    title: "MacBook purchased",
    description:
      "Purchased and added to Home Tech Vault.",
    event_date: "2025-03-12T12:00:00.000Z",
  },
  {
    id: "demo-event-2",
    device_id: "demo-macbook",
    event_type: "Software Update",
    title: "macOS updated",
    description:
      "Installed the latest macOS security update.",
    event_date: "2026-06-18T12:00:00.000Z",
  },
  {
    id: "demo-event-3",
    device_id: "demo-printer",
    event_type: "Maintenance",
    title: "Toner replaced",
    description:
      "Installed a replacement black toner cartridge.",
    event_date: "2026-05-21T12:00:00.000Z",
  },
];

export const demoProfile = {
  full_name: "Jason Demo",
  household_name: "The Demo Home",
  email: "demo@hometechvault.com",
};

export const demoDashboard = {
  firstName: "Jason",
  householdName: "The Demo Home",
  deviceCount: demoDevices.length,
  documentCount: demoDocuments.length,
  activeWarrantyCount: demoDevices.filter((device) => {
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