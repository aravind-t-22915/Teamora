// src/features/match/components/FormationSelector.tsx
import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../config/theme';

const FORMATIONS = ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2', '4-1-4-1', '3-4-3'];

export interface FormationSelectorProps {
  value: string;
  onChange: (formation: string) => void;
  disabled?: boolean;
}

export const FormationSelector: React.FC<FormationSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Formation</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {FORMATIONS.map((f) => {
          const isSelected = f === value;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => !disabled && onChange(f)}
              activeOpacity={disabled ? 1 : 0.7}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                disabled && styles.chipDisabled,
              ]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing[3],
  },
  label: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: '600',
    marginBottom: spacing[2],
    paddingHorizontal: spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.tertiary,
  },
  chipSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.text.inverse,
  },
});
