import React, { useRef } from 'react';
import {
  Animated,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../config/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: string;
  fullWidth?: boolean;
  style?: object;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  fullWidth = false,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (): void => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth ? styles.fullWidth : {},
    disabled || loading ? styles.disabled : {},
    style as ViewStyle,
  ];

  const textStyle = [
    styles.label,
    styles[`labelSize_${size}`],
    styles[`labelVariant_${variant}`],
  ];

  return (
    <Animated.View style={{ transform: [{ scale }], alignSelf: fullWidth ? 'stretch' : 'auto' }}>
      <Pressable
        style={containerStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.text.inverse : colors.accent.primary}
          />
        ) : (
          <>
            {leftIcon ? <Text style={[styles.icon, styles[`iconSize_${size}`]]}>{leftIcon}</Text> : null}
            <Text style={textStyle}>{label}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.45,
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    gap: spacing[1],
  },
  size_md: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    gap: spacing[2],
  },
  size_lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    gap: spacing[2],
  },

  // Variants
  variant_primary: {
    backgroundColor: colors.accent.primary,
  },
  variant_secondary: {
    backgroundColor: 'rgba(22, 27, 34, 0.8)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.status.notGoing,
  },

  // Label base
  label: {
    fontWeight: '600',
  },
  labelSize_sm: {
    fontSize: typography.size.sm,
  },
  labelSize_md: {
    fontSize: typography.size.md,
  },
  labelSize_lg: {
    fontSize: typography.size.lg,
  },

  // Label colors by variant
  labelVariant_primary: {
    color: colors.text.inverse,
  },
  labelVariant_secondary: {
    color: colors.text.primary,
  },
  labelVariant_ghost: {
    color: colors.accent.primary,
  },
  labelVariant_danger: {
    color: colors.status.notGoing,
  },

  // Icon sizes
  icon: {},
  iconSize_sm: {
    fontSize: typography.size.sm,
  },
  iconSize_md: {
    fontSize: typography.size.md,
  },
  iconSize_lg: {
    fontSize: typography.size.lg,
  },
});
