// src/features/home/screens/HomeScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useAuthStore } from '../../../stores/authStore';
import { useUpcomingEvents, useAllEvents } from '../../../hooks/useEvents';
import { EventCard } from '../../events/components/EventCard';
import { HomeStackParamList, MainTabParamList } from '../../../types';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

export function HomeScreen() {
  const { user, club, can } = useAuthStore();
  const navigation    = useNavigation<Nav>();
  const { data: upcoming = [], isLoading } = useUpcomingEvents(3);
  const { data: allEvents = [] } = useAllEvents();

  const completedMatches = allEvents.filter(e => e.isMatch && e.status === 'completed' && !!e.result);
  const wins   = completedMatches.filter(e => e.result?.outcome === 'win').length;
  const draws  = completedMatches.filter(e => e.result?.outcome === 'draw').length;
  const losses = completedMatches.filter(e => e.result?.outcome === 'loss').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const goToEvents = () => navigation.navigate('EventsTab', { screen: 'EventsList' });
  const goToCreate = () => navigation.navigate('EventsTab', { screen: 'CreateEvent' });
  const goToDetail = (eventId: string) =>
    navigation.navigate('EventsTab', { screen: 'EventDetail', params: { eventId } });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.clubName}>{club?.name ?? 'Teamora'}</Text>
          <Text style={styles.greeting}>{greeting}, {user?.firstName ?? 'Coach'} 👋</Text>
        </View>
        <View style={styles.headerIcons}>
          <Text style={styles.icon}>🔔</Text>
          <Text style={styles.icon}>⚙️</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Banner */}
        <View style={[glassCardStyle, styles.statsBanner]}>
          <Text style={styles.statsBannerTitle}>🏆 {club?.season ?? 'Season'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{draws}</Text>
              <Text style={styles.statLabel}>Draws</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.accentValue]}>{completedMatches.length}</Text>
              <Text style={styles.statLabel}>Played</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>UPCOMING EVENTS</Text>
          {upcoming.length > 0 && (
            <TouchableOpacity onPress={goToEvents}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.accent.primary} />
          </View>
        ) : upcoming.length > 0 ? (
          upcoming.map(ev => (
            <EventCard
              key={ev.eventId}
              event={ev}
              onPress={() => goToDetail(ev.eventId)}
              compact
            />
          ))
        ) : (
          <View style={[glassCardStyle, styles.emptyCard]}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No upcoming events</Text>
            <Text style={styles.emptySubtitle}>
              {can('create_event')
                ? 'Tap + to create your first event'
                : "Your coach hasn't scheduled anything yet"}
            </Text>
          </View>
        )}

        {/* Announcements */}
        <Text style={styles.sectionTitle}>ANNOUNCEMENTS</Text>
        <View style={[glassCardStyle, styles.emptyCard]}>
          <Text style={styles.emptyEmoji}>📢</Text>
          <Text style={styles.emptyTitle}>No announcements</Text>
          <Text style={styles.emptySubtitle}>Important updates will appear here</Text>
        </View>
      </ScrollView>

      {/* FAB — Coach only */}
      {can('create_event') && (
        <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={goToCreate}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.background.primary },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[3] },
  clubName:         { fontSize: typography.size.xl, color: colors.text.primary, fontWeight: '700' },
  greeting:         { fontSize: typography.size.sm, color: colors.text.secondary, marginTop: 2 },
  headerIcons:      { flexDirection: 'row', gap: spacing[3] },
  icon:             { fontSize: 22 },
  scroll:           { flex: 1 },
  content:          { paddingHorizontal: spacing[5], paddingBottom: spacing[16], gap: spacing[4] },
  statsBanner:      { padding: spacing[5] },
  statsBannerTitle: { fontSize: typography.size.sm, color: colors.text.secondary, fontWeight: '600', marginBottom: spacing[4] },
  statsRow:         { flexDirection: 'row', alignItems: 'center' },
  statItem:         { flex: 1, alignItems: 'center' },
  statValue:        { fontSize: typography.size['2xl'], color: colors.text.primary, fontWeight: '700' },
  accentValue:      { color: colors.accent.primary },
  statLabel:        { fontSize: typography.size.xs, color: colors.text.muted, marginTop: 2 },
  statDivider:      { width: 1, height: 32, backgroundColor: colors.divider },
  sectionRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle:     { fontSize: typography.size.xs, color: colors.text.muted, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  seeAll:           { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '600' },
  loadingBox:       { alignItems: 'center', paddingVertical: spacing[6] },
  emptyCard:        { padding: spacing[8], alignItems: 'center', gap: spacing[2] },
  emptyEmoji:       { fontSize: 36 },
  emptyTitle:       { fontSize: typography.size.md, color: colors.text.primary, fontWeight: '600' },
  emptySubtitle:    { fontSize: typography.size.sm, color: colors.text.muted, textAlign: 'center' },
  fab:              { position: 'absolute', bottom: spacing[6], right: spacing[5], width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabText:          { fontSize: 28, color: '#fff', lineHeight: 32 },
});
