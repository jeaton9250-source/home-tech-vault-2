import { Redirect, Tabs } from 'expo-router';
import { CircleEllipsis, ClipboardCheck, House, Library, MonitorSmartphone } from 'lucide-react-native';

import { LoadingView } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import { colors, fonts } from '@/theme';

export default function TabsLayout() {
  const { mode } = useAuth();
  if (mode === 'loading') return <LoadingView />;
  if (mode !== 'demo' && mode !== 'account') return <Redirect href="/welcome" />;
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.oliveDark,
      tabBarInactiveTintColor: '#849097',
      tabBarLabelStyle: { fontFamily: fonts.sans, fontSize: 10, fontWeight: '600', marginBottom: 2 },
      tabBarStyle: { height: 82, paddingTop: 8, backgroundColor: colors.paper, borderTopColor: colors.line },
      sceneStyle: { backgroundColor: colors.cream },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <House size={size} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="devices" options={{ title: 'Devices', tabBarIcon: ({ color, size }) => <MonitorSmartphone size={size} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="care" options={{ title: 'Care', tabBarIcon: ({ color, size }) => <ClipboardCheck size={size} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="vault" options={{ title: 'Vault', tabBarIcon: ({ color, size }) => <Library size={size} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color, size }) => <CircleEllipsis size={size} color={color} strokeWidth={1.8} /> }} />
    </Tabs>
  );
}
