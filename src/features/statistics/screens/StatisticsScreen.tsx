// src/features/statistics/screens/StatisticsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useAllEvents } from '../../../hooks/useEvents';
import {
  useTopScorers,
  useTopAssists,
  useMotmLeaders,
  useAttendanceLeaders,
} from '../../../hooks/usePlayerStats';
import { SeasonOverviewCard } from '../components/SeasonOverviewCard';
import { LeaderboardList } from '../components/LeaderboardList';
import { SEASON } from '../../../config/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Statistics'>;

const TABS = ['Season', 'Scorers', 'Assists', 'MOTM', 'Attendance'] as const;
type Tab = typeof TABS[number];

export function StatisticsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Season');

  const { data: allEvents = [], isLoading: eventsLoading } = useAllEvents();
  const { data: scorers   = [], isLoading: scorersLoading } = useTopScorers();
  const { data: assists   = [], isLoading: assistsLoading } = useTopAssists();
  const { data: motm      = [], isLoading: motmLoading    } = useMotmLeaders();
  const { data: attLeaders= [], isLoading: attLoading     } = useAttendanceLeaders();

  // ── Season overview derived from events ──────────────────────────────────────
  const completedMatches = allEvents.filter(
    e => e.isMatch && e.status === 'completed' && !!e.result,
  );
  const wins          = completedMatches.filter(e => e.result?.outcome === 'win').length;
  const draws         = completedMatches.filter(e => e.result?.outcome === 'draw').length;
  const losses        = completedMatches.filter(e => e.result?.outcome === 'loss').length;
  const goalsFor     = completedMatches.reduce((sum, e) => {
    const ours = e.isHomeGame !== false ? (e.result?.homeGoals ?? 0) : (e.result?.awayGoals ?? 0);
    return sum + ours;
  }, 0);
  const goalsAgainst = completedMatches.reduce((sum, e) => {
    const theirs = e.isHomeGame !== false ? (e.result?.awayGoals ?? 0) : (e.result?.homeGoals ?? 0);
    return sum + theirs;
  }, 0);

  const renderContent = () => {
    switch (activeTab) {
      case 'Season':
        return eventsLoading ? (
          <View style={s.center}>
            <ActivityIndicator color={colors.accent.primary} size="large" />
          </View>
        ) : (
          <SeasonOverviewCard
            played={completedMatches.length}
            wins={wins}
            draws={draws}
            losses={losses}
            goalsFor={goalsFor}
            goalsAgainst={goalsAgainst}
            season={SEASON}
          />
        );
      case 'Scorers':
        return <LeaderboardList data={scorers} metric="goals" isLoading={scorersLoading} />;
      case 'Assists':
        return <LeaderboardList data={assists} metric="assists" isLoading={assistsLoading} />;
      case 'MOTM':
        return <LeaderboardList data={motm} metric="motmCount" isLoading={motmLoading} />;
      case 'Attendance':
        return <LeaderboardList data={attLeaders} metric="attendanceRate" isLoading={attLoading} />;
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn}>
          <Text style={s.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Statistics</Text>
        <View style={[glassCardStyle, s.seasonBadge]}>
          <Text style={s.seasonText}>{SEASON}</Text>
        </View>
      </View>

      {/* ── Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabsScroll}
        contentContainerStyle={s.tabsContent}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Content ── */}
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        <View style={{ height: spacing[8] }} />
      </ScrollView>
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
  closeBtn:     {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: colors.text.secondary, fontSize: typography.size.md },
  headerTitle:  {
    flex: 1, textAlign: 'center',
    color: colors.text.primary,
    fontSize: typography.size.xl, fontWeight: '800',
  },
  seasonBadge:  {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.accent.glow,
    borderColor: colors.accent.primary + '40',
  },
  seasonText:   { color: colors.accent.primary, fontSize: typography.size.xs, fontWeight: '700' },

  tabsScroll:   { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabsContent:  { flexDirection: 'row', paddingHorizontal: spacing[4], gap: spacing[1], alignItems: 'center' },
  tab:          { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radius.full },
  tabActive:    { backgroundColor: colors.accent.glow },
  tabText:      { color: colors.text.muted, fontSize: typography.size.sm, fontWeight: '600' },
  tabTextActive:{ color: colors.accent.primary },

  content:      { paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  center:       { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[8] },
});
