import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  error?: Error | string | null;
  onRetry?: () => void;
  message?: string;
}

function resolveMessage(error: Error | string | null | undefined, message?: string): string {
  if (message) return message;
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') return error;
  return error.message || 'An unexpected error occurred.';
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, message }) => {
  const displayMessage = resolveMessage(error, message);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>❌</Text>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>{displayMessage}</Text>
      {onRetry ? (
        <Button
          label="Try Again"
          onPress={onRetry}
          variant="secondary"
          size="md"
          style={styles.retryBtn}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    gap: spacing[3],
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  message: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.size.sm * 1.5,
  },
  retryBtn: {
    marginTop: spacing[2],
  },
});
