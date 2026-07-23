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
  demo_image: string;
  hostname?: string | null;
  connector_id?: string | null;
  first_seen_at?: string | null;
  network_updated_at?: string | null;
};

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

export type DemoWarranty = {
  id: string;
  device_name: string;
  brand: string;
  location: string;
  warranty_date: string | null;
};

export type DemoDocument = {
  id: string;
  device_id: string;
  document_name: string;
  document_type: string;
  file_name: string;
  created_at: string;
};

export type DemoTimelineEvent = {
  id: string;
  device_id: string;
  event_type: string;
  title: string;
  description: string;
  event_date: string;
};
