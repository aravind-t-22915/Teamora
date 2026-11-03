// src/features/statistics/components/LeaderboardItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, glassCardStyle } from '../../../config/theme';

interface LeaderboardItemProps {
  rank:        number;
  displayName: string;
  value:       number | string;
  metric:      string;
  suffix?:     string;
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  rank, displayName, value, suffix = '',
}) => {
  const medal    = RANK_MEDALS[rank];
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');

  return (
    <View style={[glassCardStyle, s.row]}>
      {/* Rank */}
      <View style={s.rankContainer}>
        {medal
          ? <Text style={s.rankMedal}>{medal}</Text>
          : <Text style={s.rankNum}>{rank}</Text>
        }
      </View>

      {/* Avatar */}
      <View style={s.avatar}>
        <Text style={s.avatarText}>{initials}</Text>
      </View>

      {/* Name */}
      <Text style={s.name} numberOfLines={1}>{displayName}</Text>

      {/* Value */}
      <View style={s.valueContainer}>
        <Text style={s.value}>
          {value}{suffix}
        </Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  row:           {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    marginBottom: spacing[2], gap: spacing[3],
  },
  rankContainer: { width: 32, alignItems: 'center' },
  rankMedal:     { fontSize: 22 },
  rankNum:       { fontSize: typography.size.md, color: colors.text.muted, fontWeight: '700' },
  avatar:        {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.accent.dark,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:    { color: '#fff', fontSize: typography.size.sm, fontWeight: '700' },
  name:          { flex: 1, color: colors.text.primary, fontSize: typography.size.md, fontWeight: '600' },
  valueContainer:{ alignItems: 'flex-end' },
  value:         { color: colors.accent.primary, fontSize: typography.size.xl, fontWeight: '800' },
});
