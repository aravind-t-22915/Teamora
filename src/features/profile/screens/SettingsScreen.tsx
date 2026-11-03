// src/features/profile/screens/SettingsScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Share, Alert, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useAuthStore } from '../../../stores/authStore';
import { SEASON } from '../../../config/constants';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const user = useAuthStore(s => s.user);
  const club = useAuthStore(s => s.club);
  const inviteCode = club?.inviteCode ?? null;
  const isCoach    = user?.role === 'coach' || user?.role === 'assistant_coach';

  const handleShare = async () => {
    if (!inviteCode) return;
    try {
      await Share.share({
        message: `Join ${club?.name ?? 'our team'} on Teamora! Use invite code: ${inviteCode}`,
        title: 'Team Invite Code',
      });
    } catch {
      // user cancelled share sheet
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={s.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Invite Code (coaches only) ──────────────────────────────── */}
        {isCoach && inviteCode && (
          <Section title="Team Invite Code">
            <View style={s.inviteBlock}>
              <Text style={s.inviteLabel}>Share this code so players can join {club?.name ?? 'your team'}</Text>
              <View style={s.inviteCodeRow}>
                <Text style={s.inviteCode} selectable>{inviteCode}</Text>
              </View>
              <View style={s.inviteActions}>
                <TouchableOpacity style={s.inviteBtn} onPress={handleShare} activeOpacity={0.8}>
                  <Text style={s.inviteBtnText}>Share Invite Code</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Section>
        )}

        {/* ── Club ─────────────────────────────────────────────────────── */}
        <Section title="Club">
          <Row label="Club Name"  value={club?.name ?? '—'} />
          <Row label="Season"     value={club?.season ?? SEASON} />
          <Row label="Club ID"    value={club?.clubId ?? '—'} mono />
        </Section>

        {/* ── Account ──────────────────────────────────────────────────── */}
        <Section title="Account">
          <Row label="Name"  value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || '—'} />
          <Row label="Email" value={user?.email ?? '—'} />
          <Row label="Role"  value={user?.role?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—'} />
        </Section>

        {/* ── Notifications ────────────────────────────────────────────── */}
        <Section title="Notifications">
          <TouchableOpacity style={s.row} onPress={() => Alert.alert('Coming Soon', 'Notification preferences will be available in a future update.')} activeOpacity={0.7}>
            <Text style={s.rowLabel}>Notification Preferences</Text>
            <Text style={s.rowChevron}>›</Text>
          </TouchableOpacity>
        </Section>

        {/* ── App ──────────────────────────────────────────────────────── */}
        <Section title="App">
          <Row label="Version" value="1.0.0" />
        </Section>

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={[glassCardStyle, s.card]}>{children}</View>
    </View>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, mono && s.rowValueMono]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background.primary },

  header:      {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:    { color: colors.accent.primary, fontSize: typography.size.xl, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.text.primary, fontSize: typography.size.lg, fontWeight: '700' },
  headerSpacer:{ width: 36 },

  content:     { paddingHorizontal: spacing[5], paddingTop: spacing[5] },

  section:     { marginBottom: spacing[5] },
  sectionTitle:{ fontSize: typography.size.xs, color: colors.text.muted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing[2], paddingLeft: spacing[1] },
  card:        { overflow: 'hidden' },

  row:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowLabel:    { fontSize: typography.size.sm, color: colors.text.secondary, flex: 1 },
  rowValue:    { fontSize: typography.size.sm, color: colors.text.primary, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  rowValueMono:{ fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: typography.size.xs, color: colors.text.muted },
  rowChevron:  { fontSize: typography.size.lg, color: colors.text.muted },

  // Invite Code block
  inviteBlock: { padding: spacing[4], gap: spacing[3] },
  inviteLabel: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center' },
  inviteCodeRow:{
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    borderWidth: 1,
    borderColor: colors.accent.primary + '40',
  },
  inviteCode:  {
    fontSize: typography.size['3xl'], fontWeight: '800',
    color: colors.accent.primary,
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  inviteActions: { flexDirection: 'row', gap: spacing[3] },
  inviteBtn:   {
    flex: 1, backgroundColor: colors.accent.primary,
    borderRadius: radius.md, paddingVertical: spacing[3],
    alignItems: 'center',
  },
  inviteBtnText: { color: colors.text.inverse, fontSize: typography.size.sm, fontWeight: '700' },
});
