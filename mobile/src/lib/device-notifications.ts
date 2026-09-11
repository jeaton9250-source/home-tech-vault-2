import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { MaintenanceItem, VaultDevice } from '@/lib/demo-data';
import { registerPushToken } from '@/lib/home-tech-vault-api';

const CHANNEL_ID = 'home-reminders';
const SOURCE = 'home-tech-vault';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function prepareAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Home reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6B7D3C',
  });
}

function reminderDate(value: string | null | undefined, dayOffset: number) {
  if (!value) return null;
  const parts = value.slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) return null;
  const [year, month, day] = parts;
  const source = new Date(year, month - 1, day + dayOffset, 9, 0, 0, 0);
  if (Number.isNaN(source.getTime())) return null;
  return source.getTime() > Date.now() ? source : null;
}

async function clearHomeTechVaultReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.content.data?.source === SOURCE)
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
}

export async function getNotificationPermissionStatus() {
  const permission = await Notifications.getPermissionsAsync();
  return permission.status;
}

export async function syncHomeNotifications(
  devices: VaultDevice[],
  maintenance: MaintenanceItem[],
) {
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') return 0;

  await prepareAndroidChannel();
  await clearHomeTechVaultReminders();

  const reminders = [
    ...devices
      .filter((device) => device.warrantyDate && new Date(`${device.warrantyDate}T23:59:59`).getTime() > Date.now())
      .map((device) => ({
        date: reminderDate(device.warrantyDate, 30),
        title: 'Warranty ending soon',
        body: `${device.name} coverage ends in about 30 days.`,
        data: { source: SOURCE, kind: 'warranty', deviceId: device.id },
      })),
    ...maintenance
      .filter((item) => item.status !== 'Completed' && item.dueDateIso)
      .flatMap((item) => [
        {
          date: reminderDate(item.dueDateIso, -2),
          title: 'Home care due in 2 days',
          reminderKind: 'due_48h',
        },
        {
          date: reminderDate(item.dueDateIso, -1),
          title: 'Home care due tomorrow',
          reminderKind: 'due_24h',
        },
        {
          date: reminderDate(item.dueDateIso, 1),
          title: 'Home care is overdue',
          reminderKind: 'overdue',
        },
      ].map((reminder) => ({
        date: reminder.date,
        title: reminder.title,
        body: `${item.title} · ${item.deviceName}`,
        data: {
          source: SOURCE,
          kind: 'maintenance',
          reminderKind: reminder.reminderKind,
          maintenanceId: item.id,
          url: '/(tabs)/care',
        },
      }))),
  ]
    .filter((item): item is typeof item & { date: Date } => Boolean(item.date))
    .sort((left, right) => left.date.getTime() - right.date.getTime())
    .slice(0, 48);

  await Promise.all(reminders.map((reminder) => Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: reminder.body,
      data: reminder.data,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminder.date,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  })));

  return reminders.length;
}

async function connectRemotePush(accessToken: string) {
  if (!Device.isDevice || (Platform.OS !== 'ios' && Platform.OS !== 'android')) return false;
  const projectId = Constants.easConfig?.projectId
    ?? (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId;
  if (!projectId) return false;

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  await registerPushToken({
    token: token.data,
    platform: Platform.OS,
    deviceId: Device.modelId,
  }, accessToken);
  return true;
}

export async function syncEnabledHomeNotifications(input: {
  devices: VaultDevice[];
  maintenance: MaintenanceItem[];
  accessToken: string;
}) {
  const scheduled = await syncHomeNotifications(input.devices, input.maintenance);
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') return { scheduled, remote: false };

  let remote = false;
  try {
    remote = await connectRemotePush(input.accessToken);
  } catch {
    // The on-device reminders remain active while remote registration retries later.
  }
  return { scheduled, remote };
}

export async function enableHomeNotifications(input: {
  devices: VaultDevice[];
  maintenance: MaintenanceItem[];
  accessToken: string;
}) {
  await prepareAndroidChannel();
  let permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return { granted: false, scheduled: 0, remote: false };

  const scheduled = await syncHomeNotifications(input.devices, input.maintenance);
  let remote = false;
  try {
    remote = await connectRemotePush(input.accessToken);
  } catch {
    // Local reminders still work if the network or Expo push registration is unavailable.
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your home reminders are on',
      body: scheduled
        ? `${scheduled} upcoming warranty and care reminder${scheduled === 1 ? '' : 's'} are ready.`
        : 'We’ll let you know when a warranty or home-care date is getting close.',
      data: { source: SOURCE, kind: 'confirmation' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });

  return { granted: true, scheduled, remote };
}
