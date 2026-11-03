// src/features/match/components/PlayerRatingCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LineupPlayer } from '../../../types';
import { colors, spacing, typography, radius, glassCardStyle } from '../../../config/theme';
import { Avatar } from '../../../components/ui/Avatar';

export interface PlayerRatingCardProps {
  player: LineupPlayer;
  rating: number;         // 1–10, 0 = not rated
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

function buildStars(rating: number): string {
  const filled = rating;
  const empty = 10 - filled;
  return '●'.repeat(filled) + '○'.repeat(empty);
}

export const PlayerRatingCard: React.FC<PlayerRatingCardProps> = ({
  player,
  rating,
  onRatingChange,
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (!disabled && rating > 1) onRatingChange(rating - 1);
    if (!disabled && rating === 0) onRatingChange(1);
  };

  const handleIncrement = () => {
    if (!disabled && rating < 10) onRatingChange(rating + 1);
    if (!disabled && rating === 0) onRatingChange(1);
  };

  return (
    <View style={styles.card}>
      <Avatar name={player.displayName} size={44} />

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{player.displayName}</Text>
          {player.jerseyNumber > 0 && (
            <View style={styles.jerseyBadge}>
              <Text style={styles.jerseyText}>#{player.jerseyNumber}</Text>
            </View>
          )}
          {player.isCaptain && (
            <View style={styles.captainBadge}>
              <Text style={styles.captainText}>C</Text>
            </View>
          )}
        </View>
        <Text style={styles.position}>{player.position}</Text>
        <Text style={styles.stars} numberOfLines={1}>
          {rating > 0 ? buildStars(rating) : '○○○○○○○○○○'}
        </Text>
      </View>

      <View style={styles.stepper}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={disabled || rating <= 1}
          style={[styles.stepBtn, (disabled || rating <= 1) && styles.stepBtnDisabled]}
          activeOpacity={0.7}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>

        <View style={styles.ratingBox}>
          <Text style={[styles.ratingValue, rating === 0 && styles.ratingUnset]}>
            {rating > 0 ? rating : '—'}
          </Text>
          <Text style={styles.ratingMax}>/10</Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={disabled || rating >= 10}
          style={[styles.stepBtn, (disabled || rating >= 10) && styles.stepBtnDisabled]}
          activeOpacity={0.7}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...glassCardStyle,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
  },
  info: {
    flex: 1,
    marginLeft: spacing[3],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  name: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: '700',
    flexShrink: 1,
  },
  jerseyBadge: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  jerseyText: {
    color: colors.accent.primary,
    fontSize: typography.size.xs,
    fontWeight: '700',
  },
  captainBadge: {
    backgroundColor: colors.accent.glow,
    borderWidth: 1,
    borderColor: colors.accent.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  captainText: {
    color: colors.accent.primary,
    fontSize: typography.size.xs,
    fontWeight: '700',
  },
  position: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  stars: {
    color: colors.accent.primary,
    fontSize: typography.size.xs,
    marginTop: 4,
    letterSpacing: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepBtnText: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: '700',
    lineHeight: 20,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 40,
    justifyContent: 'center',
  },
  ratingValue: {
    color: colors.accent.primary,
    fontSize: typography.size.xl,
    fontWeight: '800',
  },
  ratingUnset: {
    color: colors.text.muted,
  },
  ratingMax: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    marginLeft: 1,
  },
});
