// src/features/match/components/MatchStatsBars.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MatchStatsData } from '../../../types';
import { colors, spacing, typography, radius } from '../../../config/theme';

export interface MatchStatsBarsProps {
  home: MatchStatsData;
  away: MatchStatsData;
  homeTeamName?: string;
  awayTeamName?: string;
}

interface StatRowProps {
  label: string;
  homeValue: number;
  awayValue: number;
  isPossession?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, homeValue, awayValue, isPossession }) => {
  const total = homeValue + awayValue;
  const homeRatio = total > 0 ? homeValue / total : 0.5;
  const awayRatio = total > 0 ? awayValue / total : 0.5;

  const homeBarWidth = `${Math.round(homeRatio * 100)}%` as `${number}%`;
  const awayBarWidth = `${Math.round(awayRatio * 100)}%` as `${number}%`;

  return (
    <View style={styles.statRow}>
      <Text style={styles.homeValue}>{homeValue}{isPossession ? '%' : ''}</Text>
      <View style={styles.barArea}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.homeBar,
              { width: homeBarWidth },
            ]}
          />
          <View
            style={[
              styles.awayBar,
              { width: awayBarWidth },
            ]}
          />
        </View>
      </View>
      <Text style={styles.awayValue}>{awayValue}{isPossession ? '%' : ''}</Text>
    </View>
  );
};

export const MatchStatsBars: React.FC<MatchStatsBarsProps> = ({
  home,
  away,
  homeTeamName = 'Home',
  awayTeamName = 'Away',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.teamName}>{homeTeamName}</Text>
        <Text style={styles.statsTitle}>Match Stats</Text>
        <Text style={styles.teamName}>{awayTeamName}</Text>
      </View>

      <StatRow label="Possession"   homeValue={home.possession}     awayValue={away.possession}     isPossession />
      <StatRow label="Shots"        homeValue={home.shots}          awayValue={away.shots} />
      <StatRow label="On Target"    homeValue={home.shotsOnTarget}  awayValue={away.shotsOnTarget} />
      <StatRow label="Corners"      homeValue={home.corners}        awayValue={away.corners} />
      <StatRow label="Fouls"        homeValue={home.fouls}          awayValue={away.fouls} />
      <StatRow label="Offsides"     homeValue={home.offsides}       awayValue={away.offsides} />
      <StatRow label="Yellow Cards" homeValue={home.yellowCards}    awayValue={away.yellowCards} />
      <StatRow label="Red Cards"    homeValue={home.redCards}       awayValue={away.redCards} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  teamName: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: '700',
    width: 80,
    textAlign: 'center',
  },
  statsTitle: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  homeValue: {
    color: colors.accent.primary,
    fontSize: typography.size.sm,
    fontWeight: '700',
    width: 44,
    textAlign: 'right',
    marginRight: spacing[2],
  },
  awayValue: {
    color: colors.status.notGoing,
    fontSize: typography.size.sm,
    fontWeight: '700',
    width: 44,
    textAlign: 'left',
    marginLeft: spacing[2],
  },
  barArea: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    marginBottom: 4,
    textAlign: 'center',
  },
  barTrack: {
    width: '100%',
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.full,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  homeBar: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: radius.full,
  },
  awayBar: {
    height: '100%',
    backgroundColor: colors.status.notGoing,
    borderRadius: radius.full,
  },
});
