import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightElement,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.right}>
        {rightElement ?? null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 56,
    backgroundColor: colors.background.primary,
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backBtn: {
    padding: spacing[1],
  },
  backIcon: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
    fontWeight: '400',
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
