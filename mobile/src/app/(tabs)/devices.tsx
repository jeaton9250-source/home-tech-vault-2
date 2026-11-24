import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MonitorSmartphone, Plus, Search, ShieldCheck, ShieldAlert, Package } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, EmptyState, LoadingView, PrimaryButton } from '@/components/ui';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts, shadows } from '@/theme';

function shortDate(value: string | null) {
  if (!value) return 'Not recorded';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DevicesScreen() {
  const router = useRouter();
  const data = useVaultData();
  const [query, setQuery] = useState('');
  const devices = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? data.devices.filter((device) => [device.name, device.brand, device.location, device.category].some((value) => value.toLowerCase().includes(needle))) : data.devices;
  }, [data.devices, query]);
  if (data.loading) return <LoadingView />;
  return (
    <AppScreen title="My Items" subtitle={`${data.devices.length} items saved in ${data.householdName}`} refreshing={data.refreshing} onRefresh={data.refresh}>
      <View style={styles.search}><Search size={19} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search items, brands, or rooms" placeholderTextColor="#9AA3A5" style={styles.input} /></View>
      <PrimaryButton label="Add an item" icon={Plus} onPress={() => router.push('/add-device')} />
      {devices.length ? (
        <View style={styles.grid}>
          {devices.map((device) => (
            <Pressable key={device.id} onPress={() => router.push({ pathname: '/device/[id]', params: { id: device.id } })} style={({ pressed }) => [styles.device, pressed && styles.pressed]}>
              {device.image ? <Image alt={device.name} source={device.image} contentFit="cover" style={styles.image} /> : <View style={styles.placeholder}><Package size={38} color={colors.oliveDark} strokeWidth={1.4} /><Text style={styles.placeholderLabel}>{device.category || "Your item"}</Text></View>}
              <View style={styles.copy}>
                <View style={styles.nameRow}><Text numberOfLines={1} style={styles.name}>{device.name}</Text><View style={[styles.dot, { backgroundColor: device.online === false ? colors.amber : device.online === true ? colors.olive : colors.line }]} /></View>
                <Text style={styles.brand}>{device.brand} · {device.category}</Text>
                <Text style={styles.room}>{device.location}</Text>
                <View style={styles.warrantyBadge}>{device.warrantyDate && !Number.isNaN(new Date(device.warrantyDate).getTime()) ? new Date(device.warrantyDate).getTime() >= Date.now() ? <ShieldCheck size={12} color={colors.oliveDark} /> : <ShieldAlert size={12} color={colors.rust} /> : <ShieldAlert size={12} color={colors.muted} />}<Text style={styles.warrantyText}>{device.warrantyDate && !Number.isNaN(new Date(device.warrantyDate).getTime()) ? new Date(device.warrantyDate).getTime() >= Date.now() ? `Covered until ${shortDate(device.warrantyDate)}` : "Warranty expired" : "Warranty not recorded"}</Text></View>
                <View style={styles.facts}>
                  <View style={styles.factRow}><Text style={styles.factLabel}>Model</Text><Text numberOfLines={1} style={styles.factValue}>{device.model}</Text></View>
                  <View style={styles.factRow}><Text style={styles.factLabel}>Serial</Text><Text numberOfLines={1} style={styles.factValue}>{device.serialNumber || 'Not recorded'}</Text></View>
                  <View style={styles.factRow}><Text style={styles.factLabel}>Purchased</Text><Text numberOfLines={1} style={styles.factValue}>{shortDate(device.purchaseDate)}</Text></View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : <EmptyState icon={MonitorSmartphone} title={query ? 'Nothing matched that search' : 'Your first item belongs here'} body={query ? 'Try a device name, brand, or room.' : 'Add the first device you would want details for during a repair, return, or warranty claim.'} />}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  search: { minHeight: 52, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  input: { flex: 1, color: colors.ink, fontFamily: fonts.sans, fontSize: 14 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  device: { width: '48.2%', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, ...shadows.card }, image: { width: '100%', height: 120 },
  placeholder: { width: '100%', height: 120, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand }, initial: { color: colors.navy, fontFamily: fonts.serif, fontSize: 40 },
  placeholderLabel: { marginTop: 8, color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 10, fontWeight: '700' }, warrantyBadge: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 7, backgroundColor: colors.oliveWash }, warrantyText: { flex: 1, color: colors.ink, fontFamily: fonts.sans, fontSize: 9, fontWeight: '600' }, copy: { padding: 13 }, nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, name: { flex: 1, color: colors.ink, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' }, dot: { width: 7, height: 7, borderRadius: 4 },
  brand: { marginTop: 4, color: colors.muted, fontFamily: fonts.sans, fontSize: 9 }, room: { marginTop: 8, color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 10, fontWeight: '700' }, facts: { marginTop: 11, paddingTop: 9, gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }, factRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }, factLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 8, fontWeight: '600' }, factValue: { flex: 1, textAlign: 'right', color: colors.ink, fontFamily: fonts.sans, fontSize: 8, fontWeight: '700' }, pressed: { opacity: 0.68 },
});
