import { useRouter } from 'expo-router';
import { Bell, ChevronLeft, FileText, MonitorSmartphone, ShieldAlert, Wrench } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, EmptyState, ListRow } from '@/components/ui';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

const icons = { warranty: ShieldAlert, maintenance: Wrench, device: MonitorSmartphone, document: FileText };

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications } = useVaultData();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft size={23} color={colors.ink} /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>YOUR HOME, RECENTLY</Text><Text style={styles.title}>Notifications</Text></View>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        {notifications.length ? <Card>{notifications.slice(0, 5).map((item) => <View key={item.id} style={styles.notification}><View style={item.unread ? styles.unread : styles.read} /><View style={styles.notificationRow}><ListRow icon={icons[item.kind]} title={item.title} detail={item.body} meta={item.time} /></View></View>)}</Card> : <EmptyState icon={Bell} title="All quiet at home" body="Warranty reminders, care notes, and important device updates will appear here." />}
        <Text style={styles.footnote}>Showing the five most recent updates. Your complete activity history remains available on the web.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream }, header: { height: 82, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }, headerCopy: { flex: 1, alignItems: 'center' }, eyebrow: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 8, fontWeight: '800', letterSpacing: 1.5 }, title: { marginTop: 3, color: colors.navy, fontFamily: fonts.serif, fontSize: 25 }, spacer: { width: 42 }, content: { padding: 20, gap: 15 },
  notification: { position: 'relative' }, notificationRow: { overflow: 'hidden' }, unread: { position: 'absolute', zIndex: 2, left: 7, top: 32, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.rust }, read: { display: 'none' }, footnote: { paddingHorizontal: 14, textAlign: 'center', color: colors.muted, fontFamily: fonts.sans, fontSize: 10, lineHeight: 16 },
});
