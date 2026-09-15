import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const CHUNK_SIZE = 1800;
const DEV_STORAGE_PREFIX = 'htv:secure-store-dev-fallback:';

const serverSessionStorage = {
  async getItem() {
    return null;
  },
  async setItem() {},
  async removeItem() {},
};

const webSessionStorage = typeof window === 'undefined' ? serverSessionStorage : AsyncStorage;

async function getSecureItem(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    if (__DEV__) return AsyncStorage.getItem(`${DEV_STORAGE_PREFIX}${key}`);
    throw error;
  }
}

async function setSecureItem(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    if (__DEV__) {
      await AsyncStorage.setItem(`${DEV_STORAGE_PREFIX}${key}`, value);
      return;
    }
    throw error;
  }
}

async function removeSecureItem(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    if (!__DEV__) throw error;
  }
  if (__DEV__) await AsyncStorage.removeItem(`${DEV_STORAGE_PREFIX}${key}`);
}

const secureSessionStorage = {
  async getItem(key: string) {
    const countValue = await getSecureItem(`${key}__count`);
    if (!countValue) return null;
    const count = Number(countValue);
    if (!Number.isInteger(count) || count < 1) return null;
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) => getSecureItem(`${key}__${index}`)),
    );
    return chunks.every((chunk): chunk is string => chunk !== null) ? chunks.join('') : null;
  },
  async setItem(key: string, value: string) {
    const previousCount = Number(await getSecureItem(`${key}__count`)) || 0;
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'gs')) ?? [''];
    await Promise.all(chunks.map((chunk, index) => setSecureItem(`${key}__${index}`, chunk)));
    await setSecureItem(`${key}__count`, String(chunks.length));
    if (previousCount > chunks.length) {
      await Promise.all(
        Array.from({ length: previousCount - chunks.length }, (_, index) =>
          removeSecureItem(`${key}__${chunks.length + index}`),
        ),
      );
    }
  },
  async removeItem(key: string) {
    const count = Number(await getSecureItem(`${key}__count`)) || 0;
    await Promise.all(
      Array.from({ length: count }, (_, index) => removeSecureItem(`${key}__${index}`)),
    );
    await removeSecureItem(`${key}__count`);
  },
};

export const isSupabaseConfigured = Boolean(url && publishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(url!, publishableKey!, {
      auth: {
        storage: Platform.OS === 'web' ? webSessionStorage : secureSessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
