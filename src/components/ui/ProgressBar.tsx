import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../config/theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  animated?: boolean;
  label?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.accent.primary,
  height = 8,
  animated = true,
  label,
  showPercentage = false,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: clampedProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, widthAnim]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const percentage = Math.round(clampedProgress * 100);

  return (
    <View style={styles.wrapper}>
      {(label || showPercentage) ? (
        <View style={styles.topRow}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {showPercentage ? (
            <Text style={styles.percentage}>{percentage}%</Text>
          ) : null}
        </View>
      ) : null}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolated,
              height,
              borderRadius: height / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[2],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  percentage: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  track: {
    backgroundColor: colors.background.tertiary,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
