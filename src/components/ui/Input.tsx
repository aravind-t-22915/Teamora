import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../config/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  rightIcon?: string;
  onRightIconPress?: () => void;
  editable?: boolean;
  style?: object;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  rightIcon,
  onRightIconPress,
  editable = true,
  style,
}) => {
  const [focused, setFocused] = useState(false);

  const inputContainerStyle: ViewStyle[] = [
    styles.inputContainer,
    focused ? styles.inputContainerFocused : {},
    error ? styles.inputContainerError : {},
    !editable ? styles.inputContainerDisabled : {},
    style as ViewStyle,
  ];

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={inputContainerStyle}>
        <TextInput
          style={[styles.input, multiline ? styles.inputMultiline : {}]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.accent.primary}
          cursorColor={colors.accent.primary}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIconBtn} hitSlop={8}>
            <Text style={styles.rightIconText}>{rightIcon}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[1],
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: spacing[1],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  inputContainerFocused: {
    borderColor: `${colors.accent.primary}60`,
  },
  inputContainerError: {
    borderColor: colors.status.notGoing,
  },
  inputContainerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text.primary,
    padding: 0,
    margin: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  rightIconBtn: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },
  rightIconText: {
    fontSize: typography.size.lg,
  },
  errorText: {
    fontSize: typography.size.xs,
    color: colors.status.notGoing,
    marginTop: spacing[1],
  },
});
