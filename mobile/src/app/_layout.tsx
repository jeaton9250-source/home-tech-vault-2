import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { VaultDataProvider } from '@/providers/vault-data-provider';
import { colors } from '@/theme';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { mode } = useAuth();
  useEffect(() => {
    if (mode !== 'loading') void SplashScreen.hideAsync();
  }, [mode]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="create-account" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-device" options={{ presentation: 'modal' }} />
        <Stack.Screen name="device/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <VaultDataProvider>
            <RootNavigator />
          </VaultDataProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
