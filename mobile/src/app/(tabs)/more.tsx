import { useRouter } from 'expo-router';
import { Bell, FileText, HelpCircle, Mail, MessageSquareText, Shield, Trash2, UsersRound } from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, ListRow, SecondaryButton } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import { useVaultData } from '@/providers/vault-data-provider';
import { colors, fonts } from '@/theme';

const webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://www.hometechvault.com';

export default function MoreScreen() {
  const router = useRouter();
  const { isDemo, exitDemo, signOut } = useAuth();
  const data = useVaultData();

  async function leave() {
    if (isDemo) await exitDemo(); else await signOut();
    router.replace(isDemo ? '/sign-in' : '/welcome');
  }

  return (
    <AppScreen title="Your account" subtitle={isDemo ? 'Exploring a sample household' : data.email}>
      <Card style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.initials}>{data.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</Text></View>
        <View style={styles.profileCopy}><Text style={styles.name}>{data.fullName}</Text><Text style={styles.home}>{data.householdName}</Text></View>
        {isDemo ? <View style={styles.demoBadge}><Text style={styles.demoText}>DEMO</Text></View> : null}
      </Card>

      <Text style={styles.sectionLabel}>YOUR HOME</Text>
      <Card>
        <ListRow icon={Bell} title="Notifications" detail="Warranty, care, and home updates" onPress={() => router.push('/notifications')} />
        <ListRow icon={UsersRound} title="Household sharing" detail="Family access and roles" onPress={() => void Linking.openURL(`${webUrl}/family`)} />
        <ListRow icon={Shield} title="Privacy & security" detail="How your home record is protected" onPress={() => void Linking.openURL(`${webUrl}/privacy`)} />
      </Card>

      <Text style={styles.sectionLabel}>HELP & ACCOUNT</Text>
      <Card>
        <ListRow icon={HelpCircle} title="Help center" detail="Answers and practical guides" onPress={() => void Linking.openURL(`${webUrl}/faq`)} />
        <ListRow icon={Mail} title="Contact support" detail="Get help from Home Tech Vault" onPress={() => void Linking.openURL(`${webUrl}/contact`)} />
        {!isDemo ? <ListRow icon={MessageSquareText} title="Send feedback" detail="Share an idea or report a problem" onPress={() => router.push('/feedback')} /> : null}
        <ListRow icon={FileText} title="Terms of service" detail="The terms that govern your vault" onPress={() => void Linking.openURL(`${webUrl}/terms`)} />
      </Card>

      {!isDemo ? (
        <Pressable onPress={() => router.push('/delete-account')} style={styles.deleteRow}>
          <Trash2 size={17} color={colors.rust} /><Text style={styles.deleteText}>Delete account</Text>
        </Pressable>
      ) : null}
      <SecondaryButton label={isDemo ? 'Use my own account' : 'Sign out'} onPress={leave} />
      <View style={styles.wordmark}><Text style={styles.wordmarkMain}>HTV</Text><Text style={styles.wordmarkText}>Home Tech Vault</Text></View>
      <Text style={styles.version}>Private by design · Version 1.0.0</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  profile: { padding: 18, flexDirection: 'row', alignItems: 'center', gap: 13 }, avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }, initials: { color: colors.white, fontFamily: fonts.serif, fontSize: 18 }, profileCopy: { flex: 1 }, name: { color: colors.ink, fontFamily: fonts.serif, fontSize: 20 }, home: { marginTop: 3, color: colors.muted, fontFamily: fonts.sans, fontSize: 11 }, demoBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.oliveWash }, demoText: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  sectionLabel: { marginTop: 5, marginLeft: 4, color: colors.muted, fontFamily: fonts.sans, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 }, deleteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11 }, deleteText: { color: colors.rust, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
  wordmark: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, wordmarkMain: { color: colors.navy, fontFamily: fonts.serif, fontSize: 19 }, wordmarkText: { color: colors.navy, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' }, version: { textAlign: 'center', color: colors.muted, fontFamily: fonts.sans, fontSize: 9 },
});
