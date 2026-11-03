// src/features/events/screens/MatchResultScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useEvent } from '../../../hooks/useEvents';
import { useMatchResult, useSaveMatchResult } from '../../../hooks/useMatchResult';
import { useSquad } from '../../../hooks/useSquad';
import { GoalEntry } from '../../../services/matchResult.service';
import { AppUser } from '../../../types';

type Props = NativeStackScreenProps<EventsStackParamList, 'MatchResult'>;

// ─── Score stepper ──────────────────────────────────────────────────────────
function ScoreStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={sc.stepperCol}>
      <Text style={sc.stepperLabel}>{label}</Text>
      <View style={sc.stepperRow}>
        <TouchableOpacity
          style={sc.stepperBtn}
          onPress={() => onChange(Math.max(0, value - 1))}
        >
          <Text style={sc.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={sc.stepperValue}>{value}</Text>
        <TouchableOpacity
          style={sc.stepperBtn}
          onPress={() => onChange(value + 1)}
        >
          <Text style={sc.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Goal entry chip ─────────────────────────────────────────────────────────
function GoalChip({
  entry,
  onRemove,
}: {
  entry: GoalEntry;
  onRemove: () => void;
}) {
  return (
    <View style={sc.chip}>
      <Text style={sc.chipText}>
        {entry.playerName}{entry.minute ? ` ${entry.minute}'` : ''}
      </Text>
      <TouchableOpacity onPress={onRemove} hitSlop={8}>
        <Text style={sc.chipRemove}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

export function MatchResultScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { data: event } = useEvent(eventId);
  const { data: existingResult } = useMatchResult(eventId);
  const { mutateAsync: saveResult, isPending: isSaving } = useSaveMatchResult(eventId);
  const squadQuery = useSquad();
  const players: AppUser[] = squadQuery.data ?? [];

  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [scorers, setScorers] = useState<GoalEntry[]>([]);
  const [assists, setAssists] = useState<GoalEntry[]>([]);
  const [motm, setMotm] = useState<{ userId: string; name: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [showPlayerPicker, setShowPlayerPicker] = useState<
    'scorer' | 'assist' | 'motm' | null
  >(null);
  const [minuteInput, setMinuteInput] = useState('');
  const [pendingPlayer, setPendingPlayer] = useState<{ userId: string; name: string } | null>(null);

  // Pre-fill from existing result
  useEffect(() => {
    if (!existingResult) return;
    setHomeGoals(existingResult.homeGoals);
    setAwayGoals(existingResult.awayGoals);
    setScorers(existingResult.scorers);
    setAssists(existingResult.assists);
    if (existingResult.manOfTheMatch) {
      setMotm({
        userId: existingResult.manOfTheMatch,
        name: existingResult.manOfTheMatchName ?? '',
      });
    }
    setNotes(existingResult.notes);
  }, [existingResult]);

  const outcome = homeGoals > awayGoals ? '🏆 Win' : homeGoals < awayGoals ? '❌ Loss' : '🤝 Draw';
  const outcomeBg =
    homeGoals > awayGoals ? colors.status.going + '20'
    : homeGoals < awayGoals ? colors.status.notGoing + '20'
    : colors.status.maybe + '20';

  const handleSelectPlayer = (userId: string, name: string) => {
    if (showPlayerPicker === 'motm') {
      setMotm({ userId, name });
      setShowPlayerPicker(null);
    } else {
      setPendingPlayer({ userId, name });
      setShowPlayerPicker(null);
      // show minute input prompt
      Alert.prompt(
        'Minute (optional)',
        'Which minute?',
        (min) => {
          const entry: GoalEntry = {
            userId,
            playerName: name,
            minute: min ? parseInt(min, 10) || null : null,
          };
          if (showPlayerPicker === 'scorer' || pendingPlayer === null) {
            // We capture the type before state changes
            setScorers(prev => [...prev, entry]);
          } else {
            setAssists(prev => [...prev, entry]);
          }
        },
        'plain-text',
      );
    }
  };

  const handleSave = async () => {
    try {
      await saveResult({
        homeGoals,
        awayGoals,
        scorers,
        assists,
        manOfTheMatch: motm?.userId ?? null,
        manOfTheMatchName: motm?.name ?? null,
        yellowCards: [],
        redCards: [],
        notes,
      });
      Alert.alert('Saved', 'Match result saved!');
      navigation.goBack();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save');
    }
  };

  // ── Player picker modal ───────────────────────────────────────────────────
  if (showPlayerPicker) {
    return (
      <SafeAreaView style={sc.container}>
        <View style={sc.pickerHeader}>
          <TouchableOpacity onPress={() => setShowPlayerPicker(null)}>
            <Text style={sc.back}>Cancel</Text>
          </TouchableOpacity>
          <Text style={sc.pickerTitle}>
            {showPlayerPicker === 'motm' ? '⭐ Man of the Match' : showPlayerPicker === 'scorer' ? '⚽ Scorer' : '🎯 Assist'}
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[2] }}>
          {players.filter(p => p.status === 'active').map(p => (
            <TouchableOpacity
              key={p.userId}
              style={[glassCardStyle, sc.playerRow]}
              onPress={() => handleSelectPlayer(p.userId, p.displayName)}
            >
              <Text style={sc.playerNum}>
                {p.jerseyNumber ? `#${p.jerseyNumber}` : '—'}
              </Text>
              <Text style={sc.playerName}>{p.displayName}</Text>
              <Text style={sc.playerPos}>{p.position}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sc.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={sc.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={sc.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={sc.heading}>Match Result</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            style={sc.saveBtn}
          >
            {isSaving
              ? <ActivityIndicator color={colors.text.inverse} size="small" />
              : <Text style={sc.saveBtnText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={sc.body}>
          {/* Match info */}
          {event?.opponent && (
            <Text style={sc.matchLabel}>
              FC Revelation vs {event.opponent}
            </Text>
          )}

          {/* Score */}
          <View style={[glassCardStyle, sc.scoreCard]}>
            <ScoreStepper label="Our Goals" value={homeGoals} onChange={setHomeGoals} />
            <Text style={sc.vs}>:</Text>
            <ScoreStepper label="Their Goals" value={awayGoals} onChange={setAwayGoals} />
          </View>

          {/* Outcome badge */}
          <View style={[sc.outcomeBadge, { backgroundColor: outcomeBg }]}>
            <Text style={sc.outcomeText}>{outcome}</Text>
          </View>

          {/* Scorers */}
          <Text style={sc.sectionTitle}>⚽ Scorers</Text>
          <View style={[glassCardStyle, sc.listCard]}>
            <View style={sc.chips}>
              {scorers.map((s, i) => (
                <GoalChip
                  key={i}
                  entry={s}
                  onRemove={() => setScorers(prev => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </View>
            <TouchableOpacity
              style={sc.addBtn}
              onPress={() => setShowPlayerPicker('scorer')}
            >
              <Text style={sc.addBtnText}>+ Add Scorer</Text>
            </TouchableOpacity>
          </View>

          {/* Assists */}
          <Text style={sc.sectionTitle}>🎯 Assists</Text>
          <View style={[glassCardStyle, sc.listCard]}>
            <View style={sc.chips}>
              {assists.map((a, i) => (
                <GoalChip
                  key={i}
                  entry={a}
                  onRemove={() => setAssists(prev => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </View>
            <TouchableOpacity
              style={sc.addBtn}
              onPress={() => setShowPlayerPicker('assist')}
            >
              <Text style={sc.addBtnText}>+ Add Assist</Text>
            </TouchableOpacity>
          </View>

          {/* Man of the Match */}
          <Text style={sc.sectionTitle}>⭐ Man of the Match</Text>
          <TouchableOpacity
            style={[glassCardStyle, sc.motmCard]}
            onPress={() => setShowPlayerPicker('motm')}
          >
            {motm ? (
              <View style={sc.motmSelected}>
                <Text style={sc.motmName}>⭐ {motm.name}</Text>
                <TouchableOpacity onPress={() => setMotm(null)}>
                  <Text style={sc.motmClear}>Clear</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={sc.motmPlaceholder}>Tap to select player</Text>
            )}
          </TouchableOpacity>

          {/* Notes */}
          <Text style={sc.sectionTitle}>📋 Notes</Text>
          <View style={[glassCardStyle, sc.notesCard]}>
            <TextInput
              style={sc.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Post-match notes, observations..."
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: spacing[8] }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const sc = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  back:         { color: colors.accent.primary, fontSize: typography.size.md },
  heading:      { fontSize: typography.size.xl, color: colors.text.primary, fontWeight: '700' },
  saveBtn: {
    backgroundColor: colors.accent.primary, paddingHorizontal: spacing[4],
    paddingVertical: spacing[2], borderRadius: radius.full,
  },
  saveBtnText:  { color: colors.text.inverse, fontWeight: '700', fontSize: typography.size.sm },
  body:         { padding: spacing[5], gap: spacing[4] },
  matchLabel:   { fontSize: typography.size.lg, color: colors.text.secondary, textAlign: 'center', fontWeight: '600' },
  scoreCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: spacing[6], gap: spacing[6],
  },
  stepperCol:   { alignItems: 'center', gap: spacing[2] },
  stepperLabel: { fontSize: typography.size.sm, color: colors.text.muted, textTransform: 'uppercase' },
  stepperRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  stepperBtn: {
    width: 44, height: 44, borderRadius: radius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  stepperBtnText: { color: colors.text.primary, fontSize: typography.size['2xl'], fontWeight: '300' },
  stepperValue:   { fontSize: typography.size['4xl'], color: colors.text.primary, fontWeight: '800', minWidth: 44, textAlign: 'center' },
  vs:           { fontSize: typography.size['2xl'], color: colors.text.muted },
  outcomeBadge: { alignSelf: 'center', paddingHorizontal: spacing[5], paddingVertical: spacing[2], borderRadius: radius.full },
  outcomeText:  { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  sectionTitle: { fontSize: typography.size.sm, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  listCard:     { padding: spacing[4], gap: spacing[3] },
  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    backgroundColor: colors.accent.primary + '20',
    borderWidth: 1, borderColor: colors.accent.primary + '40',
    borderRadius: radius.full,
    paddingHorizontal: spacing[3], paddingVertical: spacing[1],
  },
  chipText:     { color: colors.accent.primary, fontSize: typography.size.sm, fontWeight: '600' },
  chipRemove:   { color: colors.accent.primary, fontSize: typography.size.lg, fontWeight: '300' },
  addBtn:       { alignSelf: 'flex-start' },
  addBtnText:   { color: colors.accent.primary, fontSize: typography.size.sm, fontWeight: '600' },
  motmCard:     { padding: spacing[4] },
  motmSelected: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  motmName:     { fontSize: typography.size.md, color: colors.text.primary, fontWeight: '600' },
  motmClear:    { color: colors.status.notGoing, fontSize: typography.size.sm },
  motmPlaceholder: { color: colors.text.muted, fontSize: typography.size.md },
  notesCard:    { padding: spacing[4] },
  notesInput:   { color: colors.text.primary, fontSize: typography.size.md, minHeight: 80 },
  // Picker
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    padding: spacing[5], borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  pickerTitle:  { fontSize: typography.size.lg, color: colors.text.primary, fontWeight: '700' },
  playerRow:    { flexDirection: 'row', alignItems: 'center', padding: spacing[4], gap: spacing[3] },
  playerNum:    { fontSize: typography.size.sm, color: colors.text.muted, width: 32 },
  playerName:   { flex: 1, fontSize: typography.size.md, color: colors.text.primary, fontWeight: '600' },
  playerPos:    { fontSize: typography.size.sm, color: colors.text.secondary },
});
