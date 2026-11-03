import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../config/theme';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide?: () => void;
  duration?: number;
}

const TOAST_CONFIG: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: colors.status.going, icon: '✓' },
  error:   { bg: colors.status.notGoing, icon: '✕' },
  warning: { bg: colors.status.maybe, icon: '⚠' },
  info:    { bg: '#3B82F6', icon: 'ℹ' },
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  onHide,
  duration = 3000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 18,
          bounciness: 4,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        hide();
      }, duration);
    } else {
      hide();
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [visible, duration]);

  const hide = (): void => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const config = TOAST_CONFIG[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.bg, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="none"
    >
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  iconWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: typography.size.md,
    color: '#fff',
    fontWeight: '700',
  },
  message: {
    flex: 1,
    fontSize: typography.size.sm,
    color: '#fff',
    fontWeight: '500',
  },
});
