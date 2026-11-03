// src/features/events/screens/EventsListScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EventsStackParamList, AppEvent, EventType } from '../../../types';
import { colors, typography, spacing, radius } from '../../../config/theme';
import { useAllEvents } from '../../../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { useAuthStore } from '../../../stores/authStore';

type Nav = NativeStackNavigationProp<EventsStackParamList>;

type Filter = 'all' | 'upcoming' | 'match' | 'practice' | 'other';
const MATCH_TYPES: EventType[] = ['league_match', 'tournament_match', 'friendly_match', 'practice_match'];
const PRACTICE_TYPES: EventType[] = ['practice', 'gym_session', 'recovery_session'];

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'match',    label: 'Matches' },
  { key: 'practice', label: 'Training' },
  { key: 'other',    label: 'Other' },
];

export function EventsListScreen() {
  const navigation = useNavigation<Nav>();
  const can        = useAuthStore(s => s.can);
  const [filter, setFilter] = useState<Filter>('upcoming');

  const { data: events = [], isLoading, refetch, isRefetching } = useAllEvents();

  const filtered = useMemo(() => {
    const now = new Date();
    const toMs = (v: unknown): number => {
      try {
        if (!v) return 0;
        if (typeof v === 'object' && v !== null) {
          if ('toMillis' in v && typeof (v as { toMillis: unknown }).toMillis === 'function')
            return (v as { toMillis: () => number }).toMillis();
          if ('toDate' in v && typeof (v as { toDate: unknown }).toDate === 'function')
            return (v as { toDate: () => Date }).toDate().getTime();
          if ('seconds' in v && typeof (v as { seconds: unknown }).seconds === 'number')
            return (v as { seconds: number }).seconds * 1000;
          if ('_seconds' in v && typeof (v as { _seconds: unknown })._seconds === 'number')
            return (v as { _seconds: number })._seconds * 1000;
        }
        return new Date(v as string).getTime() || 0;
      } catch { return 0; }
    };
    switch (filter) {
      case 'upcoming': return events.filter(e => toMs(e.date) >= now.getTime() && e.status !== 'cancelled');
      case 'match':    return events.filter(e => MATCH_TYPES.includes(e.type));
      case 'practice': return events.filter(e => PRACTICE_TYPES.includes(e.type));
      case 'other':    return events.filter(e => !MATCH_TYPES.includes(e.type) && !PRACTICE_TYPES.includes(e.type));
      default:         return events;
    }
  }, [events, filter]);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Events</Text>
        {can('create_event') && (
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => navigation.navigate('CreateEvent')}
            activeOpacity={0.8}
          >
            <Text style={s.addBtnText}>+ New</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={s.filterBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterTab, filter === f.key && s.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[s.filterLabel, filter === f.key && s.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.accent.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.eventId}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent.primary}
            />
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.eventId })}
            />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>📅</Text>
              <Text style={s.emptyTitle}>No events found</Text>
              <Text style={s.emptySubtitle}>
                {can('create_event')
                  ? 'Tap "+ New" to create your first event'
                  : 'No events scheduled yet'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.background.primary },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[3] },
  title:           { fontSize: typography.size['2xl'], color: colors.text.primary, fontWeight: '700' },
  addBtn:          { backgroundColor: colors.accent.primary, paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radius.full },
  addBtnText:      { color: colors.text.inverse, fontWeight: '700', fontSize: typography.size.sm },
  filterBar:       { flexDirection: 'row', paddingHorizontal: spacing[5], paddingBottom: spacing[3], gap: spacing[2] },
  filterTab:       { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background.secondary },
  filterTabActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  filterLabel:     { fontSize: typography.size.sm, color: colors.text.secondary, fontWeight: '500' },
  filterLabelActive:{ color: colors.text.inverse, fontWeight: '700' },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent:     { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
  empty:           { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyEmoji:      { fontSize: 48 },
  emptyTitle:      { fontSize: typography.size.lg, color: colors.text.primary, fontWeight: '600' },
  emptySubtitle:   { fontSize: typography.size.sm, color: colors.text.muted, textAlign: 'center', paddingHorizontal: spacing[8] },
});
