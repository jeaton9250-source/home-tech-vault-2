import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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
};

const emptyData: VaultData = {
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
      const [profileResult, membershipResult] = await Promise.all([
        supabase.from('profiles').select('full_name, household_name').eq('id', user.id).maybeSingle(),
        supabase.from('household_members').select('household_id').eq('user_id', user.id).limit(1).maybeSingle(),
      ]);
      const householdId = membershipResult.data?.household_id ?? null;
      const scope = householdId ? { column: 'household_id', value: householdId } : { column: 'user_id', value: user.id };
      const [devicesResult, maintenanceResult, documentsResult] = await Promise.all([
        supabase.from('devices').select('id, device_name, brand, category, location, model_number, purchase_price, warranty_date, online').eq(scope.column, scope.value).order('device_name'),
        supabase.from('maintenance_tasks').select('id, title, device_id, due_date, completed').eq(scope.column, scope.value).order('due_date').limit(12),
        supabase.from('documents').select('id, document_name, document_type, created_at, device_id').eq(scope.column, scope.value).order('created_at', { ascending: false }).limit(20),
      ]);
      const firstError = profileResult.error || membershipResult.error || devicesResult.error || maintenanceResult.error || documentsResult.error;
      if (firstError) throw firstError;
      const devices: VaultDevice[] = (devicesResult.data ?? []).map((device) => ({
        id: device.id,
        name: device.device_name || 'Unnamed device',
        brand: device.brand || 'Unknown brand',
        category: device.category || 'Other',
        location: device.location || 'Room not set',
        model: device.model_number || 'Model not recorded',
        value: Number(device.purchase_price) || 0,
        warrantyDate: device.warranty_date,
        online: device.online,
      }));
      const deviceNames = new Map(devices.map((device) => [device.id, device.name]));
      const maintenance: MaintenanceItem[] = (maintenanceResult.data ?? []).map((item) => {
        const isPast = item.due_date ? new Date(item.due_date).getTime() < Date.now() : false;
        return {
          id: item.id,
          title: item.title || 'Home care task',
          deviceName: deviceNames.get(item.device_id ?? '') || 'Whole Home',
          dueDate: formatDate(item.due_date),
          status: item.completed ? 'Completed' : isPast ? 'Overdue' : 'Upcoming',
        };
      });
      const documents: VaultDocument[] = (documentsResult.data ?? []).map((document) => ({
        id: document.id,
        name: document.document_name || 'Home document',
        type: document.document_type || 'Document',
        deviceName: deviceNames.get(document.device_id ?? '') || 'Whole Home',
        date: formatDate(document.created_at),
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

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const visibleData = isDemo ? demoData : data;
  const value = useMemo(() => ({ ...visibleData, loading: isDemo ? false : loading, refreshing, error, refresh: () => load(true) }), [visibleData, isDemo, loading, refreshing, error, load]);
  return <VaultDataContext.Provider value={value}>{children}</VaultDataContext.Provider>;
}

export function useVaultData() {
  const context = useContext(VaultDataContext);
  if (!context) throw new Error('useVaultData must be used inside VaultDataProvider');
  return context;
}
