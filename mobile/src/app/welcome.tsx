/* eslint-disable @typescript-eslint/no-require-imports */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Check, Home } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark, PrimaryButton, SecondaryButton } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import { colors, fonts } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { enterDemo } = useAuth();
  return (
    <View style={styles.root}>
      <Image alt="A warm, modern home at dusk" source={require('../../assets/home/hero.jpg')} contentFit="cover" style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(12,27,40,0.34)', 'rgba(12,27,40,0.72)', colors.navy]} locations={[0, 0.47, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.brandRow}>
          <BrandMark light />
          <Text style={styles.brand}>Home Tech Vault</Text>
        </View>
        <View style={styles.copy}>
          <View style={styles.eyebrow}><Home size={13} color="#DDE5BE" /><Text style={styles.eyebrowText}>YOUR HOME HAS A MEMORY</Text></View>
          <Text style={styles.title}>Everything your home needs, remembered.</Text>
          <Text style={styles.body}>Keep the manuals, warranties, receipts, care, and quiet history of your home together at last.</Text>
          <View style={styles.promiseRow}>
            {['Private by design', 'Made for real homes', 'Ready when life happens'].map((promise) => (
              <View key={promise} style={styles.promise}><Check size={13} color="#DDE5BE" /><Text style={styles.promiseText}>{promise}</Text></View>
            ))}
          </View>
        </View>
        <View style={styles.actions}>
          <PrimaryButton label="Open your home" icon={ArrowRight} onPress={() => router.push('/sign-in')} />
          <SecondaryButton label="Explore a sample home" onPress={async () => { await enterDemo(); router.replace('/(tabs)'); }} />
          <Pressable onPress={() => router.push('/create-account')}><Text style={styles.createLink}>New here? <Text style={styles.createLinkStrong}>Create your home</Text></Text></Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  safe: { flex: 1, paddingHorizontal: 22, paddingBottom: 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingTop: 8 },
  brand: { color: colors.white, fontFamily: fonts.serif, fontSize: 21 },
  copy: { flex: 1, justifyContent: 'flex-end', paddingBottom: 28 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrowText: { color: '#DDE5BE', fontFamily: fonts.sans, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  title: { marginTop: 16, maxWidth: 350, color: colors.white, fontFamily: fonts.serif, fontSize: 42, lineHeight: 46, letterSpacing: -1.2 },
  body: { marginTop: 17, maxWidth: 360, color: 'rgba(255,255,255,0.72)', fontFamily: fonts.sans, fontSize: 15, lineHeight: 23 },
  promiseRow: { marginTop: 22, gap: 8 },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promiseText: { color: 'rgba(255,255,255,0.82)', fontFamily: fonts.sans, fontSize: 12 },
  actions: { gap: 11 },
  createLink: { paddingVertical: 6, textAlign: 'center', color: 'rgba(255,255,255,0.64)', fontFamily: fonts.sans, fontSize: 12 },
  createLinkStrong: { color: colors.white, fontWeight: '700' },
});
