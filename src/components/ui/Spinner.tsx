import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../config/theme';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  centered?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'small',
  color = colors.accent.primary,
  centered = false,
}) => {
  if (centered) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color} />;
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
