import { Redirect } from 'expo-router';

import { LoadingView } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';

export default function EntryScreen() {
  const { mode } = useAuth();
  if (mode === 'loading') return <LoadingView />;
  if (mode === 'account' || mode === 'demo') return <Redirect href="/(tabs)" />;
  return <Redirect href="/welcome" />;
}
