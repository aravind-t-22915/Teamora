// src/features/auth/screens/WelcomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../types';
import { colors, typography, spacing, radius } from '../../../config/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>⚽</Text>
        <Text style={styles.heroTitle}>TEAMORA</Text>
        <Text style={styles.heroSubtitle}>
          Your team hub.{'\n'}Ditch the WhatsApp chaos.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Create Account (Coach)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('JoinClub')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Join a Club</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.background.primary,
    justifyContent:  'space-between',
    paddingHorizontal: spacing[6],
    paddingVertical:   spacing[8],
  },
  hero: {
    flex:       1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  heroEmoji: {
    fontSize: 80,
  },
  heroTitle: {
    fontSize:      typography.size['5xl'],
    color:         colors.text.primary,
    fontWeight:    '900',
    letterSpacing: 6,
  },
  heroSubtitle: {
    fontSize:  typography.size.lg,
    color:     colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.size.lg * 1.6,
  },
  actions: {
    gap: spacing[3],
    paddingBottom: spacing[4],
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    borderRadius:    radius.lg,
    paddingVertical: spacing[4],
    alignItems:      'center',
  },
  primaryButtonText: {
    color:      colors.text.inverse,
    fontSize:   typography.size.md,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
    borderRadius:    radius.lg,
    paddingVertical: spacing[4],
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     colors.border,
  },
  secondaryButtonText: {
    color:      colors.text.primary,
    fontSize:   typography.size.md,
    fontWeight: '600',
  },
  linkText: {
    color:      colors.text.secondary,
    fontSize:   typography.size.sm,
    textAlign:  'center',
    paddingVertical: spacing[2],
  },
});
