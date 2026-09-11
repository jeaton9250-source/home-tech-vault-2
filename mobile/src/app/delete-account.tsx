import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import { colors, fonts } from '@/theme';

const webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://www.hometechvault.com';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);

  async function deleteAccount() {
    if (confirmation.trim() !== 'DELETE' || !session?.access_token) return;
    setBusy(true);
    try {
      const response = await fetch(`${webUrl}/api/mobile/account`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "We couldn't start account deletion.");
      await signOut();
      Alert.alert(
        'Deletion requested',
        'Your account is now inaccessible. Your account and vault data are scheduled for permanent deletion within 7 days.',
        [{ text: 'Done', onPress: () => router.replace('/welcome') }],
      );
    } catch (error) {
      Alert.alert('Deletion not started', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={21} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Delete account</Text>
        <View style={styles.back} />
      </View>
      <View style={styles.content}>
        <View style={styles.icon}><AlertTriangle size={25} color={colors.rust} /></View>
        <Text style={styles.title}>Leave no loose ends.</Text>
        <Text style={styles.body}>Your account will be locked immediately. Your profile, home records, documents, device photos, reminders, and notification tokens will be permanently erased within 7 days.</Text>
        <Card style={styles.notice}>
          <ShieldCheck size={20} color={colors.oliveDark} />
          <Text style={styles.noticeText}>This cannot be undone. If your household is shared, support may contact you to safely transfer ownership before erasure.</Text>
        </Card>
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Type DELETE to confirm</Text>
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            onChangeText={setConfirmation}
            placeholder="DELETE"
            placeholderTextColor="#A3A9A7"
            style={styles.field}
            value={confirmation}
          />
        </View>
        {busy ? (
          <View style={styles.busy}><ActivityIndicator color={colors.white} /></View>
        ) : (
          <Pressable accessibilityRole="button" disabled={confirmation.trim() !== 'DELETE'} onPress={() => {
            Alert.alert('Delete your Home Tech Vault?', 'Your account will be locked immediately and permanently erased within 7 days.', [
              { text: 'Keep my account', style: 'cancel' },
              { text: 'Delete account', style: 'destructive', onPress: () => void deleteAccount() },
            ]);
          }} style={({ pressed }) => [styles.deleteButton, confirmation.trim() !== 'DELETE' && styles.disabled, pressed && styles.pressed]}>
            <Text style={styles.deleteButtonText}>Permanently delete my account</Text>
          </Pressable>
        )}
        <Pressable onPress={() => router.back()}><Text style={styles.cancel}>Keep my account</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { height: 64, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.ink, fontFamily: fonts.sans, fontSize: 16, fontWeight: '700' },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 18 },
  icon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: '#F8EAE7' },
  title: { color: colors.navy, fontFamily: fonts.serif, fontSize: 31, textAlign: 'center' },
  body: { color: colors.muted, fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  notice: { padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  noticeText: { flex: 1, color: colors.ink, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
  fieldWrap: { gap: 7 },
  label: { color: colors.ink, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
  field: { minHeight: 54, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, color: colors.ink, fontFamily: fonts.sans, fontSize: 15, letterSpacing: 2 },
  busy: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.rust },
  deleteButton: { minHeight: 54, borderRadius: 16, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.rust },
  deleteButtonText: { color: colors.white, fontFamily: fonts.sans, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  cancel: { textAlign: 'center', color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 13, fontWeight: '700' },
});
