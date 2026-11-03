// src/features/profile/screens/EditProfileScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList, Position, PreferredFoot } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useAuthStore } from '../../../stores/authStore';
import { squadService } from '../../../services/squad.service';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const POSITIONS: Position[] = ['goalkeeper', 'defender', 'midfielder', 'forward', 'unassigned'];
const FEET: PreferredFoot[]  = ['left', 'right', 'both'];

export function EditProfileScreen({ navigation }: Props) {
  const { user, setUser } = useAuthStore();

  const [firstName,    setFirstName]    = useState(user?.firstName    ?? '');
  const [lastName,     setLastName]     = useState(user?.lastName     ?? '');
  const [phone,        setPhone]        = useState(user?.phone        ?? '');
  const [position,     setPosition]     = useState<Position>(user?.position   ?? 'unassigned');
  const [preferredFoot,setPref]         = useState<PreferredFoot>(user?.preferredFoot ?? 'right');
  const [jerseyNumber, setJersey]       = useState(user?.jerseyNumber?.toString() ?? '');
  const [height,       setHeight]       = useState(user?.height?.toString()       ?? '');
  const [weight,       setWeight]       = useState(user?.weight?.toString()       ?? '');
  const [saving,       setSaving]       = useState(false);

  const handleSave = async () => {
    if (!firstName.trim()) return Alert.alert('Validation', 'First name is required');
    setSaving(true);
    try {
      const updates = {
        firstName:    firstName.trim(),
        lastName:     lastName.trim(),
        displayName:  `${firstName.trim()} ${lastName.trim()}`.trim(),
        phone:        phone.trim(),
        position,
        preferredFoot,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : null,
        height:       height ? parseFloat(height) : null,
        weight:       weight ? parseFloat(weight) : null,
      };
      await squadService.updatePlayerProfile(user!.userId, updates);
      setUser({ ...user!, ...updates });
      navigation.goBack();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn}>
          <Text style={s.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={s.saveBtn}>
          {saving
            ? <ActivityIndicator color={colors.text.inverse} size="small" />
            : <Text style={s.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Name */}
        <Text style={s.sectionLabel}>Name</Text>
        <View style={[glassCardStyle, s.card]}>
          <View style={s.row}>
            <Text style={s.fieldLabel}>First Name</Text>
            <TextInput style={s.inlineInput} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor={colors.text.muted} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.fieldLabel}>Last Name</Text>
            <TextInput style={s.inlineInput} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor={colors.text.muted} />
          </View>
        </View>

        {/* Position */}
        <Text style={s.sectionLabel}>Position</Text>
        <View style={s.chipRow}>
          {POSITIONS.map(p => (
            <TouchableOpacity
              key={p}
              style={[s.chip, position === p && s.chipActive]}
              onPress={() => setPosition(p)}
            >
              <Text style={[s.chipText, position === p && s.chipTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferred Foot */}
        <Text style={s.sectionLabel}>Preferred Foot</Text>
        <View style={s.chipRow}>
          {FEET.map(f => (
            <TouchableOpacity
              key={f}
              style={[s.chip, preferredFoot === f && s.chipActive]}
              onPress={() => setPref(f)}
            >
              <Text style={[s.chipText, preferredFoot === f && s.chipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Numbers */}
        <Text style={s.sectionLabel}>Details</Text>
        <View style={[glassCardStyle, s.card]}>
          <View style={s.row}>
            <Text style={s.fieldLabel}>Jersey #</Text>
            <TextInput style={s.inlineInput} value={jerseyNumber} onChangeText={setJersey} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.text.muted} maxLength={2} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.fieldLabel}>Height (cm)</Text>
            <TextInput style={s.inlineInput} value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="175" placeholderTextColor={colors.text.muted} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.fieldLabel}>Weight (kg)</Text>
            <TextInput style={s.inlineInput} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="70" placeholderTextColor={colors.text.muted} />
          </View>
        </View>

        {/* Phone */}
        <Text style={s.sectionLabel}>Contact</Text>
        <View style={[glassCardStyle, s.card]}>
          <View style={s.row}>
            <Text style={s.fieldLabel}>Phone</Text>
            <TextInput style={s.inlineInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+91 98765 43210" placeholderTextColor={colors.text.muted} />
          </View>
        </View>

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background.primary },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.divider },
  closeBtn:       { padding: spacing[1] },
  closeText:      { fontSize: typography.size.lg, color: colors.text.secondary },
  headerTitle:    { fontSize: typography.size.lg, color: colors.text.primary, fontWeight: '700' },
  saveBtn:        { backgroundColor: colors.accent.primary, paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radius.full },
  saveText:       { color: colors.text.inverse, fontWeight: '700', fontSize: typography.size.sm },
  scroll:         { flex: 1 },
  content:        { paddingHorizontal: spacing[5], paddingVertical: spacing[5], gap: spacing[3] },
  sectionLabel:   { fontSize: typography.size.xs, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginTop: spacing[2] },
  card:           { paddingHorizontal: 0, paddingVertical: 0 },
  row:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  fieldLabel:     { fontSize: typography.size.md, color: colors.text.primary },
  inlineInput:    { flex: 1, textAlign: 'right', color: colors.text.primary, fontSize: typography.size.md, paddingLeft: spacing[3] },
  divider:        { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing[4] },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip:           { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background.secondary },
  chipActive:     { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  chipText:       { fontSize: typography.size.sm, color: colors.text.secondary, fontWeight: '500' },
  chipTextActive: { color: colors.text.inverse, fontWeight: '700' },
});
