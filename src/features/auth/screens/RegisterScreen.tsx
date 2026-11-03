// src/features/auth/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../../types';
import { registerSchema, RegisterFormValues } from '../../../schemas/auth.schema';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../stores/authStore';
import { colors, typography, spacing, radius } from '../../../config/theme';
import { AuthInput } from '../components/AuthInput';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const { setUser, setClub } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setLoading(true);
      const appUser = await authService.registerCoach(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.clubName,
      );
      // Immediately seed the store so RootNavigator can react after ProfileSetup
      const club = await authService.getClub(appUser.clubId);
      setUser(appUser);
      setClub(club);
      navigation.navigate('ProfileSetup');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Registration failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Set up your team on Teamora</Text>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Controller control={control} name="firstName" render={({ field: { value, onChange, onBlur } }) => (
                  <AuthInput label="First Name" placeholder="John" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.firstName?.message} />
                )} />
              </View>
              <View style={{ flex: 1 }}>
                <Controller control={control} name="lastName" render={({ field: { value, onChange, onBlur } }) => (
                  <AuthInput label="Last Name" placeholder="Smith" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.lastName?.message} />
                )} />
              </View>
            </View>
            <Controller control={control} name="clubName" render={({ field: { value, onChange, onBlur } }) => (
              <AuthInput label="Club Name" placeholder="e.g. FC Revelation" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.clubName?.message} />
            )} />
            <Controller control={control} name="email" render={({ field: { value, onChange, onBlur } }) => (
              <AuthInput label="Email" placeholder="coach@email.com" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" />
            )} />
            <Controller control={control} name="password" render={({ field: { value, onChange, onBlur } }) => (
              <AuthInput label="Password" placeholder="••••••••" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} secureTextEntry />
            )} />
            <Controller control={control} name="confirmPassword" render={({ field: { value, onChange, onBlur } }) => (
              <AuthInput label="Confirm Password" placeholder="••••••••" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} secureTextEntry />
            )} />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color={colors.text.inverse} /> : <Text style={styles.submitText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
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
  row:          { flexDirection: 'row', gap: spacing[3] },
  submitButton: { backgroundColor: colors.accent.primary, borderRadius: radius.lg, paddingVertical: spacing[4], alignItems: 'center', marginTop: spacing[2] },
  submitText:   { color: colors.text.inverse, fontSize: typography.size.md, fontWeight: '700' },
  linkText:     { color: colors.text.secondary, fontSize: typography.size.sm, textAlign: 'center', paddingVertical: spacing[2] },
});
