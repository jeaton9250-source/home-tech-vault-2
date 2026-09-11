import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField, AuthKeyboard, AuthSubmit, authStyles } from '@/components/auth-form';
import { BrandMark } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setBusy(true);
    setError(null);
    const message = await signIn(email, password);
    setBusy(false);
    if (message) return setError(message);
    router.replace('/(tabs)');
  }

  return (
    <AuthKeyboard>
      <SafeAreaView style={authStyles.safe}>
        <View style={authStyles.content}>
          <View style={authStyles.brand}>
            <BrandMark />
            <Text style={authStyles.eyebrow}>WELCOME HOME</Text>
            <Text style={authStyles.title}>Open your vault.</Text>
            <Text style={authStyles.body}>Everything your home remembers is waiting for you.</Text>
          </View>
          <View style={authStyles.form}>
            {!configured ? <Text style={authStyles.error}>Add the public Supabase values to mobile/.env.local to enable real account sign-in. Demo mode is already available.</Text> : null}
            {error ? <Text accessibilityRole="alert" style={authStyles.error}>{error}</Text> : null}
            <AuthField label="Email address" type="email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
            <AuthField label="Password" type="password" value={password} onChangeText={setPassword} placeholder="Your password" returnKeyType="done" />
            <AuthSubmit label="Open my home" busy={busy} onPress={submit} />
          </View>
          <Pressable onPress={() => router.push('/create-account')}><Text style={authStyles.footer}>Need a Home Tech Vault? <Text style={authStyles.footerStrong}>Create your home</Text></Text></Pressable>
          <Pressable onPress={() => router.back()}><Text style={authStyles.note}>Back to welcome</Text></Pressable>
        </View>
      </SafeAreaView>
    </AuthKeyboard>
  );
}
