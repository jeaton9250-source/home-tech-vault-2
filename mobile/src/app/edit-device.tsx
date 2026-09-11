import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, ChevronLeft, ImagePlus, Sparkles } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import { updateDevice, uploadDeviceImage } from '@/lib/home-tech-vault-api';
import { useAuth } from '@/providers/auth-provider';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

export default function EditDeviceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useAuth();
  const data = useVaultData();
  const device = useMemo(() => data.devices.find((item) => item.id === id), [data.devices, id]);
  const [name, setName] = useState(device?.name ?? '');
  const [brand, setBrand] = useState(device?.brand === 'Unknown brand' ? '' : device?.brand ?? '');
  const [manufacturer, setManufacturer] = useState(device?.manufacturer === 'Unknown manufacturer' ? '' : device?.manufacturer ?? '');
  const [model, setModel] = useState(device?.model === 'Model not recorded' ? '' : device?.model ?? '');
  const [serial, setSerial] = useState(device?.serialNumber ?? '');
  const [category, setCategory] = useState(device?.category ?? 'Other');
  const [room, setRoom] = useState(device?.location === 'Room not set' ? '' : device?.location ?? '');
  const [purchaseDate, setPurchaseDate] = useState(device?.purchaseDate ?? '');
  const [warrantyDate, setWarrantyDate] = useState(device?.warrantyDate ?? '');
  const [purchasePrice, setPurchasePrice] = useState(device?.value ? String(device.value) : '');
  const [notes, setNotes] = useState(device?.notes ?? '');
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);

  async function choosePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.82,
    });
    if (!result.canceled) setPhoto(result.assets[0]);
  }

  async function save() {
    if (!device || !name.trim()) return Alert.alert('Give this device a name', 'A device name is required before saving.');
    if (auth.isDemo) return Alert.alert('This is a sample home', 'Sign in to edit devices in your own home.');
    if (!auth.user || !auth.session?.access_token) return Alert.alert('Sign in required', 'Open your account before editing this device.');

    setSaving(true);
    try {
      const saved = await updateDevice(device.id, {
        deviceName: name.trim(),
        brand: brand.trim(),
        manufacturer: manufacturer.trim() || brand.trim(),
        modelNumber: model.trim(),
        serialNumber: serial.trim(),
        category: category.trim() || 'Other',
        location: room.trim(),
        productUpc: '',
        purchaseDate: purchaseDate.trim(),
        warrantyDate: warrantyDate.trim(),
        purchasePrice: purchasePrice.trim(),
        notes: notes.trim(),
      }, auth.session.access_token);

      let image = device.image;
      if (photo) {
        image = await uploadDeviceImage({
          uri: photo.uri,
          mimeType: photo.mimeType,
          fileSize: photo.fileSize,
          fileName: photo.fileName,
          deviceId: device.id,
          userId: auth.user.id,
          householdId: saved.householdId ?? data.householdId,
        });
      }

      data.rememberUpdatedDevice({ ...saved.device, image }, saved.householdId);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: '/device/[id]', params: { id: device.id } });
      void data.refresh();
    } catch (error) {
      Alert.alert('Could not update this device', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!device) return null;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft size={23} color={colors.ink} /></Pressable><View style={styles.headerCopy}><Text style={styles.eyebrow}>WHAT YOUR HOME REMEMBERS</Text><Text style={styles.headerTitle}>Edit device</Text></View><View style={styles.spacer} /></View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable onPress={choosePhoto} style={styles.photoCard}>
            {photo?.uri || device.image ? <Image alt={`${device.name} device`} source={photo?.uri ? { uri: photo.uri } : device.image} contentFit="cover" style={styles.photo} /> : <View style={styles.photoPlaceholder}><Camera size={32} color={colors.oliveDark} /></View>}
            <View style={styles.photoAction}><ImagePlus size={17} color={colors.white} /><Text style={styles.photoActionText}>{device.image || photo ? 'Change photo' : 'Add a device photo'}</Text></View>
          </Pressable>
          <View style={styles.form}>
            <Field label="Device name" value={name} onChangeText={setName} placeholder="Living Room TV" />
            <Field label="Brand" value={brand} onChangeText={setBrand} placeholder="Samsung" />
            <Field label="Manufacturer" value={manufacturer} onChangeText={setManufacturer} placeholder="Samsung Electronics" />
            <Field label="Model" value={model} onChangeText={setModel} placeholder="Optional" />
            <Field label="Serial number" value={serial} onChangeText={setSerial} placeholder="Scan or type it" />
            <Field label="Category" value={category} onChangeText={setCategory} placeholder="TV, appliance, network…" />
            <Field label="Room" value={room} onChangeText={setRoom} placeholder="Living Room" />
            <Field label="Purchase date" value={purchaseDate} onChangeText={setPurchaseDate} placeholder="YYYY-MM-DD" />
            <Field label="Warranty through" value={warrantyDate} onChangeText={setWarrantyDate} placeholder="YYYY-MM-DD" />
            <Field label="Purchase price" value={purchasePrice} onChangeText={setPurchasePrice} placeholder="0.00" />
            <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Anything worth remembering…" multiline />
          </View>
          <View style={styles.helper}><Sparkles size={17} color={colors.oliveDark} /><Text style={styles.helperText}>Changes and photos stay in sync with your Home Tech Vault website.</Text></View>
          <PrimaryButton label={saving ? 'Saving changes…' : 'Save changes'} disabled={saving} onPress={save} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean }) {
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9EA5A4" autoCapitalize="words" multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.field, multiline && styles.notes]} /></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream }, safe: { flex: 1 }, header: { height: 76, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }, headerCopy: { flex: 1, alignItems: 'center' }, eyebrow: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 8, fontWeight: '800', letterSpacing: 1.35 }, headerTitle: { marginTop: 3, color: colors.navy, fontFamily: fonts.serif, fontSize: 22 }, spacer: { width: 42 },
  content: { padding: 22, paddingBottom: 50, gap: 18 }, photoCard: { height: 220, overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, photo: { width: '100%', height: '100%' }, photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash }, photoAction: { position: 'absolute', right: 13, bottom: 13, paddingHorizontal: 13, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 999, backgroundColor: 'rgba(20,40,59,0.9)' }, photoActionText: { color: colors.white, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' },
  form: { gap: 14 }, fieldWrap: { gap: 7 }, fieldLabel: { color: colors.ink, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' }, field: { minHeight: 52, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, color: colors.ink, fontFamily: fonts.sans, fontSize: 14 }, notes: { minHeight: 104, paddingTop: 15 }, helper: { padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 16, backgroundColor: colors.oliveWash }, helperText: { flex: 1, color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 10, lineHeight: 16 },
});
