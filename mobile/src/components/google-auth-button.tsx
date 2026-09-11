import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '@/theme';

export function GoogleAuthButton({ busy, disabled = false, onPress }: { busy: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Continue with Google"
      accessibilityRole="button"
      disabled={busy || disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, (busy || disabled) && styles.disabled]}
    >
      {busy ? <ActivityIndicator color={colors.ink} /> : <GoogleMark />}
      <Text style={styles.buttonText}>{busy ? 'Opening Google…' : 'Continue with Google'}</Text>
    </Pressable>
  );
}

export function AuthDivider() {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.divider}><View style={styles.line} /><Text style={styles.dividerText}>OR CONTINUE WITH EMAIL</Text><View style={styles.line} /></View>;
}

function GoogleMark() {
  return (
    <Svg accessibilityLabel="Google" height={20} viewBox="0 0 24 24" width={20}>
      <Path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.19-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.38Z" />
      <Path fill="#34A853" d="M12 22c2.7 0 4.98-.89 6.64-2.4l-3.24-2.5c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z" />
      <Path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.07 12c0-.67.12-1.32.32-1.93v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.53l3.35-2.6Z" />
      <Path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.87-2.87C16.97 2.97 14.7 2 12 2a10 10 0 0 0-8.96 5.47l3.35 2.6C7.18 7.7 9.39 5.94 12 5.94Z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 54, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  buttonText: { color: colors.ink, fontFamily: fonts.sans, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.74, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.6 },
  divider: { minHeight: 22, flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  dividerText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 8, fontWeight: '700', letterSpacing: 1.1 },
});
