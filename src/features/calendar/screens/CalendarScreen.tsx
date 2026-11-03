// src/features/calendar/screens/CalendarScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isSameMonth, isToday, addMonths, subMonths,
} from 'date-fns';
import { CalendarStackParamList } from '../../../types';
import { colors, typography, spacing, radius, eventTypeConfig } from '../../../config/theme';
import { useMonthEvents } from '../../../hooks/useEvents';

type CalNav = NativeStackNavigationProp<CalendarStackParamList>;

function toDate(val: unknown): Date {
  try {
    if (!val) return new Date();
    if (typeof val === 'object' && val !== null) {
      // Firestore Timestamp instance (has toDate method)
      if ('toDate' in val && typeof (val as { toDate: unknown }).toDate === 'function') {
        const d = (val as { toDate: () => Date }).toDate();
        if (!isNaN(d.getTime())) return d;
      }
      // Serialised { seconds, nanoseconds } (from JSON cache)
      if ('seconds' in val && typeof (val as { seconds: unknown }).seconds === 'number') {
        const d = new Date((val as { seconds: number }).seconds * 1000);
        if (!isNaN(d.getTime())) return d;
      }
      // Firebase v12 internal { _seconds, _nanoseconds }
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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CELL_SIZE = 44;

export function CalendarScreen() {
  const navigation  = useNavigation<CalNav>();
  const [current,   setCurrent]  = useState(new Date());
  const [selected,  setSelected] = useState(new Date());

  const year  = current.getFullYear();
  const month = current.getMonth() + 1;

  const { data: events = [], isLoading } = useMonthEvents(year, month);

  // Days grid
  const days = useMemo(() => {
    const start   = startOfMonth(current);
    const end     = endOfMonth(current);
    const allDays = eachDayOfInterval({ start, end });
    const blanks  = Array(getDay(start)).fill(null) as null[];
    return [...blanks, ...allDays] as (Date | null)[];
  }, [current]);

  // Map date-string -> event type colors for dots
  const dotMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const ev of events) {
      const key = format(toDate(ev.date), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(eventTypeConfig[ev.type].color);
    }
    return map;
  }, [events]);

  // Events for the selected day
  const dayEvents = useMemo(() =>
    events.filter(e => isSameDay(toDate(e.date), selected)),
    [events, selected],
  );

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Month nav */}
        <View style={s.monthNav}>
          <TouchableOpacity onPress={() => setCurrent(subMonths(current, 1))} style={s.navBtn}>
            <Text style={s.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.monthLabel}>{format(current, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={() => setCurrent(addMonths(current, 1))} style={s.navBtn}>
            <Text style={s.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Weekday headers */}
        <View style={s.weekRow}>
          {WEEKDAYS.map(d => (
            <Text key={d} style={s.weekDay}>{d}</Text>
          ))}
        </View>

        {/* Day grid */}
        <View style={s.grid}>
          {days.map((day, i) => {
            if (!day) return <View key={`blank-${i}`} style={s.dayCell} />;
            const key        = format(day, 'yyyy-MM-dd');
            const dots       = dotMap[key] ?? [];
            const isSelected = isSameDay(day, selected);
            const isCurrent  = isToday(day);
            const isThisMonth = isSameMonth(day, current);
            return (
              <TouchableOpacity
                key={key}
                style={[
                  s.dayCell,
                  isSelected && s.dayCellSelected,
                  isCurrent && !isSelected && s.dayCellToday,
                ]}
                onPress={() => setSelected(day)}
                activeOpacity={0.7}
              >
                <Text style={[
                  s.dayNum,
                  isSelected   && s.dayNumSelected,
                  isCurrent && !isSelected && s.dayNumToday,
                  !isThisMonth && s.dayNumFaded,
                ]}>
                  {format(day, 'd')}
                </Text>
                {dots.length > 0 && (
                  <View style={s.dotsRow}>
                    {dots.slice(0, 3).map((color, di) => (
                      <View key={di} style={[s.dot, { backgroundColor: color }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Agenda header */}
        <View style={s.agendaHeader}>
          <Text style={s.agendaTitle}>{format(selected, 'EEEE, d MMMM')}</Text>
          {isLoading && <ActivityIndicator color={colors.accent.primary} size="small" />}
        </View>

        {/* Agenda list */}
        {dayEvents.length === 0 ? (
          <View style={s.emptyDay}>
            <Text style={s.emptyDayText}>No events on this day</Text>
          </View>
        ) : (
          <View style={s.agendaList}>
            {dayEvents.map(item => {
              const cfg = eventTypeConfig[item.type];
              return (
                <TouchableOpacity
                  key={item.eventId}
                  style={s.agendaItem}
                  onPress={() => navigation.navigate('EventDetail', { eventId: item.eventId })}
                  activeOpacity={0.75}
                >
                  <View style={[s.agendaStripe, { backgroundColor: cfg.color }]} />
                  <View style={s.agendaBody}>
                    <View style={s.agendaTopRow}>
                      <Text style={s.agendaIcon}>{cfg.icon}</Text>
                      <Text style={[s.agendaType, { color: cfg.color }]}>{cfg.label}</Text>
                      {item.startTime ? <Text style={s.agendaTime}>{item.startTime}</Text> : null}
                    </View>
                    <Text style={s.agendaName} numberOfLines={1}>{item.title}</Text>
                    {item.venueName ? (
                      <Text style={s.agendaVenue} numberOfLines={1}>📍 {item.venueName}</Text>
                    ) : null}
                  </View>
                  <Text style={s.agendaArrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.background.primary },
  monthNav:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[3] },
  navBtn:          { padding: spacing[2] },
  navArrow:        { fontSize: 28, color: colors.accent.primary, fontWeight: '300' },
  monthLabel:      { fontSize: typography.size.xl, color: colors.text.primary, fontWeight: '700' },
  weekRow:         { flexDirection: 'row', paddingHorizontal: spacing[3], marginBottom: spacing[1] },
  weekDay:         { flex: 1, textAlign: 'center', fontSize: typography.size.xs, color: colors.text.muted, fontWeight: '600', textTransform: 'uppercase' },
  grid:            { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing[3] },
  dayCell:         { width: `${100 / 7}%`, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  dayCellSelected: { backgroundColor: colors.accent.primary },
  dayCellToday:    { borderWidth: 1, borderColor: colors.accent.primary },
  dayNum:          { fontSize: typography.size.sm, color: colors.text.primary, fontWeight: '500' },
  dayNumSelected:  { color: colors.text.inverse, fontWeight: '700' },
  dayNumToday:     { color: colors.accent.primary, fontWeight: '700' },
  dayNumFaded:     { color: colors.text.muted },
  dotsRow:         { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot:             { width: 4, height: 4, borderRadius: 2 },
  agendaHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingVertical: spacing[3], borderTopWidth: 1, borderTopColor: colors.divider, marginTop: spacing[3] },
  agendaTitle:     { fontSize: typography.size.md, color: colors.text.primary, fontWeight: '600' },
  agendaList:      { paddingHorizontal: spacing[5], gap: spacing[2] },
  agendaItem:      { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  agendaStripe:    { width: 4, alignSelf: 'stretch' },
  agendaBody:      { flex: 1, paddingVertical: spacing[3], paddingHorizontal: spacing[3], gap: 2 },
  agendaTopRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  agendaIcon:      { fontSize: 12 },
  agendaType:      { fontSize: typography.size.xs, fontWeight: '600', flex: 1 },
  agendaTime:      { fontSize: typography.size.xs, color: colors.text.muted },
  agendaName:      { fontSize: typography.size.md, color: colors.text.primary, fontWeight: '600' },
  agendaVenue:     { fontSize: typography.size.sm, color: colors.text.muted },
  agendaArrow:     { fontSize: 20, color: colors.text.muted, paddingRight: spacing[3] },
  emptyDay:        { paddingVertical: spacing[6], alignItems: 'center' },
  emptyDayText:    { color: colors.text.muted, fontSize: typography.size.sm },
});
