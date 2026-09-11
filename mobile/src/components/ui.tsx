import type { LucideIcon } from 'lucide-react-native';
import { Bell, ChevronRight, Home, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, shadows } from '@/theme';
import { useAuth } from '@/providers/auth-provider';
import { useVaultData } from '@/providers/vault-data-provider';

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <View style={[styles.brandMark, light && styles.brandMarkLight]}>
      <Home size={17} color={light ? colors.navy : colors.cream} strokeWidth={1.8} />
    </View>
  );
}

export function AppScreen({
  children,
  title,
  subtitle,
  refreshing = false,
  onRefresh,
  header = true,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  header?: boolean;
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {header ? <AppHeader title={title} subtitle={subtitle} /> : null}
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.olive} /> : undefined}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const router = useRouter();
  const { isDemo } = useAuth();
  const { notifications } = useVaultData();
  const unread = notifications.filter((item) => item.unread).length;
  return (
    <View style={styles.header}>
      <View style={styles.headerIdentity}>
        <BrandMark />
        <View style={styles.headerCopy}>
          <View style={styles.headerTitleRow}>
            <Text numberOfLines={1} style={styles.headerTitle}>{title || 'Home Tech Vault'}</Text>
            {isDemo ? <View style={styles.demoPill}><Text style={styles.demoPillText}>DEMO HOME</Text></View> : null}
          </View>
          {subtitle ? <Text numberOfLines={1} style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Open notifications" onPress={() => router.push('/notifications')} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <Bell size={21} color={colors.ink} strokeWidth={1.8} />
        {unread > 0 ? <View style={styles.notificationDot}><Text style={styles.notificationDotText}>{Math.min(unread, 9)}</Text></View> : null}
      </Pressable>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? <Pressable onPress={onAction} hitSlop={10}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled = false, icon: Icon }: { label: string; onPress: () => void; disabled?: boolean; icon?: LucideIcon }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, disabled && styles.disabled, pressed && styles.pressed]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      {Icon ? <Icon size={18} color={colors.white} /> : null}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function ListRow({ icon: Icon, iconColor = colors.oliveDark, title, detail, meta, onPress }: { icon: LucideIcon; iconColor?: string; title: string; detail?: string; meta?: string; onPress?: () => void }) {
  const content = (
    <View style={styles.listRow}>
      <View style={styles.listIcon}><Icon size={18} color={iconColor} strokeWidth={1.8} /></View>
      <View style={styles.listCopy}>
        <Text style={styles.listTitle}>{title}</Text>
        {detail ? <Text style={styles.listDetail}>{detail}</Text> : null}
      </View>
      {meta ? <Text style={styles.listMeta}>{meta}</Text> : null}
      {onPress ? <ChevronRight size={17} color="#A3AAA9" /> : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.rowPressed}>{content}</Pressable> : content;
}

export function LoadingView({ label = 'Opening your home record…' }: { label?: string }) {
  return <View style={styles.loading}><ActivityIndicator color={colors.olive} /><Text style={styles.loadingText}>{label}</Text></View>;
}

export function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIcon}><Icon size={24} color={colors.oliveDark} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </Card>
  );
}

export function DemoNotice({ onContinue }: { onContinue?: () => void }) {
  const [open, setOpen] = useState(true);
  const { exitDemo } = useAuth();
  const router = useRouter();
  return (
    <Modal visible={open} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Pressable accessibilityLabel="Close" style={styles.modalClose} onPress={() => setOpen(false)}><X size={20} color={colors.muted} /></Pressable>
          <BrandMark />
          <Text style={styles.modalEyebrow}>A SAMPLE HOME</Text>
          <Text style={styles.modalTitle}>Welcome to the Morgan Household.</Text>
          <Text style={styles.modalBody}>Everything you see belongs to this fictional demo home—not to your personal account. Look around and see what a well-remembered home feels like.</Text>
          <PrimaryButton label="Explore this home" onPress={() => { setOpen(false); onContinue?.(); }} />
          <Pressable onPress={async () => { await exitDemo(); router.replace('/sign-in'); }}><Text style={styles.modalLink}>Use my own account instead</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  screen: { flex: 1, backgroundColor: colors.cream },
  screenContent: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 120, gap: 18 },
  header: { height: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.cream, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  headerIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  headerCopy: { flex: 1 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { maxWidth: '70%', color: colors.ink, fontFamily: fonts.serif, fontSize: 20, lineHeight: 23 },
  headerSubtitle: { marginTop: 1, color: colors.muted, fontFamily: fonts.sans, fontSize: 11 },
  brandMark: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy },
  brandMarkLight: { backgroundColor: colors.cream },
  demoPill: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: colors.oliveWash },
  demoPillText: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 8, fontWeight: '700', letterSpacing: 1.1 },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  notificationDot: { position: 'absolute', top: 4, right: 3, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.rust, borderWidth: 2, borderColor: colors.cream },
  notificationDotText: { color: colors.white, fontSize: 8, fontWeight: '800' },
  card: { borderRadius: 22, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, overflow: 'hidden', ...shadows.card },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
  sectionTitle: { color: colors.ink, fontFamily: fonts.sans, fontSize: 17, fontWeight: '700', letterSpacing: -0.25 },
  sectionAction: { color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 13, fontWeight: '700' },
  primaryButton: { minHeight: 54, borderRadius: 16, paddingHorizontal: 20, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveDark },
  primaryButtonText: { color: colors.white, fontFamily: fonts.sans, fontSize: 15, fontWeight: '700' },
  secondaryButton: { minHeight: 52, borderRadius: 16, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  secondaryButtonText: { color: colors.navy, fontFamily: fonts.sans, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  listRow: { minHeight: 74, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  listIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash },
  listCopy: { flex: 1 },
  listTitle: { color: colors.ink, fontFamily: fonts.sans, fontSize: 14, fontWeight: '600' },
  listDetail: { marginTop: 3, color: colors.muted, fontFamily: fonts.sans, fontSize: 12, lineHeight: 16 },
  listMeta: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11 },
  rowPressed: { opacity: 0.62 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.cream },
  loadingText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13 },
  emptyCard: { padding: 28, alignItems: 'center' },
  emptyIcon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oliveWash },
  emptyTitle: { marginTop: 15, color: colors.ink, fontFamily: fonts.serif, fontSize: 22, textAlign: 'center' },
  emptyBody: { marginTop: 8, color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  modalBackdrop: { flex: 1, padding: 22, justifyContent: 'center', backgroundColor: 'rgba(10, 22, 32, 0.68)' },
  modalCard: { borderRadius: 28, padding: 28, backgroundColor: colors.cream, alignItems: 'center', ...shadows.card },
  modalClose: { position: 'absolute', top: 18, right: 18, padding: 5 },
  modalEyebrow: { marginTop: 20, color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  modalTitle: { marginTop: 10, color: colors.navy, fontFamily: fonts.serif, fontSize: 29, lineHeight: 34, textAlign: 'center' },
  modalBody: { marginVertical: 18, color: colors.muted, fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  modalLink: { marginTop: 17, color: colors.oliveDark, fontFamily: fonts.sans, fontSize: 13, fontWeight: '700' },
});
