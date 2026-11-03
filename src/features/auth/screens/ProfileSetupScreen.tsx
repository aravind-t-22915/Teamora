// src/features/auth/screens/ProfileSetupScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../types';
import { colors, typography, spacing, radius } from '../../../config/theme';
import { useAuthStore } from '../../../stores/authStore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../config/constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileSetup'>;

const POSITIONS = ['goalkeeper', 'defender', 'midfielder', 'forward', 'unassigned'] as const;
const FEET      = ['left', 'right', 'both'] as const;

export function ProfileSetupScreen({ navigation: _navigation }: Props) {
  const { user, setUser } = useAuthStore();

  // Coaches / managers go straight to app after this screen (status is already 'active')
  const isCoach = user?.role === 'coach' || user?.role === 'assistant_coach' || user?.role === 'manager';

  const [position, setPosition] = useState<typeof POSITIONS[number]>(
    (user?.position as typeof POSITIONS[number]) ?? 'unassigned',
  );
  const [foot, setFoot] = useState<typeof FEET[number]>(
    (user?.preferredFoot as typeof FEET[number]) ?? 'right',
  );
  const [loading, setLoading] = useState(false);

  const handleDone = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await updateDoc(doc(db, COLLECTIONS.USERS, user.userId), {
        position,
        preferredFoot: foot,
      });
      // For coaches (status:'active') this causes RootNavigator to switch to App stack.
      setUser({ ...user, position, preferredFoot: foot });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not save profile';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {isCoach ? '🎉 Club Created!' : 'Almost There!'}
        </Text>
        <Text style={styles.subtitle}>
          {isCoach
            ? 'Your club is ready. Set your preferences to enter the app.'
            : 'Your registration is pending coach approval.'}
        </Text>

        {/* Pending badge — only shown for players */}
        {!isCoach && (
          <View style={styles.pendingNote}>
            <Text style={styles.pendingEmoji}>⏳</Text>
            <Text style={styles.pendingText}>
              Your request has been sent to the coach.{'\n'}
              You'll get access once they approve you.
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>
          {isCoach ? 'Your Position' : 'Your Position (optional)'}
        </Text>
        <View style={styles.chips}>
          {POSITIONS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, position === p && styles.chipActive]}
              onPress={() => setPosition(p)}
            >
              <Text style={[styles.chipText, position === p && styles.chipTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Preferred Foot</Text>
        <View style={styles.chips}>
          {FEET.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, foot === f && styles.chipActive]}
              onPress={() => setFoot(f)}
            >
              <Text style={[styles.chipText, foot === f && styles.chipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !isCoach && { backgroundColor: colors.background.secondary },
          ]}
          onPress={handleDone}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={isCoach ? colors.text.inverse : colors.text.secondary} />
          ) : (
            <Text style={[styles.submitText, !isCoach && { color: colors.text.secondary }]}>
              {isCoach ? 'Enter the App →' : 'Save & Wait for Approval'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background.primary },
  scroll:         { flexGrow: 1, paddingHorizontal: spacing[6], paddingVertical: spacing[8], gap: spacing[5] },
  title:          { fontSize: typography.size['3xl'], color: colors.text.primary, fontWeight: '700' },
  subtitle:       { fontSize: typography.size.md, color: colors.text.secondary },
  sectionLabel:   { fontSize: typography.size.sm, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  chips:          { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip:           { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radius.full, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border },
  chipActive:     { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  chipText:       { color: colors.text.secondary, fontSize: typography.size.sm, fontWeight: '500' },
  chipTextActive: { color: colors.text.inverse, fontWeight: '700' },
  pendingNote:    { backgroundColor: colors.background.secondary, borderRadius: radius.lg, padding: spacing[5], alignItems: 'center', gap: spacing[2], borderWidth: 1, borderColor: colors.border },
  pendingEmoji:   { fontSize: 32 },
  pendingText:    { color: colors.text.secondary, fontSize: typography.size.sm, textAlign: 'center', lineHeight: typography.size.sm * 1.6 },
  submitButton:   { backgroundColor: colors.accent.primary, borderRadius: radius.lg, paddingVertical: spacing[4], alignItems: 'center' },
  submitText:     { color: colors.text.inverse, fontSize: typography.size.md, fontWeight: '700' },
});
