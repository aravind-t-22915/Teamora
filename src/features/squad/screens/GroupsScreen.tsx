// src/features/squad/screens/GroupsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SquadStackParamList } from '../../../types';
import { colors, typography, spacing } from '../../../config/theme';
type Props = NativeStackScreenProps<SquadStackParamList, 'Groups'>;
export function GroupsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
      <View style={styles.body}><Text style={styles.emoji}>🗂️</Text><Text style={styles.placeholder}>Groups coming in Phase 4</Text></View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  back: { paddingHorizontal: spacing[5], paddingVertical: spacing[4] },
  backText: { color: colors.accent.primary, fontSize: typography.size.md },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  emoji: { fontSize: 48 },
  placeholder: { fontSize: typography.size.lg, color: colors.text.secondary, textAlign: 'center' },
});
