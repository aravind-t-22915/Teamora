// src/features/profile/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../../../services/auth.service';
import { ProfileStackParamList } from '../../../types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

export function ProfileScreen() {
  const { user, club, logout } = useAuthStore();
  const navigation = useNavigation<Nav>();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0] ?? '?'}{user?.lastName?.[0] ?? ''}
            </Text>
          </View>
          <Text style={styles.name}>{user?.displayName ?? '—'}</Text>
          <Text style={styles.role}>{user?.role?.replace('_', ' ').toUpperCase() ?? '—'}</Text>
          <Text style={styles.club}>{club?.name ?? '—'}</Text>
        </View>

        {/* Info Card */}
        <View style={[glassCardStyle, styles.infoCard]}>
          <InfoRow label="Position" value={user?.position ?? '—'} />
          <InfoRow label="Jersey #" value={user?.jerseyNumber?.toString() ?? '—'} />
          <InfoRow label="Email"    value={user?.email ?? '—'} />
          <InfoRow label="Status"   value={user?.status ?? '—'} />
        </View>

        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}
        >
          <Text style={styles.editText}>✏️  Edit Profile</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2] },
  label: { fontSize: typography.size.sm, color: colors.text.muted },
  value: { fontSize: typography.size.sm, color: colors.text.primary, fontWeight: '500', textTransform: 'capitalize' },
});

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.background.primary },
  header:        { paddingHorizontal: spacing[5], paddingVertical: spacing[4] },
  title:         { fontSize: typography.size['2xl'], color: colors.text.primary, fontWeight: '700' },
  content:       { flex: 1, paddingHorizontal: spacing[5], gap: spacing[5] },
  avatarSection: { alignItems: 'center', gap: spacing[2] },
  avatar:        { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: typography.size['2xl'], color: '#fff', fontWeight: '700' },
  name:          { fontSize: typography.size.xl, color: colors.text.primary, fontWeight: '700' },
  role:          { fontSize: typography.size.xs, color: colors.accent.primary, fontWeight: '600', letterSpacing: 1 },
  club:          { fontSize: typography.size.sm, color: colors.text.secondary },
  infoCard:      { padding: spacing[4] },
  editButton:    { backgroundColor: colors.background.secondary, borderRadius: radius.lg, paddingVertical: spacing[4], alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  editText:      { color: colors.text.primary, fontSize: typography.size.md, fontWeight: '600' },
  logoutButton:  { backgroundColor: colors.background.secondary, borderRadius: radius.lg, paddingVertical: spacing[4], alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  logoutText:    { color: '#EF4444', fontSize: typography.size.md, fontWeight: '600' },
});
