import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, FileText, MapPin, ShieldCheck, Wifi, WifiOff, Wrench } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, EmptyState, ListRow } from '@/components/ui';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

export default function DeviceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = useVaultData();
  const device = data.devices.find((item) => item.id === id);
  if (!device) return <SafeAreaView style={styles.safe}><View style={styles.missing}><EmptyState icon={WifiOff} title="Device not found" body="This device may have been removed or belongs to another household." /><Pressable onPress={() => router.back()}><Text style={styles.link}>Back to your devices</Text></Pressable></View></SafeAreaView>;
  const documents = data.documents.filter((item) => item.deviceName === device.name);
  const maintenance = data.maintenance.filter((item) => item.deviceName === device.name);
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft size={23} color={colors.ink} /></Pressable><Text numberOfLines={1} style={styles.headerTitle}>{device.name}</Text><View style={styles.spacer} /></View>
      <View style={styles.content}>
        <Card>
          {device.image ? <Image alt={device.name} source={device.image} contentFit="cover" style={styles.hero} /> : <View style={styles.placeholder}><Text style={styles.initial}>{device.brand.slice(0, 1)}</Text></View>}
          <View style={styles.deviceCopy}><Text style={styles.eyebrow}>{device.category.toUpperCase()}</Text><Text style={styles.title}>{device.name}</Text><Text style={styles.model}>{device.brand} · {device.model}</Text><View style={styles.chips}><View style={styles.chip}><MapPin size={13} color={colors.oliveDark} /><Text style={styles.chipText}>{device.location}</Text></View><View style={styles.chip}>{device.online === false ? <WifiOff size={13} color={colors.amber} /> : <Wifi size={13} color={colors.oliveDark} />}<Text style={styles.chipText}>{device.online === false ? 'Offline' : device.online === true ? 'Online' : 'Saved'}</Text></View></View></View>
        </Card>
        <Text style={styles.section}>WHAT YOUR HOME REMEMBERS</Text>
        <Card>
          <ListRow icon={ShieldCheck} title="Warranty coverage" detail={device.warrantyDate ? `Coverage through ${new Date(`${device.warrantyDate}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}` : 'No warranty date saved'} />
          <ListRow icon={FileText} title={`${documents.length} filed document${documents.length === 1 ? '' : 's'}`} detail={documents.length ? documents.map((item) => item.type).join(', ') : 'Add a receipt, manual, or warranty'} />
          <ListRow icon={Wrench} title={`${maintenance.length} care reminder${maintenance.length === 1 ? '' : 's'}`} detail={maintenance[0]?.title || 'No upcoming care recorded'} />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream }, header: { height: 70, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }, headerTitle: { flex: 1, marginHorizontal: 12, textAlign: 'center', color: colors.navy, fontFamily: fonts.serif, fontSize: 20 }, spacer: { width: 42 }, content: { padding: 20, gap: 17 }, hero: { width: '100%', height: 235 }, placeholder: { width: '100%', height: 235, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand }, initial: { color: colors.navy, fontFamily: fonts.serif, fontSize: 60 }, deviceCopy: { padding: 20 }, eyebrow: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 }, title: { marginTop: 7, color: colors.navy, fontFamily: fonts.serif, fontSize: 29 }, model: { marginTop: 5, color: colors.muted, fontFamily: fonts.sans, fontSize: 12 }, chips: { marginTop: 16, flexDirection: 'row', gap: 8 }, chip: { paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, backgroundColor: colors.oliveWash }, chipText: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 9, fontWeight: '700' }, section: { marginLeft: 4, color: colors.muted, fontFamily: fonts.sans, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 }, missing: { flex: 1, padding: 22, justifyContent: 'center', gap: 16 }, link: { textAlign: 'center', color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 13, fontWeight: '700' },
});
