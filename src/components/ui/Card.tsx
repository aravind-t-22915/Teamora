import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors, glassCardStyle, spacing } from '../../config/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
  padded?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padded = true,
  glass = true,
}) => {
  const containerStyle: ViewStyle[] = [
    glass ? (styles.glass as ViewStyle) : styles.plain,
    padded ? styles.padded : {},
    style as ViewStyle,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  glass: {
    ...(glassCardStyle as object),
  },
  plain: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing[4],
  },
});
