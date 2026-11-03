// src/features/match/screens/LineupBuilderScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { EventsStackParamList, AppUser, LineupPlayer } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useMatchData, useSaveLineup } from '../../../hooks/useMatch';
import { usePlayers } from '../../../hooks/usePlayers';
import { useAuthStore } from '../../../stores/authStore';
import { FormationSelector } from '../components/FormationSelector';
import { Avatar } from '../../../components/ui/Avatar';

type Props = {
  navigation: NativeStackNavigationProp<EventsStackParamList>;
  route: RouteProp<{ LineupBuilder: { eventId: string } }, 'LineupBuilder'>;
};

function userToLineupPlayer(user: AppUser, positionIndex: number): LineupPlayer {
  return {
    userId: user.userId,
    displayName: user.displayName,
    jerseyNumber: user.jerseyNumber ?? 0,
    position: user.position,
    positionIndex,
    isCaptain: false,
    rating: null,
  };
}

type Slot = 'bench' | 'starting' | 'none';

export function LineupBuilderScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const can = useAuthStore((s) => s.can);

  const { data: matchData, isLoading: matchLoading } = useMatchData(eventId);
  const { data: allPlayers, isLoading: playersLoading } = usePlayers();
  const { mutateAsync: saveLineup, isPending: isSaving } = useSaveLineup();

  const [formation, setFormation] = useState('4-3-3');
  const [startingIds, setStartingIds] = useState<string[]>([]);
  const [benchIds, setBenchIds] = useState<string[]>([]);

  // Seed from existing match data
  useEffect(() => {
    if (matchData) {
      setFormation(matchData.formation);
      setStartingIds(matchData.startingLineup.map((p) => p.userId));
      setBenchIds(matchData.substitutes.map((p) => p.userId));
    }
  }, [matchData]);

  const getSlot = useCallback(
    (userId: string): Slot => {
      if (startingIds.includes(userId)) return 'starting';
      if (benchIds.includes(userId)) return 'bench';
      return 'none';
    },
    [startingIds, benchIds],
  );

  const handleToggle = useCallback(
    (user: AppUser) => {
      const slot = getSlot(user.userId);
      if (slot === 'none') {
        if (startingIds.length < 11) {
          setStartingIds((prev) => [...prev, user.userId]);
        } else if (benchIds.length < 7) {
          setBenchIds((prev) => [...prev, user.userId]);
        } else {
          Alert.alert('Lineup Full', 'Remove a player before adding another.');
        }
      } else if (slot === 'starting') {
        setStartingIds((prev) => prev.filter((id) => id !== user.userId));
      } else {
        setBenchIds((prev) => prev.filter((id) => id !== user.userId));
      }
    },
    [startingIds, benchIds, getSlot],
  );

  const handleSave = async () => {
    if (!allPlayers) return;
    const playerMap = new Map(allPlayers.map((p) => [p.userId, p]));

    const startingLineup: LineupPlayer[] = startingIds.map((id, idx) => {
      const user = playerMap.get(id);
      if (user) return userToLineupPlayer(user, idx);
      // Fallback if user not found
      return { userId: id, displayName: id, jerseyNumber: 0, position: 'midfielder', positionIndex: idx, isCaptain: false, rating: null };
    });

    const substitutes: LineupPlayer[] = benchIds.map((id, idx) => {
      const user = playerMap.get(id);
      if (user) return userToLineupPlayer(user, idx);
      return { userId: id, displayName: id, jerseyNumber: 0, position: 'midfielder', positionIndex: idx, isCaptain: false, rating: null };
    });

    try {
      await saveLineup({ eventId, startingLineup, substitutes, formation });
      Alert.alert('Saved', 'Lineup saved successfully.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save lineup. Please try again.');
    }
  };

  if (!can('edit_lineup')) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>🔒</Text>
          <Text style={styles.permissionTitle}>Access Restricted</Text>
          <Text style={styles.permissionText}>You don't have permission to edit the lineup.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = matchLoading || playersLoading;

  const renderPlayer = ({ item }: { item: AppUser }) => {
    const slot = getSlot(item.userId);
    const isStarting = slot === 'starting';
    const isBench = slot === 'bench';
    const isAdded = isStarting || isBench;

    return (
      <View style={[styles.playerRow, isStarting && styles.playerRowStarting, isBench && styles.playerRowBench]}>
        <Avatar name={item.displayName} size={40} />
        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1}>{item.displayName}</Text>
          <Text style={styles.playerMeta}>
            {item.position}
            {item.jerseyNumber != null ? `  •  #${item.jerseyNumber}` : ''}
          </Text>
        </View>
        {isStarting && <View style={styles.slotBadge}><Text style={styles.slotBadgeText}>START</Text></View>}
        {isBench && <View style={[styles.slotBadge, styles.slotBadgeBench]}><Text style={styles.slotBadgeText}>BENCH</Text></View>}
        <TouchableOpacity
          onPress={() => handleToggle(item)}
          style={[styles.toggleBtn, isAdded && styles.toggleBtnAdded]}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleBtnText}>{isAdded ? '−' : '+'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const startingCount = startingIds.length;
  const benchCount = benchIds.length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backIconText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lineup Builder</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveHeaderBtn, isSaving && { opacity: 0.5 }]}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <Text style={styles.saveHeaderBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      ) : (
        <FlatList
          data={allPlayers ?? []}
          keyExtractor={(item) => item.userId}
          renderItem={renderPlayer}
          ListHeaderComponent={
            <View>
              <FormationSelector
                value={formation}
                onChange={setFormation}
                disabled={isSaving}
              />
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Starting XI</Text>
                <Text style={[
                  styles.sectionCount,
                  startingCount === 11 && styles.sectionCountFull,
                ]}>
                  {startingCount}/11
                </Text>
              </View>
              {startingCount === 0 && (
                <Text style={styles.emptyHint}>Tap + next to players to add to the starting lineup</Text>
              )}
              <View style={styles.sectionDivider} />
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Substitutes</Text>
                <Text style={styles.sectionCount}>{benchCount}/7</Text>
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backIcon: {
    marginRight: spacing[2],
  },
  backIconText: {
    color: colors.text.primary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: '700',
  },
  saveHeaderBtn: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    minWidth: 64,
    alignItems: 'center',
  },
  saveHeaderBtnText: {
    color: colors.text.inverse,
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing[10],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  sectionCount: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    fontWeight: '600',
  },
  sectionCountFull: {
    color: colors.accent.primary,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
  emptyHint: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  playerRowStarting: {
    backgroundColor: `${colors.accent.primary}10`,
  },
  playerRowBench: {
    backgroundColor: `${colors.status.maybe}08`,
  },
  playerInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  playerName: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: '600',
  },
  playerMeta: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  slotBadge: {
    backgroundColor: `${colors.accent.primary}25`,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: spacing[2],
  },
  slotBadgeBench: {
    backgroundColor: `${colors.status.maybe}25`,
  },
  slotBadgeText: {
    color: colors.text.secondary,
    fontSize: typography.size.xs,
    fontWeight: '700',
  },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnAdded: {
    backgroundColor: colors.status.notGoing,
  },
  toggleBtnText: {
    color: '#fff',
    fontSize: typography.size.xl,
    fontWeight: '700',
    lineHeight: 24,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: spacing[4],
  },
  permissionTitle: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  permissionText: {
    color: colors.text.secondary,
    fontSize: typography.size.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  backBtn: {
    marginTop: spacing[6],
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: radius.full,
  },
  backBtnText: {
    color: colors.text.inverse,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
});
