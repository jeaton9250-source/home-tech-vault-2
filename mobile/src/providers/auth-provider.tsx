import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AppMode = 'loading' | 'guest' | 'demo' | 'account';
type AuthContextValue = {
  mode: AppMode;
  session: Session | null;
  user: User | null;
  isDemo: boolean;
  configured: boolean;
  enterDemo: () => Promise<void>;
  exitDemo: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
};

const DEMO_MODE_KEY = 'htv:mobile:demo-mode';
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://www.hometechvault.com';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>('loading');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;
    async function restore() {
      const demoEnabled = (await AsyncStorage.getItem(DEMO_MODE_KEY)) === 'true';
      if (!active) return;
      if (demoEnabled) {
        setSession(null);
        setMode('demo');
        return;
      }
      if (!supabase) {
        setMode('guest');
        return;
      }
      const { data: claimsData } = await supabase.auth.getClaims();
      if (!claimsData?.claims) {
        setSession(null);
        setMode('guest');
        return;
      }
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error || !data.session) {
        setSession(null);
        setMode('guest');
        return;
      }
      setSession(data.session);
      setMode('account');
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase || mode === 'loading' || mode === 'demo') return;
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setMode(nextSession ? 'account' : 'guest');
    });
    return () => data.subscription.unsubscribe();
  }, [mode]);

  useEffect(() => {
    const client = supabase;
    if (!client || mode !== 'account') return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
    return () => subscription.remove();
  }, [mode]);

  const enterDemo = useCallback(async () => {
    await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
    setSession(null);
    setMode('demo');
  }, []);

  const exitDemo = useCallback(async () => {
    await AsyncStorage.removeItem(DEMO_MODE_KEY);
    setSession(null);
    setMode('guest');
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'The app connection has not been configured yet.';
    await AsyncStorage.removeItem(DEMO_MODE_KEY);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return error.message;
    setSession(data.session);
    setMode('account');
    return null;
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) return { error: 'The app connection has not been configured yet.', needsConfirmation: false };
    await AsyncStorage.removeItem(DEMO_MODE_KEY);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${WEB_URL}/auth/callback?next=${encodeURIComponent('/dashboard')}`,
      },
    });
    if (error) return { error: error.message, needsConfirmation: false };
    if (data.session) {
      setSession(data.session);
      setMode('account');
    }
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(DEMO_MODE_KEY);
    if (supabase) await supabase.auth.signOut({ scope: 'local' });
    setSession(null);
    setMode('guest');
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    mode,
    session,
    user: session?.user ?? null,
    isDemo: mode === 'demo',
    configured: isSupabaseConfigured,
    enterDemo,
    exitDemo,
    signIn,
    signUp,
    signOut,
  }), [mode, session, enterDemo, exitDemo, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
