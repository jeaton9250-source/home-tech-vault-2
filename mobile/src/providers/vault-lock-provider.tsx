import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { ShieldCheck } from 'lucide-react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';
import { colors, fonts } from '@/theme';

type VaultLockContextValue = {
  enabled: boolean;
  available: boolean;
  biometricLabel: string;
  setLockEnabled: (enabled: boolean) => Promise<string | null>;
};

const VAULT_LOCK_KEY = 'htv:mobile:vault-lock-enabled:v1';
const LOCK_AFTER_MS = 30_000;
const VaultLockContext = createContext<VaultLockContextValue | null>(null);

function authenticationLabel(types: LocalAuthentication.AuthenticationType[]) {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return Platform.OS === 'ios' ? 'Face ID' : 'Face unlock';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
  return 'Device lock';
}

async function authenticate(label: string) {
  return LocalAuthentication.authenticateAsync({
    promptMessage: `Unlock Home Tech Vault with ${label}`,
    promptSubtitle: 'Your private home record is protected',
    promptDescription: 'Confirm it’s you to open your devices and documents.',
    cancelLabel: 'Not now',
    fallbackLabel: 'Use device passcode',
    disableDeviceFallback: false,
    biometricsSecurityLevel: 'strong',
  });
}

export function VaultLockProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Face ID');
  const [locked, setLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    async function restorePreference() {
      const [hardware, enrolled, types, stored] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
        AsyncStorage.getItem(VAULT_LOCK_KEY),
      ]);
      if (!active) return;
      const preferenceEnabled = stored === 'true';
      setAvailable(hardware && enrolled);
      setBiometricLabel(authenticationLabel(types));
      setEnabled(preferenceEnabled);
      setLocked(preferenceEnabled);
      setReady(true);
    }
    void restorePreference().catch(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasActive = appState.current === 'active';
      const isActive = nextState === 'active';
      if (wasActive && !isActive && auth.mode === 'account' && enabled) {
        backgroundedAt.current = Date.now();
        setLocked(true);
      }
      if (!wasActive && isActive && auth.mode === 'account' && enabled) {
        const elapsed = backgroundedAt.current ? Date.now() - backgroundedAt.current : LOCK_AFTER_MS;
        if (elapsed < LOCK_AFTER_MS) setLocked(false);
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [auth.mode, enabled]);

  const unlock = useCallback(async () => {
    if (unlocking) return;
    setUnlocking(true);
    setMessage(null);
    const result = await authenticate(biometricLabel).catch(() => ({ success: false as const, error: 'unknown' as const }));
    setUnlocking(false);
    if (result.success) {
      setLocked(false);
      return;
    }
    if (!['user_cancel', 'system_cancel', 'app_cancel'].includes(result.error)) {
      setMessage(`We couldn’t verify ${biometricLabel}. Try again or use your device passcode.`);
    }
  }, [biometricLabel, unlocking]);

  const setLockEnabled = useCallback(async (nextEnabled: boolean) => {
    if (nextEnabled && !available) return `Set up ${biometricLabel} in your device settings before turning on Vault Lock.`;
    const result = await authenticate(biometricLabel).catch(() => ({ success: false as const, error: 'unknown' as const }));
    if (!result.success) {
      if (['user_cancel', 'system_cancel', 'app_cancel'].includes(result.error)) return null;
      return `We couldn’t verify ${biometricLabel}. Please try again.`;
    }
    if (nextEnabled) await AsyncStorage.setItem(VAULT_LOCK_KEY, 'true');
    else await AsyncStorage.removeItem(VAULT_LOCK_KEY);
    setEnabled(nextEnabled);
    setLocked(false);
    return null;
  }, [available, biometricLabel]);

  const leaveAccount = useCallback(async () => {
    await AsyncStorage.removeItem(VAULT_LOCK_KEY);
    setEnabled(false);
    setLocked(false);
    await auth.signOut();
  }, [auth]);

  const value = useMemo<VaultLockContextValue>(() => ({
    enabled,
    available,
    biometricLabel,
    setLockEnabled,
  }), [enabled, available, biometricLabel, setLockEnabled]);

  if (!ready) {
    return <View style={styles.loading}><ActivityIndicator color={colors.olive} /></View>;
  }

  return (
    <VaultLockContext.Provider value={value}>
      <View style={styles.root}>
        <View
          accessibilityElementsHidden={auth.mode === 'account' && enabled && locked}
          importantForAccessibility={auth.mode === 'account' && enabled && locked ? 'no-hide-descendants' : 'auto'}
          pointerEvents={auth.mode === 'account' && enabled && locked ? 'none' : 'auto'}
          style={[styles.appContent, auth.mode === 'account' && enabled && locked && styles.hidden]}
        >
          {children}
        </View>
        {auth.mode === 'account' && enabled && locked ? <SafeAreaView style={styles.safe}>
          <View style={styles.lockContent}>
            <View style={styles.icon}><ShieldCheck color="#DDE5BE" size={29} /></View>
            <Text style={styles.eyebrow}>PRIVATE BY DESIGN</Text>
            <Text style={styles.title}>Your home is protected.</Text>
            <Text style={styles.body}>Use {biometricLabel} to open your devices, documents, and home-care history.</Text>
            {message ? <Text accessibilityRole="alert" style={styles.error}>{message}</Text> : null}
            <Pressable accessibilityRole="button" disabled={unlocking} onPress={() => void unlock()} style={({ pressed }) => [styles.unlockButton, pressed && styles.pressed]}>
              {unlocking ? <ActivityIndicator color={colors.navy} /> : <Text style={styles.unlockText}>Unlock with {biometricLabel}</Text>}
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void leaveAccount()}><Text style={styles.signOut}>Sign out instead</Text></Pressable>
          </View>
        </SafeAreaView> : null}
      </View>
    </VaultLockContext.Provider>
  );
}

export function useVaultLock() {
  const context = useContext(VaultLockContext);
  if (!context) throw new Error('useVaultLock must be used inside VaultLockProvider');
  return context;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  appContent: { flex: 1 },
  hidden: { opacity: 0 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy },
  safe: { position: 'absolute', inset: 0, backgroundColor: colors.navy },
  lockContent: { flex: 1, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(221,229,190,0.12)', borderWidth: 1, borderColor: 'rgba(221,229,190,0.24)' },
  eyebrow: { marginTop: 22, color: '#DDE5BE', fontFamily: fonts.sans, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  title: { marginTop: 12, color: colors.white, fontFamily: fonts.serif, fontSize: 34, lineHeight: 40, textAlign: 'center' },
  body: { marginTop: 12, maxWidth: 340, color: 'rgba(255,255,255,0.7)', fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  error: { marginTop: 14, color: '#FFD5CC', fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  unlockButton: { marginTop: 28, width: '100%', minHeight: 54, maxWidth: 360, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  unlockText: { color: colors.navy, fontFamily: fonts.sans, fontSize: 15, fontWeight: '800' },
  signOut: { padding: 18, color: 'rgba(255,255,255,0.65)', fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
});
