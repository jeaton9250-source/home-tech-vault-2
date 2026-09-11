import type { BarcodeScanningResult } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Camera, ChevronLeft, Flashlight } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import { colors, fonts } from '@/theme';

const SUPPORTED_CODES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'itf14', 'codabar', 'datamatrix', 'qr'] as const;

export default function ScanDeviceScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  function onBarcodeScanned(result: BarcodeScanningResult) {
    if (scanned) return;
    setScanned(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: '/add-device', params: { barcode: result.data.trim().slice(0, 255) } });
  }

  if (!permission) return <View style={styles.permissionPage} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionPage}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}><CameraGlyph /></View>
          <Text style={styles.permissionTitle}>Scan the label on your device</Text>
          <Text style={styles.permissionBody}>Camera access lets Home Tech Vault read a barcode or serial-number label. Images stay on your device unless you choose to save one later.</Text>
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
        active
        barcodeScannerSettings={{ barcodeTypes: [...SUPPORTED_CODES] }}
        enableTorch={torch}
        facing="back"
        onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.shade} />
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.circleButton}><ChevronLeft size={24} color={colors.white} /></Pressable>
          <Text style={styles.headerTitle}>Scan a device label</Text>
          <Pressable onPress={() => setTorch((current) => !current)} style={[styles.circleButton, torch && styles.circleButtonActive]}><Flashlight size={20} color={colors.white} /></Pressable>
        </View>
        <View style={styles.finderWrap} pointerEvents="none">
          <View style={styles.finder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
        <View style={styles.guidance}>
          <Text style={styles.guidanceTitle}>Hold the code inside the frame</Text>
          <Text style={styles.guidanceBody}>Try the barcode beside “Serial,” “S/N,” or “Model.” You can review the number before saving.</Text>
          <Pressable onPress={() => router.back()} style={styles.typeButton}><Text style={styles.typeButtonText}>Type it in instead</Text></Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function CameraGlyph() {
  return <Camera size={25} color={colors.oliveDark} />;
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
  finder: { width: '78%', aspectRatio: 1.45, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.04)' },
  corner: { position: 'absolute', width: 42, height: 42, borderColor: colors.white },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 22 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 22 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 22 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 22 },
  guidance: { margin: 18, padding: 22, alignItems: 'center', borderRadius: 24, backgroundColor: 'rgba(20, 40, 59, 0.92)' },
  guidanceTitle: { color: colors.white, fontFamily: fonts.serif, fontSize: 23, textAlign: 'center' },
  guidanceBody: { marginTop: 8, color: '#D3D7D9', fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  typeButton: { marginTop: 16, paddingHorizontal: 18, paddingVertical: 10 },
  typeButtonText: { color: '#DDE29A', fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
  permissionPage: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  permissionCard: { width: '100%', maxWidth: 440, padding: 26, alignItems: 'center', borderRadius: 26, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  permissionIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash },
  permissionTitle: { marginTop: 18, color: colors.navy, fontFamily: fonts.serif, fontSize: 28, lineHeight: 33, textAlign: 'center' },
  permissionBody: { marginTop: 10, marginBottom: 22, color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  manualButton: { marginTop: 16, padding: 8 },
  manualText: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
});
