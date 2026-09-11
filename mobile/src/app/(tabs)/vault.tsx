import { FileCheck2, FileText, FolderHeart, ReceiptText, Search, ShieldCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, Card, EmptyState, ListRow, LoadingView } from '@/components/ui';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

export default function VaultScreen() {
  const data = useVaultData();
  const [query, setQuery] = useState('');
  const documents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? data.documents.filter((document) => [document.name, document.type, document.deviceName].some((value) => value.toLowerCase().includes(needle))) : data.documents;
  }, [data.documents, query]);
  if (data.loading) return <LoadingView />;
  return (
    <AppScreen title="Your vault" subtitle="The papers your home should never lose" refreshing={data.refreshing} onRefresh={data.refresh}>
      <View style={styles.counts}>
        <Count icon={ReceiptText} value={data.documents.filter((item) => item.type.toLowerCase().includes('receipt')).length} label="receipts" />
        <Count icon={FileText} value={data.documents.filter((item) => item.type.toLowerCase().includes('manual')).length} label="manuals" />
        <Count icon={ShieldCheck} value={data.documents.filter((item) => item.type.toLowerCase().includes('warranty')).length} label="warranties" />
      </View>
      <View style={styles.search}><Search size={19} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Find a receipt, manual, or warranty" placeholderTextColor="#9AA3A5" style={styles.input} /></View>
      {documents.length ? <Card>{documents.map((document) => <ListRow key={document.id} icon={document.type === 'Receipt' ? ReceiptText : document.type === 'Warranty' ? ShieldCheck : FileCheck2} title={document.name} detail={`${document.type} · ${document.deviceName}`} meta={document.date.split(',')[0]} />)}</Card> : <EmptyState icon={FolderHeart} title={query ? 'No documents found' : 'A safe place for the paperwork'} body={query ? 'Try another document name, type, or device.' : 'Receipts, manuals, coverage, and insurance records will stay organized here.'} />}
    </AppScreen>
  );
}

function Count({ icon: Icon, value, label }: { icon: typeof FileText; value: number; label: string }) {
  return <View style={styles.count}><Icon size={17} color={colors.oliveDark} /><Text style={styles.countValue}>{value}</Text><Text style={styles.countLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  counts: { flexDirection: 'row', gap: 9 }, count: { flex: 1, paddingVertical: 15, alignItems: 'center', borderRadius: 17, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, countValue: { marginTop: 6, color: colors.ink, fontFamily: fonts.serif, fontSize: 21 }, countLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 9 },
  search: { minHeight: 52, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, input: { flex: 1, color: colors.ink, fontFamily: fonts.sans, fontSize: 13 },
});
