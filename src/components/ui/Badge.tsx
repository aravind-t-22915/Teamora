import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../config/theme';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
  icon?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = colors.accent.primary,
  textColor = colors.text.primary,
  size = 'md',
  icon,
}) => {
  return (
    <View
      style={[
        styles.container,
        size === 'sm' ? styles.containerSm : styles.containerMd,
        { backgroundColor: `${color}25` },
      ]}
    >
      {icon ? (
        <Text style={[styles.icon, size === 'sm' ? styles.iconSm : styles.iconMd]}>{icon}</Text>
      ) : null}
      <Text
        style={[
          styles.label,
          size === 'sm' ? styles.labelSm : styles.labelMd,
          { color: textColor !== colors.text.primary ? textColor : color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  containerSm: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    gap: 3,
  },
  containerMd: {
    paddingVertical: spacing[1] + 2,
    paddingHorizontal: spacing[3],
    gap: spacing[1],
  },
  icon: {},
  iconSm: {
    fontSize: typography.size.xs,
  },
  iconMd: {
    fontSize: typography.size.sm,
  },
  label: {
    fontWeight: '600',
  },
  labelSm: {
    fontSize: typography.size.xs,
  },
  labelMd: {
    fontSize: typography.size.sm,
  },
});
