// src/features/events/screens/AvailabilityPollScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList, Attendance } from '../../../types';
import { colors, typography, spacing, glassCardStyle } from '../../../config/theme';
import { useEventAttendance } from '../../../hooks/useAttendance';

type Props = NativeStackScreenProps<EventsStackParamList, 'AvailabilityPoll'>;

const STATUS_LABEL: Record<string, string> = {
  going:       '✅ Going',
  maybe:       '🤔 Maybe',
  not_going:   '❌ Not Going',
  late:        '⏰ Late',
  need_pickup: '🚗 Needs Pickup',
  no_response: '❓ No Response',
};

const STATUS_COLOR: Record<string, string> = {
  going:       colors.status.going,
  maybe:       colors.status.maybe,
  not_going:   colors.status.notGoing,
  late:        colors.status.late,
  need_pickup: colors.status.pickup,
  no_response: colors.status.noResp,
};

const STATUS_ORDER = ['going', 'maybe', 'late', 'need_pickup', 'not_going', 'no_response'];

export function AvailabilityPollScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { data: attendance = [], isLoading, isError } = useEventAttendance(eventId);

  const groups = attendance.reduce<Record<string, Attendance[]>>((acc, item) => {
    const key = item.status;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const populated = STATUS_ORDER.filter(s => (groups[s]?.length ?? 0) > 0);

  return (
    <SafeAreaView style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Availability Poll</Text>
        <View style={s.headerRight} />
      </View>

      {/* ── States ── */}
      {isLoading && (
        <View style={s.center}>
          <ActivityIndicator color={colors.accent.primary} size="large" />
        </View>
      )}

      {isError && (
        <View style={s.center}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyTitle}>Poll feature coming soon</Text>
          <Text style={s.emptySubtext}>Check back later for availability details.</Text>
        </View>
      )}

      {!isLoading && !isError && attendance.length === 0 && (
        <View style={s.center}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyTitle}>No responses yet</Text>
          <Text style={s.emptySubtext}>Players haven't replied to this event.</Text>
        </View>
      )}

      {!isLoading && !isError && attendance.length > 0 && (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary */}
          <View style={[glassCardStyle, s.summaryCard]}>
            <Text style={s.summaryLabel}>Total Responses</Text>
            <Text style={s.summaryCount}>{attendance.length}</Text>
          </View>

          {/* Groups */}
          {populated.map(status => (
            <View key={status} style={s.section}>
              <Text style={[s.sectionHeader, { color: STATUS_COLOR[status] ?? colors.text.secondary }]}>
                {STATUS_LABEL[status] ?? status}
                {'  '}
                <Text style={s.sectionCount}>{groups[status].length}</Text>
              </Text>

              <View style={[glassCardStyle, s.groupCard]}>
                {groups[status].map((att, idx) => (
                  <View
                    key={att.attendanceId}
                    style={[s.playerRow, idx > 0 && s.borderTop]}
                  >
                    <View style={s.avatar}>
                      <Text style={s.avatarText}>
                        {att.displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={s.playerName}>{att.displayName}</Text>
                    {!!att.note && (
                      <Text style={s.playerNote} numberOfLines={1}>{att.note}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={{ height: spacing[8] }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background.primary },
  header:       {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn:      { minWidth: 64 },
  backText:     { color: colors.accent.primary, fontSize: typography.size.md },
  headerTitle:  { flex: 1, textAlign: 'center', color: colors.text.primary, fontSize: typography.size.lg, fontWeight: '700' },
  headerRight:  { minWidth: 64 },

  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  emptyIcon:    { fontSize: 48 },
  emptyTitle:   { color: colors.text.primary, fontSize: typography.size.xl, fontWeight: '700' },
  emptySubtext: { color: colors.text.secondary, fontSize: typography.size.sm, textAlign: 'center', paddingHorizontal: spacing[8] },

  scrollContent:{ paddingHorizontal: spacing[4], paddingTop: spacing[4], gap: spacing[4] },
  summaryCard:  { padding: spacing[4], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: colors.text.secondary, fontSize: typography.size.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryCount: { color: colors.accent.primary, fontSize: typography.size['2xl'], fontWeight: '800' },

  section:      { gap: spacing[2] },
  sectionHeader:{ fontSize: typography.size.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCount: { fontWeight: '800' },
  groupCard:    { overflow: 'hidden' },
  playerRow:    {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing[3], paddingHorizontal: spacing[4], gap: spacing[3],
  },
  borderTop:    { borderTopWidth: 1, borderTopColor: colors.divider },
  avatar:       {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accent.dark,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:   { color: '#fff', fontSize: typography.size.md, fontWeight: '700' },
  playerName:   { flex: 1, color: colors.text.primary, fontSize: typography.size.md, fontWeight: '500' },
  playerNote:   { color: colors.text.muted, fontSize: typography.size.sm, maxWidth: 120 },
});
