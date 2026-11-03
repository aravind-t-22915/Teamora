// src/features/auth/components/AuthInput.tsx
import React from 'react';
import {
  View, Text, TextInput, StyleSheet, TextInputProps, TextStyle,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../../config/theme';

interface AuthInputProps extends TextInputProps {
  label:   string;
  error?:  string;
  style?:  TextStyle;
}

export function AuthInput({ label, error, style, ...props }: AuthInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.text.muted}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing[1] },
  label:   { fontSize: typography.size.sm, color: colors.text.secondary, fontWeight: '500' },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius:    radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[3],
    color:           colors.text.primary,
    fontSize:        typography.size.md,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  inputError: { borderColor: '#EF4444' },
  error:      { fontSize: typography.size.xs, color: '#EF4444' },
});
