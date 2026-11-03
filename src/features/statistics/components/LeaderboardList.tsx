// src/features/statistics/components/LeaderboardList.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { PlayerStats } from '../../../types';
import { colors, typography, spacing } from '../../../config/theme';
import { LeaderboardItem } from './LeaderboardItem';

interface LeaderboardListProps {
  data:       PlayerStats[];
  metric:     'goals' | 'assists' | 'motmCount' | 'attendanceRate';
  isLoading?: boolean;
  limit?:     number;
}

const METRIC_SUFFIX: Partial<Record<LeaderboardListProps['metric'], string>> = {
  attendanceRate: '%',
};

const METRIC_LABEL: Record<LeaderboardListProps['metric'], string> = {
  goals:         'Goals',
  assists:       'Assists',
  motmCount:     'MOTM',
  attendanceRate:'Attendance',
};

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  data, metric, isLoading = false, limit = 10,
}) => {
  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent.primary} size="large" />
      </View>
    );
  }

  const sliced = data.slice(0, limit);

  if (sliced.length === 0) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>No stats recorded yet</Text>
      </View>
    );
  }

  return (
    <View style={s.list}>
      {sliced.map((item, index) => {
        const raw: number = item[metric];
        const displayValue = metric === 'attendanceRate' ? Math.round(raw) : raw;
        return (
          <LeaderboardItem
            key={item.statsId}
            rank={index + 1}
            displayName={item.displayName}
            value={displayValue}
            metric={METRIC_LABEL[metric]}
            suffix={METRIC_SUFFIX[metric] ?? ''}
          />
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  list:      { paddingVertical: spacing[2] },
  center:    {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  emptyText: { color: colors.text.muted, fontSize: typography.size.md },
});
