// src/features/events/components/EventCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppEvent } from '../../../types';
import { colors, spacing, radius, typography, glassCardStyle, eventTypeConfig } from '../../../config/theme';
import { format } from 'date-fns';

interface Props {
  event: AppEvent;
  onPress: () => void;
  compact?: boolean;
}

function toDate(val: unknown): Date {
  try {
    if (!val) return new Date();
    if (typeof val === 'object' && val !== null) {
      if ('toDate' in val && typeof (val as { toDate: unknown }).toDate === 'function') {
        const d = (val as { toDate: () => Date }).toDate();
        if (!isNaN(d.getTime())) return d;
      }
      if ('seconds' in val && typeof (val as { seconds: unknown }).seconds === 'number') {
        const d = new Date((val as { seconds: number }).seconds * 1000);
        if (!isNaN(d.getTime())) return d;
      }
      if ('_seconds' in val && typeof (val as { _seconds: unknown })._seconds === 'number') {
        const d = new Date((val as { _seconds: number })._seconds * 1000);
        if (!isNaN(d.getTime())) return d;
      }
    }
    if (val instanceof Date) return isNaN(val.getTime()) ? new Date() : val;
    const d = new Date(val as string);
    return isNaN(d.getTime()) ? new Date() : d;
  } catch { return new Date(); }
}

export function EventCard({ event, onPress, compact = false }: Props) {
  const cfg  = eventTypeConfig[event.type];
  const date = toDate(event.date);
  const total = event.attendanceCount
    ? event.attendanceCount.going + event.attendanceCount.maybe
    : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.wrapper}>
      <View style={[glassCardStyle, styles.card]}>
        {/* Left color stripe */}
        <View style={[styles.stripe, { backgroundColor: cfg.color }]} />

        <View style={styles.body}>
          {/* Type badge + status */}
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: cfg.color + '25' }]}>
              <Text style={styles.badgeIcon}>{cfg.icon}</Text>
              <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            {event.status === 'cancelled' && (
              <View style={styles.cancelledBadge}>
                <Text style={styles.cancelledText}>CANCELLED</Text>
              </View>
            )}
            {event.status === 'live' && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>● LIVE</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>

          {!compact && (
            <>
              {/* Date / time row */}
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📅</Text>
                <Text style={styles.metaText}>
                  {format(date, 'EEE, d MMM')}
                  {event.startTime ? `  ·  ${event.startTime}` : ''}
                </Text>
              </View>

              {/* Venue */}
              {!!event.venueName && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>📍</Text>
                  <Text style={styles.metaText} numberOfLines={1}>{event.venueName}</Text>
                </View>
              )}

              {/* Match opponent */}
              {event.isMatch && event.opponent && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>⚔️</Text>
                  <Text style={styles.metaText}>
                    vs {event.opponent}
                    {event.isHomeGame != null ? (event.isHomeGame ? '  (H)' : '  (A)') : ''}
                  </Text>
                </View>
              )}
            </>
          )}

          {compact && (
            <Text style={styles.compactDate}>
              {format(date, 'EEE, d MMM')}
              {event.startTime ? ` · ${event.startTime}` : ''}
            </Text>
          )}
        </View>

        {/* Right: attendance pill */}
        {!compact && total > 0 && (
          <View style={styles.attendancePill}>
            <Text style={styles.attendanceNum}>{total}</Text>
            <Text style={styles.attendanceLabel}>going</Text>
          </View>
        )}

        {/* Arrow */}
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper:         { marginBottom: spacing[3] },
  card:            { flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  stripe:          { width: 4, alignSelf: 'stretch', borderTopLeftRadius: radius.lg, borderBottomLeftRadius: radius.lg },
  body:            { flex: 1, paddingVertical: spacing[3], paddingHorizontal: spacing[4], gap: spacing[1] },
  topRow:          { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: 2 },
  badge:           { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing[2], paddingVertical: 3, borderRadius: radius.full },
  badgeIcon:       { fontSize: 11 },
  badgeText:       { fontSize: typography.size.xs, fontWeight: '600' },
  cancelledBadge:  { backgroundColor: colors.status.notGoing + '25', paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: radius.full },
  cancelledText:   { color: colors.status.notGoing, fontSize: typography.size.xs, fontWeight: '700', letterSpacing: 0.5 },
  liveBadge:       { backgroundColor: '#22C55E25', paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: radius.full },
  liveText:        { color: colors.accent.primary, fontSize: typography.size.xs, fontWeight: '700' },
  title:           { fontSize: typography.size.md, color: colors.text.primary, fontWeight: '700' },
  metaRow:         { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  metaIcon:        { fontSize: 11 },
  metaText:        { fontSize: typography.size.sm, color: colors.text.secondary },
  compactDate:     { fontSize: typography.size.sm, color: colors.text.muted },
  attendancePill:  { alignItems: 'center', paddingHorizontal: spacing[3] },
  attendanceNum:   { fontSize: typography.size.lg, color: colors.accent.primary, fontWeight: '700' },
  attendanceLabel: { fontSize: typography.size.xs, color: colors.text.muted },
  arrow:           { fontSize: 22, color: colors.text.muted, paddingRight: spacing[3] },
});
