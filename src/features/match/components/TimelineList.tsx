// src/features/match/components/TimelineList.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimelineEvent } from '../../../types';
import { TimelineEventItem } from './TimelineEventItem';
import { colors, typography, spacing } from '../../../config/theme';

export interface TimelineListProps {
  events: TimelineEvent[];
  onDelete?: (id: string) => void;
  onEdit?: (event: TimelineEvent) => void;
}

export const TimelineList: React.FC<TimelineListProps> = ({ events, onDelete, onEdit }) => {
  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>⏱</Text>
        <Text style={styles.emptyText}>No events yet</Text>
        <Text style={styles.emptySubtext}>Add events to build the match timeline</Text>
      </View>
    );
  }

  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  return (
    <View>
      {sorted.map((ev) => (
        <TimelineEventItem
          key={ev.id}
          event={ev}
          onDelete={onDelete ? () => onDelete(ev.id) : undefined}
          onEdit={onEdit ? () => onEdit(ev) : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing[3],
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.size.lg,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  emptySubtext: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
});
