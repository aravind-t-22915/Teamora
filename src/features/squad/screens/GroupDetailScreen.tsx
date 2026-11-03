// src/features/squad/screens/GroupDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SquadStackParamList } from '../../../types';
import { colors, typography, spacing } from '../../../config/theme';
type Props = NativeStackScreenProps<SquadStackParamList, 'GroupDetail'>;
export function GroupDetailScreen({ navigation, route }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
      <View style={styles.body}><Text style={styles.emoji}>👥</Text><Text style={styles.placeholder}>Group Detail</Text><Text style={styles.sub}>groupId: {route.params.groupId}</Text></View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  back: { paddingHorizontal: spacing[5], paddingVertical: spacing[4] },
  backText: { color: colors.accent.primary, fontSize: typography.size.md },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  emoji: { fontSize: 48 },
  placeholder: { fontSize: typography.size.lg, color: colors.text.primary, fontWeight: '600' },
  sub: { fontSize: typography.size.sm, color: colors.text.muted },
});
