// src/features/statistics/components/SeasonOverviewCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, glassCardStyle } from '../../../config/theme';

interface SeasonOverviewCardProps {
  played:        number;
  wins:          number;
  draws:         number;
  losses:        number;
  goalsFor:      number;
  goalsAgainst:  number;
  season:        string;
}

export const SeasonOverviewCard: React.FC<SeasonOverviewCardProps> = ({
  played, wins, draws, losses, goalsFor, goalsAgainst, season,
}) => {
  const gd = goalsFor - goalsAgainst;
  const gdColor  = gd > 0 ? colors.status.going : gd < 0 ? colors.status.notGoing : colors.text.secondary;
  const gdText   = gd > 0 ? `+${gd}` : `${gd}`;

  const stats: Array<{ label: string; value: string | number; color: string }> = [
    { label: 'P',  value: played,       color: colors.text.primary },
    { label: 'W',  value: wins,         color: colors.status.going },
    { label: 'D',  value: draws,        color: colors.status.maybe },
    { label: 'L',  value: losses,       color: colors.status.notGoing },
    { label: 'GF', value: goalsFor,     color: colors.text.primary },
    { label: 'GA', value: goalsAgainst, color: colors.text.primary },
    { label: 'GD', value: gdText,       color: gdColor },
  ];

  return (
    <View style={[glassCardStyle, s.card]}>
      <Text style={s.title}>Season {season} Overview</Text>
      <View style={s.statsRow}>
        {stats.map(({ label, value, color }) => (
          <View key={label} style={s.statItem}>
            <Text style={[s.statValue, { color }]}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card:     { padding: spacing[4], gap: spacing[4] },
  title:    {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', gap: spacing[1] },
  statValue:{ fontSize: typography.size.xl, fontWeight: '800' },
  statLabel:{
    fontSize: typography.size.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
