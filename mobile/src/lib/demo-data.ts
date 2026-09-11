/* eslint-disable @typescript-eslint/no-require-imports */
import type { ImageSourcePropType } from 'react-native';

export type VaultDevice = {
  id: string;
  name: string;
  brand: string;
  category: string;
  location: string;
  model: string;
  manufacturer: string;
  serialNumber: string | null;
  purchaseDate: string | null;
  value: number;
  warrantyDate: string | null;
  online: boolean | null;
  notes?: string;
  image?: ImageSourcePropType;
};

export type MaintenanceItem = {
  id: string;
  title: string;
  deviceName: string;
  dueDate: string;
  dueDateIso?: string | null;
  status: 'Overdue' | 'Due soon' | 'Upcoming' | 'Completed';
};

export type VaultDocument = {
  id: string;
  deviceId: string | null;
  name: string;
  type: string;
  deviceName: string;
  date: string;
  fileUrl?: string | null;
};

export type VaultNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  kind: 'warranty' | 'maintenance' | 'device' | 'document';
};

export const demoHousehold = {
  firstName: 'Alex',
  fullName: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  householdName: 'Morgan Household',
};

export const demoDevices: VaultDevice[] = [
  {
    id: 'demo-frame-tv',
    name: 'Samsung Frame TV',
    brand: 'Samsung',
    category: 'Entertainment',
    location: 'Living Room',
    model: '65-inch QLED',
    manufacturer: 'Samsung',
    serialNumber: '0B3H3CDT800214',
    purchaseDate: '2024-06-24',
    value: 1899,
    warrantyDate: '2026-10-18',
    online: true,
    image: require('../../assets/devices/frame-tv.webp'),
  },
  {
    id: 'demo-thermostat',
    name: 'Nest Thermostat',
    brand: 'Google',
    category: 'Climate',
    location: 'Hallway',
    model: 'Learning Thermostat',
    manufacturer: 'Google',
    serialNumber: '09AA01AC4412',
    purchaseDate: '2023-09-10',
    value: 249,
    warrantyDate: '2027-09-10',
    online: true,
    image: require('../../assets/devices/thermostat.webp'),
  },
  {
    id: 'demo-washer',
    name: 'LG Washer',
    brand: 'LG',
    category: 'Appliance',
    location: 'Laundry Room',
    model: 'WM4000HWA',
    manufacturer: 'LG',
    serialNumber: '207KWVJ2A918',
    purchaseDate: '2022-11-05',
    value: 1099,
    warrantyDate: '2027-11-05',
    online: false,
    image: require('../../assets/devices/washer.webp'),
  },
  {
    id: 'demo-doorbell',
    name: 'Front Doorbell',
    brand: 'Ring',
    category: 'Security',
    location: 'Front Porch',
    model: 'Video Doorbell Pro',
    manufacturer: 'Ring',
    serialNumber: 'RNG-PRO-39281',
    purchaseDate: '2024-03-22',
    value: 249,
    warrantyDate: '2026-03-22',
    online: true,
    image: require('../../assets/devices/doorbell.webp'),
  },
  {
    id: 'demo-router',
    name: 'Wi-Fi Router',
    brand: 'Ubiquiti',
    category: 'Network',
    location: 'Office',
    model: 'Dream Router',
    manufacturer: 'Ubiquiti',
    serialNumber: 'UDR-6F20A9',
    purchaseDate: '2024-05-15',
    value: 199,
    warrantyDate: '2026-05-15',
    online: true,
    image: require('../../assets/devices/router.webp'),
  },
  {
    id: 'demo-sonos',
    name: 'Sonos Beam',
    brand: 'Sonos',
    category: 'Audio',
    location: 'Living Room',
    model: 'Beam Gen 2',
    manufacturer: 'Sonos',
    serialNumber: 'B2-48A1C0',
    purchaseDate: '2024-07-18',
    value: 499,
    warrantyDate: '2026-07-18',
    online: true,
    image: require('../../assets/devices/sonos.webp'),
  },
];

export const demoMaintenance: MaintenanceItem[] = [
  { id: 'm1', title: 'Update router firmware', deviceName: 'Wi-Fi Router', dueDate: 'Today', status: 'Due soon' },
  { id: 'm2', title: 'Clean dryer vent', deviceName: 'LG Dryer', dueDate: 'Sep 14', status: 'Upcoming' },
  { id: 'm3', title: 'Replace air purifier filter', deviceName: 'Dyson Purifier', dueDate: 'Sep 18', status: 'Upcoming' },
  { id: 'm4', title: 'Test smoke & CO detectors', deviceName: 'Whole Home', dueDate: 'Sep 22', status: 'Upcoming' },
];

export const demoDocuments: VaultDocument[] = [
  { id: 'd1', deviceId: 'demo-frame-tv', name: 'Samsung TV receipt', type: 'Receipt', deviceName: 'Samsung Frame TV', date: 'Jun 24, 2024' },
  { id: 'd2', deviceId: 'demo-washer', name: 'LG washer manual', type: 'Manual', deviceName: 'LG Washer', date: 'Nov 5, 2022' },
  { id: 'd3', deviceId: 'demo-doorbell', name: 'Ring Protect plan', type: 'Warranty', deviceName: 'Front Doorbell', date: 'Mar 22, 2024' },
  { id: 'd4', deviceId: null, name: 'Home insurance inventory', type: 'Insurance', deviceName: 'Whole Home', date: 'Jul 7, 2026' },
];

export const demoNotifications: VaultNotification[] = [
  { id: 'n1', title: 'Warranty ends in 30 days', body: 'Your Samsung Frame TV coverage is nearing its end.', time: '12 min ago', unread: true, kind: 'warranty' },
  { id: 'n2', title: 'A little home care is due', body: 'The Wi-Fi router firmware update is ready.', time: '2 hr ago', unread: true, kind: 'maintenance' },
  { id: 'n3', title: 'Manual safely filed', body: 'LG Washer Manual was added to your home record.', time: 'Yesterday', unread: false, kind: 'document' },
  { id: 'n4', title: 'Front doorbell is back online', body: 'The connection was restored at 8:42 AM.', time: 'Yesterday', unread: false, kind: 'device' },
  { id: 'n5', title: 'Monthly home note', body: 'Your home record is 82% complete.', time: 'Sep 1', unread: false, kind: 'document' },
];
