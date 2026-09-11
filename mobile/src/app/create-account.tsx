import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField, AuthKeyboard, AuthSubmit, authStyles } from '@/components/auth-form';
import { BrandMark } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim() || !email.trim() || password.length < 8) {
      setIsError(true);
      setMessage('Add your name, a valid email, and a password of at least 8 characters.');
      return;
    }
    try {
      setBusy(true);
      setMessage(null);
      const result = await signUp(email, password, name);
      if (result.error) {
        setIsError(true);
        setMessage(result.error);
        return;
      }
      if (result.needsConfirmation) {
        Alert.alert(
          'Check your email',
          'We sent a confirmation link. Confirm your email, then return to sign in to your new Home Tech Vault.',
          [{ text: 'Go to sign in', onPress: () => router.replace('/sign-in') }],
        );
        return;
      }
      router.replace('/(tabs)');
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "We couldn't create your vault. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthKeyboard>
      <SafeAreaView style={authStyles.safe}>
        <View style={authStyles.content}>
          <View style={authStyles.brand}>
            <BrandMark />
            <Text style={authStyles.eyebrow}>BEGIN YOUR HOME RECORD</Text>
            <Text style={authStyles.title}>Give your home a place to remember.</Text>
            <Text style={authStyles.body}>Start small. Add what matters. Your vault becomes more useful with every detail.</Text>
          </View>
          <View style={authStyles.form}>
            {message ? <Text accessibilityRole="alert" style={isError ? authStyles.error : authStyles.body}>{message}</Text> : null}
            <AuthField label="Your name" value={name} onChangeText={setName} placeholder="Alex Morgan" autoCapitalize="words" />
            <AuthField label="Email address" type="email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
            <AuthField label="Password" type="password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" returnKeyType="done" />
            <AuthSubmit label="Create my home" busy={busy} onPress={submit} />
          </View>
          <Pressable onPress={() => router.push('/sign-in')}><Text style={authStyles.footer}>Already have an account? <Text style={authStyles.footerStrong}>Sign in</Text></Text></Pressable>
          <Text style={authStyles.note}>By continuing, you agree to the Terms and Privacy Policy on hometechvault.com.</Text>
        </View>
      </SafeAreaView>
    </AuthKeyboard>
  );
}
