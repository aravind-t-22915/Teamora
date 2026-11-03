// src/features/squad/screens/PendingApprovalsScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SquadStackParamList, AppUser } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useSquad, useApprovePlayer, useRejectPlayer } from '../../../hooks/useSquad';

type Props = NativeStackScreenProps<SquadStackParamList, 'PendingApprovals'>;

function PendingCard({
  player,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  player: AppUser;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const initials = `${player.firstName?.[0] ?? ''}${player.lastName?.[0] ?? ''}`.toUpperCase();
  return (
    <View style={[glassCardStyle as object, s.card]}>
      <View style={s.cardTop}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials || '?'}</Text>
        </View>
        <View style={s.info}>
          <Text style={s.name}>{player.displayName || `${player.firstName} ${player.lastName}`}</Text>
          <Text style={s.email}>{player.email}</Text>
          <Text style={s.position}>{player.position?.replace('_', ' ') ?? 'Unassigned'}</Text>
        </View>
      </View>
      <View style={s.actions}>
        <TouchableOpacity
          style={s.rejectBtn}
          onPress={onReject}
          disabled={isApproving || isRejecting}
          activeOpacity={0.75}
        >
          {isRejecting
            ? <ActivityIndicator color={colors.status.notGoing} size="small" />
            : <Text style={s.rejectText}>✕  Reject</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={s.approveBtn}
          onPress={onApprove}
          disabled={isApproving || isRejecting}
          activeOpacity={0.75}
        >
          {isApproving
            ? <ActivityIndicator color={colors.text.inverse} size="small" />
            : <Text style={s.approveText}>✓  Approve</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function PendingApprovalsScreen({ navigation }: Props) {
  const { data: players = [], isLoading, refetch, isRefetching } = useSquad();
  const { mutateAsync: approve, isPending: isApproving } = useApprovePlayer();
  const { mutateAsync: reject,  isPending: isRejecting  } = useRejectPlayer();

  const pending = players.filter(p => p.status === 'pending');

  const handleApprove = (player: AppUser) => {
    Alert.alert(
      'Approve Player',
      `Add ${player.displayName || player.firstName} to the squad?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try { await approve(player.userId); }
            catch (e: unknown) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
          },
        },
      ],
    );
  };

  const handleReject = (player: AppUser) => {
    Alert.alert(
      'Reject Request',
      `Deny ${player.displayName || player.firstName}'s join request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try { await reject(player.userId); }
            catch (e: unknown) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Pending Requests</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <View style={s.center}><ActivityIndicator color={colors.accent.primary} size="large" /></View>
      ) : (
        <FlatList
          data={pending}
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
            <PendingCard
              player={item}
              onApprove={() => handleApprove(item)}
              onReject={() => handleReject(item)}
              isApproving={isApproving}
              isRejecting={isRejecting}
            />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>✅</Text>
              <Text style={s.emptyTitle}>All clear!</Text>
              <Text style={s.emptySubtitle}>No pending join requests</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background.primary },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[4] },
  backBtn:     { width: 60 },
  backText:    { color: colors.accent.primary, fontSize: typography.size.md },
  title:       { fontSize: typography.size.lg, color: colors.text.primary, fontWeight: '700' },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: spacing[5], paddingBottom: spacing[8], gap: spacing[3] },
  card:        { padding: spacing[4], gap: spacing[4] },
  cardTop:     { flexDirection: 'row', gap: spacing[3] },
  avatar:      { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.status.maybe + '30', alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: typography.size.lg, color: colors.status.maybe, fontWeight: '700' },
  info:        { flex: 1, gap: 3 },
  name:        { fontSize: typography.size.md, color: colors.text.primary, fontWeight: '600' },
  email:       { fontSize: typography.size.sm, color: colors.text.muted },
  position:    { fontSize: typography.size.xs, color: colors.text.secondary, textTransform: 'capitalize' },
  actions:     { flexDirection: 'row', gap: spacing[3] },
  rejectBtn:   { flex: 1, paddingVertical: spacing[2], borderRadius: radius.md, borderWidth: 1, borderColor: colors.status.notGoing + '60', alignItems: 'center', justifyContent: 'center' },
  rejectText:  { color: colors.status.notGoing, fontWeight: '600', fontSize: typography.size.sm },
  approveBtn:  { flex: 1, paddingVertical: spacing[2], borderRadius: radius.md, backgroundColor: colors.accent.primary, alignItems: 'center', justifyContent: 'center' },
  approveText: { color: colors.text.inverse, fontWeight: '700', fontSize: typography.size.sm },
  empty:       { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyEmoji:  { fontSize: 48 },
  emptyTitle:  { fontSize: typography.size.lg, color: colors.text.primary, fontWeight: '600' },
  emptySubtitle:{ fontSize: typography.size.sm, color: colors.text.muted },
});
