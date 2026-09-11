import { router, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { syncEnabledHomeNotifications } from '@/lib/device-notifications';
import { VaultDataProvider, useVaultData } from '@/providers/vault-data-provider';
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
        <Stack.Screen name="delete-account" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-device" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-document" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-device" options={{ presentation: 'modal' }} />
        <Stack.Screen name="scan-device" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="device/[id]" />
      </Stack>
    </>
  );
}

function NotificationScheduler() {
  const auth = useAuth();
  const data = useVaultData();

  useEffect(() => {
    const accessToken = auth.session?.access_token;
    if (auth.mode !== 'account' || data.loading || !accessToken) return;
    void syncEnabledHomeNotifications({
      devices: data.devices,
      maintenance: data.maintenance,
      accessToken,
    }).catch(() => undefined);
  }, [auth.mode, auth.session?.access_token, data.loading, data.devices, data.maintenance]);

  return null;
}

function NotificationNavigation() {
  useEffect(() => {
    function openMaintenanceReminder(notification: Notifications.Notification) {
      const data = notification.request.content.data;
      if (data?.source === 'home-tech-vault' && data?.kind === 'maintenance') {
        router.push('/(tabs)/care');
      }
    }

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) openMaintenanceReminder(lastResponse.notification);
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openMaintenanceReminder(response.notification);
    });
    return () => subscription.remove();
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <VaultDataProvider>
            <NotificationScheduler />
            <NotificationNavigation />
            <RootNavigator />
          </VaultDataProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
