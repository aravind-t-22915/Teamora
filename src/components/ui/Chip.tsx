import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../config/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  icon?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  color = colors.accent.primary,
  icon,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        selected
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: 'transparent', borderColor: colors.border },
      ]}
    >
      {icon ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : null}
      <Text
        style={[
          styles.label,
          selected ? styles.labelSelected : styles.labelUnselected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    gap: spacing[1],
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: typography.size.sm,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.text.inverse,
  },
  labelUnselected: {
    color: colors.text.secondary,
  },
});
