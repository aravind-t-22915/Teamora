// src/features/match/screens/TimelineEditorScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Modal, TextInput, ActivityIndicator,
  Switch, Alert, FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { EventsStackParamList, TimelineEvent, TimelineEventType, AppUser } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useMatchData, useAddTimelineEvent, useUpdateTimelineEvent, useRemoveTimelineEvent } from '../../../hooks/useMatch';
import { usePlayers } from '../../../hooks/usePlayers';
import { useAuthStore } from '../../../stores/authStore';
import { TimelineList } from '../components/TimelineList';

type Props = {
  navigation: NativeStackNavigationProp<EventsStackParamList>;
  route: RouteProp<{ TimelineEditor: { eventId: string } }, 'TimelineEditor'>;
};

const EVENT_TYPES: Array<{ value: TimelineEventType; label: string; icon: string }> = [
  { value: 'goal',         label: 'Goal',        icon: '⚽' },
  { value: 'yellow_card',  label: 'Yellow Card', icon: '🟨' },
  { value: 'red_card',     label: 'Red Card',    icon: '🟥' },
  { value: 'substitution', label: 'Substitution',icon: '🔄' },
  { value: 'half_time',    label: 'Half Time',   icon: '⏱' },
  { value: 'full_time',    label: 'Full Time',   icon: '⏱' },
];

interface FormState {
  minute: string;
  type: TimelineEventType;
  playerId: string;
  playerName: string;
  assistId: string;
  assistName: string;
  substituteInId: string;
  substituteOutId: string;
  isOwnGoal: boolean;
  isPenalty: boolean;
  note: string;
}

const DEFAULT_FORM: FormState = {
  minute: '',
  type: 'goal',
  playerId: '',
  playerName: '',
  assistId: '',
  assistName: '',
  substituteInId: '',
  substituteOutId: '',
  isOwnGoal: false,
  isPenalty: false,
  note: '',
};

const NO_PLAYER_TYPES: TimelineEventType[] = ['half_time', 'full_time', 'kickoff'];

export function TimelineEditorScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const can = useAuthStore((s) => s.can);

  const { data: matchData, isLoading } = useMatchData(eventId);
  const { data: allPlayers } = usePlayers();
  const { mutateAsync: addEvent,    isPending: isAdding   } = useAddTimelineEvent();
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateTimelineEvent();
  const { mutateAsync: removeEvent, isPending: isRemoving } = useRemoveTimelineEvent();

  const [showForm,       setShowForm]       = useState(false);
  const [form,           setForm]           = useState<FormState>(DEFAULT_FORM);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showPlayerPicker, setShowPlayerPicker] = useState<'main' | 'assist' | 'subIn' | 'subOut' | null>(null);

  const canEdit = can('add_timeline');

  const handleEdit = (ev: TimelineEvent) => {
    setEditingEventId(ev.id);
    setForm({
      minute:          String(ev.minute),
      type:            ev.type,
      playerId:        ev.playerId  ?? '',
      playerName:      ev.playerName ?? '',
      assistId:        ev.assistId  ?? '',
      assistName:      ev.assistName ?? '',
      substituteInId:  ev.substituteInId  ?? '',
      substituteOutId: ev.substituteOutId ?? '',
      isOwnGoal:       ev.isOwnGoal ?? false,
      isPenalty:       ev.isPenalty ?? false,
      note:            ev.note ?? '',
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setForm(DEFAULT_FORM);
    setEditingEventId(null);
  };

  const handleAddEvent = async () => {
    const minute = parseInt(form.minute, 10);
    if (isNaN(minute) || minute < 0 || minute > 120) {
      Alert.alert('Invalid Minute', 'Enter a minute between 0 and 120.');
      return;
    }

    try {
      const eventPayload: TimelineEvent = {
        id: editingEventId ?? `te_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        minute,
        type: form.type,
        playerId:        form.playerId        || null,
        playerName:      form.playerName      || null,
        assistId:        form.assistId        || null,
        assistName:      form.assistName      || null,
        substituteInId:  form.substituteInId  || null,
        substituteOutId: form.substituteOutId || null,
        isOwnGoal:       form.isOwnGoal,
        isPenalty:       form.isPenalty,
        note:            form.note,
      };
      if (editingEventId) {
        await updateEvent({ eventId, event: eventPayload });
      } else {
        await addEvent({ eventId, event: eventPayload });
      }
      handleCloseForm();
    } catch {
      Alert.alert('Error', `Failed to ${editingEventId ? 'update' : 'add'} event. Try again.`);
    }
  };

  const handleDelete = async (eventTimelineId: string) => {
    if (!canEdit) return;
    Alert.alert('Delete Event', 'Remove this timeline event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await removeEvent({ eventId, timelineEventId: eventTimelineId });
          } catch {
            Alert.alert('Error', 'Failed to delete event.');
          }
        },
      },
    ]);
  };

  const pickPlayer = (player: AppUser) => {
    if (showPlayerPicker === 'main') {
      setForm((f) => ({ ...f, playerId: player.userId, playerName: player.displayName }));
    } else if (showPlayerPicker === 'assist') {
      setForm((f) => ({ ...f, assistId: player.userId, assistName: player.displayName }));
    } else if (showPlayerPicker === 'subIn') {
      setForm((f) => ({ ...f, substituteInId: player.userId }));
    } else if (showPlayerPicker === 'subOut') {
      setForm((f) => ({ ...f, substituteOutId: player.userId }));
    }
    setShowPlayerPicker(null);
  };

  const needsPlayer = !NO_PLAYER_TYPES.includes(form.type);

  const renderPlayerPickerItem = ({ item }: { item: AppUser }) => (
    <TouchableOpacity
      style={styles.pickerPlayerRow}
      onPress={() => pickPlayer(item)}
      activeOpacity={0.7}
    >
      <View style={styles.pickerAvatar}>
        <Text style={styles.pickerAvatarText}>
          {item.displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.pickerPlayerName}>{item.displayName}</Text>
        <Text style={styles.pickerPlayerMeta}>{item.position}{item.jerseyNumber != null ? `  •  #${item.jerseyNumber}` : ''}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Timeline</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <TimelineList
            events={matchData?.timeline ?? []}
            onDelete={canEdit ? handleDelete : undefined}
            onEdit={canEdit ? handleEdit : undefined}
          />

          {canEdit && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowForm(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+ Add Event</Text>
            </TouchableOpacity>
          )}

          {!canEdit && (
            <Text style={styles.readOnlyNote}>Only coaches can edit the timeline.</Text>
          )}
        </ScrollView>
      )}

      {/* Add Event Modal */}
      <Modal visible={showForm} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingEventId ? 'Edit Event' : 'Add Event'}</Text>

            {/* Minute */}
            <Text style={styles.fieldLabel}>Minute *</Text>
            <TextInput
              style={styles.input}
              value={form.minute}
              onChangeText={(v) => setForm((f) => ({ ...f, minute: v }))}
              keyboardType="number-pad"
              placeholder="0 – 120"
              placeholderTextColor={colors.text.muted}
              maxLength={3}
            />

            {/* Event Type */}
            <Text style={styles.fieldLabel}>Event Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
              {EVENT_TYPES.map((et) => (
                <TouchableOpacity
                  key={et.value}
                  onPress={() => setForm((f) => ({ ...f, type: et.value }))}
                  style={[styles.typeChip, form.type === et.value && styles.typeChipSelected]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.typeChipIcon}>{et.icon}</Text>
                  <Text style={[styles.typeChipText, form.type === et.value && styles.typeChipTextSelected]}>
                    {et.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Player selector */}
            {needsPlayer && (
              <>
                <Text style={styles.fieldLabel}>Player</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setShowPlayerPicker('main')}
                  activeOpacity={0.7}
                >
                  <Text style={form.playerName ? styles.pickerTriggerText : styles.pickerTriggerPlaceholder}>
                    {form.playerName || 'Select player…'}
                  </Text>
                  <Text style={styles.pickerTriggerChevron}>›</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Assist (goal only) */}
            {form.type === 'goal' && (
              <>
                <Text style={styles.fieldLabel}>Assist (optional)</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setShowPlayerPicker('assist')}
                  activeOpacity={0.7}
                >
                  <Text style={form.assistName ? styles.pickerTriggerText : styles.pickerTriggerPlaceholder}>
                    {form.assistName || 'Select player…'}
                  </Text>
                  <Text style={styles.pickerTriggerChevron}>›</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Sub selectors */}
            {form.type === 'substitution' && (
              <>
                <Text style={styles.fieldLabel}>Sub On</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setShowPlayerPicker('subIn')}
                  activeOpacity={0.7}
                >
                  <Text style={form.substituteInId ? styles.pickerTriggerText : styles.pickerTriggerPlaceholder}>
                    {form.substituteInId || 'Select player…'}
                  </Text>
                  <Text style={styles.pickerTriggerChevron}>›</Text>
                </TouchableOpacity>

                <Text style={styles.fieldLabel}>Sub Off</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setShowPlayerPicker('subOut')}
                  activeOpacity={0.7}
                >
                  <Text style={form.substituteOutId ? styles.pickerTriggerText : styles.pickerTriggerPlaceholder}>
                    {form.substituteOutId || 'Select player…'}
                  </Text>
                  <Text style={styles.pickerTriggerChevron}>›</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Goal toggles */}
            {form.type === 'goal' && (
              <View style={styles.toggleRow}>
                <View style={styles.toggleItem}>
                  <Text style={styles.toggleLabel}>Own Goal</Text>
                  <Switch
                    value={form.isOwnGoal}
                    onValueChange={(v) => setForm((f) => ({ ...f, isOwnGoal: v }))}
                    trackColor={{ false: colors.border, true: colors.accent.primary }}
                    thumbColor="#fff"
                  />
                </View>
                <View style={styles.toggleItem}>
                  <Text style={styles.toggleLabel}>Penalty</Text>
                  <Switch
                    value={form.isPenalty}
                    onValueChange={(v) => setForm((f) => ({ ...f, isPenalty: v }))}
                    trackColor={{ false: colors.border, true: colors.accent.primary }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            )}

            {/* Note */}
            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              value={form.note}
              onChangeText={(v) => setForm((f) => ({ ...f, note: v }))}
              placeholder="e.g. Header from corner"
              placeholderTextColor={colors.text.muted}
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={handleCloseForm}
                style={styles.cancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddEvent}
                disabled={isAdding || isUpdating}
                style={[styles.confirmBtn, (isAdding || isUpdating) && { opacity: 0.5 }]}
                activeOpacity={0.8}
              >
                {(isAdding || isUpdating) ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <Text style={styles.confirmBtnText}>{editingEventId ? 'Save' : 'Add'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Player Picker Modal */}
      <Modal
        visible={showPlayerPicker !== null}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowPlayerPicker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '70%' }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Player</Text>
            <FlatList
              data={allPlayers ?? []}
              keyExtractor={(p) => p.userId}
              renderItem={renderPlayerPickerItem}
            />
            <TouchableOpacity
              onPress={() => setShowPlayerPicker(null)}
              style={styles.cancelBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    color: colors.text.primary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    width: 40,
  },
  headerTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: spacing[10],
  },
  addBtn: {
    margin: spacing[4],
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.text.inverse,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  readOnlyNote: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    textAlign: 'center',
    marginTop: spacing[6],
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing[5],
    paddingBottom: spacing[8],
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: '700',
    marginBottom: spacing[4],
  },
  fieldLabel: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: '600',
    marginBottom: spacing[1],
    marginTop: spacing[3],
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    color: colors.text.primary,
    fontSize: typography.size.md,
  },
  typeRow: {
    flexDirection: 'row',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing[2],
    gap: 4,
  },
  typeChipSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  typeChipIcon: {
    fontSize: 14,
  },
  typeChipText: {
    color: colors.text.secondary,
    fontSize: typography.size.xs,
    fontWeight: '600',
  },
  typeChipTextSelected: {
    color: colors.text.inverse,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  pickerTriggerText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.size.md,
  },
  pickerTriggerPlaceholder: {
    flex: 1,
    color: colors.text.muted,
    fontSize: typography.size.md,
  },
  pickerTriggerChevron: {
    color: colors.text.muted,
    fontSize: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    marginTop: spacing[3],
    gap: spacing[4],
  },
  toggleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  toggleLabel: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[5],
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginTop: spacing[3],
  },
  cancelBtnText: {
    color: colors.text.secondary,
    fontSize: typography.size.md,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.text.inverse,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  pickerPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing[3],
  },
  pickerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.accent.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerAvatarText: {
    color: colors.accent.primary,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  pickerPlayerName: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: '600',
  },
  pickerPlayerMeta: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
