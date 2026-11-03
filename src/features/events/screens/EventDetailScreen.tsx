// src/features/events/screens/EventDetailScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { EventsStackParamList, AttendanceStatus } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle, eventTypeConfig } from '../../../config/theme';
import { useEvent, useDeleteEvent } from '../../../hooks/useEvents';
import { useMyAttendance, useSetAttendance, useEventAttendance } from '../../../hooks/useAttendance';
import { useAuthStore } from '../../../stores/authStore';
import { useEventGallery } from '../../../hooks/useGallery';
import { CommentsList } from '../components/CommentsList';
import { MediaThumbnail } from '../../gallery/components/MediaThumbnail';
import { Dimensions } from 'react-native';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventDetail'>;

type TabId = 'overview' | 'attendance' | 'comments' | 'gallery';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',   label: 'Overview'   },
  { id: 'attendance', label: 'Attendance' },
  { id: 'comments',   label: 'Comments'   },
  { id: 'gallery',    label: 'Gallery'    },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const THUMB_SIZE = (SCREEN_WIDTH - spacing[5] * 2 - spacing[1] * 2) / 3;

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

export function EventDetailScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: event, isLoading } = useEvent(eventId);
  const { mutateAsync: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { data: myAtt } = useMyAttendance(eventId);
  const { mutateAsync: setAttendance, isPending: isRsvping } = useSetAttendance(eventId);
  const { data: allAttendance = [] } = useEventAttendance(eventId);
  const { data: gallery = [] } = useEventGallery(eventId);
  const can = useAuthStore(s => s.can);

  const myStatus: AttendanceStatus | null = myAtt?.status ?? null;

  const handleDelete = () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(eventId);
            navigation.goBack();
          } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}><ActivityIndicator color={colors.accent.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={s.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.center}>
          <Text style={s.errorText}>Event not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cfg  = eventTypeConfig[event.type];
  const date = toDate(event.date);

  // ─── Attendance tab content ────────────────────────────────────────────────
  const STATUS_SECTIONS = [
    { status: 'going'       as AttendanceStatus, label: '✅ Going',       color: colors.status.going    },
    { status: 'late'        as AttendanceStatus, label: '⏰ Late',         color: colors.status.late     },
    { status: 'maybe'       as AttendanceStatus, label: '🤔 Maybe',        color: colors.status.maybe    },
    { status: 'need_pickup' as AttendanceStatus, label: '🚗 Need Pickup',  color: colors.status.pickup   },
    { status: 'not_going'   as AttendanceStatus, label: '❌ Not Going',    color: colors.status.notGoing },
  ];

  return (
    <SafeAreaView style={s.container}>
      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <View style={[s.hero, { backgroundColor: cfg.color + '30' }]}>
        <View style={s.heroTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          {can('edit_event') && (
            <View style={s.heroActions}>
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => navigation.navigate('EditEvent', { eventId })}
              >
                <Text style={s.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={handleDelete} disabled={isDeleting}>
                {isDeleting
                  ? <ActivityIndicator color={colors.status.notGoing} size="small" />
                  : <Text style={s.deleteBtnText}>🗑</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[s.typeBadge, { backgroundColor: cfg.color + '30' }]}>
          <Text style={s.typeBadgeIcon}>{cfg.icon}</Text>
          <Text style={[s.typeBadgeLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={s.heroTitle}>{event.title}</Text>
        {event.status === 'cancelled' && (
          <View style={s.cancelledBanner}>
            <Text style={s.cancelledBannerText}>⚠️ This event has been cancelled</Text>
          </View>
        )}
        {event.isMatch && event.result && (
          <View style={s.scoreBadge}>
            <Text style={s.scoreText}>
              {event.result.homeGoals} – {event.result.awayGoals}
            </Text>
            <Text style={[
              s.outcomeText,
              { color: event.result.outcome === 'win' ? colors.status.going : event.result.outcome === 'loss' ? colors.status.notGoing : colors.status.maybe }
            ]}>
              {event.result.outcome?.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabBar}
        contentContainerStyle={s.tabBarContent}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[s.tab, activeTab === tab.id && s.tabActive]}
          >
            <Text style={[s.tabLabel, activeTab === tab.id && s.tabLabelActive]}>
              {tab.label}
            </Text>
            {tab.id === 'attendance' && (
              <Text style={s.tabBadge}>
                {(event.attendanceCount?.going ?? 0) + (event.attendanceCount?.late ?? 0)}
              </Text>
            )}
            {tab.id === 'comments' && event.commentCount > 0 && (
              <Text style={s.tabBadge}>{event.commentCount}</Text>
            )}
            {tab.id === 'gallery' && event.galleryCount > 0 && (
              <Text style={s.tabBadge}>{event.galleryCount}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={s.body}>

            {/* Date / Time */}
            <View style={[glassCardStyle, s.infoCard]}>
              <View style={s.infoRow}>
                <Text style={s.infoIcon}>📅</Text>
                <View>
                  <Text style={s.infoLabel}>Date</Text>
                  <Text style={s.infoValue}>{format(date, 'EEEE, d MMMM yyyy')}</Text>
                </View>
              </View>
              {!event.allDay && event.startTime && (
                <>
                  <View style={s.infoDivider} />
                  <View style={s.infoRow}>
                    <Text style={s.infoIcon}>🕐</Text>
                    <View>
                      <Text style={s.infoLabel}>Time</Text>
                      <Text style={s.infoValue}>
                        {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Venue */}
            {(event.venueName || event.venueAddress) && (
              <View style={[glassCardStyle, s.infoCard]}>
                <View style={s.infoRow}>
                  <Text style={s.infoIcon}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.infoLabel}>Venue</Text>
                    {!!event.venueName    && <Text style={s.infoValue}>{event.venueName}</Text>}
                    {!!event.venueAddress && <Text style={s.infoSub}>{event.venueAddress}</Text>}
                  </View>
                </View>
              </View>
            )}

            {/* Match details */}
            {event.isMatch && event.opponent && (
              <View style={[glassCardStyle, s.infoCard]}>
                <View style={s.infoRow}>
                  <Text style={s.infoIcon}>⚔️</Text>
                  <View>
                    <Text style={s.infoLabel}>Match</Text>
                    <Text style={s.infoValue}>vs {event.opponent}</Text>
                    {!!event.competition && <Text style={s.infoSub}>{event.competition}</Text>}
                    {event.isHomeGame != null && (
                      <Text style={s.infoSub}>{event.isHomeGame ? '🏠 Home' : '✈️ Away'}</Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Match actions (coach only) */}
            {event.isMatch && (can('edit_lineup') || can('add_timeline') || can('rate_players') || can('write_report')) && (
              <>
                <Text style={s.sectionTitle}>Match Tools</Text>
                <View style={s.matchActions}>
                  {can('edit_lineup') && (
                    <TouchableOpacity style={s.matchAction} onPress={() => navigation.navigate('LineupBuilder', { eventId })}>
                      <Text style={s.matchActionIcon}>📋</Text>
                      <Text style={s.matchActionLabel}>Lineup</Text>
                    </TouchableOpacity>
                  )}
                  {can('add_timeline') && (
                    <TouchableOpacity style={s.matchAction} onPress={() => navigation.navigate('TimelineEditor', { eventId })}>
                      <Text style={s.matchActionIcon}>⏱</Text>
                      <Text style={s.matchActionLabel}>Timeline</Text>
                    </TouchableOpacity>
                  )}
                  {can('rate_players') && (
                    <TouchableOpacity style={s.matchAction} onPress={() => navigation.navigate('PlayerRating', { eventId })}>
                      <Text style={s.matchActionIcon}>⭐</Text>
                      <Text style={s.matchActionLabel}>Ratings</Text>
                    </TouchableOpacity>
                  )}
                  {can('write_report') && (
                    <TouchableOpacity style={s.matchAction} onPress={() => navigation.navigate('ReportWriter', { eventId })}>
                      <Text style={s.matchActionIcon}>📝</Text>
                      <Text style={s.matchActionLabel}>Report</Text>
                    </TouchableOpacity>
                  )}
                  {can('edit_event') && (
                    <TouchableOpacity style={s.matchAction} onPress={() => navigation.navigate('MatchResult', { eventId })}>
                      <Text style={s.matchActionIcon}>🏆</Text>
                      <Text style={s.matchActionLabel}>Result</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            {/* Description */}
            {!!event.description && (
              <>
                <Text style={s.sectionTitle}>About</Text>
                <View style={[glassCardStyle, s.descCard]}>
                  <Text style={s.descText}>{event.description}</Text>
                </View>
              </>
            )}

            {/* RSVP buttons */}
            {can('set_attendance') && event.status !== 'cancelled' && (
              <>
                <Text style={s.sectionTitle}>Your Response</Text>
                <View style={[glassCardStyle, s.rsvpCard]}>
                  {isRsvping && (
                    <ActivityIndicator color={colors.accent.primary} size="small" style={s.rsvpLoader} />
                  )}
                  <View style={s.rsvpRow}>
                    {([
                      { status: 'going'       as AttendanceStatus, emoji: '✅', label: 'Going',   color: colors.status.going    },
                      { status: 'maybe'       as AttendanceStatus, emoji: '🤔', label: 'Maybe',   color: colors.status.maybe    },
                      { status: 'not_going'   as AttendanceStatus, emoji: '❌', label: "Can't",   color: colors.status.notGoing },
                      { status: 'late'        as AttendanceStatus, emoji: '⏰', label: 'Late',    color: colors.status.late     },
                      { status: 'need_pickup' as AttendanceStatus, emoji: '🚗', label: 'Pickup',  color: colors.status.pickup   },
                    ]).map(({ status, emoji, label, color }) => {
                      const isActive = myStatus === status;
                      return (
                        <TouchableOpacity
                          key={status}
                          style={[s.rsvpBtn, isActive && { backgroundColor: color + '25', borderColor: color }]}
                          onPress={() => setAttendance(status)}
                          disabled={isRsvping}
                          activeOpacity={0.7}
                        >
                          <Text style={s.rsvpEmoji}>{emoji}</Text>
                          <Text style={[s.rsvpLabel, isActive && { color, fontWeight: '700' }]}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            {/* Coach notes */}
            {can('view_coach_notes') && !!event.coachNotes && (
              <>
                <Text style={s.sectionTitle}>Coach Notes 🔒</Text>
                <View style={[glassCardStyle, s.descCard, s.coachNotesCard]}>
                  <Text style={s.descText}>{event.coachNotes}</Text>
                </View>
              </>
            )}

            <View style={{ height: spacing[8] }} />
          </View>
        </ScrollView>
      )}

      {activeTab === 'attendance' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
          {/* Summary counts */}
          <View style={[glassCardStyle, s.attendSummary]}>
            {([
              { key: 'going',      label: 'Going',    color: colors.status.going    },
              { key: 'maybe',      label: 'Maybe',    color: colors.status.maybe    },
              { key: 'notGoing',   label: "No",       color: colors.status.notGoing },
              { key: 'late',       label: 'Late',     color: colors.status.late     },
              { key: 'needPickup', label: 'Pickup',   color: colors.status.pickup   },
            ] as const).map(({ key, label, color }) => (
              <View key={key} style={s.attendSummaryItem}>
                <Text style={[s.attendSummaryCount, { color }]}>
                  {event.attendanceCount?.[key] ?? 0}
                </Text>
                <Text style={s.attendSummaryLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Players by status */}
          {STATUS_SECTIONS.map(({ status, label, color }) => {
            const players = allAttendance.filter(a => a.status === status);
            if (players.length === 0) return null;
            return (
              <View key={status}>
                <Text style={[s.sectionTitle, { color }]}>{label} ({players.length})</Text>
                <View style={[glassCardStyle, { padding: 0, overflow: 'hidden' }]}>
                  {players.map((att, idx) => (
                    <View key={att.attendanceId} style={[s.playerRow, idx > 0 && s.playerRowBorder]}>
                      <View style={s.playerAvatar}>
                        <Text style={s.playerAvatarText}>
                          {att.displayName?.[0]?.toUpperCase() ?? '?'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.playerName}>{att.displayName}</Text>
                        {!!att.note && <Text style={s.playerNote}>{att.note}</Text>}
                      </View>
                      <View style={[s.statusDot, { backgroundColor: color }]} />
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          {allAttendance.length === 0 && (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>👥</Text>
              <Text style={s.emptyText}>No responses yet</Text>
            </View>
          )}
          <View style={{ height: spacing[8] }} />
        </ScrollView>
      )}

      {activeTab === 'comments' && (
        <CommentsList eventId={eventId} />
      )}

      {activeTab === 'gallery' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
          <TouchableOpacity
            style={s.galleryViewAll}
            onPress={() => navigation.navigate('Gallery', { eventId })}
          >
            <Text style={s.galleryViewAllText}>
              {can('upload_gallery') ? '📷 Upload & View Gallery' : '📷 View Full Gallery'} →
            </Text>
          </TouchableOpacity>

          {gallery.length > 0 ? (
            <View style={s.galleryGrid}>
              {gallery.slice(0, 9).map((media) => (
                <MediaThumbnail
                  key={media.mediaId}
                  media={media}
                  size={THUMB_SIZE}
                  onPress={() => navigation.navigate('Gallery', { eventId })}
                />
              ))}
            </View>
          ) : (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>📷</Text>
              <Text style={s.emptyText}>No photos yet</Text>
              {can('upload_gallery') && (
                <TouchableOpacity onPress={() => navigation.navigate('Gallery', { eventId })}>
                  <Text style={s.emptyAction}>Add photos →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={{ height: spacing[8] }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: colors.background.primary },
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  errorText:          { color: colors.text.secondary },

  // Hero
  hero:               { paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[4] },
  heroTop:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] },
  heroActions:        { flexDirection: 'row', gap: spacing[2] },
  backBtn:            {},
  backText:           { color: colors.accent.primary, fontSize: typography.size.md },
  editBtn:            { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, borderWidth: 1, borderColor: colors.accent.primary },
  editBtnText:        { color: colors.accent.primary, fontSize: typography.size.sm, fontWeight: '600' },
  deleteBtn:          { paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
  deleteBtnText:      { fontSize: typography.size.md },
  typeBadge:          { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing[1], paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, marginBottom: spacing[3] },
  typeBadgeIcon:      { fontSize: 14 },
  typeBadgeLabel:     { fontSize: typography.size.sm, fontWeight: '700' },
  heroTitle:          { fontSize: typography.size['2xl'], color: colors.text.primary, fontWeight: '800', lineHeight: typography.size['2xl'] * 1.2 },
  cancelledBanner:    { marginTop: spacing[3], backgroundColor: colors.status.notGoing + '20', borderRadius: radius.md, padding: spacing[3] },
  cancelledBannerText:{ color: colors.status.notGoing, fontSize: typography.size.sm, fontWeight: '600' },
  scoreBadge:         { marginTop: spacing[3], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  scoreText:          { fontSize: typography.size['3xl'], color: colors.text.primary, fontWeight: '900' },
  outcomeText:        { fontSize: typography.size.sm, fontWeight: '700', letterSpacing: 1 },

  // Tab bar
  tabBar:             { borderBottomWidth: 1, borderBottomColor: colors.border, maxHeight: 44 },
  tabBarContent:      { paddingHorizontal: spacing[5], gap: spacing[1] },
  tab:                { paddingHorizontal: spacing[4], paddingVertical: spacing[3], flexDirection: 'row', alignItems: 'center', gap: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:          { borderBottomColor: colors.accent.primary },
  tabLabel:           { fontSize: typography.size.sm, color: colors.text.muted, fontWeight: '500' },
  tabLabelActive:     { color: colors.accent.primary, fontWeight: '700' },
  tabBadge:           { fontSize: typography.size.xs, color: colors.text.muted, backgroundColor: colors.background.tertiary, borderRadius: radius.full, paddingHorizontal: 5, paddingVertical: 1 },

  // Body / cards
  body:               { paddingHorizontal: spacing[5], paddingTop: spacing[4], gap: spacing[4] },
  infoCard:           { padding: spacing[4] },
  infoRow:            { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  infoDivider:        { height: 1, backgroundColor: colors.divider, marginVertical: spacing[3] },
  infoIcon:           { fontSize: 18, marginTop: 2 },
  infoLabel:          { fontSize: typography.size.xs, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue:          { fontSize: typography.size.md, color: colors.text.primary, fontWeight: '600' },
  infoSub:            { fontSize: typography.size.sm, color: colors.text.secondary, marginTop: 2 },
  sectionTitle:       { fontSize: typography.size.xs, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  descCard:           { padding: spacing[4] },
  coachNotesCard:     { borderColor: colors.accent.primary + '40' },
  descText:           { fontSize: typography.size.md, color: colors.text.secondary, lineHeight: typography.size.md * 1.6 },

  // Match actions
  matchActions:       { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  matchAction:        { alignItems: 'center', gap: spacing[1], paddingVertical: spacing[3], paddingHorizontal: spacing[4], backgroundColor: colors.background.secondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, minWidth: 72 },
  matchActionIcon:    { fontSize: 22 },
  matchActionLabel:   { fontSize: typography.size.xs, color: colors.text.secondary, fontWeight: '600' },

  // RSVP
  rsvpCard:           { padding: spacing[3] },
  rsvpLoader:         { marginBottom: spacing[2] },
  rsvpRow:            { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[1] },
  rsvpBtn:            { flex: 1, alignItems: 'center', paddingVertical: spacing[2], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: 3 },
  rsvpEmoji:          { fontSize: 18 },
  rsvpLabel:          { fontSize: typography.size.xs, color: colors.text.secondary, textAlign: 'center' },

  // Attendance tab
  attendSummary:      { flexDirection: 'row', padding: spacing[4], justifyContent: 'space-around' },
  attendSummaryItem:  { alignItems: 'center', gap: 2 },
  attendSummaryCount: { fontSize: typography.size['2xl'], fontWeight: '800' },
  attendSummaryLabel: { fontSize: typography.size.xs, color: colors.text.muted },
  playerRow:          { flexDirection: 'row', alignItems: 'center', padding: spacing[4], gap: spacing[3] },
  playerRowBorder:    { borderTopWidth: 1, borderTopColor: colors.divider },
  playerAvatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent.primary + '30', alignItems: 'center', justifyContent: 'center' },
  playerAvatarText:   { color: colors.accent.primary, fontWeight: '700', fontSize: typography.size.md },
  playerName:         { color: colors.text.primary, fontSize: typography.size.md, fontWeight: '500' },
  playerNote:         { color: colors.text.muted, fontSize: typography.size.sm, marginTop: 1 },
  statusDot:          { width: 8, height: 8, borderRadius: 4 },

  // Gallery tab
  galleryViewAll:     { padding: spacing[4], backgroundColor: colors.background.secondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  galleryViewAllText: { color: colors.accent.primary, fontSize: typography.size.md, fontWeight: '600' },
  galleryGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1] },

  // Empty state
  emptyState:         { alignItems: 'center', paddingVertical: spacing[12], gap: spacing[2] },
  emptyIcon:          { fontSize: 40 },
  emptyText:          { color: colors.text.muted, fontSize: typography.size.md },
  emptyAction:        { color: colors.accent.primary, fontSize: typography.size.md, fontWeight: '600', marginTop: spacing[2] },
});
