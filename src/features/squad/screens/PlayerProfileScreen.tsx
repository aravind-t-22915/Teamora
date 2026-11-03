// src/features/squad/screens/PlayerProfileScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SquadStackParamList } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useSquad } from '../../../hooks/useSquad';
import { usePlayerStats } from '../../../hooks/usePlayerStats';
import { useAuthStore } from '../../../stores/authStore';
import { SEASON } from '../../../config/constants';

type Props = NativeStackScreenProps<SquadStackParamList, 'PlayerProfile'>;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || '—'}</Text>
    </View>
  );
}

export function PlayerProfileScreen({ navigation, route }: Props) {
  const { userId } = route.params;
  const can         = useAuthStore(s => s.can);
  const { data: players = [], isLoading } = useSquad();
  const { data: stats } = usePlayerStats(userId, SEASON);

  const player = players.find(p => p.userId === userId);

  if (isLoading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}><ActivityIndicator color={colors.accent.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!player) {
    return (
      <SafeAreaView style={s.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.center}>
          <Text style={s.errorText}>Player not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = `${player.firstName?.[0] ?? ''}${player.lastName?.[0] ?? ''}`.toUpperCase();
  const statusColor = player.status === 'active'
    ? colors.status.going
    : player.status === 'pending'
    ? colors.status.maybe
    : colors.status.notGoing;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={s.hero}>
          <View style={[s.avatar, { backgroundColor: colors.accent.primary + '30' }]}>
            <Text style={s.avatarText}>{initials || '?'}</Text>
          </View>
          <Text style={s.name}>{player.displayName || `${player.firstName} ${player.lastName}`}</Text>
          <Text style={s.position}>{player.position?.replace('_', ' ').toUpperCase() ?? 'UNASSIGNED'}</Text>
          <View style={[s.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '60' }]}>
            <Text style={[s.statusText, { color: statusColor }]}>{player.status?.toUpperCase()}</Text>
          </View>
          {player.jerseyNumber != null && (
            <Text style={s.jersey}>#{player.jerseyNumber}</Text>
          )}
        </View>

        <View style={s.body}>

          {/* Player info */}
          <View style={[glassCardStyle, s.card]}>
            <InfoRow label="Role"           value={player.role?.replace('_', ' ')} />
            <View style={s.divider} />
            <InfoRow label="Position"       value={player.position?.replace('_', ' ')} />
            <View style={s.divider} />
            <InfoRow label="Preferred Foot" value={player.preferredFoot} />
            <View style={s.divider} />
            <InfoRow label="Jersey #"       value={player.jerseyNumber?.toString() ?? ''} />
            <View style={s.divider} />
            <InfoRow label="Height"         value={player.height ? `${player.height} cm` : ''} />
            <View style={s.divider} />
            <InfoRow label="Weight"         value={player.weight ? `${player.weight} kg` : ''} />
          </View>

          {/* Season stats */}
          {stats && (
            <>
              <Text style={s.sectionTitle}>Season Stats {SEASON}</Text>
              <View style={[glassCardStyle, s.statsGrid]}>
                {[
                  { label: 'Goals',     value: stats.goals,        icon: '⚽️' },
                  { label: 'Assists',   value: stats.assists,      icon: '🎯' },
                  { label: 'MOTM',      value: stats.motmCount,    icon: '🏆' },
                  { label: 'Apps',      value: stats.appearances,  icon: '📋' },
                  { label: 'Yellows',   value: stats.yellowCards,  icon: '🟨' },
                  { label: 'Reds',      value: stats.redCards,     icon: '🟥' },
                ].map(({ label, value, icon }) => (
                  <View key={label} style={s.statItem}>
                    <Text style={s.statIcon}>{icon}</Text>
                    <Text style={s.statValue}>{value}</Text>
                    <Text style={s.statLabel}>{label}</Text>
                  </View>
                ))}
              </View>
              <View style={[glassCardStyle, s.card]}>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Attendance Rate</Text>
                  <Text style={[s.infoValue, { color: stats.attendanceRate >= 80 ? colors.status.going : colors.status.maybe }]}>
                    {Math.round(stats.attendanceRate)}%
                  </Text>
                </View>
                <View style={s.divider} />
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Avg Rating</Text>
                  <Text style={s.infoValue}>
                    {stats.ratingCount > 0 ? stats.averageRating.toFixed(1) : '—'} / 10
                  </Text>
                </View>
                {player.position === 'goalkeeper' && (
                  <>
                    <View style={s.divider} />
                    <View style={s.infoRow}>
                      <Text style={s.infoLabel}>Clean Sheets</Text>
                      <Text style={s.infoValue}>{stats.cleanSheets}</Text>
                    </View>
                  </>
                )}
              </View>
            </>
          )}

          {/* Contact info (coaches only) */}
          {can('manage_squad') && (
            <>
              <Text style={s.sectionTitle}>Contact (Staff Only)</Text>
              <View style={[glassCardStyle, s.card]}>
                <InfoRow label="Email"  value={player.email} />
                <View style={s.divider} />
                <InfoRow label="Phone"  value={player.phone} />
                <View style={s.divider} />
                <InfoRow label="Emergency Contact" value={player.emergencyContactName} />
                <View style={s.divider} />
                <InfoRow label="Emergency Phone" value={player.emergencyContactPhone} />
              </View>
            </>
          )}

          <View style={{ height: spacing[8] }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background.primary },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  errorText:    { color: colors.text.secondary },
  backBtn:      { paddingHorizontal: spacing[5], paddingVertical: spacing[4] },
  backText:     { color: colors.accent.primary, fontSize: typography.size.md },
  hero:         { alignItems: 'center', paddingVertical: spacing[6], gap: spacing[2] },
  avatar:       { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
  avatarText:   { fontSize: typography.size['3xl'], color: colors.accent.primary, fontWeight: '800' },
  name:         { fontSize: typography.size.xl, color: colors.text.primary, fontWeight: '700' },
  position:     { fontSize: typography.size.xs, color: colors.text.muted, letterSpacing: 1, fontWeight: '600' },
  statusBadge:  { paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: radius.full, borderWidth: 1 },
  statusText:   { fontSize: typography.size.xs, fontWeight: '700', letterSpacing: 0.5 },
  jersey:       { fontSize: typography.size['2xl'], color: colors.accent.primary, fontWeight: '900' },
  body:         { paddingHorizontal: spacing[5], gap: spacing[4] },
  card:         { paddingHorizontal: spacing[4], paddingVertical: 0 },
  infoRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[3] },
  infoLabel:    { fontSize: typography.size.sm, color: colors.text.muted, textTransform: 'capitalize' },
  infoValue:    { fontSize: typography.size.sm, color: colors.text.primary, fontWeight: '500', textTransform: 'capitalize', maxWidth: '60%', textAlign: 'right' },
  divider:      { height: 1, backgroundColor: colors.divider },
  sectionTitle: { fontSize: typography.size.xs, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', padding: spacing[4], gap: spacing[2] },
  statItem:     { width: '30%', alignItems: 'center', gap: 4, paddingVertical: spacing[2] },
  statIcon:     { fontSize: 20 },
  statValue:    { fontSize: typography.size['2xl'], color: colors.text.primary, fontWeight: '800' },
  statLabel:    { fontSize: typography.size.xs, color: colors.text.muted },
});
