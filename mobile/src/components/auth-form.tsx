import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui';
import { colors, fonts } from '@/theme';

export function AuthField({ label, value, onChangeText, placeholder, type = 'text', autoCapitalize = 'none', returnKeyType = 'next' }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; type?: 'email' | 'password' | 'text'; autoCapitalize?: 'none' | 'words'; returnKeyType?: 'next' | 'done' }) {
  const [visible, setVisible] = useState(false);
  const Icon = type === 'email' ? Mail : type === 'password' ? LockKeyhole : UserRound;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Icon size={18} color={colors.muted} strokeWidth={1.8} />
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#A3A9A7" autoCapitalize={autoCapitalize} autoCorrect={false} keyboardType={type === 'email' ? 'email-address' : 'default'} secureTextEntry={type === 'password' && !visible} returnKeyType={returnKeyType} textContentType={type === 'password' ? 'password' : type === 'email' ? 'emailAddress' : 'name'} style={styles.input} />
        {type === 'password' ? <Pressable accessibilityLabel={visible ? 'Hide password' : 'Show password'} hitSlop={10} onPress={() => setVisible((current) => !current)}>{visible ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}</Pressable> : null}
      </View>
    </View>
  );
}

export function AuthSubmit({ label, busy, disabled = false, onPress }: { label: string; busy: boolean; disabled?: boolean; onPress: () => void }) {
  return busy ? <View style={styles.busyButton}><ActivityIndicator color={colors.white} /></View> : <PrimaryButton disabled={disabled} label={label} onPress={onPress} />;
}

export function AuthKeyboard({ children }: { children: ReactNode }) {
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={authStyles.keyboard}>{children}</KeyboardAvoidingView>;
}

export const authStyles = StyleSheet.create({
  keyboard: { flex: 1 }, safe: { flex: 1, backgroundColor: colors.cream }, content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' }, brand: { alignItems: 'center', marginBottom: 28 },
  eyebrow: { marginTop: 16, color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: { marginTop: 9, color: colors.navy, fontFamily: fonts.serif, fontSize: 34, lineHeight: 39, textAlign: 'center' },
  body: { marginTop: 10, color: colors.muted, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  form: { gap: 16 }, error: { borderRadius: 13, padding: 12, color: colors.rust, backgroundColor: '#F8EAE7', fontFamily: fonts.sans, fontSize: 12, lineHeight: 17 },
  footer: { marginTop: 20, textAlign: 'center', color: colors.muted, fontFamily: fonts.sans, fontSize: 13 }, footerStrong: { color: colors.oliveDark, fontWeight: '700' },
  note: { marginTop: 18, textAlign: 'center', color: colors.muted, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17 },
});

const styles = StyleSheet.create({
  fieldWrap: { gap: 7 }, label: { color: colors.ink, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
  field: { minHeight: 54, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  input: { flex: 1, paddingVertical: 14, color: colors.ink, fontFamily: fonts.sans, fontSize: 15 }, busyButton: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveDark },
});
