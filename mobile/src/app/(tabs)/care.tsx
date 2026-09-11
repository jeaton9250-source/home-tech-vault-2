import { CalendarDays, Check, CircleAlert, ClipboardCheck, Clock3 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, EmptyState, ListRow, LoadingView, SectionTitle } from '@/components/ui';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

export default function CareScreen() {
  const data = useVaultData();
  if (data.loading) return <LoadingView />;
  const active = data.maintenance.filter((item) => item.status !== 'Completed');
  const completed = data.maintenance.filter((item) => item.status === 'Completed');
  const overdue = active.filter((item) => item.status === 'Overdue').length;
  return (
    <AppScreen title="Home care" subtitle="Small reminders that keep things running" refreshing={data.refreshing} onRefresh={data.refresh}>
      <Card style={styles.summary}>
        <View style={styles.summaryIcon}><ClipboardCheck size={27} color={colors.oliveDark} /></View>
        <View style={styles.summaryCopy}><Text style={styles.summaryTitle}>{overdue ? `${overdue} item${overdue === 1 ? '' : 's'} need attention` : 'Your home care is on track'}</Text><Text style={styles.summaryBody}>{active.length} upcoming reminders across your home.</Text></View>
      </Card>
      <SectionTitle title="Coming up" />
      {active.length ? <Card>{active.map((item) => <ListRow key={item.id} icon={item.status === 'Overdue' ? CircleAlert : Clock3} iconColor={item.status === 'Overdue' ? colors.rust : colors.oliveDark} title={item.title} detail={item.deviceName} meta={item.dueDate} />)}</Card> : <EmptyState icon={Check} title="Nothing needs attention" body="When a filter change, firmware update, or seasonal check is due, it will appear here." />}
      {completed.length ? <><SectionTitle title="Recently completed" /><Card>{completed.map((item) => <ListRow key={item.id} icon={Check} title={item.title} detail={item.deviceName} meta={item.dueDate} />)}</Card></> : null}
      <View style={styles.tip}><CalendarDays size={17} color={colors.oliveDark} /><Text style={styles.tipText}>Home Tech Vault keeps care tied to the device record, so service history is easy to find later.</Text></View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summary: { padding: 19, flexDirection: 'row', alignItems: 'center', gap: 14 }, summaryIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash }, summaryCopy: { flex: 1 },
  summaryTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 20 }, summaryBody: { marginTop: 4, color: colors.muted, fontFamily: fonts.sans, fontSize: 12 },
  tip: { padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 11, borderRadius: 16, backgroundColor: colors.oliveWash }, tipText: { flex: 1, color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17 },
});
