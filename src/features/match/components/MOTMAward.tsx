// src/features/match/components/MOTMAward.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LineupPlayer } from '../../../types';
import { colors, spacing, typography, radius, glassCardStyle } from '../../../config/theme';
import { Avatar } from '../../../components/ui/Avatar';

export interface MOTMAwardProps {
  players: LineupPlayer[];
  selectedUserId: string | null;
  onSelect: (userId: string) => void;
  disabled?: boolean;
}

export const MOTMAward: React.FC<MOTMAwardProps> = ({
  players,
  selectedUserId,
  onSelect,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.trophy}>🏆</Text>
        <View>
          <Text style={styles.title}>Man of the Match</Text>
          <Text style={styles.subtitle}>Select the standout player</Text>
        </View>
      </View>

      <View style={styles.list}>
        {players.map((player) => {
          const isSelected = player.userId === selectedUserId;
          return (
            <TouchableOpacity
              key={player.userId}
              onPress={() => !disabled && onSelect(player.userId)}
              activeOpacity={disabled ? 1 : 0.7}
              style={[
                styles.playerRow,
                isSelected && styles.playerRowSelected,
              ]}
            >
              <Avatar
                name={player.displayName}
                size={36}
                color={isSelected ? `${colors.status.maybe}30` : `${colors.accent.primary}20`}
              />

              <View style={styles.playerInfo}>
                <Text style={[styles.playerName, isSelected && styles.playerNameSelected]}>
                  {player.displayName}
                </Text>
                <Text style={styles.playerPosition}>{player.position}</Text>
              </View>

              {player.jerseyNumber > 0 && (
                <Text style={styles.jersey}>#{player.jerseyNumber}</Text>
              )}

              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>

              {isSelected && <Text style={styles.motmBadge}>🏆</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  trophy: {
    fontSize: 32,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  list: {
    gap: spacing[2],
  },
  playerRow: {
    ...glassCardStyle,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    gap: spacing[3],
  },
  playerRowSelected: {
    borderColor: colors.status.maybe,
    backgroundColor: `${colors.status.maybe}15`,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: '600',
  },
  playerNameSelected: {
    color: colors.status.maybe,
  },
  playerPosition: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  jersey: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.status.maybe,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.status.maybe,
  },
  motmBadge: {
    fontSize: 16,
  },
});
