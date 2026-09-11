import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import {
  demoDevices,
  demoDocuments,
  demoHousehold,
  demoMaintenance,
  demoNotifications,
  type MaintenanceItem,
  type VaultDevice,
  type VaultDocument,
  type VaultNotification,
} from '@/lib/demo-data';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

type VaultData = {
  householdId: string | null;
  firstName: string;
  fullName: string;
  email: string;
  householdName: string;
  devices: VaultDevice[];
  maintenance: MaintenanceItem[];
  documents: VaultDocument[];
  notifications: VaultNotification[];
};

type VaultDataContextValue = VaultData & {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  rememberSavedDevice: (device: VaultDevice, householdId: string | null) => void;
  rememberUpdatedDevice: (device: VaultDevice, householdId: string | null) => void;
  rememberSavedDocument: (document: VaultDocument, householdId: string | null) => void;
};

const emptyData: VaultData = {
  householdId: null,
  firstName: 'Homeowner',
  fullName: 'Homeowner',
  email: '',
  householdName: 'Your Home',
  devices: [],
  maintenance: [],
  documents: [],
  notifications: [],
};

const demoData: VaultData = {
  householdId: null,
  ...demoHousehold,
  devices: demoDevices,
  maintenance: demoMaintenance,
  documents: demoDocuments,
  notifications: demoNotifications,
};

const VaultDataContext = createContext<VaultDataContextValue | null>(null);

function formatDate(value: string | null) {
  if (!value) return 'No date';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

async function resolveHomeHouseholdId(userId: string) {
  if (!supabase) return null;

  const [membershipsResult, realtorVaultsResult] = await Promise.all([
    supabase
      .from('household_members')
      .select('household_id, joined_at')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false }),
    supabase
      .from('realtor_vault_gifts')
      .select('household_id')
      .eq('realtor_user_id', userId)
      .not('household_id', 'is', null),
  ]);

  if (membershipsResult.error) throw membershipsResult.error;
  if (realtorVaultsResult.error) throw realtorVaultsResult.error;

  const clientVaultIds = new Set(
    (realtorVaultsResult.data ?? [])
      .map((gift) => gift.household_id)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  );

  return (membershipsResult.data ?? [])
    .find((membership) => !clientVaultIds.has(membership.household_id))
    ?.household_id ?? null;
}

export function VaultDataProvider({ children }: { children: ReactNode }) {
  const { mode, user, isDemo } = useAuth();
  const [data, setData] = useState<VaultData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (mode === 'loading') return;
    if (isDemo) {
      setData(demoData);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }
    if (mode !== 'account' || !user || !supabase) {
      setData(emptyData);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [profileResult, householdId] = await Promise.all([
        supabase.from('profiles').select('full_name, household_name').eq('id', user.id).maybeSingle(),
        resolveHomeHouseholdId(user.id),
      ]);
      const scope = householdId ? { column: 'household_id', value: householdId } : { column: 'user_id', value: user.id };
      const [devicesResult, maintenanceResult, documentsResult] = await Promise.all([
        supabase.from('devices').select('id, device_name, brand, manufacturer, category, location, model_number, serial_number, purchase_date, purchase_price, warranty_date, online, notes').eq(scope.column, scope.value).order('device_name'),
        supabase.from('maintenance_tasks').select('id, title, device_id, due_date, completed').eq(scope.column, scope.value).order('due_date').limit(12),
        supabase.from('documents').select('id, file_name, file_type, document_name, document_type, created_at, device_id, file_url').eq(scope.column, scope.value).order('created_at', { ascending: false }).limit(20),
      ]);
      const firstError = profileResult.error || devicesResult.error;
      if (firstError) throw firstError;
      let devices: VaultDevice[] = (devicesResult.data ?? []).map((device) => ({
        id: device.id,
        name: device.device_name || 'Unnamed device',
        brand: device.brand || 'Unknown brand',
        category: device.category || 'Other',
        location: device.location || 'Room not set',
        model: device.model_number || 'Model not recorded',
        manufacturer: device.manufacturer || device.brand || 'Unknown manufacturer',
        serialNumber: device.serial_number,
        purchaseDate: device.purchase_date,
        value: Number(device.purchase_price) || 0,
        warrantyDate: device.warranty_date,
        online: device.online,
        notes: device.notes || '',
      }));

      if (devices.length) {
        const { data: imageRows } = await supabase
          .from('device_images')
          .select('device_id, image_url, created_at')
          .in('device_id', devices.map((device) => device.id))
          .order('created_at', { ascending: false });
        const latestPathByDevice = new Map<string, string>();
        for (const row of imageRows ?? []) {
          if (row.device_id && row.image_url && !latestPathByDevice.has(row.device_id)) {
            latestPathByDevice.set(row.device_id, row.image_url);
          }
        }
        const signedUrls = new Map<string, string>();
        const imageStorage = supabase.storage.from('device-images');
        await Promise.all([...latestPathByDevice.entries()].map(async ([deviceId, path]) => {
          const { data: signed } = await imageStorage.createSignedUrl(path, 3600);
          if (signed?.signedUrl) signedUrls.set(deviceId, signed.signedUrl);
        }));
        devices = devices.map((device) => {
          const uri = signedUrls.get(device.id);
          return uri ? { ...device, image: { uri } } : device;
        });
      }
      const deviceNames = new Map(devices.map((device) => [device.id, device.name]));
      const maintenance: MaintenanceItem[] = (maintenanceResult.error ? [] : maintenanceResult.data ?? []).map((item) => {
        const isPast = item.due_date ? new Date(item.due_date).getTime() < Date.now() : false;
        return {
          id: item.id,
          title: item.title || 'Home care task',
          deviceName: deviceNames.get(item.device_id ?? '') || 'Whole Home',
          dueDate: formatDate(item.due_date),
          dueDateIso: item.due_date,
          status: item.completed ? 'Completed' : isPast ? 'Overdue' : 'Upcoming',
        };
      });
      const documents: VaultDocument[] = (documentsResult.error ? [] : documentsResult.data ?? []).map((document) => ({
        id: document.id,
        deviceId: document.device_id,
        name: document.document_name || document.file_name || 'Home document',
        type: document.document_type || document.file_type || 'Document',
        deviceName: deviceNames.get(document.device_id ?? '') || 'Whole Home',
        date: formatDate(document.created_at),
        fileUrl: document.file_url,
      }));
      const now = Date.now();
      const notifications: VaultNotification[] = [
        ...maintenance
          .filter((item) => item.status === 'Overdue')
          .map((item) => ({ id: `maintenance-${item.id}`, title: 'Home care is overdue', body: `${item.title} · ${item.deviceName}`, time: item.dueDate, unread: true, kind: 'maintenance' as const })),
        ...devices
          .filter((device) => {
            if (!device.warrantyDate) return false;
            const days = (new Date(device.warrantyDate).getTime() - now) / 86_400_000;
            return days >= 0 && days <= 60;
          })
          .map((device) => ({ id: `warranty-${device.id}`, title: 'Warranty ending soon', body: `${device.name} coverage ends ${formatDate(device.warrantyDate)}`, time: 'Upcoming', unread: true, kind: 'warranty' as const })),
      ].slice(0, 10);
      const fullName = profileResult.data?.full_name?.trim() || user.email?.split('@')[0] || 'Homeowner';
      setData({
        householdId,
        firstName: fullName.split(' ')[0],
        fullName,
        email: user.email || '',
        householdName: profileResult.data?.household_name?.trim() || `${fullName.split(' ')[0]}'s Home`,
        devices,
        maintenance,
        documents,
        notifications,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your home record could not be refreshed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, user, isDemo]);

  const rememberSavedDevice = useCallback((device: VaultDevice, householdId: string | null) => {
    setData((current) => ({
      ...current,
      householdId: householdId ?? current.householdId,
      devices: [device, ...current.devices.filter((item) => item.id !== device.id)]
        .sort((left, right) => left.name.localeCompare(right.name)),
    }));
  }, []);

  const rememberUpdatedDevice = useCallback((device: VaultDevice, householdId: string | null) => {
    setData((current) => ({
      ...current,
      householdId: householdId ?? current.householdId,
      devices: current.devices
        .map((item) => item.id === device.id ? device : item)
        .sort((left, right) => left.name.localeCompare(right.name)),
    }));
  }, []);

  const rememberSavedDocument = useCallback((document: VaultDocument, householdId: string | null) => {
    setData((current) => ({
      ...current,
      householdId: householdId ?? current.householdId,
      documents: [document, ...current.documents.filter((item) => item.id !== document.id)],
    }));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  useEffect(() => {
    if (mode !== 'account' || !user || !supabase || loading) return;

    const scopeColumn = data.householdId ? 'household_id' : 'user_id';
    const scopeValue = data.householdId ?? user.id;
    const filter = `${scopeColumn}=eq.${scopeValue}`;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => void load(), 250);
    };

    const channel = supabase
      .channel(`mobile-vault-sync-${user.id}-${scopeValue}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devices', filter }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_tasks', filter }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents', filter }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'device_images', filter }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'household_members', filter: `user_id=eq.${user.id}` }, scheduleRefresh)
      .subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void supabase?.removeChannel(channel);
    };
  }, [mode, user, loading, data.householdId, load]);

  useEffect(() => {
    if (mode !== 'account') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void load();
    });

    return () => subscription.remove();
  }, [mode, load]);

  const visibleData = isDemo ? demoData : data;
  const value = useMemo(() => ({ ...visibleData, loading: isDemo ? false : loading, refreshing, error, refresh: () => load(true), rememberSavedDevice, rememberUpdatedDevice, rememberSavedDocument }), [visibleData, isDemo, loading, refreshing, error, load, rememberSavedDevice, rememberUpdatedDevice, rememberSavedDocument]);
  return <VaultDataContext.Provider value={value}>{children}</VaultDataContext.Provider>;
}

export function useVaultData() {
  const context = useContext(VaultDataContext);
  if (!context) throw new Error('useVaultData must be used inside VaultDataProvider');
  return context;
}
