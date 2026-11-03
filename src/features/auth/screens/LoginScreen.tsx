// src/features/auth/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../../types';
import { loginSchema, LoginFormValues } from '../../../schemas/auth.schema';
import { authService } from '../../../services/auth.service';
import { colors, typography, spacing, radius } from '../../../config/theme';
import { AuthInput } from '../components/AuthInput';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      await authService.login(data.email, data.password);
      // Navigation handled by RootNavigator auth state listener
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Login failed';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to FC Revelation</Text>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <AuthInput
                  label="Email"
                  placeholder="your@email.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <AuthInput
                  label="Password"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                />
              )}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={colors.text.inverse} />
              : <Text style={styles.submitText}>Sign In</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Don't have an account? Create one</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  kav:       { flex: 1 },
  scroll:    { flexGrow: 1, paddingHorizontal: spacing[6], paddingVertical: spacing[6], gap: spacing[4] },
  back:      { marginBottom: spacing[4] },
  backText:  { color: colors.accent.primary, fontSize: typography.size.md },
  title:     { fontSize: typography.size['3xl'], color: colors.text.primary, fontWeight: '700' },
  subtitle:  { fontSize: typography.size.md, color: colors.text.secondary },
  form:      { gap: spacing[3], marginTop: spacing[4] },
  submitButton: {
    backgroundColor: colors.accent.primary,
    borderRadius:    radius.lg,
    paddingVertical: spacing[4],
    alignItems:      'center',
    marginTop:       spacing[2],
  },
  submitText: { color: colors.text.inverse, fontSize: typography.size.md, fontWeight: '700' },
  linkText:   { color: colors.text.secondary, fontSize: typography.size.sm, textAlign: 'center', paddingVertical: spacing[2] },
});
