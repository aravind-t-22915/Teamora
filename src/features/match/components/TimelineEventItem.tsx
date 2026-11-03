// src/features/match/components/TimelineEventItem.tsx
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { TimelineEvent, TimelineEventType } from '../../../types';
import { colors, spacing, typography, radius } from '../../../config/theme';

export interface TimelineEventItemProps {
  event: TimelineEvent;
  onDelete?: () => void;
  onEdit?: () => void;
}

function getEventIcon(type: TimelineEventType): string {
  switch (type) {
    case 'goal':         return '⚽';
    case 'yellow_card':  return '🟨';
    case 'red_card':     return '🟥';
    case 'substitution': return '🔄';
    case 'half_time':    return '⏱';
    case 'full_time':    return '⏱';
    case 'kickoff':      return '🏁';
    default:             return '•';
  }
}

function getEventLabel(type: TimelineEventType): string {
  switch (type) {
    case 'half_time': return 'Half Time';
    case 'full_time': return 'Full Time';
    case 'kickoff':   return 'Kick Off';
    default:          return '';
  }
}

const DIVIDER_TYPES: TimelineEventType[] = ['half_time', 'full_time', 'kickoff'];

export const TimelineEventItem: React.FC<TimelineEventItemProps> = ({ event, onDelete, onEdit }) => {
  if (DIVIDER_TYPES.includes(event.type)) {
    return (
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>
          {getEventIcon(event.type)}  {getEventLabel(event.type)} — {event.minute}'
        </Text>
        <View style={styles.dividerLine} />
      </View>
    );
  }

  const suffixes: string[] = [];
  if (event.isOwnGoal)  suffixes.push('OG');
  if (event.isPenalty)  suffixes.push('P');

  const playerLabel = event.playerName
    ? `${event.playerName}${suffixes.length ? ` (${suffixes.join(', ')})` : ''}`
    : '—';

  return (
    <TouchableOpacity
      onPress={onEdit}
      onLongPress={onDelete}
      activeOpacity={onEdit || onDelete ? 0.7 : 1}
      style={styles.row}
    >
      <View style={styles.minuteBadge}>
        <Text style={styles.minuteText}>{event.minute}'</Text>
      </View>

      <Text style={styles.icon}>{getEventIcon(event.type)}</Text>

      <View style={styles.info}>
        <Text style={styles.playerName} numberOfLines={1}>
          {playerLabel}
        </Text>
        {event.type === 'goal' && event.assistName ? (
          <Text style={styles.assist} numberOfLines={1}>
            Assist: {event.assistName}
          </Text>
        ) : null}
        {event.type === 'substitution' && event.substituteInId ? (
          <Text style={styles.assist} numberOfLines={1}>
            In: {event.substituteInId}
          </Text>
        ) : null}
        {event.note ? (
          <Text style={styles.note} numberOfLines={1}>{event.note}</Text>
        ) : null}
      </View>

      {(onEdit || onDelete) ? (
        <Text style={styles.deleteHint}>{onEdit ? 'Tap · Hold ✕' : 'Hold ✕'}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  minuteBadge: {
    width: 42,
    alignItems: 'flex-end',
    marginRight: spacing[3],
  },
  minuteText: {
    color: colors.accent.primary,
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  icon: {
    fontSize: 18,
    marginRight: spacing[3],
    width: 24,
    textAlign: 'center',
  },
  info: {
    flex: 1,
  },
  playerName: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: '600',
  },
  assist: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  note: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    marginTop: 2,
    fontStyle: 'italic',
  },
  deleteHint: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    fontWeight: '600',
    marginHorizontal: spacing[3],
  },
});
