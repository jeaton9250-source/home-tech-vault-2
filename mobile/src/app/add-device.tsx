import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, ChevronLeft, Keyboard, ScanBarcode, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

export default function AddDeviceScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode?: string }>();
  const auth = useAuth();
  const data = useVaultData();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState(barcode ?? '');
  const [room, setRoom] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return Alert.alert('What should your home call it?', 'Add a device name before saving.');
    if (auth.isDemo) return Alert.alert('This is a sample home', 'The Morgan Household is read-only. Sign in to remember devices in your own home.');
    if (!auth.user || !supabase) return Alert.alert('Sign in required', 'Open your account before adding a device.');
    setSaving(true);
    const { data: membership } = await supabase.from('household_members').select('household_id').eq('user_id', auth.user.id).limit(1).maybeSingle();
    const { error } = await supabase.from('devices').insert({
      user_id: auth.user.id,
      household_id: membership?.household_id ?? null,
      device_name: name.trim(),
      brand: brand.trim() || null,
      model_number: model.trim() || null,
      serial_number: serial.trim() || null,
      location: room.trim() || null,
      category: 'Other',
    });
    setSaving(false);
    if (error) return Alert.alert('Could not save this device', error.message);
    await data.refresh();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/devices');
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft size={23} color={colors.ink} /></Pressable><View style={styles.headerCopy}><Text style={styles.eyebrow}>ADD TO YOUR HOME</Text><Text style={styles.headerTitle}>Remember a device</Text></View><View style={styles.spacer} /></View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>How would you like to add it?</Text>
          <Text style={styles.body}>Start with what you know. You can add receipts, photos, and coverage later.</Text>
          <View style={styles.methods}>
            <Method icon={Camera} label="Scan label" detail="Use your camera" onPress={() => router.push('/scan-device')} />
            <Method icon={ScanBarcode} label="Barcode" detail="Capture a code" onPress={() => router.push('/scan-device')} />
            <Method icon={Keyboard} label="Type it in" detail="Fast and simple" active onPress={() => undefined} />
          </View>
          <View style={styles.form}>
            <Field label="Device name" value={name} onChangeText={setName} placeholder="Living Room TV" />
            <Field label="Brand" value={brand} onChangeText={setBrand} placeholder="Samsung" />
            <Field label="Model" value={model} onChangeText={setModel} placeholder="Optional" />
            <Field label="Serial number" value={serial} onChangeText={setSerial} placeholder="Scan or type it" />
            <Field label="Room" value={room} onChangeText={setRoom} placeholder="Living Room" />
          </View>
          <View style={styles.helper}><Sparkles size={17} color={colors.oliveDark} /><Text style={styles.helperText}>Once saved, Home Tech Vault gives this device a lasting place for its receipt, manual, warranty, and care history.</Text></View>
          <PrimaryButton label={saving ? 'Remembering…' : auth.isDemo ? 'Preview save' : 'Save to my home'} disabled={saving} onPress={save} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function Method({ icon: Icon, label, detail, active = false, onPress }: { icon: typeof Camera; label: string; detail: string; active?: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.method, active && styles.methodActive]}><View style={[styles.methodIcon, active && styles.methodIconActive]}><Icon size={20} color={active ? colors.white : colors.oliveDark} /></View><Text style={styles.methodLabel}>{label}</Text><Text style={styles.methodDetail}>{detail}</Text></Pressable>;
}

function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9EA5A4" autoCapitalize="words" style={styles.field} /></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream }, safe: { flex: 1 }, header: { height: 76, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }, headerCopy: { flex: 1, alignItems: 'center' }, eyebrow: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 8, fontWeight: '800', letterSpacing: 1.5 }, headerTitle: { marginTop: 3, color: colors.navy, fontFamily: fonts.serif, fontSize: 22 }, spacer: { width: 42 },
  content: { padding: 22, paddingBottom: 50, gap: 18 }, title: { color: colors.navy, fontFamily: fonts.serif, fontSize: 29, lineHeight: 34 }, body: { marginTop: -10, color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20 }, methods: { flexDirection: 'row', gap: 9 }, method: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 17, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, methodActive: { borderColor: colors.olive }, methodIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash }, methodIconActive: { backgroundColor: colors.oliveDark }, methodLabel: { marginTop: 9, color: colors.ink, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' }, methodDetail: { marginTop: 2, color: colors.muted, fontFamily: fonts.sans, fontSize: 8, textAlign: 'center' },
  form: { gap: 14 }, fieldWrap: { gap: 7 }, fieldLabel: { color: colors.ink, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' }, field: { minHeight: 52, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, color: colors.ink, fontFamily: fonts.sans, fontSize: 14 }, helper: { padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 16, backgroundColor: colors.oliveWash }, helperText: { flex: 1, color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 10, lineHeight: 16 },
});
