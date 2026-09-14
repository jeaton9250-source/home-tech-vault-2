import { AppleButton, appleAuth } from '@invertase/react-native-apple-authentication';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export function AppleAuthButton({ busy, disabled = false, onPress }: { busy: boolean; disabled?: boolean; onPress: () => void }) {
  if (Platform.OS !== 'ios' || !appleAuth.isSupported) return null;

  return (
    <View pointerEvents={busy || disabled ? 'none' : 'auto'} style={[styles.wrapper, disabled && styles.disabled]}>
      <AppleButton
        buttonStyle={AppleButton.Style.BLACK}
        buttonType={AppleButton.Type.CONTINUE}
        cornerRadius={16}
        onPress={onPress}
        style={styles.button}
      />
      {busy ? <View style={styles.busy}><ActivityIndicator color={colors.white} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { minHeight: 54, position: 'relative' },
  button: { width: '100%', height: 54 },
  busy: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.ink },
  disabled: { opacity: 0.6 },
});
