import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, typography } from '../../config/theme';

interface FABProps {
  onPress: () => void;
  icon?: string;
  color?: string;
  style?: object;
}

export const FAB: React.FC<FABProps> = ({
  onPress,
  icon = '+',
  color = colors.accent.primary,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: color },
        pressed ? styles.pressed : {},
        style as ViewStyle,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  icon: {
    fontSize: typography.size['2xl'],
    color: colors.text.inverse,
    fontWeight: '400',
    lineHeight: typography.size['2xl'] + 2,
  },
});
