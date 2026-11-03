// src/features/squad/screens/SquadScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SquadStackParamList, AppUser } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useSquad } from '../../../hooks/useSquad';
import { useAuthStore } from '../../../stores/authStore';

type Nav = NativeStackNavigationProp<SquadStackParamList>;

type PositionFilter = 'all' | 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
const POS_FILTERS: { key: PositionFilter; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'goalkeeper', label: 'GK' },
  { key: 'defender',   label: 'DEF' },
  { key: 'midfielder', label: 'MID' },
  { key: 'forward',    label: 'FWD' },
];

function PlayerCard({ player, onPress }: { player: AppUser; onPress: () => void }) {
  const initials = `${player.firstName?.[0] ?? ''}${player.lastName?.[0] ?? ''}`.toUpperCase();
  const statusColor = player.status === 'active'
    ? colors.status.going
    : player.status === 'pending'
    ? colors.status.maybe
    : colors.status.notGoing;

  return (
    <TouchableOpacity style={s.playerCard} onPress={onPress} activeOpacity={0.75}>
      <View style={glassCardStyle as object}>
        <View style={s.playerRow}>
          {/* Avatar */}
          <View style={[s.avatar, { backgroundColor: colors.accent.primary + '30' }]}>
            <Text style={s.avatarText}>{initials || '?'}</Text>
            <View style={[s.statusDot, { backgroundColor: statusColor }]} />
          </View>

          {/* Info */}
          <View style={s.playerInfo}>
            <Text style={s.playerName}>{player.displayName || `${player.firstName} ${player.lastName}`}</Text>
            <View style={s.playerMeta}>
              <Text style={s.positionText}>{player.position?.replace('_', ' ') ?? 'Unassigned'}</Text>
              {player.jerseyNumber != null && (
                <Text style={s.jerseyBadge}>#{player.jerseyNumber}</Text>
              )}
            </View>
          </View>

          {/* Role badge */}
          <View style={[s.roleBadge, { backgroundColor: roleColor(player.role) + '20' }]}>
            <Text style={[s.roleText, { color: roleColor(player.role) }]}>
              {roleLabel(player.role)}
            </Text>
          </View>

          <Text style={s.arrow}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function roleColor(role: string): string {
  switch (role) {
    case 'coach':           return colors.accent.primary;
    case 'assistant_coach': return '#60A5FA';
    case 'manager':         return '#A855F7';
    default:                return colors.text.muted;
  }
}
function roleLabel(role: string): string {
  switch (role) {
    case 'coach':           return 'Coach';
    case 'assistant_coach': return 'Asst';
    case 'manager':         return 'Mgr';
    default:                return 'Player';
  }
}

export function SquadScreen() {
  const navigation = useNavigation<Nav>();
  const { can }    = useAuthStore();
  const [search,   setSearch]  = useState('');
  const [posFilter, setPosFilter] = useState<PositionFilter>('all');

  const { data: players = [], isLoading, refetch, isRefetching } = useSquad();

  const pending = players.filter(p => p.status === 'pending');

  const filtered = useMemo(() => {
    let list = players.filter(p => p.status !== 'suspended');
    if (posFilter !== 'all') list = list.filter(p => p.position === posFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.displayName?.toLowerCase().includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q),
      );
    }
    // Coaches first, then players sorted by position
    return [...list].sort((a, b) => {
      const roleOrder = ['coach', 'assistant_coach', 'manager', 'player'];
      return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
    });
  }, [players, posFilter, search]);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Squad</Text>
        {can('approve_player') && pending.length > 0 && (
          <TouchableOpacity
            style={s.pendingBtn}
            onPress={() => navigation.navigate('PendingApprovals')}
          >
            <Text style={s.pendingBtnText}>⏳ {pending.length} Pending</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search players..."
          placeholderTextColor={colors.text.muted}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Position filter tabs */}
      <View style={s.filterBar}>
        {POS_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterTab, posFilter === f.key && s.filterTabActive]}
            onPress={() => setPosFilter(f.key)}
          >
            <Text style={[s.filterLabel, posFilter === f.key && s.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Count */}
      {!isLoading && (
        <Text style={s.countLabel}>{filtered.length} member{filtered.length !== 1 ? 's' : ''}</Text>
      )}

      {/* List */}
      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.accent.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.userId}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent.primary}
            />
          }
          renderItem={({ item }) => (
            <PlayerCard
              player={item}
              onPress={() => navigation.navigate('PlayerProfile', { userId: item.userId })}
            />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>👥</Text>
              <Text style={s.emptyTitle}>
                {search ? 'No players found' : 'No squad members yet'}
              </Text>
              <Text style={s.emptySubtitle}>
                {search ? 'Try a different search' : 'Share the invite code to add players'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.background.primary },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[3] },
  title:           { fontSize: typography.size['2xl'], color: colors.text.primary, fontWeight: '700' },
  pendingBtn:      { backgroundColor: colors.status.maybe + '20', paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, borderWidth: 1, borderColor: colors.status.maybe + '60' },
  pendingBtnText:  { color: colors.status.maybe, fontSize: typography.size.sm, fontWeight: '600' },
  searchBar:       { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing[5], backgroundColor: colors.background.secondary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing[3], marginBottom: spacing[3] },
  searchIcon:      { fontSize: 16, marginRight: spacing[2] },
  searchInput:     { flex: 1, paddingVertical: spacing[3], color: colors.text.primary, fontSize: typography.size.md },
  filterBar:       { flexDirection: 'row', paddingHorizontal: spacing[5], gap: spacing[2], marginBottom: spacing[2] },
  filterTab:       { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background.secondary },
  filterTabActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  filterLabel:     { fontSize: typography.size.sm, color: colors.text.secondary, fontWeight: '500' },
  filterLabelActive:{ color: colors.text.inverse, fontWeight: '700' },
  countLabel:      { fontSize: typography.size.xs, color: colors.text.muted, paddingHorizontal: spacing[5], marginBottom: spacing[2] },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent:     { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
  playerCard:      { marginBottom: spacing[2] },
  playerRow:       { flexDirection: 'row', alignItems: 'center', padding: spacing[3], gap: spacing[3] },
  avatar:          { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarText:      { fontSize: typography.size.md, color: colors.accent.primary, fontWeight: '700' },
  statusDot:       { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.background.secondary },
  playerInfo:      { flex: 1 },
  playerName:      { fontSize: typography.size.md, color: colors.text.primary, fontWeight: '600' },
  playerMeta:      { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: 2 },
  positionText:    { fontSize: typography.size.xs, color: colors.text.muted, textTransform: 'capitalize' },
  jerseyBadge:     { fontSize: typography.size.xs, color: colors.accent.primary, fontWeight: '700' },
  roleBadge:       { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: radius.full },
  roleText:        { fontSize: typography.size.xs, fontWeight: '700' },
  arrow:           { fontSize: 20, color: colors.text.muted },
  empty:           { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyEmoji:      { fontSize: 48 },
  emptyTitle:      { fontSize: typography.size.lg, color: colors.text.primary, fontWeight: '600' },
  emptySubtitle:   { fontSize: typography.size.sm, color: colors.text.muted, textAlign: 'center', paddingHorizontal: spacing[8] },
});
