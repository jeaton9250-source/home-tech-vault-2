import { useRouter } from 'expo-router';
import { Bell, BellRing, Check, ChevronLeft, FileText, MonitorSmartphone, ShieldAlert, Wrench } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, EmptyState, ListRow, PrimaryButton } from '@/components/ui';
import { enableHomeNotifications, getNotificationPermissionStatus } from '@/lib/device-notifications';
import { useAuth } from '@/providers/auth-provider';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

const icons = { warranty: ShieldAlert, maintenance: Wrench, device: MonitorSmartphone, document: FileText };

export default function NotificationsScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { notifications, devices, maintenance } = useVaultData();
  const [permission, setPermission] = useState<string>('undetermined');
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    void getNotificationPermissionStatus().then(setPermission).catch(() => undefined);
  }, []);

  async function enable() {
    if (!auth.session?.access_token) return Alert.alert('Sign in required', 'Open your account to turn on home reminders.');
    setEnabling(true);
    try {
      const result = await enableHomeNotifications({
        devices,
        maintenance,
        accessToken: auth.session.access_token,
      });
      setPermission(result.granted ? 'granted' : 'denied');
      if (!result.granted) {
        Alert.alert('Notifications are off', 'Allow notifications for Home Tech Vault in your phone settings to receive reminders.');
      }
    } catch (error) {
      Alert.alert('Could not turn on notifications', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setEnabling(false);
    }
  }
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft size={23} color={colors.ink} /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>YOUR HOME, RECENTLY</Text><Text style={styles.title}>Notifications</Text></View>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.pushCard}>
          <View style={[styles.pushIcon, permission === 'granted' && styles.pushIconOn]}>{permission === 'granted' ? <Check size={23} color={colors.white} /> : <BellRing size={23} color={colors.oliveDark} />}</View>
          <View style={styles.pushCopy}><Text style={styles.pushTitle}>{permission === 'granted' ? 'Home reminders are on' : 'Let your home remind you'}</Text><Text style={styles.pushBody}>{permission === 'granted' ? 'Care reminders arrive 48 hours before, 24 hours before, and when an item becomes overdue.' : 'Get a gentle alert 48 hours before, 24 hours before, and when home care becomes overdue.'}</Text></View>
          {permission !== 'granted' && !auth.isDemo ? <PrimaryButton label={enabling ? 'Turning on…' : 'Turn on notifications'} disabled={enabling} onPress={enable} /> : null}
        </Card>
        {notifications.length ? <Card>{notifications.slice(0, 5).map((item) => <View key={item.id} style={styles.notification}><View style={item.unread ? styles.unread : styles.read} /><View style={styles.notificationRow}><ListRow icon={icons[item.kind]} title={item.title} detail={item.body} meta={item.time} /></View></View>)}</Card> : <EmptyState icon={Bell} title="All quiet at home" body="Warranty reminders, care notes, and important device updates will appear here." />}
        <Text style={styles.footnote}>Showing the five most recent updates. Your complete activity history remains available on the web.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream }, header: { height: 82, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }, headerCopy: { flex: 1, alignItems: 'center' }, eyebrow: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 8, fontWeight: '800', letterSpacing: 1.5 }, title: { marginTop: 3, color: colors.navy, fontFamily: fonts.serif, fontSize: 25 }, spacer: { width: 42 }, content: { padding: 20, paddingBottom: 48, gap: 15 }, pushCard: { padding: 20, gap: 14 }, pushIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash }, pushIconOn: { backgroundColor: colors.oliveDark }, pushCopy: { gap: 5 }, pushTitle: { color: colors.navy, fontFamily: fonts.serif, fontSize: 21 }, pushBody: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
  notification: { position: 'relative' }, notificationRow: { overflow: 'hidden' }, unread: { position: 'absolute', zIndex: 2, left: 7, top: 32, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.rust }, read: { display: 'none' }, footnote: { paddingHorizontal: 14, textAlign: 'center', color: colors.muted, fontFamily: fonts.sans, fontSize: 10, lineHeight: 16 },
});
