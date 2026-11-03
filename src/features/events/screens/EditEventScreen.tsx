// src/features/events/screens/EditEventScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList, EventType } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle, eventTypeConfig } from '../../../config/theme';
import { useEvent, useUpdateEvent } from '../../../hooks/useEvents';
import { useAuthStore } from '../../../stores/authStore';
import { DatePickerField } from '../components/DatePickerField';

type Props = NativeStackScreenProps<EventsStackParamList, 'EditEvent'>;

const MATCH_TYPES: EventType[] = ['league_match', 'tournament_match', 'friendly_match', 'practice_match'];
const ALL_TYPES   = Object.keys(eventTypeConfig) as EventType[];

function toDateStr(val: unknown): string {
  if (!val) return new Date().toISOString().split('T')[0];
  let d: Date;
  if (typeof val === 'object' && val !== null) {
    if ('toDate' in val && typeof (val as { toDate: unknown }).toDate === 'function') {
      d = (val as { toDate: () => Date }).toDate();
    } else if ('seconds' in val) {
      d = new Date((val as { seconds: number }).seconds * 1000);
    } else { d = new Date(); }
  } else { d = new Date(val as string); }
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
}

export function EditEventScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { data: event, isLoading } = useEvent(eventId);
  const { mutateAsync: updateEvent, isPending } = useUpdateEvent(eventId);
  const can = useAuthStore(s => s.can);

  const [type,         setType]         = useState<EventType>('practice');
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [dateStr,      setDateStr]      = useState('');
  const [startTime,    setStartTime]    = useState('09:00');
  const [endTime,      setEndTime]      = useState('11:00');
  const [allDay,       setAllDay]       = useState(false);
  const [venueName,    setVenueName]    = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [opponent,     setOpponent]     = useState('');
  const [competition,  setCompetition]  = useState('');
  const [isHomeGame,   setIsHomeGame]   = useState(true);
  const [coachNotes,   setCoachNotes]   = useState('');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [visibleToAll, setVisibleToAll] = useState(true);
  const [seeded,       setSeeded]       = useState(false);

  // Pre-fill form when event loads
  useEffect(() => {
    if (event && !seeded) {
      setType(event.type);
      setTitle(event.title ?? '');
      setDescription(event.description ?? '');
      setDateStr(toDateStr(event.date));
      setStartTime(event.startTime ?? '09:00');
      setEndTime(event.endTime ?? '');
      setAllDay(event.allDay ?? false);
      setVenueName(event.venueName ?? '');
      setVenueAddress(event.venueAddress ?? '');
      setOpponent(event.opponent ?? '');
      setCompetition(event.competition ?? '');
      setIsHomeGame(event.isHomeGame ?? true);
      setCoachNotes(event.coachNotes ?? '');
      setNotifEnabled(event.notificationsEnabled ?? true);
      setVisibleToAll(event.visibleToAll ?? true);
      setSeeded(true);
    }
  }, [event, seeded]);

  const isMatch = MATCH_TYPES.includes(type);

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert('Validation', 'Title is required');
    const date = new Date(dateStr);
    if (!allDay && !startTime.match(/^\d{2}:\d{2}$/))
      return Alert.alert('Validation', 'Start time format: HH:MM');
    try {
      await updateEvent({
        type, title: title.trim(), description: description.trim(),
        date, startTime, endTime, allDay,
        venueName: venueName.trim(), venueAddress: venueAddress.trim(), coordinates: null,
        isMatch,
        opponent:    isMatch ? opponent.trim()    : undefined,
        competition: isMatch ? competition.trim() : undefined,
        isHomeGame:  isMatch ? isHomeGame         : undefined,
        targetGroups: [], visibleToAll,
        coachNotes: coachNotes.trim(), weatherPlaceholder: '',
        notificationsEnabled: notifEnabled,
      });
      navigation.goBack();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not update event');
    }
  };

  if (isLoading || !seeded) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}><ActivityIndicator color={colors.accent.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn}>
          <Text style={s.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Event</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isPending} style={s.saveBtn}>
          {isPending
            ? <ActivityIndicator color={colors.text.inverse} size="small" />
            : <Text style={s.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Event Type */}
        <Text style={s.sectionLabel}>Event Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.typesRow}>
            {ALL_TYPES.map(t => {
              const cfg    = eventTypeConfig[t];
              const active = t === type;
              return (
                <TouchableOpacity
                  key={t}
                  style={[s.typeChip, active && { backgroundColor: cfg.color, borderColor: cfg.color }]}
                  onPress={() => setType(t)}
                  activeOpacity={0.75}
                >
                  <Text style={s.typeIcon}>{cfg.icon}</Text>
                  <Text style={[s.typeLabel, active && s.typeLabelActive]}>{cfg.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Title */}
        <Text style={s.sectionLabel}>Title *</Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Event title"
          placeholderTextColor={colors.text.muted}
          maxLength={100}
        />

        {/* Description */}
        <Text style={s.sectionLabel}>Description</Text>
        <TextInput
          style={[s.input, s.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Additional details..."
          placeholderTextColor={colors.text.muted}
          multiline
          numberOfLines={3}
          maxLength={1000}
        />

        {/* Date & Time */}
        <Text style={s.sectionLabel}>Date & Time</Text>
        <View style={[glassCardStyle, s.card]}>
          <DatePickerField label="Date" value={dateStr} onChange={setDateStr} />
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.fieldLabel}>All Day</Text>
            <Switch value={allDay} onValueChange={setAllDay} trackColor={{ true: colors.accent.primary }} thumbColor={colors.text.primary} />
          </View>
          {!allDay && (
            <>
              <View style={s.divider} />
              <View style={s.row}>
                <Text style={s.fieldLabel}>Start Time</Text>
                <TextInput style={s.inlineInput} value={startTime} onChangeText={setStartTime} placeholder="09:00" placeholderTextColor={colors.text.muted} />
              </View>
              <View style={s.divider} />
              <View style={s.row}>
                <Text style={s.fieldLabel}>End Time</Text>
                <TextInput style={s.inlineInput} value={endTime} onChangeText={setEndTime} placeholder="11:00" placeholderTextColor={colors.text.muted} />
              </View>
            </>
          )}
        </View>

        {/* Venue */}
        <Text style={s.sectionLabel}>Venue</Text>
        <View style={[glassCardStyle, s.card]}>
          <View style={s.row}>
            <Text style={s.fieldLabel}>Name</Text>
            <TextInput style={s.inlineInput} value={venueName} onChangeText={setVenueName} placeholder="Ground / Stadium" placeholderTextColor={colors.text.muted} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.fieldLabel}>Address</Text>
            <TextInput style={s.inlineInput} value={venueAddress} onChangeText={setVenueAddress} placeholder="Full address" placeholderTextColor={colors.text.muted} />
          </View>
        </View>

        {/* Match details (conditional) */}
        {isMatch && (
          <>
            <Text style={s.sectionLabel}>Match Details</Text>
            <View style={[glassCardStyle, s.card]}>
              <View style={s.row}>
                <Text style={s.fieldLabel}>Opponent</Text>
                <TextInput style={s.inlineInput} value={opponent} onChangeText={setOpponent} placeholder="Team name" placeholderTextColor={colors.text.muted} />
              </View>
              <View style={s.divider} />
              <View style={s.row}>
                <Text style={s.fieldLabel}>Competition</Text>
                <TextInput style={s.inlineInput} value={competition} onChangeText={setCompetition} placeholder="League / Cup" placeholderTextColor={colors.text.muted} />
              </View>
              <View style={s.divider} />
              <View style={s.row}>
                <Text style={s.fieldLabel}>Home Game</Text>
                <Switch value={isHomeGame} onValueChange={setIsHomeGame} trackColor={{ true: colors.accent.primary }} thumbColor={colors.text.primary} />
              </View>
            </View>
          </>
        )}

        {/* Coach notes */}
        {can('view_coach_notes') && (
          <>
            <Text style={s.sectionLabel}>Coach Notes (staff only)</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={coachNotes}
              onChangeText={setCoachNotes}
              placeholder="Tactical notes, focus areas..."
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
              maxLength={2000}
            />
          </>
        )}

        {/* Settings */}
        <Text style={s.sectionLabel}>Settings</Text>
        <View style={[glassCardStyle, s.card]}>
          <View style={s.row}>
            <View style={s.rowLabelBlock}>
              <Text style={s.fieldLabel}>Notifications</Text>
              <Text style={s.fieldHint}>Alert squad of changes</Text>
            </View>
            <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ true: colors.accent.primary }} thumbColor={colors.text.primary} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <View style={s.rowLabelBlock}>
              <Text style={s.fieldLabel}>Visible to All</Text>
              <Text style={s.fieldHint}>All members can see this</Text>
            </View>
            <Switch value={visibleToAll} onValueChange={setVisibleToAll} trackColor={{ true: colors.accent.primary }} thumbColor={colors.text.primary} />
          </View>
        </View>

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background.primary },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.divider },
  closeBtn:       { padding: spacing[1] },
  closeText:      { fontSize: typography.size.lg, color: colors.text.secondary },
  headerTitle:    { fontSize: typography.size.lg, color: colors.text.primary, fontWeight: '700' },
  saveBtn:        { backgroundColor: colors.accent.primary, paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radius.full },
  saveText:       { color: colors.text.inverse, fontWeight: '700', fontSize: typography.size.sm },
  scroll:         { flex: 1 },
  content:        { paddingHorizontal: spacing[5], paddingVertical: spacing[5], gap: spacing[3] },
  sectionLabel:   { fontSize: typography.size.xs, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginTop: spacing[2] },
  typesRow:       { flexDirection: 'row', gap: spacing[2], paddingBottom: spacing[1] },
  typeChip:       { flexDirection: 'row', alignItems: 'center', gap: spacing[1], paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background.secondary },
  typeIcon:       { fontSize: 14 },
  typeLabel:      { fontSize: typography.size.sm, color: colors.text.secondary, fontWeight: '500' },
  typeLabelActive:{ color: colors.text.primary, fontWeight: '700' },
  input:          { backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing[4], paddingVertical: spacing[3], color: colors.text.primary, fontSize: typography.size.md },
  textarea:       { minHeight: 80, textAlignVertical: 'top' },
  card:           { paddingHorizontal: 0, paddingVertical: 0 },
  row:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  rowLabelBlock:  { flex: 1 },
  fieldLabel:     { fontSize: typography.size.md, color: colors.text.primary },
  fieldHint:      { fontSize: typography.size.xs, color: colors.text.muted, marginTop: 2 },
  inlineInput:    { flex: 1, textAlign: 'right', color: colors.text.primary, fontSize: typography.size.md, paddingLeft: spacing[3] },
  divider:        { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing[4] },
});
