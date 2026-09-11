import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronLeft, FilePlus2, FileText, Link2, Upload } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import { DOCUMENT_TYPES, uploadDocument, type MobileDocumentType } from '@/lib/home-tech-vault-api';
import { useAuth } from '@/providers/auth-provider';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'text/plain',
];

type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
};

function titleFromFileName(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
}

function formatFileSize(bytes: number) {
  if (!bytes) return 'Ready to upload';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AddDocumentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ deviceId?: string }>();
  const auth = useAuth();
  const data = useVaultData();
  const initialDeviceId = data.devices.some((device) => device.id === params.deviceId) ? params.deviceId ?? '' : '';
  const [deviceId, setDeviceId] = useState(initialDeviceId);
  const [documentType, setDocumentType] = useState<MobileDocumentType>('Receipt');
  const [documentName, setDocumentName] = useState('');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const selectedDevice = useMemo(() => data.devices.find((device) => device.id === deviceId), [data.devices, deviceId]);

  async function chooseFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ALLOWED_MIME_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;

    setFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType || 'application/octet-stream',
      size: asset.size || 0,
    });
    if (!documentName.trim()) setDocumentName(titleFromFileName(asset.name));
    void Haptics.selectionAsync();
  }

  async function save() {
    if (auth.isDemo) return Alert.alert('This is a sample home', 'Sign in to add documents to your own vault.');
    if (!auth.session?.access_token) return Alert.alert('Sign in required', 'Open your account before adding a document.');
    if (!file) return Alert.alert('Choose a document', 'Select a receipt, manual, warranty, photo, or other home document.');
    if (!documentName.trim()) return Alert.alert('Name this document', 'Add a short name so it is easy to find later.');

    setUploading(true);
    try {
      const saved = await uploadDocument({
        ...file,
        documentName: documentName.trim(),
        documentType,
        deviceId,
        deviceName: selectedDevice?.name || 'Whole Home',
      }, auth.session.access_token);
      data.rememberSavedDocument(saved.document, saved.householdId);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
      void data.refresh();
    } catch (error) {
      Alert.alert('Could not save this document', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft size={23} color={colors.ink} /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>ADD TO YOUR VAULT</Text><Text style={styles.headerTitle}>File a document</Text></View>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View><Text style={styles.title}>Keep the paperwork with the home.</Text><Text style={styles.body}>Receipts, manuals, warranties, photos, and notes stay private and appear everywhere you use Home Tech Vault.</Text></View>

        <Pressable onPress={() => void chooseFile()} style={({ pressed }) => [styles.filePicker, pressed && styles.pressed]}>
          <View style={styles.fileIcon}>{file ? <FileText size={25} color={colors.oliveDark} /> : <FilePlus2 size={25} color={colors.oliveDark} />}</View>
          <View style={styles.fileCopy}>
            <Text numberOfLines={1} style={styles.fileTitle}>{file?.name || 'Choose a file'}</Text>
            <Text style={styles.fileDetail}>{file ? formatFileSize(file.size) : 'PDF, photo, or text · up to 15 MB'}</Text>
          </View>
          <Upload size={20} color={colors.oliveDark} />
        </Pressable>

        <View style={styles.fieldWrap}><Text style={styles.label}>Document name</Text><TextInput value={documentName} onChangeText={setDocumentName} placeholder="Kitchen range receipt" placeholderTextColor="#9EA5A4" style={styles.input} /></View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>What kind of document is it?</Text>
          <View style={styles.chips}>{DOCUMENT_TYPES.map((type) => <Pressable key={type} onPress={() => setDocumentType(type)} style={[styles.typeChip, documentType === type && styles.typeChipActive]}><Text style={[styles.typeText, documentType === type && styles.typeTextActive]}>{type}</Text></Pressable>)}</View>
        </View>

        <View style={styles.fieldWrap}>
          <View style={styles.labelRow}><Text style={styles.label}>Connect to a device</Text><Text style={styles.optional}>OPTIONAL</Text></View>
          <Pressable onPress={() => setDeviceId('')} style={[styles.deviceRow, !deviceId && styles.deviceRowActive]}><View style={styles.deviceIcon}><Link2 size={17} color={colors.oliveDark} /></View><Text style={styles.deviceName}>Whole Home</Text>{!deviceId ? <Check size={18} color={colors.oliveDark} /> : null}</Pressable>
          {data.devices.map((device) => <Pressable key={device.id} onPress={() => setDeviceId(device.id)} style={[styles.deviceRow, deviceId === device.id && styles.deviceRowActive]}><View style={styles.deviceInitial}><Text style={styles.deviceInitialText}>{device.brand.slice(0, 1)}</Text></View><View style={styles.deviceCopy}><Text style={styles.deviceName}>{device.name}</Text><Text style={styles.deviceMeta}>{device.location} · {device.model}</Text></View>{deviceId === device.id ? <Check size={18} color={colors.oliveDark} /> : null}</Pressable>)}
        </View>

        <PrimaryButton label={uploading ? 'Filing safely…' : 'Save to my vault'} disabled={uploading} icon={Upload} onPress={() => void save()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream }, header: { height: 76, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }, headerCopy: { flex: 1, alignItems: 'center' }, eyebrow: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 8, fontWeight: '800', letterSpacing: 1.5 }, headerTitle: { marginTop: 3, color: colors.navy, fontFamily: fonts.serif, fontSize: 22 }, spacer: { width: 42 },
  content: { padding: 22, paddingBottom: 54, gap: 22 }, title: { color: colors.navy, fontFamily: fonts.serif, fontSize: 29, lineHeight: 34 }, body: { marginTop: 8, color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20 },
  filePicker: { minHeight: 86, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 19, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.olive, backgroundColor: colors.oliveWash }, fileIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }, fileCopy: { flex: 1 }, fileTitle: { color: colors.ink, fontFamily: fonts.sans, fontSize: 13, fontWeight: '700' }, fileDetail: { marginTop: 4, color: colors.muted, fontFamily: fonts.sans, fontSize: 10 },
  fieldWrap: { gap: 9 }, labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, label: { color: colors.ink, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' }, optional: { color: colors.muted, fontFamily: fonts.sans, fontSize: 8, fontWeight: '800', letterSpacing: 1.2 }, input: { minHeight: 52, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, color: colors.ink, fontFamily: fonts.sans, fontSize: 14 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, typeChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, typeChipActive: { borderColor: colors.oliveDark, backgroundColor: colors.oliveDark }, typeText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, fontWeight: '700' }, typeTextActive: { color: colors.white },
  deviceRow: { minHeight: 62, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, deviceRowActive: { borderColor: colors.olive, backgroundColor: colors.oliveWash }, deviceIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }, deviceInitial: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand }, deviceInitialText: { color: colors.navy, fontFamily: fonts.serif, fontSize: 18 }, deviceCopy: { flex: 1 }, deviceName: { flex: 1, color: colors.ink, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' }, deviceMeta: { marginTop: 3, color: colors.muted, fontFamily: fonts.sans, fontSize: 9 }, pressed: { opacity: 0.7 },
});
