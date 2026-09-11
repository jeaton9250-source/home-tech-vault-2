import type { BarcodeScanningResult } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, ChevronLeft, Flashlight, ScanBarcode } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import {
  identifyDevicePhoto,
  lookupDevice,
  type DeviceLookupMatch,
  type VisionExtraction,
} from '@/lib/home-tech-vault-api';
import { useAuth } from '@/providers/auth-provider';
import { colors, fonts } from '@/theme';

const PRODUCT_CODES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'itf14'] as const;

type ScanParams = {
  mode?: 'photo' | 'barcode';
  name?: string;
  brand?: string;
  manufacturer?: string;
  model?: string;
  serial?: string;
  category?: string;
  productUpc?: string;
  room?: string;
  purchaseDate?: string;
  warrantyDate?: string;
  purchasePrice?: string;
};

export default function ScanDeviceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ScanParams>();
  const auth = useAuth();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);
  const isPhotoMode = params.mode === 'photo';

  function finish(extraction?: Partial<VisionExtraction>, match?: DeviceLookupMatch, barcode?: string) {
    router.replace({
      pathname: '/add-device',
      params: {
        name: match?.deviceName || extraction?.productName || params.name || '',
        brand: extraction?.brand || match?.brand || params.brand || '',
        manufacturer: extraction?.manufacturer || match?.manufacturer || params.manufacturer || '',
        model: extraction?.modelNumber || match?.modelNumber || params.model || '',
        serial: extraction?.serialNumber || params.serial || '',
        category: extraction?.category || match?.category || params.category || 'Other',
        productUpc: barcode || extraction?.barcode || match?.upc || params.productUpc || '',
        room: params.room || '',
        purchaseDate: params.purchaseDate || '',
        warrantyDate: params.warrantyDate || '',
        purchasePrice: params.purchasePrice || '',
      },
    });
  }

  async function onBarcodeScanned(result: BarcodeScanningResult) {
    if (scanned || working) return;

    const barcode = result.data.replace(/\D/g, '');
    if (![8, 12, 13, 14].includes(barcode.length)) return;

    setScanned(true);
    setWorking(true);
    setMessage('Looking up this product…');
    void Haptics.selectionAsync();

    try {
      if (!auth.session?.access_token) throw new Error('Please sign in again to identify this product.');
      const matches = await lookupDevice(barcode, auth.session.access_token);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      finish(undefined, matches[0], barcode);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We couldn't identify that barcode.");
      setScanned(false);
      setWorking(false);
    }
  }

  async function photographLabel() {
    if (working) return;

    try {
      if (!auth.session?.access_token) throw new Error('Please sign in again to scan a device label.');
      setWorking(true);
      setMessage('Reading the model and serial label…');
      const photo = await cameraRef.current?.takePictureAsync({
        base64: true,
        exif: false,
        quality: 0.55,
      });

      if (!photo?.base64) throw new Error('The photo could not be captured. Please try again.');

      const vision = await identifyDevicePhoto(
        `data:image/jpeg;base64,${photo.base64}`,
        auth.session.access_token,
      );
      setMessage('Matching the product…');

      let match: DeviceLookupMatch | undefined;
      if (vision.searchQuery) {
        try {
          match = (await lookupDevice(vision.searchQuery, auth.session.access_token))[0];
        } catch {
          // The label extraction is still useful when online enrichment is unavailable.
        }
      }

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      finish(vision.extraction ?? undefined, match);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We couldn't read that label. Try again.");
      setWorking(false);
    }
  }

  if (!permission) return <View style={styles.permissionPage} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionPage}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>{isPhotoMode ? <Camera size={25} color={colors.oliveDark} /> : <ScanBarcode size={25} color={colors.oliveDark} />}</View>
          <Text style={styles.permissionTitle}>{isPhotoMode ? 'Read the label on your device' : 'Scan the product barcode'}</Text>
          <Text style={styles.permissionBody}>Camera access lets Home Tech Vault identify the label. The photo is used only to read product details and is not saved to your vault.</Text>
          {permission.canAskAgain ? (
            <PrimaryButton label="Allow camera access" onPress={() => void requestPermission()} />
          ) : (
            <PrimaryButton label="Open camera settings" onPress={() => void Linking.openSettings()} />
          )}
          <Pressable onPress={() => router.back()} style={styles.manualButton}><Text style={styles.manualText}>Type it in instead</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        ref={cameraRef}
        active
        barcodeScannerSettings={isPhotoMode ? undefined : { barcodeTypes: [...PRODUCT_CODES] }}
        enableTorch={torch}
        facing="back"
        mode="picture"
        onBarcodeScanned={!isPhotoMode && !scanned ? onBarcodeScanned : undefined}
        onMountError={(event) => setMessage(event.message)}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.shade} />
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.circleButton}><ChevronLeft size={24} color={colors.white} /></Pressable>
          <Text style={styles.headerTitle}>{isPhotoMode ? 'Scan model & serial' : 'Scan product barcode'}</Text>
          <Pressable onPress={() => setTorch((current) => !current)} style={[styles.circleButton, torch && styles.circleButtonActive]}><Flashlight size={20} color={colors.white} /></Pressable>
        </View>
        <View style={styles.finderWrap} pointerEvents="none">
          <View style={[styles.finder, isPhotoMode && styles.photoFinder]}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
        <View style={styles.guidance}>
          <Text style={styles.guidanceTitle}>{working ? message : isPhotoMode ? 'Fill the frame with the label' : 'Hold the barcode inside the frame'}</Text>
          <Text style={styles.guidanceBody}>{working ? 'This usually takes only a few seconds.' : message || (isPhotoMode ? 'For the best result, photograph the sticker showing the brand, model, or serial number.' : 'Use the UPC or EAN product barcode. Home Tech Vault will look up the matching product before you save.')}</Text>
          {working ? (
            <ActivityIndicator color="#DDE29A" size="large" style={styles.progress} />
          ) : isPhotoMode ? (
            <Pressable accessibilityLabel="Take label photo" onPress={() => void photographLabel()} style={styles.shutter}><View style={styles.shutterCenter} /></Pressable>
          ) : null}
          <Pressable onPress={() => router.back()} style={styles.typeButton}><Text style={styles.typeButtonText}>Type it in instead</Text></Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  shade: { position: 'absolute', inset: 0, backgroundColor: 'rgba(10, 23, 34, 0.24)' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  header: { paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: colors.white, fontFamily: fonts.sans, fontSize: 14, fontWeight: '700' },
  circleButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10, 23, 34, 0.54)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  circleButtonActive: { backgroundColor: colors.oliveDark },
  finderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  finder: { width: '78%', aspectRatio: 1.6, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.04)' },
  photoFinder: { aspectRatio: 1.25 },
  corner: { position: 'absolute', width: 42, height: 42, borderColor: colors.white },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 22 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 22 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 22 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 22 },
  guidance: { margin: 18, padding: 22, alignItems: 'center', borderRadius: 24, backgroundColor: 'rgba(20, 40, 59, 0.94)' },
  guidanceTitle: { color: colors.white, fontFamily: fonts.serif, fontSize: 23, textAlign: 'center' },
  guidanceBody: { marginTop: 8, color: '#D3D7D9', fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  progress: { marginTop: 18 },
  shutter: { marginTop: 18, width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.white, backgroundColor: 'rgba(255,255,255,0.2)' },
  shutterCenter: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.white },
  typeButton: { marginTop: 12, paddingHorizontal: 18, paddingVertical: 10 },
  typeButtonText: { color: '#DDE29A', fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
  permissionPage: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  permissionCard: { width: '100%', maxWidth: 440, padding: 26, alignItems: 'center', borderRadius: 26, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  permissionIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash },
  permissionTitle: { marginTop: 18, color: colors.navy, fontFamily: fonts.serif, fontSize: 28, lineHeight: 33, textAlign: 'center' },
  permissionBody: { marginTop: 10, marginBottom: 22, color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  manualButton: { marginTop: 16, padding: 8 },
  manualText: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
});
