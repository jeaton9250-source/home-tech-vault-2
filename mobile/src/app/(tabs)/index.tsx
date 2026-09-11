import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ArrowRight, Camera, FileText, Plus, ShieldCheck, Wrench } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, DemoNotice, EmptyState, LoadingView, SectionTitle } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const today = Date.now();
const currentHour = new Date().getHours();

export default function HomeScreen() {
  const router = useRouter();
  const { isDemo } = useAuth();
  const data = useVaultData();
  if (data.loading) return <LoadingView />;
  const protectedValue = data.devices.reduce((sum, device) => sum + device.value, 0);
  const activeWarranties = data.devices.filter((device) => device.warrantyDate && new Date(device.warrantyDate).getTime() > today).length;
  const readiness = data.devices.length ? Math.min(96, Math.round(52 + data.documents.length * 2.5 + activeWarranties * 2)) : 18;
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  function demoAware(action: () => void) {
    void Haptics.selectionAsync();
    action();
  }

  return (
    <AppScreen title="Home Tech Vault" subtitle={data.householdName} refreshing={data.refreshing} onRefresh={data.refresh}>
      {isDemo ? <DemoNotice /> : null}
      <View style={styles.intro}>
        <Text style={styles.greeting}>{greeting}, {data.firstName}.</Text>
        <Text style={styles.introTitle}>Your home is well remembered.</Text>
      </View>
      {data.error ? <Text style={styles.error}>{data.error}</Text> : null}
      <Card style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroEyebrow}>HOME READINESS</Text>
            <Text style={styles.heroScore}>{readiness}%</Text>
          </View>
          <View style={styles.scoreRing}><ShieldCheck size={25} color="#DDE5BE" /><Text style={styles.scoreRingText}>Strong</Text></View>
        </View>
        <Text style={styles.heroMessage}>The details that matter are close at hand.</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${readiness}%` }]} /></View>
        <View style={styles.heroStats}>
          <View><Text style={styles.statValue}>{data.devices.length}</Text><Text style={styles.statLabel}>devices</Text></View>
          <View style={styles.statDivider} />
          <View><Text style={styles.statValue}>{data.documents.length}</Text><Text style={styles.statLabel}>documents</Text></View>
          <View style={styles.statDivider} />
          <View><Text style={styles.statValue}>{money.format(protectedValue)}</Text><Text style={styles.statLabel}>remembered</Text></View>
        </View>
      </Card>

      <SectionTitle title="Add to your home" />
      <View style={styles.quickGrid}>
        <QuickAction icon={Camera} title="Scan a device" body="Camera or barcode" onPress={() => demoAware(() => router.push('/(tabs)/devices'))} />
        <QuickAction icon={FileText} title="File a document" body="Receipt or manual" onPress={() => demoAware(() => router.push('/(tabs)/vault'))} />
      </View>

      <SectionTitle title="Around your home" action="See all" onAction={() => router.push('/(tabs)/devices')} />
      {data.devices.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deviceRail}>
          {data.devices.slice(0, 5).map((device) => (
            <Pressable key={device.id} onPress={() => router.push({ pathname: '/device/[id]', params: { id: device.id } })} style={({ pressed }) => [styles.deviceCard, pressed && styles.pressed]}>
              {device.image ? <Image alt={device.name} source={device.image} contentFit="cover" style={styles.deviceImage} /> : <View style={styles.devicePlaceholder}><Text style={styles.deviceInitial}>{device.brand.slice(0, 1)}</Text></View>}
              <View style={styles.deviceCopy}><Text numberOfLines={1} style={styles.deviceName}>{device.name}</Text><Text style={styles.deviceRoom}>{device.location}</Text></View>
              <View style={[styles.onlineDot, { backgroundColor: device.online === false ? colors.amber : colors.olive }]} />
            </Pressable>
          ))}
        </ScrollView>
      ) : <EmptyState icon={Plus} title="Begin with one device" body="Add the first thing you would want details for during a repair, return, or warranty claim." />}

      <SectionTitle title="Coming up at home" action="View care" onAction={() => router.push('/(tabs)/care')} />
      <Card>
        {data.maintenance.slice(0, 3).map((item, index) => (
          <View key={item.id} style={[styles.careRow, index === 2 && styles.lastRow]}>
            <View style={styles.careIcon}><Wrench size={17} color={colors.oliveDark} /></View>
            <View style={styles.careCopy}><Text style={styles.careTitle}>{item.title}</Text><Text style={styles.careMeta}>{item.deviceName} · {item.dueDate}</Text></View>
            <ArrowRight size={16} color="#A3AAA9" />
          </View>
        ))}
      </Card>
    </AppScreen>
  );
}

function QuickAction({ icon: Icon, title, body, onPress }: { icon: typeof Camera; title: string; body: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}><View style={styles.quickIcon}><Icon size={20} color={colors.oliveDark} /></View><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickBody}>{body}</Text></Pressable>;
}

const styles = StyleSheet.create({
  intro: { paddingTop: 5 }, greeting: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13 }, introTitle: { marginTop: 4, color: colors.navy, fontFamily: fonts.serif, fontSize: 29, lineHeight: 34 },
  error: { borderRadius: 14, padding: 13, color: colors.rust, backgroundColor: '#F8EAE7', fontFamily: fonts.sans, fontSize: 12 },
  heroCard: { padding: 22, backgroundColor: colors.navy, borderColor: colors.navy }, heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, heroEyebrow: { color: '#DDE5BE', fontFamily: fonts.sans, fontSize: 9, fontWeight: '800', letterSpacing: 1.7 }, heroScore: { marginTop: 4, color: colors.white, fontFamily: fonts.serif, fontSize: 43 },
  scoreRing: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(221,229,190,0.28)', backgroundColor: 'rgba(255,255,255,0.06)' }, scoreRingText: { marginTop: 2, color: '#DDE5BE', fontFamily: fonts.sans, fontSize: 8, fontWeight: '700' },
  heroMessage: { marginTop: 5, color: 'rgba(255,255,255,0.72)', fontFamily: fonts.sans, fontSize: 13 }, progressTrack: { height: 5, marginTop: 19, borderRadius: 3, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.12)' }, progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#AAB86F' },
  heroStats: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, statValue: { color: colors.white, fontFamily: fonts.sans, fontSize: 16, fontWeight: '700' }, statLabel: { marginTop: 2, color: 'rgba(255,255,255,0.52)', fontFamily: fonts.sans, fontSize: 9 }, statDivider: { width: 1, height: 29, backgroundColor: 'rgba(255,255,255,0.12)' },
  quickGrid: { flexDirection: 'row', gap: 12 }, quickCard: { flex: 1, padding: 16, borderRadius: 19, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, quickIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash }, quickTitle: { marginTop: 13, color: colors.ink, fontFamily: fonts.sans, fontSize: 13, fontWeight: '700' }, quickBody: { marginTop: 3, color: colors.muted, fontFamily: fonts.sans, fontSize: 10 },
  deviceRail: { gap: 12, paddingRight: 20 }, deviceCard: { width: 164, borderRadius: 19, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, deviceImage: { width: '100%', height: 105 }, devicePlaceholder: { width: '100%', height: 105, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand }, deviceInitial: { color: colors.navy, fontFamily: fonts.serif, fontSize: 38 }, deviceCopy: { padding: 13 }, deviceName: { color: colors.ink, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' }, deviceRoom: { marginTop: 3, color: colors.muted, fontFamily: fonts.sans, fontSize: 10 }, onlineDot: { position: 'absolute', right: 10, top: 10, width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: colors.paper },
  careRow: { minHeight: 68, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, lastRow: { borderBottomWidth: 0 }, careIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash }, careCopy: { flex: 1 }, careTitle: { color: colors.ink, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' }, careMeta: { marginTop: 3, color: colors.muted, fontFamily: fonts.sans, fontSize: 10 }, pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
});
