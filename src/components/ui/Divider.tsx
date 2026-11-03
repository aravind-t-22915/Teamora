import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';

interface DividerProps {
  label?: string;
  style?: object;
}

export const Divider: React.FC<DividerProps> = ({ label, style }) => {
  if (label) {
    return (
      <View style={[styles.rowContainer, style]}>
        <View style={styles.line} />
        <Text style={styles.label}>{label}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  return <View style={[styles.simpleLine, style]} />;
};

const styles = StyleSheet.create({
  simpleLine: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing[3],
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[3],
    gap: spacing[3],
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  label: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    flexShrink: 0,
  },
});
