// src/features/events/components/DatePickerField.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, parseISO, isValid } from 'date-fns';
import { colors, typography, spacing } from '../../../config/theme';

interface Props {
  label: string;
  value: string;        // YYYY-MM-DD
  onChange: (dateStr: string) => void;
}

function formatDisplay(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, 'EEE, d MMM yyyy') : dateStr;
  } catch {
    return dateStr;
  }
}

export function DatePickerField({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  const markedDates = value
    ? { [value]: { selected: true, selectedColor: colors.accent.primary } }
    : {};

  return (
    <>
      <View style={s.row}>
        <Text style={s.fieldLabel}>{label}</Text>
        <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.7} style={s.valueBtn}>
          <Text style={s.valueText}>{formatDisplay(value)}</Text>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modal}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setOpen(false)} activeOpacity={0.7}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.modalTitle}>Select Date</Text>
            <View style={{ width: 60 }} />
          </View>
          <Calendar
            current={value || today}
            markedDates={markedDates}
            onDayPress={(day: { dateString: string }) => {
              onChange(day.dateString);
              setOpen(false);
            }}
            theme={{
              backgroundColor:            colors.background.primary,
              calendarBackground:         colors.background.primary,
              dayTextColor:               colors.text.primary,
              textDisabledColor:          colors.text.muted,
              monthTextColor:             colors.text.primary,
              arrowColor:                 colors.accent.primary,
              todayTextColor:             colors.accent.primary,
              selectedDayBackgroundColor: colors.accent.primary,
              selectedDayTextColor:       colors.text.inverse,
              textDayFontSize:            typography.size.md,
              textMonthFontSize:          typography.size.lg,
              textDayHeaderFontSize:      typography.size.xs,
            }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  fieldLabel:  { fontSize: typography.size.md, color: colors.text.primary },
  valueBtn:    { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  valueText:   { fontSize: typography.size.md, color: colors.accent.primary, fontWeight: '500' },
  chevron:     { fontSize: typography.size.lg, color: colors.text.muted },
  modal:       { flex: 1, backgroundColor: colors.background.primary },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border },
  cancelText:  { fontSize: typography.size.md, color: colors.accent.primary },
  modalTitle:  { flex: 1, textAlign: 'center', fontSize: typography.size.lg, color: colors.text.primary, fontWeight: '700' },
});
