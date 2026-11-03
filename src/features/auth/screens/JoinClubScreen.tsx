// src/features/auth/screens/JoinClubScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../../types';
import { joinClubSchema, JoinClubFormValues } from '../../../schemas/auth.schema';
import { colors, typography, spacing, radius } from '../../../config/theme';
import { AuthInput } from '../components/AuthInput';

type Props = NativeStackScreenProps<AuthStackParamList, 'JoinClub'>;

export function JoinClubScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'code' | 'register'>('code');
  const [inviteCode, setInviteCode] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<JoinClubFormValues>({
    resolver: zodResolver(joinClubSchema),
  });

  const onCodeSubmit = (data: JoinClubFormValues) => {
    setInviteCode(data.inviteCode);
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Join a Club</Text>
          <Text style={styles.subtitle}>Enter the invite code from your coach</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="inviteCode"
              render={({ field: { value, onChange, onBlur } }) => (
                <AuthInput
                  label="Invite Code"
                  placeholder="REV123"
                  value={value}
                  onChangeText={(t: string) => onChange(t.toUpperCase())}
                  onBlur={onBlur}
                  error={errors.inviteCode?.message}
                  autoCapitalize="characters"
                  maxLength={6}
                  style={styles.codeInput}
                />
              )}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit(onCodeSubmit)}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={colors.text.inverse} />
              : <Text style={styles.submitText}>Continue</Text>
            }
          </TouchableOpacity>

          <View style={styles.hint}>
            <Text style={styles.hintText}>📋 Ask your coach for the 6-character club invite code</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background.primary },
  scroll:       { flexGrow: 1, paddingHorizontal: spacing[6], paddingVertical: spacing[6], gap: spacing[4] },
  back:         { marginBottom: spacing[2] },
  backText:     { color: colors.accent.primary, fontSize: typography.size.md },
  title:        { fontSize: typography.size['3xl'], color: colors.text.primary, fontWeight: '700' },
  subtitle:     { fontSize: typography.size.md, color: colors.text.secondary },
  form:         { gap: spacing[3], marginTop: spacing[4] },
  codeInput:    { textAlign: 'center', fontSize: typography.size['2xl'], letterSpacing: 8, fontWeight: '700' },
  submitButton: { backgroundColor: colors.accent.primary, borderRadius: radius.lg, paddingVertical: spacing[4], alignItems: 'center', marginTop: spacing[2] },
  submitText:   { color: colors.text.inverse, fontSize: typography.size.md, fontWeight: '700' },
  hint:         { backgroundColor: colors.background.secondary, borderRadius: radius.md, padding: spacing[4], borderWidth: 1, borderColor: colors.border },
  hintText:     { color: colors.text.secondary, fontSize: typography.size.sm, textAlign: 'center' },
});
