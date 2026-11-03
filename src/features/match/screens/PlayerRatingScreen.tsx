// src/features/match/screens/PlayerRatingScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { EventsStackParamList, LineupPlayer } from '../../../types';
import { colors, typography, spacing, radius } from '../../../config/theme';
import { useMatchData, useSetPlayerRating, useSetMotm } from '../../../hooks/useMatch';
import { useAuthStore } from '../../../stores/authStore';
import { PlayerRatingCard } from '../components/PlayerRatingCard';
import { MOTMAward } from '../components/MOTMAward';

type Props = {
  navigation: NativeStackNavigationProp<EventsStackParamList>;
  route: RouteProp<{ PlayerRating: { eventId: string } }, 'PlayerRating'>;
};

export function PlayerRatingScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const can = useAuthStore((s) => s.can);

  const { data: matchData, isLoading } = useMatchData(eventId);
  const { mutateAsync: setRating, isPending: isSavingRatings } = useSetPlayerRating();
  const { mutateAsync: setMotm, isPending: isSavingMotm } = useSetMotm();

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [motmId, setMotmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Seed from existing data
  useEffect(() => {
    if (matchData) {
      const initial: Record<string, number> = {};
      for (const p of matchData.startingLineup) {
        initial[p.userId] = p.rating ?? 0;
      }
      setRatings(initial);
      setMotmId(matchData.motm);
    }
  }, [matchData]);

  const handleRatingChange = useCallback((userId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [userId]: rating }));
  }, []);

  const handleSaveAll = async () => {
    if (!matchData) return;
    setIsSaving(true);
    try {
      const ratedPlayers = matchData.startingLineup.filter(
        (p) => ratings[p.userId] > 0,
      );

      await Promise.all(
        ratedPlayers.map((p) =>
          setRating({ eventId, userId: p.userId, rating: ratings[p.userId], isStarting: true }),
        ),
      );

      if (motmId) {
        await setMotm({ eventId, userId: motmId });
      }

      Alert.alert('Saved', 'Ratings and MOTM saved successfully.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save ratings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!can('rate_players')) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate Players</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>🔒</Text>
          <Text style={styles.permissionTitle}>Access Restricted</Text>
          <Text style={styles.permissionText}>You don't have permission to rate players.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const players: LineupPlayer[] = matchData?.startingLineup ?? [];
  const isPending = isSaving || isSavingRatings || isSavingMotm;

  const renderItem = ({ item }: { item: LineupPlayer }) => (
    <PlayerRatingCard
      player={item}
      rating={ratings[item.userId] ?? 0}
      onRatingChange={(r) => handleRatingChange(item.userId, r)}
      disabled={isPending}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Players</Text>
        <TouchableOpacity
          onPress={handleSaveAll}
          disabled={isPending}
          style={[styles.saveBtn, isPending && { opacity: 0.5 }]}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      ) : players.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👕</Text>
          <Text style={styles.emptyText}>No lineup set yet</Text>
          <Text style={styles.emptySubtext}>Set the lineup first to rate players</Text>
        </View>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(p) => p.userId}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                Rate each player's performance (1–10)
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <MOTMAward
                players={players}
                selectedUserId={motmId}
                onSelect={setMotmId}
                disabled={isPending}
              />

              <TouchableOpacity
                onPress={handleSaveAll}
                disabled={isPending}
                style={[styles.saveAllBtn, isPending && { opacity: 0.5 }]}
                activeOpacity={0.8}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <Text style={styles.saveAllBtnText}>Save All Ratings</Text>
                )}
              </TouchableOpacity>
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
  backText: {
    color: colors.text.primary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    width: 40,
  },
  headerTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    minWidth: 64,
    alignItems: 'center',
  },
  saveBtnText: {
    color: colors.text.inverse,
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing[10],
  },
  listHeader: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  listHeaderText: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
  },
  footer: {
    paddingBottom: spacing[4],
  },
  saveAllBtn: {
    margin: spacing[4],
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  saveAllBtnText: {
    color: colors.text.inverse,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[3],
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.size.lg,
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  emptySubtext: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    textAlign: 'center',
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
});
