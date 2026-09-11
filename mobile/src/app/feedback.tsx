import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { CheckCircle2, ChevronLeft, Lightbulb, MessageSquareText, Wrench } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, PrimaryButton } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

const webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://www.hometechvault.com';

export default function FeedbackScreen() {
  const router = useRouter();
  const auth = useAuth();
  const data = useVaultData();
  const [kind, setKind] = useState<'idea' | 'issue'>('idea');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  async function submit() {
    if (!auth.session?.access_token) return Alert.alert('Sign in required', 'Open your account before sending feedback.');
    if (subject.trim().length < 3) return Alert.alert('Add a short title', 'Tell us what your feedback is about.');
    if (message.trim().length < 10) return Alert.alert('Tell us a little more', 'Add at least a sentence so we can understand your feedback.');

    setBusy(true);
    try {
      const diagnostics = [
        `App: Home Tech Vault ${Constants.expoConfig?.version || 'unknown'}`,
        `Platform: ${Platform.OS} ${Platform.Version}`,
        `Device: ${Device.modelName || Device.modelId || 'unknown'}`,
        'Source: in-app feedback',
      ].join('\n');
      const response = await fetch(`${webUrl}/api/support/tickets`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          subject: subject.trim(),
          category: kind === 'idea' ? 'Feature Request' : 'Technical Issue',
          message: `${message.trim()}\n\n--- App diagnostics ---\n${diagnostics}`,
          sourcePage: 'mobile-app/feedback',
          idempotencyKey: `mobile:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`,
        }),
      });
      const payload = await response.json().catch(() => ({})) as { ticketNumber?: string; error?: string };
      if (!response.ok || !payload.ticketNumber) throw new Error(payload.error || "We couldn't send your feedback.");
      setTicketNumber(payload.ticketNumber);
    } catch (error) {
      Alert.alert('Feedback not sent', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}><Pressable accessibilityLabel="Close feedback" onPress={() => router.back()} style={styles.back}><ChevronLeft size={23} color={colors.ink} /></Pressable><View style={styles.headerCopy}><Text style={styles.eyebrow}>HELP SHAPE THE VAULT</Text><Text style={styles.headerTitle}>Send feedback</Text></View><View style={styles.spacer} /></View>
        {ticketNumber ? (
          <View style={styles.success}>
            <View style={styles.successIcon}><CheckCircle2 size={30} color={colors.oliveDark} /></View>
            <Text style={styles.successTitle}>Thank you for helping us make home feel easier.</Text>
            <Text style={styles.successBody}>Your note is safely in our support center as {ticketNumber}. We’ll reply to {data.email} if we need more detail.</Text>
            <PrimaryButton label="Done" onPress={() => router.back()} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View><Text style={styles.title}>What would make Home Tech Vault better?</Text><Text style={styles.body}>Send an idea or tell us where something felt broken. App and device details are included automatically—never your vault contents.</Text></View>
            <View style={styles.kindRow}>
              <KindButton active={kind === 'idea'} icon={Lightbulb} label="Share an idea" onPress={() => setKind('idea')} />
              <KindButton active={kind === 'issue'} icon={Wrench} label="Report a problem" onPress={() => setKind('issue')} />
            </View>
            <Card style={styles.form}>
              <View style={styles.fieldWrap}><Text style={styles.label}>Short title</Text><TextInput maxLength={200} onChangeText={setSubject} placeholder={kind === 'idea' ? 'A feature that would help' : 'What went wrong'} placeholderTextColor="#9EA5A4" style={styles.input} value={subject} /></View>
              <View style={styles.fieldWrap}><Text style={styles.label}>Tell us more</Text><TextInput maxLength={4500} multiline onChangeText={setMessage} placeholder="What were you trying to do, and what would you like to happen?" placeholderTextColor="#9EA5A4" style={[styles.input, styles.message]} textAlignVertical="top" value={message} /></View>
              <View style={styles.diagnostics}><MessageSquareText size={17} color={colors.oliveDark} /><Text style={styles.diagnosticsText}>Includes app version, iOS version, and device model for faster help.</Text></View>
            </Card>
            <PrimaryButton disabled={busy} label={busy ? 'Sending safely…' : 'Send feedback'} onPress={() => void submit()} />
          </ScrollView>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function KindButton({ active, icon: Icon, label, onPress }: { active: boolean; icon: typeof Lightbulb; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={onPress} style={[styles.kindButton, active && styles.kindButtonActive]}><Icon size={19} color={active ? colors.white : colors.oliveDark} /><Text style={[styles.kindLabel, active && styles.kindLabelActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream }, safe: { flex: 1 }, header: { height: 76, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }, headerCopy: { flex: 1, alignItems: 'center' }, eyebrow: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 8, fontWeight: '800', letterSpacing: 1.5 }, headerTitle: { marginTop: 3, color: colors.navy, fontFamily: fonts.serif, fontSize: 22 }, spacer: { width: 42 },
  content: { padding: 22, paddingBottom: 52, gap: 20 }, title: { color: colors.navy, fontFamily: fonts.serif, fontSize: 29, lineHeight: 34 }, body: { marginTop: 8, color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20 }, kindRow: { flexDirection: 'row', gap: 10 }, kindButton: { minHeight: 52, flex: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, kindButtonActive: { borderColor: colors.oliveDark, backgroundColor: colors.oliveDark }, kindLabel: { color: colors.ink, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' }, kindLabelActive: { color: colors.white },
  form: { padding: 18, gap: 18 }, fieldWrap: { gap: 7 }, label: { color: colors.ink, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' }, input: { minHeight: 52, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, color: colors.ink, fontFamily: fonts.sans, fontSize: 14 }, message: { minHeight: 150, paddingTop: 14 }, diagnostics: { padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 9, borderRadius: 14, backgroundColor: colors.oliveWash }, diagnosticsText: { flex: 1, color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 10, lineHeight: 15 },
  success: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 18 }, successIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash }, successTitle: { color: colors.navy, fontFamily: fonts.serif, fontSize: 29, lineHeight: 35, textAlign: 'center' }, successBody: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 21, textAlign: 'center' },
});
