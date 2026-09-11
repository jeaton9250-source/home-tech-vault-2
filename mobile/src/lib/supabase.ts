import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const CHUNK_SIZE = 1800;

const serverSessionStorage = {
  async getItem() {
    return null;
  },
  async setItem() {},
  async removeItem() {},
};

const webSessionStorage = typeof window === 'undefined' ? serverSessionStorage : AsyncStorage;

const secureSessionStorage = {
  async getItem(key: string) {
    const countValue = await SecureStore.getItemAsync(`${key}__count`);
    if (!countValue) return null;
    const count = Number(countValue);
    if (!Number.isInteger(count) || count < 1) return null;
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(`${key}__${index}`)),
    );
    return chunks.every((chunk): chunk is string => chunk !== null) ? chunks.join('') : null;
  },
  async setItem(key: string, value: string) {
    const previousCount = Number(await SecureStore.getItemAsync(`${key}__count`)) || 0;
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'gs')) ?? [''];
    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(`${key}__${index}`, chunk)));
    await SecureStore.setItemAsync(`${key}__count`, String(chunks.length));
    if (previousCount > chunks.length) {
      await Promise.all(
        Array.from({ length: previousCount - chunks.length }, (_, index) =>
          SecureStore.deleteItemAsync(`${key}__${chunks.length + index}`),
        ),
      );
    }
  },
  async removeItem(key: string) {
    const count = Number(await SecureStore.getItemAsync(`${key}__count`)) || 0;
    await Promise.all(
      Array.from({ length: count }, (_, index) => SecureStore.deleteItemAsync(`${key}__${index}`)),
    );
    await SecureStore.deleteItemAsync(`${key}__count`);
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
