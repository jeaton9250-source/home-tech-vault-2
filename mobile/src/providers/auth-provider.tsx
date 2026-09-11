import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { AppState, Platform } from 'react-native';
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
  signInWithApple: () => Promise<{ completed: boolean; error: string | null }>;
  signInWithGoogle: () => Promise<{ completed: boolean; error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
};

const DEMO_MODE_KEY = 'htv:mobile:demo-mode';
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://www.hometechvault.com';
const GOOGLE_AUTH_REDIRECT = 'hometechvault://auth/callback';
const AuthContext = createContext<AuthContextValue | null>(null);

WebBrowser.maybeCompleteAuthSession();

function readOAuthCallback(url: string) {
  const parsed = new URL(url);
  const params = new URLSearchParams(parsed.search);
  const fragment = new URLSearchParams(parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash);
  fragment.forEach((value, key) => params.set(key, value));
  return params;
}

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

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { completed: false, error: 'The app connection has not been configured yet.' };
    try {
      await AsyncStorage.removeItem(DEMO_MODE_KEY);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: GOOGLE_AUTH_REDIRECT,
          skipBrowserRedirect: true,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) return { completed: false, error: error.message };
      if (!data.url) return { completed: false, error: "Google sign-in couldn't be opened." };

      const browserResult = await WebBrowser.openAuthSessionAsync(data.url, GOOGLE_AUTH_REDIRECT);
      if (browserResult.type !== 'success') return { completed: false, error: null };

      const params = readOAuthCallback(browserResult.url);
      const providerError = params.get('error_description') || params.get('error');
      if (providerError) return { completed: false, error: providerError.replace(/\+/g, ' ') };

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (!accessToken || !refreshToken) {
        return { completed: false, error: 'Google sign-in returned an incomplete session. Please try again.' };
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError || !sessionData.session) {
        return { completed: false, error: sessionError?.message || "Google sign-in couldn't be completed." };
      }
      setSession(sessionData.session);
      setMode('account');
      return { completed: true, error: null };
    } catch (error) {
      return {
        completed: false,
        error: error instanceof Error ? error.message : "Google sign-in couldn't be completed.",
      };
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    if (!supabase) return { completed: false, error: 'The app connection has not been configured yet.' };
    if (Platform.OS !== 'ios') return { completed: false, error: 'Sign in with Apple is available on iPhone and iPad.' };
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) return { completed: false, error: 'Sign in with Apple is not available on this device.' };

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        return { completed: false, error: "Apple sign-in couldn't return a secure identity token." };
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error || !data.session) {
        return { completed: false, error: error?.message || "Apple sign-in couldn't be completed." };
      }

      const givenName = credential.fullName?.givenName?.trim() || '';
      const middleName = credential.fullName?.middleName?.trim() || '';
      const familyName = credential.fullName?.familyName?.trim() || '';
      const fullName = [givenName, middleName, familyName].filter(Boolean).join(' ');
      if (fullName) {
        await supabase.auth.updateUser({
          data: { full_name: fullName, given_name: givenName || null, family_name: familyName || null },
        });
      }

      await AsyncStorage.removeItem(DEMO_MODE_KEY);
      setSession(data.session);
      setMode('account');
      return { completed: true, error: null };
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ERR_REQUEST_CANCELED') {
        return { completed: false, error: null };
      }
      return {
        completed: false,
        error: error instanceof Error ? error.message : "Apple sign-in couldn't be completed.",
      };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) return { error: 'The app connection has not been configured yet.', needsConfirmation: false };
    try {
      await AsyncStorage.removeItem(DEMO_MODE_KEY);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
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
    } catch (error) {
      return {
        error: error instanceof Error
          ? error.message
          : "We couldn't create your vault. Check your connection and try again.",
        needsConfirmation: false,
      };
    }
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
    signInWithApple,
    signInWithGoogle,
    signUp,
    signOut,
  }), [mode, session, enterDemo, exitDemo, signIn, signInWithApple, signInWithGoogle, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
