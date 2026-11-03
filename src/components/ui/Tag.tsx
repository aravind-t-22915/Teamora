import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../config/theme';

interface TagProps {
  label: string;
  color?: string;
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({
  label,
  color = colors.accent.primary,
  onRemove,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={6} style={styles.removeBtn}>
          <Text style={[styles.removeIcon, { color }]}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    gap: spacing[1],
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: '500',
  },
  removeBtn: {
    marginLeft: 2,
  },
  removeIcon: {
    fontSize: typography.size.lg,
    lineHeight: typography.size.lg,
    fontWeight: '600',
  },
});
